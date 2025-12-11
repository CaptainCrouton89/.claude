---
description: Review recent implementation with multiple agents and fix identified issues
argument-hint: [optional: specific files or scope to review]
---

# Review and Fix Implementation

**Scope:** $ARGUMENTS (or recent implementation if not specified)

## Phase 1: Parallel Code Review

Spawn **multiple code reviewer agents in parallel** (`silas-toolkit:code-reviewer`) to evaluate:

1. **Plan adherence** - Does implementation match the plan? Any deviations?
2. **Code quality** - Code smells, duplication, maintainability concerns
3. **Consistency** - Naming patterns, type consistency across languages/files
4. **Missing pieces** - Tests, documentation, edge cases

Each reviewer should focus on different aspects or files. Run them with `run_in_background: true` and collect results.

## Phase 2: Consolidate Findings

After all reviewers complete, consolidate into a prioritized list:

| Priority | Description |
|----------|-------------|
| **Critical** | Must fix - bugs, security issues, broken functionality |
| **Warnings** | Should fix - missing tests, duplication, inconsistencies |
| **Suggestions** | Consider - style improvements, documentation, minor optimizations |

Present this summary to the user.

## Phase 3: Delegate Fixes

For each issue to fix:

- **Easy/straightforward fixes**: Delegate directly to `silas-toolkit:junior-engineer` or `silas-toolkit:programmer` agents
- **Complex fixes requiring design decisions**: Delegate to `silas-toolkit:senior-advisor` for planning first, then delegate the resulting plan to a programmer agent

Run independent fixes **in parallel** where possible. For fixes with dependencies, run sequentially.

Always tell delegated agents:
- What specific issue to fix
- The file(s) involved
- "Do no more than instructed"

## Phase 4: Verification

After fixes complete:
- Run type checking
- Run relevant tests
- Confirm no regressions

## Output

Report:
1. Summary of issues found by reviewers
2. Which fixes were applied
3. Verification results
4. Any remaining items deferred or needing user input
