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