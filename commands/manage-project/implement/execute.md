---
description: Execute implementation tasks with parallel validation and progress tracking
argument-hint: [F-## | S-## | API-METHOD-path]
---

# Implementation Phase 3: Execution

Execute implementation tasks according to plan with parallel validation.

$ARGUMENTS

@docs/product-requirements.md
@docs/system-design.md
@agent-backend-developer
@agent-frontend-ui-developer

## Purpose

Execute planned tasks, implement the feature/story/API, and validate continuously during implementation.

## Process

### 1. Load Plan
Read implementation plan:
- `@docs/plans/implement-{item-id}-plan.md` - Task breakdown and dependencies
- `@docs/plans/implement-{item-id}-requirements.md` - Requirements
- `agent-responses/agent_*.md` - Investigation artifacts referenced in plan

Verify plan exists. If missing, prompt user to run `/manage-project/implement/plan` first.

### 2. Execution Strategy
Based on plan's parallelization analysis:

**Sequential:** Tasks have hard dependencies or shared resource conflicts  
**Parallel (preferred):** Independent tasks, 3-5 concurrent optimal  
**Batched (common):** Execute dependency-ordered batches, each batch runs in parallel

### 3. Task Execution Loop

#### 3.1 Task Implementation
**For simple tasks:** Main agent implements directly  
**For complex tasks:** Delegate to specialized agent:
- `@agent-backend-developer` for API endpoints, services, data layer (see `@agent-backend-developer` for backend expertise)
- `@agent-frontend-ui-developer` for React components, UI, forms (see `@agent-frontend-ui-developer` for frontend patterns)
- `@agent-general-purpose` for utilities, config, cross-cutting

#### 3.2 Spawn Validation Agent (One Step Behind)
As soon as task implementation completes, spawn validation agent:

```markdown
Validate implementation of [Task T#].

**Context:**
- Modified files: [Files modified/created in T#]
- Success criteria: @docs/plans/implement-{item-id}-plan.md (Task T# section)
- Requirements: @docs/plans/implement-{item-id}-requirements.md
- Patterns: agent-responses/agent_*.md

Determine validation strategy to verify the implementation meets success criteria and follows established patterns.
```

Validation agent runs asynchronously while next task proceeds.

#### 3.3 Track Progress
```markdown
## Execution Progress

### Batch 1 (3 tasks)
- [✓] T1: Database schema - Complete (validated)
- [✓] T2: API types - Complete (validated)
- [⧗] T3: Utility functions - Validating...

### Batch 2 (3 tasks)
- [⧗] T4: Service layer - In progress
- [○] T5: API endpoints - Pending
- [○] T6: React components - Pending
```

**Legend:** ✓ Complete, ⧗ In progress/Validating, ○ Pending, ⚠ Validation issues, ✗ Failed

### 4. Handle Validation Issues
When validation agent reports issues:

**Review validation report:** Read `agent-responses/agent_{agent_id}.md`

**Assess impact:**
- **Blocking:** Must fix before proceeding (breaks next tasks)
- **Critical:** Should fix now (doesn't block, but important)
- **Minor:** Can defer (polish, non-critical improvements)

**Fix blocking/critical issues immediately, re-validate, then continue.**

### 5. Batch Completion
After each batch completes:
1. Verify all tasks validated successfully
2. Ensure no blocking issues
3. Confirm next batch dependencies satisfied
4. Launch next batch

### 6. Parallel Agent Management
When running parallel agents:
- 3-5 agents optimal per batch
- Max 6 agents (diminishing returns)
- Clear boundaries prevent conflicts

Monitor with: `./agent-responses/await {agent_id}`

### 7. Shared Dependencies
Before parallelizing, create shared types, interfaces, core utilities FIRST. Then spawn parallel agents with clear boundaries.

### 8. Implementation Patterns
Follow patterns from investigations. Reference investigation findings for error handling, validation, auth/permissions, naming, testing.

### 9. Execution Completion
```markdown
## Execution Complete

✓ All tasks implemented
✓ All task validations passed

**Tasks Summary:**
- Batch 1: T1, T2, T3 ✓
- Batch 2: T4, T5, T6 ✓
- Batch 3: T7, T8, T9 ✓

**Validation Reports:**
- agent-responses/agent_*.md ✓

**Next Step:** Run `/manage-project/implement/validate {item-id}` for comprehensive final validation.
```

### 10. Handoff to Validation Phase
```markdown
✓ Execution phase complete
✓ All tasks implemented and validated
✓ Ready for final comprehensive validation

**Next Step:** Run `/manage-project/implement/validate {item-id}`
```

## Output Artifacts

**Created:**
- Implemented code (feature/story/API)
- `agent-responses/agent_{agent_id}.md` - Task validation reports
- Tests (if included in plan)

**References:**
- `@docs/plans/implement-{item-id}-plan.md` (guides execution)
- `@docs/plans/implement-{item-id}-requirements.md` (requirements check)

**Handoff to:** Validation phase (`/manage-project/implement/validate`)

## Edge Cases

### Task Fails Validation Repeatedly
- Assess if requirements are unclear or investigation missed critical information
- May need to update plan or requirements
- Present situation to user for guidance

### Blocking Dependency Discovered
- Document the new dependency
- Update plan with new task or modify existing
- May need to pause and replan

### Parallel Tasks Conflict
- Pause conflicting tasks
- Execute sequentially instead
- Update plan to note conflict

### Implementation Reveals Design Flaw
- Document the issue
- Propose alternative approach
- May need to return to planning phase

### External Blocker Encountered
- Implement everything that isn't blocked
- Create stubs/mocks for blocked dependencies
- Report status to user with options
