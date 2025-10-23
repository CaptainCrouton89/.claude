# Agent Registry and Logging Patterns

## Registry File: `.active-pids.json`

### Schema
```json
{
  "agent_123456": {
    "pid": 12345,           // Process ID (null before spawn, updated after)
    "depth": 0,             // Recursion depth (0-2)
    "parentId": null,       // Parent agent ID or null for root
    "agentType": "programmer"  // Agent type
  }
}
```

### Lifecycle
1. **Pre-spawn write** (line 233-238): Entry created with `pid: null` BEFORE spawning
2. **Post-spawn update** (line 252-253): PID updated after `spawn()` returns
3. **No cleanup mechanism**: Registry persists (no automatic removal on completion)

**Critical timing**: Registry written BEFORE spawn so child agents can check parent type to prevent self-spawning (lines 105-123)

## Agent Log Files: `agent-responses/{agent_id}.md`

### Frontmatter Template
```yaml
---
Task: {description}              # From tool_input.description
Instructions: {prompt}           # Full prompt with [UPDATE] instruction appended
Started: 2024-01-01T00:00:00Z   # ISO timestamp at creation
Status: in-progress             # Values: in-progress → done/failed
Depth: 0                        # Current recursion depth (0-2)
ParentAgent: root               # Parent agent ID or 'root'
Ended: 2024-01-01T00:00:00Z    # Added on completion (Status change)
---
```

### Log File Lifecycle

1. **Creation** (lines 125-136): Initial frontmatter written synchronously before spawn
2. **Streaming** (lines 194-198): Assistant text blocks appended in real-time via `appendFileSync`
3. **Finalization** (lines 199-210): On completion:
   - Status updated: `in-progress` → `done` (success) or `failed` (error)
   - `Ended` timestamp added
   - File re-written with updated frontmatter

## PID Tracking

### Recording Timeline
1. **Pre-spawn**: Registry entry created with `pid: null` (line 233)
2. **Spawn call**: `spawn()` with `detached: true, stdio: 'ignore'` (line 241-249)
3. **Post-spawn**: Registry updated with actual PID from `childProcess.pid` (line 252)
4. **Unreferenced**: `childProcess.unref()` allows parent to exit (line 255)

### Environment Variables
- `CLAUDE_AGENT_ID`: Current agent's ID
- `CLAUDE_AGENT_DEPTH`: Current depth + 1 for child

## Await Script Integration

### Location & Deployment
- Source: `~/.claude/await`
- Copied to: `./agent-responses/await` (lines 51-60)
- Made executable: `chmod 755`

### Monitoring Mechanism
The await script monitors agent log files by:
1. Watching for Status field changes in frontmatter
2. Detecting `Status: done` or `Status: failed`
3. Streaming updates with `[UPDATE]` prefix markers
4. Blocking until completion when needed

### Usage Pattern
```bash
./agent-responses/await agent_123456  # Blocks until complete
./agent-responses/await agent_1 agent_2 agent_3  # Multiple agents
```

## Recursion Control

- **Max depth**: 3 levels (constant `MAX_RECURSION_DEPTH`)
- **Depth tracking**: Via `CLAUDE_AGENT_DEPTH` environment variable
- **Enforcement**: Pre-tool-use hook denies Task calls at max depth (lines 32-42)

## Self-Spawning Prevention

1. **Registry check** (lines 105-123): Parent agent type compared to requested subagent_type
2. **Forbidden agents list** (lines 83-90): Parsed from agent file frontmatter
3. **Auto-forbid**: Non-general agents cannot spawn themselves (lines 100-102)
4. **Runtime enforcement**: Hook in spawned process checks forbidden list (lines 163-179)