---
description: Execute implementation tasks with parallel validation and progress tracking
argument-hint: [F-## | S-## | API-METHOD-path]
---

# Implementation Phase 3: Execution

Execute implementation tasks according to plan with parallel validation.

$ARGUMENTS

@docs/product-requirements.md
@docs/system-design.md
@agent-programmer

## Purpose

Execute planned tasks, implement the feature/story/API, and validate continuously during implementation.

## Process

### 1. Load Plan
Read implementation plan:
- `@docs/plans/implement-{item-id}-plan.md` - Task breakdown and dependencies
- `@docs/plans/implement-{item-id}-requirements.md` - Requirements

Verify plan exists. If missing, prompt user to run `/manage-project/implement/plan` first.

### 2. Execution Strategy
Event-driven, dependency-based execution:

**Dependency-driven:** Each task launches immediately when its dependencies complete
**Concurrent execution:** Multiple independent tasks run simultaneously (3-5 agents optimal)
**No batch coordination:** Tasks don't wait for "batches" to complete—execution is fluid and asynchronous

### 3. Task Execution Loop

#### 3.1 Task Implementation
**For simple tasks:** Main agent implements directly  
**For complex tasks:** Delegate to specialized agent:
- `@agent-programmer` for API endpoints, services, data layer, components, UI, forms
- `@agent-orchestrator` for utilities, config, cross-cutting

#### 3.2 Spawn Validation Agent (One Step Behind)
As soon as task implementation completes, spawn validation agent:

```markdown
Validate implementation of [Task T#].

**Context:**
- Modified files: [Files modified/created in T#]
- Success criteria: @docs/plans/implement-{item-id}-plan.md (Task T# section)
- Requirements: @docs/plans/implement-{item-id}-requirements.md

Determine validation strategy to verify the implementation meets success criteria and follows established patterns.
```

Validation agent runs asynchronously while next task proceeds.

#### 3.3 Track Progress
```markdown
## Execution Progress

- [✓] T1: Database schema - Complete (validated)
- [✓] T2: API types - Complete (validated)
- [⧗] T3: Utility functions - Validating...
- [⧗] T4: Service layer - In progress (depends on T1, T2)
- [○] T5: API endpoints - Ready to start (depends on T3, T4)
- [○] T6: React components - Waiting on T2
- [○] T7: Integration tests - Waiting on T5, T6
```

**Legend:** ✓ Complete, ⧗ In progress/Validating, ○ Pending, ⚠ Validation issues, ✗ Failed

### 4. Handle Validation Issues
When validation agent reports issues:

**Review validation report:** Agent output returned via klaude

**Assess impact:**
- **Blocking:** Must fix before proceeding (breaks next tasks)
- **Critical:** Should fix now (doesn't block, but important)
- **Minor:** Can defer (polish, non-critical improvements)

**Fix blocking/critical issues immediately, re-validate, then continue.**

### 5. Task Completion
After each task completes:
1. Verify task validated successfully
2. Check for blocking issues
3. Identify tasks whose dependencies are now satisfied
4. Launch newly-ready tasks immediately

### 6. Parallel Agent Management
When running parallel agents:
- 3-5 concurrent agents optimal
- Max 6 agents running simultaneously (diminishing returns)
- Tasks launch as dependencies complete, not in coordinated batches
- Clear boundaries prevent conflicts
- klaude returns agent output directly upon completion

### 7. Shared Dependencies
Before parallelizing, create shared types, interfaces, core utilities FIRST. Then spawn parallel agents with clear boundaries.

### 8. Implementation Patterns
Follow patterns from investigations. Reference investigation findings for error handling, validation, auth/permissions, naming, testing.

### 9. Execution Completion
```markdown
## Execution Complete

✓ All tasks implemented
✓ All task validations passed

**Tasks Completed:**
- T1: Database schema ✓
- T2: API types ✓
- T3: Utility functions ✓
- T4: Service layer ✓
- T5: API endpoints ✓
- T6: React components ✓
- T7: Integration tests ✓

**Validation Reports:**
- All validations passed ✓

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
