# Plan: Interactive Agent Entry System

## Summary
**Goal:** Enable seamless entry into agent sessions from parent Claude sessions and return navigation
**Type:** Feature
**Scope:** Medium

## Relevant Context
- Architecture: `docs/architecture/multi-session-enter-agent.md`
- Existing registry: `agent-responses/.active-pids.json`
- Agent spawning: `hooks/pre-tool-use/agent-system/agent-interceptor.js`
- Agent runtime: `hooks/pre-tool-use/agent-system/agent-script.mjs`
- Entry script: `~/.claude/bin/enter-agent` (created)
- Wrapper proof-of-concept: `/tmp/claude-wrapper.sh` (validated)

## Investigation Artifacts
- `docs/architecture/multi-session-enter-agent.md` – Complete architecture specification for multi-session agent tracking
- **POC validation** – Confirmed `exec` mechanism successfully exits Claude and executes commands in parent terminal

## Current System Overview

**Agent spawning flow:**
1. User calls Task tool → triggers `agent-interceptor.js` (pre-tool-use hook)
2. Interceptor spawns `agent-script.mjs` with agent config
3. Agent script creates Claude SDK stream and writes output to `agent-responses/{id}.md`
4. Registry entry created in `.active-pids.json` with: `pid`, `depth`, `parentId`, `agentType`, `allowedAgents`

**Missing pieces:**
- No session ID tracking (SDK provides it but not captured)
- No parent session linking
- No mechanism to resume into agent sessions
- No cleanup of session markers

**File structure:**
```
hooks/pre-tool-use/agent-system/
  ├── agent-interceptor.js    # Spawns agents
  ├── agent-script.mjs         # Agent runtime
  └── registry-manager.js      # Registry operations

agent-responses/
  ├── .active-pids.json        # Agent registry
  └── agent_*.md               # Agent outputs

~/.claude/bin/
  └── enter-agent              # Entry script (created, not functional yet)
```

## Implementation Plan

### Tasks

#### Task 1: Create session tracking lifecycle hook
**What:** Hook that writes session markers on SessionStart and cleans up on SessionEnd
**Why:** Enables mapping parent PIDs to session IDs for agent parent tracking

- Files: `hooks/lifecycle/session-tracker.mjs` (new)
- Depends on: none
- Risks/Gotchas:
  - PID reuse edge case (mitigated by process existence check)
  - Marker file orphaning if crash (mitigated by SessionEnd cleanup)
- Agent: none (direct implementation)

**Implementation details:**
- Listen for SessionStart and SessionEnd events
- On start: write `.claude/.session-markers/{ppid}.json` with `{sessionId, pid, cwd, startedAt}`
- On end: delete marker file
- Create markers directory if not exists

#### Task 2: Extend agent registry schema
**What:** Add session tracking fields to `.active-pids.json` entries
**Why:** Enables enter-agent script to lookup session IDs and parent relationships

- Files: `hooks/pre-tool-use/agent-system/registry-manager.js`
- Depends on: none
- Risks/Gotchas: Backward compatibility with existing registry entries
- Agent: none (direct implementation)

**New fields:**
```json
{
  "sessionId": "abc-123",           // Agent's session ID
  "transcriptPath": "~/.claude/...", // Full path to transcript
  "parentSessionId": "xyz-789",      // Spawning session ID
  "parentPid": 12345                 // Parent Claude process PID
}
```

#### Task 3: Modify agent interceptor to pass parent PID
**What:** Export `CLAUDE_PARENT_PID=process.pid` to spawned agent processes
**Why:** Allows agent-script to lookup parent session from marker files

- Files: `hooks/pre-tool-use/agent-system/agent-interceptor.js`
- Depends on: Task 1 (session markers must exist)
- Risks/Gotchas: None
- Agent: none (direct implementation)

**Changes:**
- Add environment variable to spawn options before creating agent process
- No other modifications needed

#### Task 4: Capture session IDs in agent-script
**What:** Read parent marker, capture session ID from first message, write to registry
**Why:** Populates registry with data needed by enter-agent script

- Files: `hooks/pre-tool-use/agent-system/agent-script.mjs`
- Depends on: Task 2 (registry schema), Task 3 (parent PID env var)
- Risks/Gotchas:
  - Session ID arrives after ~1-2s delay (need flag to track)
  - Parent marker might not exist (handle gracefully)
  - Path sanitization must match SDK exactly
- Agent: none (direct implementation)

**Implementation:**
- Add `sessionIdCaptured` flag
- On first message with `session_id`:
  - Read parent marker from `.claude/.session-markers/{CLAUDE_PARENT_PID}.json`
  - Calculate transcript path using path sanitization
  - Update registry entry with all new fields
  - Set flag to prevent re-processing

#### Task 5: Update .gitignore
**What:** Add `.claude/.session-markers/` to gitignore
**Why:** Prevent session marker files from being tracked

- Files: `.gitignore`
- Depends on: none
- Risks/Gotchas: None
- Agent: none (direct implementation)

