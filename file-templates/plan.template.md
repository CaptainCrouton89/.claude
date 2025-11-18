# Plan: [Feature/Refactor Name]

## Summary
**Goal:** [One sentence]
**Type:** [Feature | Refactor | Enhancement | Bug Fix]
**Scope:** [Small | Medium | Large]

## Relevant Context
- Link `docs/plans/[feature-name]/shared.md`
- Link requirements: `docs/plans/[feature-name]/requirements.md`
- Link investigations (if present): `docs/plans/[feature-name]/investigations/*.md`
- Link init-project docs if present:
  - `docs/product-requirements.md`
  - `docs/user-flows/[feature-slug].md`
  - `docs/feature-spec/[feature-slug].md`
  - `docs/api-contracts.yaml`
  - `docs/system-design.md`
  - `docs/data-plan.md`

## Investigation Artifacts (if any)
- `agent-responses/agent_XXXXXX.md` – [Short description]
- `docs/plans/[feature-name]/investigations/[topic].md` – [Short description]

## Current System Overview
- Briefly describe relevant files and current flows (reference `shared.md` for details)

## Implementation Plan

### Tasks
- Task 1: [What and why]
  - Files: [/path, /path]
  - Depends on: [none | 1 | 2.3]
  - Risks/Gotchas: [brief]
  - Agent: [programmer | junior-engineer | orchestrator | Explore | senior-engineer]
- Task 2: [...]

### Data/Schema Impacts (if any)
- Migrations: [file, summary]
- API contracts: [endpoints, changes]
# Implementation Plan – <Identifier>

## Overview
- **Item ID:** <F-## / S-## / API-...>
- **Spec:** `docs/feature-spec/F-##-<slug>.yaml` (or equivalent)
- **Requirements:** `docs/plans/implement-<id>-requirements.md`
- **Investigations:** [`agent-responses/agent_*.md`]

## Problem (for fixes/refactors)
- [Specific failure/symptom]
- [Why it happens - root cause]

## Solution
- [Core approach in 1-2 bullets]
- [Key principle(s) this change enforces]

## Current System
[Brief: relevant files, current flows, where new code fits]

## Changes Required

### 1) `path/to/file.ts`: `functionName()`
- **Current**: [current behavior/contract]
- **Change**: [new behavior/contract]
- **Code Delta** (optional):
```ts
// key snippet or pseudo
```

### 2) `path/to/other.ts`: `ComponentName`
- **Current**: [current behavior]
- **Change**: [new behavior]

## Task Breakdown

| ID | Description | Agent | Deps | Files | Exit Criteria |
|----|-------------|-------|------|-------|---------------|
| T1 | [What & why] | [agent] | — | [paths] | [criteria] |
| T2 | [What & why] | [agent] | T1 | [paths] | [criteria] |

## Parallelization

### Batch 1 (no deps)
- **Tasks:** T1, T2
- **Notes:** [shared setup, patterns]

### Batch 2 (after Batch 1)
- **Tasks:** T3, T4
- **Notes:** [dependencies on T1/T2]

## Data/Schema Changes (if any)
- **Migration:** [file] – [summary]
- **API:** [endpoint changes]

## Expected Result
- [Explicit observable outcome]
- [Concrete example of previously missing detail now captured]

## Notes (optional)
- [Links, context, related tickets]

## Next
`/manage-project/implement/execute <item-id>`
### Integration Points
- [Service/lib] at `path:file:line` – purpose

### Testing Strategy
- Unit: [files]
- Integration/E2E: [areas]

## Impact Analysis
- Affected files: [/path – why]
- Call sites/dependencies: [key ones]
- Ripple effects/breaking changes: [with mitigation]

## Rollout and Ops
- Config/env: [.env.example updates]
- Migration/rollback: [brief]
- Monitoring: [what to watch]

## Appendix
- Conventions/patterns to follow: [links]
- Open questions/assumptions: [list]

