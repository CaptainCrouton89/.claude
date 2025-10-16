# Multi-Session Architecture & Interactive Agent Entry

## Problem Statement

**Multiple concurrent Claude sessions per project** — User can run `claude` in multiple terminal windows for the same working directory, creating distinct sessions with unique session IDs but sharing the same sanitized project directory in `~/.claude/projects/`.

**Example observed state:**
- Terminal s008 (PID 53958): Running claude in `/Users/silasrhyneer/.claude`
- Terminal s080 (PID 11618): Running claude in `/Users/silasrhyneer/.claude`
- Terminal s059 (PID 52801): Running claude in `/Users/silasrhyneer/.claude`
- All write to `~/.claude/projects/-Users-silasrhyneer--claude/<unique-session-id>.jsonl`

**Challenge:** When spawning agents from `agent-interceptor.js`, the subagent's session ID gets captured, but returning to the *correct parent session* requires tracking which terminal spawned which agent.

---

## Current Architecture

### Session Storage Pattern
```
~/.claude/projects/<sanitized-cwd>/
  ├── 00002608-fe94-4215-ab0e-3abfc85990a9.jsonl  # Session 1
  ├── 008faffc-5137-4f98-9f70-3e80492b04b2.jsonl  # Session 2
  ├── 00aa2ea7-c702-4853-a86f-181571dbdb55.jsonl  # Session 3
  └── ...
```
- Each session = separate JSONL file
- Multiple active sessions can coexist
- Path sanitization: `/Users/foo/bar` → `-Users-foo-bar`

### Agent Registry
**Location:** `agent-responses/.active-pids.json` (relative to `cwd`)

**Current fields:**
```json
{
  "agent_123456": {
    "pid": 98765,
    "depth": 1,
    "parentId": null,
    "agentType": "backend-developer",
    "allowedAgents": ["general-purpose"],
    "allowedMcpServers": null,
    "missingMcpServers": []
  }
}
```

**Missing:** `sessionId`, `transcriptPath`, `parentSessionId`

### Session ID Availability
- **SDK streams it:** Every message includes `session_id` field (typescript-sdk.md:378,392,422)
- **Timing:** Available on *first* message after spawn (~1-2s delay)
- **Current gap:** `agent-script.mjs` doesn't capture or persist it

---

## Solution Architecture

### 1. Session Tracking Hook (SessionStart)

**New lifecycle hook:** `hooks/lifecycle/session-tracker.mjs`

**Purpose:** Write current session ID to a per-process marker file when any Claude session starts.

```javascript
#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const stdin = readFileSync(0, 'utf-8');
const inputData = JSON.parse(stdin);

if (inputData.hook_event_name !== 'SessionStart') {
  process.exit(0);
}

const parentPid = process.ppid;
const sessionId = inputData.session_id;
const cwd = inputData.cwd || process.cwd();

// Write to per-PID marker so enter-agent can find parent session
const markersDir = join(cwd, '.claude', '.session-markers');
mkdirSync(markersDir, { recursive: true });
const markerPath = join(markersDir, `${parentPid}.json`);
writeFileSync(markerPath, JSON.stringify({
  sessionId,
  pid: parentPid,
  cwd,
  startedAt: new Date().toISOString()
}, null, 2));

process.exit(0);
```

**Storage location:** `.claude/.session-markers/<pid>.json` (per-project, gitignored)

**Cleanup:** SessionEnd hook removes marker file.

**Why per-PID?** Each terminal has a unique Claude process PID — this maps the shell's parent Claude PID → session ID without ambiguity.

---

### 2. Enhanced Agent Registry

**New fields added to `.active-pids.json`:**
```json
{
  "agent_123456": {
    "pid": 98765,
    "sessionId": "abc-def-123",                    // ← NEW: Agent's session ID
    "transcriptPath": "~/.claude/projects/...",    // ← NEW: Path to agent transcript
    "parentSessionId": "xyz-789-parent",           // ← NEW: Spawning session ID
    "parentPid": 53958,                            // ← NEW: Parent Claude process PID
    "depth": 1,
    "parentId": null,
    "agentType": "backend-developer",
    "allowedAgents": ["general-purpose"],
    "allowedMcpServers": null,
    "missingMcpServers": []
  }
}
```

**Modified:** `agent-script.mjs` to capture and write these fields on first message.

