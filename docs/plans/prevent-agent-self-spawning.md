# Plan: Prevent Agent Self-Spawning via Active PID Registry

## Summary

**Goal:** Prevent agents from spawning themselves by checking active agent types in the PID registry before allowing spawn operations.

**Type:** Bug Fix

**Problem:** Current forbiddenAgents mechanism (agent-interceptor.js:86-87) doesn't effectively prevent self-spawning because it doesn't check whether an agent of the same type is already active.

---

## Reasoning

**Why this approach:**
- `.active-pids.json` already tracks running agents (agent-interceptor.js:194-208)
- Adding type tracking enables verification before spawn, not just denial after attempt
- Checking active registry is more reliable than forbiddenAgents list passed to child

**Alternatives considered:**
- Current forbiddenAgents mechanism: Doesn't work because it's checked inside child agent after spawn

---

## Impact Analysis

### Main Affected Files

**Files requiring changes:** 1 file

**Hook:**
- `hooks/pre-tool-use/agent-interceptor.js:203-207` - Add `type` field to registry
- `hooks/pre-tool-use/agent-interceptor.js:43-88` - Add pre-spawn verification check

---

## Current System

### Relevant Files

**Hook:**
- `hooks/pre-tool-use/agent-interceptor.js` - Agent spawning interceptor

### Current Flow

Task tool called → Depth check (line 32-42) → Agent ID generated (line 44) →
Log created (lines 89-100) → Runner script created (lines 103-183) →
Process spawned (lines 187-191) → **Registry updated** (lines 194-208)

### Current Registry Structure (lines 203-207)
```javascript
registry[agentId] = {
  pid: childProcess.pid,
  depth: currentDepth,
  parentId: parentAgentId
  // MISSING: type field
};
```

---

## New System Design

### Modified Flow

Task tool called → Depth check → **Type check against active registry** →
Agent ID generated → Log created → Runner script created →
Process spawned → Registry updated **with type field**

### New Registry Structure
```javascript
registry[agentId] = {
  pid: childProcess.pid,
  depth: currentDepth,
  parentId: parentAgentId,
  type: subagentType  // NEW
};
```

### New Verification Check (insert after line 42)
Check all active registry entries for matching `type` field.
If match found, deny with message about self-spawning prevention.

---

## Implementation Checklist

- [ ] Add type field to registry entry (line 203-207)
- [ ] Add verification check after depth check (after line 42)
- [ ] Test with test-agent spawning itself
- [ ] Verify .active-pids.json contains type field