#### Task 6: Test single-session flow
**What:** Spawn agent, use enter-agent to enter session, verify parent tracking
**Why:** Validate basic functionality

- Files: Test execution only
- Depends on: Tasks 1-5
- Risks/Gotchas: Timing issues if session ID not captured quickly
- Agent: none (manual testing)

**Test steps:**
1. Launch Claude in single terminal
2. Spawn test agent via Task tool
3. Run `~/.claude/bin/enter-agent agent_{id}`
4. Verify: enters agent session successfully
5. Note parent session ID from output
6. Run `exec claude --resume {parent_session_id}`
7. Verify: returns to original session

#### Task 7: Test multi-terminal isolation
**What:** Spawn agents from multiple terminals, verify correct parent tracking
**Why:** Ensure no cross-contamination between concurrent sessions

- Files: Test execution only
- Depends on: Task 6 passing
- Risks/Gotchas: None
- Agent: none (manual testing)

**Test steps:**
1. Terminal A: Launch Claude (session-A), spawn agent_001
2. Terminal B: Launch Claude (session-B, same cwd), spawn agent_002
3. Terminal A: `enter-agent agent_001` → verify returns to session-A
4. Terminal B: `enter-agent agent_002` → verify returns to session-B

### Data/Schema Impacts

**Registry schema extension:**
- Backward compatible (new fields are optional)
- Existing entries without new fields still functional
- No migration needed

**New storage:**
- `.claude/.session-markers/{pid}.json` – ephemeral, cleaned up on SessionEnd
- Gitignored, not persisted

### Integration Points

**SDK integration:**
- `agent-script.mjs:177` – Message stream loop where session_id first appears
- SDK provides session_id in every message after connection established

**Lifecycle hooks:**
- New hook at `hooks/lifecycle/session-tracker.mjs`
- Triggered on SessionStart and SessionEnd events

**Path sanitization:**
- Must match SDK's algorithm: `cwd.replace(/^\//, '').replace(/\//g, '-')`
- Reference: `docs/architecture/multi-session-enter-agent.md:400-411`

### Testing Strategy

**Unit:**
- Not applicable (no new testable units, primarily integration/system level)

**Integration:**
- Single session: spawn → enter → return flow
- Multi-session: concurrent spawns with correct parent tracking
- Edge cases:
  - Agent already completed when entering (should warn, allow read-only)
  - Parent marker missing (should handle gracefully)
  - Session ID not yet captured (should poll and wait)

**Manual validation:**
- Verify "hello world" appears in parent terminal on exec
- Verify enter-agent successfully resumes agent session
- Verify parent session ID displayed correctly
- Verify registry contains all new fields

## Impact Analysis

**Affected files:**
- `hooks/lifecycle/session-tracker.mjs` – NEW, handles session marker lifecycle
- `hooks/pre-tool-use/agent-system/agent-interceptor.js` – Add CLAUDE_PARENT_PID env var
- `hooks/pre-tool-use/agent-system/agent-script.mjs` – Capture session IDs, read markers, update registry
- `hooks/pre-tool-use/agent-system/registry-manager.js` – Extend schema
- `.gitignore` – Add session markers directory
- `~/.claude/bin/enter-agent` – Already created, will become functional

**Call sites/dependencies:**
- No breaking changes to existing agent spawn flow
- Registry schema is backward compatible
- New lifecycle hook is additive only

**Ripple effects:**
- Agent spawning slightly slower (negligible: single env var, one file read)
- Disk usage increase: ~200 bytes per active session (markers)
- Cleanup required on SessionEnd to prevent marker accumulation

## Rollout and Ops

**Config/env:**
- No environment variable changes needed
- No config file updates required

**Migration/rollback:**
- Forward: Session markers created automatically on SessionStart
- Rollback: Remove lifecycle hook, revert other changes—existing registry entries still work
- No data migration needed (backward compatible schema)

**Monitoring:**
- Watch for orphaned marker files (if crashes prevent SessionEnd cleanup)
- Verify registry population after spawning agents
- Monitor enter-agent success rate (polling should succeed within 10s)

## Appendix

**Conventions/patterns to follow:**
- Path sanitization: Use SDK algorithm from architecture doc
- Registry updates: Use registry-manager.js helpers (don't write directly)
- Marker file format: JSON with consistent schema (sessionId, pid, cwd, startedAt)
- Hook implementation: Follow existing patterns in `hooks/lifecycle/`

**Open questions/assumptions:**
- **Q:** Should we add session name aliasing for easier identification?
  - **A:** Defer to future enhancement (architecture doc line 429)
- **Q:** Should we implement multi-hop return (exit-agent --root)?
  - **A:** Defer to future enhancement (architecture doc line 428)
- **Assumption:** `process.ppid` reliably provides parent Claude process PID
- **Assumption:** SDK's session_id field is always present after first message
- **Assumption:** Path sanitization algorithm remains stable across SDK versions

**Future enhancements:**
- Auto-detect current session via env var exposure
- Session tree visualization (parent/child graph)
- Exit-agent helper (reverse lookup from agent session to parent)
- Session name aliasing