```javascript
// In agent-script.mjs after line 177
let sessionIdCaptured = false;

for await (const message of result) {
  if (message.session_id && !sessionIdCaptured) {
    // Derive transcript path
    const sanitizedCwd = cwd.replace(/^\//, '').replace(/\//g, '-');
    const transcriptPath = join(
      homedir(), '.claude', 'projects', `-${sanitizedCwd}`, `${message.session_id}.jsonl`
    );

    // Read parent session from marker
    const parentPid = process.env.CLAUDE_PARENT_PID || process.ppid; // Set by interceptor
    let parentSessionId = null;
    try {
      const markerPath = join(cwd, '.claude', '.session-markers', `${parentPid}.json`);
      const marker = JSON.parse(readFileSync(markerPath, 'utf-8'));
      parentSessionId = marker.sessionId;
    } catch {
      // Parent marker not found - agent spawned from non-claude context
    }

    // Update registry
    const registryPath = join(cwd, 'agent-responses', '.active-pids.json');
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
    if (registry[agentId]) {
      registry[agentId].sessionId = message.session_id;
      registry[agentId].transcriptPath = transcriptPath;
      registry[agentId].parentSessionId = parentSessionId;
      registry[agentId].parentPid = parentPid;
      writeFileSync(registryPath, JSON.stringify(registry, null, 2));
    }
    sessionIdCaptured = true;
  }

  // ... existing message handling
}
```

**Environment variable:** `agent-interceptor.js` must set `CLAUDE_PARENT_PID` to `process.pid` before spawning.

---

### 3. Interactive Agent Entry Script

**Command:** `enter-agent <agent_id>`

**Location:** `~/.claude/bin/enter-agent` (or inline slash command)

```bash
#!/bin/bash
set -euo pipefail

AGENT_ID="${1:-}"
if [ -z "$AGENT_ID" ]; then
  echo "Usage: enter-agent <agent_id>"
  exit 1
fi

REGISTRY="./agent-responses/.active-pids.json"

# Poll for session ID (may not be captured yet)
for i in {1..20}; do
  if [ ! -f "$REGISTRY" ]; then
    echo "Registry not found, retrying..." >&2
    sleep 0.5
    continue
  fi

  SESSION_ID=$(jq -r ".[\"$AGENT_ID\"].sessionId // empty" "$REGISTRY" 2>/dev/null || echo "")
  AGENT_STATUS=$(jq -r ".[\"$AGENT_ID\"].agentType // empty" "$REGISTRY" 2>/dev/null || echo "")

  if [ -n "$SESSION_ID" ]; then
    break
  fi

  if [ $i -eq 1 ]; then
    echo "Waiting for agent session ID..." >&2
  fi
  sleep 0.5
done

if [ -z "$SESSION_ID" ]; then
  echo "Error: Agent $AGENT_ID not found or session not captured" >&2
  exit 1
fi

# Extract parent session for return
PARENT_SESSION=$(jq -r ".[\"$AGENT_ID\"].parentSessionId // empty" "$REGISTRY" 2>/dev/null || echo "")

if [ -z "$PARENT_SESSION" ]; then
  echo "Warning: Parent session not tracked - use 'claude -r' to browse sessions for return" >&2
else
  echo "Parent session: $PARENT_SESSION (return with 'exec claude --resume $PARENT_SESSION')" >&2
fi

# Check if agent already terminated
AGENT_LOG="./agent-responses/${AGENT_ID}.md"
if [ -f "$AGENT_LOG" ]; then
  STATUS=$(grep "^Status:" "$AGENT_LOG" | tail -1 | awk '{print $2}')
  if [ "$STATUS" = "done" ] || [ "$STATUS" = "failed" ]; then
    echo "Warning: Agent already $STATUS - entering read-only session" >&2
  fi
fi

echo "" >&2
echo "Entering agent $AGENT_ID ($AGENT_STATUS)" >&2
echo "Session: $SESSION_ID" >&2
sleep 1

# Replace current process with agent session
exec claude --resume "$SESSION_ID"
```

**Key mechanics:**
- **Polling:** Session ID may not be written instantly — poll up to 10s
- **Parent tracking:** Display return command for convenience
- **`exec` replacement:** No subprocess — swaps the current shell process
- **Status check:** Warns if agent already completed (read-only resume)

**Dependencies & paths:**
- The script expects `jq` to be installed for JSON parsing.
- `REGISTRY="./agent-responses/.active-pids.json"` assumes you run `enter-agent` from the same project root as the agent registry. If you prefer location agnostic execution, resolve the path via `$CLAUDE_PROJECT_DIR` or by reading the `cwd` stored alongside the agent entry.

---

### 4. Return Journey

**Two options:**

#### Option A: Manual (always works)
```bash
exec claude --resume <parent_session_id>
```
User copies the parent session ID shown by `enter-agent`.

#### Option B: Helper slash command
```bash
exit-agent  # or /exit-agent slash command
```

Reads the agent registry entry for the current session, extracts `parentSessionId`, then runs `exec claude --resume`.

**Implementation (requires current session ID):**
```bash
#!/bin/bash
set -euo pipefail

CURRENT_SESSION_ID="${1:-${CLAUDE_SESSION_ID:-}}"
if [ -z "$CURRENT_SESSION_ID" ]; then
  echo "Usage: exit-agent <current_session_id>" >&2
  exit 1
fi

REGISTRY="./agent-responses/.active-pids.json"
AGENT_ID=$(jq -r "to_entries[] | select(.value.sessionId == \"$CURRENT_SESSION_ID\") | .key" "$REGISTRY")

if [ -z "$AGENT_ID" ]; then
  echo "Not in an agent session" >&2
  exit 1
fi

PARENT_SESSION=$(jq -r ".[\"$AGENT_ID\"].parentSessionId" "$REGISTRY")
exec claude --resume "$PARENT_SESSION"
```

