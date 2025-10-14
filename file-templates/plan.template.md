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
  - Agent: [frontend-ui-developer | backend-developer | general-purpose]
- Task 2: [...]

### Data/Schema Impacts (if any)
- Migrations: [file, summary]
- API contracts: [endpoints, changes]

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

