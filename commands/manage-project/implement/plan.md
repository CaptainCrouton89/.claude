---
description: Create detailed implementation plan with task breakdown and dependencies
argument-hint: [F-## | S-## | API-METHOD-path]
---

# Implementation Phase 2: Planning

Create detailed implementation plan with task breakdown, dependencies, and validation criteria.

$ARGUMENTS

@docs/product-requirements.md
@docs/system-design.md
@docs/api-contracts.yaml
@agent-documentor

## Purpose

Transform investigation findings into actionable implementation plan with discrete, delegatable tasks.

## Process

### 1. Load Investigation Artifacts
Read all artifacts from investigation phase:
- `@docs/plans/implement-{item-id}-requirements.md` - Requirements document
- `agent-responses/agent_*.md` - All investigation findings

Verify artifacts exist. If missing, prompt user to run `/manage-project/implement/investigate` first.

### 2. Planning Strategy Decision
**Simple (inline planning):** 1-3 tasks, single domain, no complex dependencies
**Moderate (assisted planning):** 4-8 tasks, multiple domains, some dependencies  
**Complex (delegated planning):** 9+ tasks, cross-cutting concerns, complex dependencies

### 3. Delegate Planning Agent (if complex)
For complex features, spawn `@agent-documentor` with all requirements and investigation documents to synthesize the implementation plan.

**See:** `@agent-documentor` for documentation orchestration capabilities, plan synthesis expertise, and task breakdown methodology.

Output: `@docs/plans/implement-{item-id}-plan.md`
- When creating this document for the first time, copy the scaffold from `@/file-templates/manage-project/plans/implement-plan.md` prior to filling it in.

### 4. Create Implementation Plan
Plan must include:

#### Task Breakdown
Break work into discrete, atomic tasks (T1, T2, T3...), each representing one agent session with working code and clear success criteria.

#### Parallelization Analysis
Identify which tasks can run in parallel:

```markdown
### Batch 1 (Parallel - No Dependencies)
- T1: Database schema
- T2: API types/interfaces
- T3: Utility functions

### Batch 2 (Parallel - Depends on Batch 1)
- T4: Service layer (depends on T1, T2)
- T5: API endpoints (depends on T1, T2)
- T6: React components (depends on T3)

### Batch 3 (Parallel - Depends on Batch 2)
- T7: Integration tests (depends on T4, T5)
- T8: E2E tests (depends on T6)
- T9: Documentation (depends on T4, T5, T6)
```

**Common patterns:**
- **Layer-based:** Database → Services → API → Components → Tests
- **Feature-based:** Independent modules in parallel → Integration → Tests
- **Dependency-first:** Shared utilities → Dependent features → Tests

#### Integration Points
Document how tasks integrate (shared interfaces, data flow, API contracts, events).

#### Risk Assessment
Identify potential issues: breaking changes, performance concerns, security considerations, edge cases.

### 5. Link to Investigation Findings
Throughout plan, cite specific investigation findings:
- "Follow error handling pattern from `agent-responses/agent_{id}.md:45`"
- "Integrate with existing auth at `src/auth/service.ts:89` per `agent-responses/agent_{id}.md`"

Plans must be grounded in investigation findings, not assumptions.

### 6. Present Plan for Review
```markdown
## Implementation Plan Created

**Feature:** [F-## name]
**Total Tasks:** [N tasks]
**Execution Strategy:** [X batches, Y parallel tasks]

### Task Summary
- Batch 1: [T1, T2, T3] (parallel)
- Batch 2: [T4, T5] (depends on Batch 1)
- Batch 3: [T6, T7, T8] (parallel, depends on Batch 2)

### Key Points
- [Highlight critical tasks]
- [Note potential risks]
- [List breaking changes]

**Plan Document:** @docs/plans/implement-{item-id}-plan.md

Ready to proceed to execution phase?
```

### 7. Get User Sign-Off
Wait for explicit approval before proceeding.

### 8. Handoff to Execution Phase
```markdown
✓ Planning phase complete
✓ Implementation plan created: @docs/plans/implement-{item-id}-plan.md
✓ Task dependencies mapped
✓ Validation criteria defined

**Next Step:** Run `/manage-project/implement/execute {item-id}` to begin implementation.
```

## Output Artifacts

**Created:**
- `@docs/plans/implement-{item-id}-plan.md` - Detailed implementation plan

**References:**
- `@docs/plans/implement-{item-id}-requirements.md` (from investigation)
- `agent-responses/agent_*.md` (from investigation)

**Handoff to:** Execution phase (`/manage-project/implement/execute`)

## Edge Cases

### Investigation Artifacts Missing
If investigation phase was skipped:
- Prompt to run `/manage-project/implement/investigate` first
- OR perform inline lightweight investigation if scope is simple

### Plan Too Large
If plan has 15+ tasks:
- Break into multiple features or iterations
- Identify MVP subset
- Create phased plan with milestones

### Unclear Dependencies
If task dependencies are complex:
- Create dependency diagram
- Identify critical path
- Highlight blocking tasks

### External Blockers
If plan reveals external dependencies:
- Document blockers clearly
- Identify workarounds or stubs
- Create plan for what CAN be done