**Challenge:** Detecting "which session am I in?" without CLI support. Until the CLI exposes the current session ID (for example via `CLAUDE_SESSION_ID`), the helper must accept it as an argument or derive it via another custom hook (e.g., persisting it in a shell-local file during SessionStart).

---

## Multi-Session Conflict Resolution

### Scenario: Multiple terminals spawn agents

**Terminal A (PID 1000):**
- Session `session-A`
- Spawns `agent_123` with sessionId `agent-session-1`
- Registry entry: `parentSessionId = session-A`, `parentPid = 1000`

**Terminal B (PID 2000):**
- Session `session-B` (same cwd)
- Spawns `agent_456` with sessionId `agent-session-2`
- Registry entry: `parentSessionId = session-B`, `parentPid = 2000`

**Resolution:**
- Each agent tracks its *specific* parent session via marker files
- No ambiguity: `enter-agent agent_123` → returns to `session-A`
- No ambiguity: `enter-agent agent_456` → returns to `session-B`

### Edge Case: Marker file cleanup

**Problem:** If parent session crashes, marker file persists.

**Solution:** SessionEnd hook deletes marker:
```javascript
// In session-tracker.mjs SessionEnd handler
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const parentPid = process.ppid;
const markersDir = join(cwd, '.claude', '.session-markers');
const markerPath = join(markersDir, `${parentPid}.json`);
if (existsSync(markerPath)) {
  unlinkSync(markerPath);
}
```

**Fallback:** `enter-agent` can detect stale markers by checking if `parentPid` is still running:
```bash
if ! ps -p "$PARENT_PID" > /dev/null 2>&1; then
  echo "Warning: Parent process $PARENT_PID no longer running" >&2
fi
```

---

## Implementation Checklist

- [ ] **Create `hooks/lifecycle/session-tracker.mjs`** — SessionStart/End marker management
- [ ] **Extend `registry-manager.js`** — Add `sessionId`, `transcriptPath`, `parentSessionId`, `parentPid` fields
- [ ] **Modify `agent-interceptor.js`** — Pass `CLAUDE_PARENT_PID=process.pid` to spawned agents
- [ ] **Modify `agent-script.mjs`** — Capture session ID, read parent marker, write to registry
- [ ] **Create `~/.claude/bin/enter-agent`** — Polling, status check, exec resume
- [ ] **Optional: Create `/exit-agent` slash command** — Reverse lookup and return
- [ ] **Add `.claude/.session-markers/` to `.gitignore`** — Prevent tracking marker files
- [ ] **Test multi-terminal spawning** — Verify parent tracking with concurrent sessions

---

## Testing Strategy

1. **Single session baseline:**
   ```bash
   claude  # Terminal A
   # Spawn agent_001
   enter-agent agent_001
   # Verify: enters agent session
   exec claude --resume <parent-session-id>
   # Verify: returns to original session
   ```

2. **Multi-session isolation:**
   ```bash
   # Terminal A
   claude  # session-A
   # Spawn agent_001

   # Terminal B (same cwd)
   claude  # session-B
   # Spawn agent_002

   # Terminal A
   enter-agent agent_001
   # Verify: returns to session-A (not session-B)
   ```

3. **Race condition (session ID not yet captured):**
   ```bash
   # Spawn agent, immediately enter
   # Task -> agent spawns -> enter-agent agent_XXX
   # Verify: polling waits and succeeds
   ```

4. **Completed agent entry:**
   ```bash
   # Wait for agent to finish
   enter-agent agent_001
   # Verify: warns "read-only", still allows resume
   ```

---

## Path Sanitization Reference

**Observed pattern:** `/Users/silasrhyneer/Code/ASI-UPEARA-2` → `-Users-silasrhyneer-Code-ASI-ASI-UPEARA-2`

**Algorithm:**
```javascript
function sanitizePath(cwd) {
  return cwd.replace(/^\//, '').replace(/\//g, '-');
}
```

**Note:** Leading slash removed, remaining slashes → hyphens. No special handling for home directory expansion observed.

---

## Security Considerations

- **Marker files contain session IDs** — Gitignore `.claude/.session-markers/` to prevent leaking session history
- **Registry contains session IDs** — Already gitignored via `agent-responses/.active-pids.json`
- **Transcript paths exposed** — Low risk; transcripts already accessible by file path
- **PID reuse** — Minimal risk; marker cleanup on SessionEnd + stale PID detection handles this

---

## Future Enhancements

- **Auto-detect current session** — Hook to write session ID to env var accessible by enter-agent
- **Session tree visualization** — Show parent/child relationships: `session-A → agent_001 → agent_002`
- **Multi-hop return** — `exit-agent --root` to return to top-level session
- **Session name aliasing** — Allow naming sessions for easier identification (`session-A` → "feature-auth-impl")
