# Plan: Parent-Only Agent Monitoring

## Summary

**Goal:** Modify agent monitoring system so each agent only receives notifications about its direct children, not grandchildren.

**Type:** Enhancement

**Problem:** Currently `agent-monitor.mjs` broadcasts all agent updates to the current agent. This means root agents receive notifications about grandchildren agents (children of their children), creating noisy and confusing monitoring feedback.

---

## Reasoning

**Why this approach:**
- Registry (`agent-responses/.active-pids.json:96-104`) already tracks `parentId` for each agent
- Each agent runs with `CLAUDE_AGENT_ID` environment variable identifying itself
- Simple parent-child matching via registry lookup requires no spawning changes
- Backward compatible - gracefully handles missing registry data

**Alternatives considered:**
- **Agent-specific response directories**: Each agent monitors only `agent-responses/{agent_id}/` subdirectory
  - Rejected: Requires restructuring file layout, breaks existing wait-for-agent script, complicates cleanup
- **Depth-based filtering**: Filter by depth level only
  - Rejected: Doesn't handle parallel agents at same depth, overly simplistic

---

## Impact Analysis

### Main Affected Files

**Files requiring changes:** 1 file total

**Backend (1 file):**
- `hooks/lifecycle/agent-monitor.mjs:34-168` - Add parent-child filtering logic

### Key Integration Points

1. **Environment variables** (`agent-interceptor.js:244`) - Uses `CLAUDE_AGENT_ID` set during spawn
2. **Registry file** (`agent-responses/.active-pids.json`) - Contains parent relationship data
3. **Hook execution** - Runs in spawning agent's process context automatically

---

## Current System

### Relevant Files

**Lifecycle Hooks:**
- `hooks/lifecycle/agent-monitor.mjs` - Monitors all agent files, notifies on updates/completion
- `agent-responses/.active-pids.json` - Registry tracking agent relationships

**Agent Spawning:**
- `hooks/pre-tool-use/agent-interceptor.js:232-238` - Creates registry entries with `parentId`
- `hooks/pre-tool-use/agent-interceptor.js:244` - Sets `CLAUDE_AGENT_ID` environment variable

### Current Flow

Hook trigger (`lifecycle/agent-monitor.mjs:90-201`) →
Scan entire `agent-responses/` directory (line 114) →
Check each file for modifications (lines 117-131) →
Extract update content (lines 149-155) →
Broadcast notification to current agent (lines 177-196) →
**Problem:** No filtering - all agents notify current agent

---

## New/Modified System Design

### Modified Files

- `hooks/lifecycle/agent-monitor.mjs:34` - Add `getCurrentAgentId()` helper
- `hooks/lifecycle/agent-monitor.mjs:40` - Add `loadRegistry()` helper
- `hooks/lifecycle/agent-monitor.mjs:117-168` - Add parent-child filtering in main loop

### New Flow

Hook trigger → Load registry and current agent ID →
Scan `agent-responses/` directory →
For each modified file:
  - Extract agent ID from filename
  - Look up agent in registry
  - **Check if `parentId` matches current agent**
  - Skip notification if not a direct child →
Broadcast only direct child notifications

### Filtering Logic

```
currentAgentId = process.env.CLAUDE_AGENT_ID || null

For each modified agent file:
  agentId = extract from filename (e.g., "agent_123456")
  registryEntry = registry[agentId]

  if (!registryEntry) {
    // Registry cleaned up, agent completed - proceed with notification
    notify(agent update)
  } else if (registryEntry.parentId === currentAgentId) {
    // Direct child - notify
    notify(agent update)
  } else if (currentAgentId === null && registryEntry.parentId === null) {
    // Root agent seeing root-spawned child - notify
    notify(agent update)
  } else {
    // Not a direct child - skip
    continue
  }
```

### Edge Cases

1. **Registry cleanup race condition**: Agent completes and registry cleaned before monitor runs
   - **Solution**: If agent not in registry, assume completed and notify (existing behavior)

2. **Root agent identification**: Root has no `CLAUDE_AGENT_ID`
   - **Solution**: `null` or `undefined` indicates root context

3. **Multiple parents**: Not possible - each agent has exactly one parent in registry

4. **Agent depth changes**: Not relevant - filtering by `parentId`, not `depth`

---

## Implementation Checklist

- [ ] Add `getCurrentAgentId()` helper function
- [ ] Add `loadRegistry()` helper function
- [ ] Modify main monitoring loop with parent filter
- [ ] Handle root agent special case (`parentId === null`)
- [ ] Handle missing registry entries (race condition)
- [ ] Test with 3-level agent hierarchy (root → agent → subagent)
- [ ] Verify root sees only direct children
- [ ] Verify subagents see only their children
- [ ] Verify completion notifications still work after registry cleanup

---

## Testing Strategy

**Test Cases:**

1. **Root spawns agent_A, agent_A spawns agent_B**
   - Root should see agent_A updates only
   - Root should NOT see agent_B updates
   - agent_A should see agent_B updates

2. **Parallel agents at same depth**
   - Root spawns agent_A and agent_B
   - Root should see both
   - agent_A should NOT see agent_B updates

3. **Agent completion and cleanup**
   - agent_B completes → registry cleaned
   - agent_A should still receive completion notification
   - Root should NOT receive notification

4. **Three-level hierarchy**
   - Root → agent_A → agent_B → agent_C
   - Root sees only agent_A
   - agent_A sees only agent_B
   - agent_B sees only agent_C
