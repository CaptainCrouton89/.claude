---
description: After /rpi/review - apply recommended fixes
argument-hint: <optional: which fixes, priorities, or skip>
---
# Implement Review Fixes

**Input:** $ARGUMENTS

Parse the input above. It may be:
- Empty (apply all recommended fixes)
- Specific guidance ("fix the type errors, skip the naming suggestions")
- Priorities ("blocking issues only")

## Objective

Address issues identified in the code review by delegating fixes to agents.

## Process

### 1. Review the Feedback

- The review findings should be in the current conversation context
- If guidance was provided, use it to filter which fixes to apply:
  - "all" — fix everything
  - "blocking only" — fix only blocking issues
  - Specific issues — "fix the type error in auth.ts, skip the naming suggestions"

### 2. Categorize Fixes

Group fixes by:
- **Independent fixes** — Can be done in parallel
- **Dependent fixes** — One fix affects another (do sequentially)
- **Skipped** — User indicated these should not be addressed

### 3. Delegate Fix Agents

For each fix (or group of related fixes):

- Use `silas-toolkit:junior-engineer` for straightforward fixes
- Use `silas-toolkit:programmer` for fixes requiring broader changes
- Always use `run_in_background: true` for independent fixes

**Agent prompt should include:**
- The specific issue to fix (with file:line reference)
- The suggested fix from the review
- Any additional context or constraints

### 4. Verify Fixes

As agents complete:
- Confirm each fix was applied correctly
- If a fix introduces new issues, note them
- Track completion status

### 5. Output

When all requested fixes are complete:

State: "Fixes applied. {N} issues addressed, {M} skipped per guidance. Ready for re-review (`/rpi/review`) or proceed."

If issues remain: List what was skipped and why.
