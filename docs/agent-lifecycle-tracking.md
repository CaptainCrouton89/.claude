# Agent Registry and Status Tracking

## Registry File: `.active-pids.json` (Project Root)

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

## Agent Output Model

### klaude Direct Output
- Agents output directly to terminal (non-blocking)
- No log files generated automatically
- Status tracked exclusively in registry
- Parent/child communication via registry polling

## PID Tracking

### Recording Timeline
1. **Pre-spawn**: Registry entry created with `pid: null` (line 233)
2. **Spawn call**: `spawn()` with `detached: true, stdio: 'ignore'` (line 241-249)
3. **Post-spawn**: Registry updated with actual PID from `childProcess.pid` (line 252)
4. **Unreferenced**: `childProcess.unref()` allows parent to exit (line 255)

### Environment Variables
- `CLAUDE_AGENT_ID`: Current agent's ID
- `CLAUDE_AGENT_DEPTH`: Current depth + 1 for child

## Agent Monitoring

### Registry Polling
- Monitor `.active-pids.json` for status changes
- Poll `status` field: `in-progress` → `done`/`failed`
- Hook system can notify on completion via `agent-monitor.mjs`
- No blocking required—agents run asynchronously

## Recursion Control

- **Max depth**: 3 levels (constant `MAX_RECURSION_DEPTH`)
- **Depth tracking**: Via `CLAUDE_AGENT_DEPTH` environment variable
- **Enforcement**: Pre-tool-use hook denies Task calls at max depth (lines 32-42)

## Self-Spawning Prevention

1. **Registry check** (lines 105-123): Parent agent type compared to requested subagent_type
2. **Forbidden agents list** (lines 83-90): Parsed from agent file frontmatter
3. **Auto-forbid**: Non-general agents cannot spawn themselves (lines 100-102)
4. **Runtime enforcement**: Hook in spawned process checks forbidden list (lines 163-179)