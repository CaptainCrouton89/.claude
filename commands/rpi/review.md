---
description: After /rpi/implement - review code quality
argument-hint: <optional: scope, focus, or concerns>
---
# Post-Implementation Review

**Input:** $ARGUMENTS

Parse the input above. It may be:
- Empty (review everything from this conversation)
- A specific scope ("just the API layer")
- Particular concerns to focus on ("check for race conditions")

## Objective

Assess the implementation completed in this conversation. Identify issues, validate against the plan, and surface actionable feedback.

## Process

### 1. Identify What Changed

- Review the files modified during implementation
- If a specific scope was provided, focus on that area
- Otherwise, review all changes from the current phase

### 2. Delegate Review Agents

Spawn review agents **per vertical slice** (not per concern). Each agent assesses a cohesive unit of work across all quality dimensions.

For each vertical slice, spawn a `silas-toolkit:code-reviewer` agent with `run_in_background: true` to assess:

- **Plan adherence** — Does the implementation match what the plan specified?
- **Code smells** — Are there any anti-patterns, unnecessary complexity, or maintainability concerns?
- **Pattern consistency** — Does the code follow established codebase patterns?
- **Best practices** — Are there violations of language idioms, security concerns, or performance issues?

**Agent prompt template:**
```
Review the following changes for [slice description]:
- Files: [list of files in this slice]
- Plan reference: [relevant section of plan]
- Context: [relevant context doc if applicable]

Assess for: plan adherence, code smells, pattern consistency, best practices.
Report issues with specific file:line references and concrete fix suggestions.
```

### 3. Synthesize Feedback

Once all review agents complete:

- Collect their findings
- Group issues by severity (blocking, important, minor)
- Present a summary with:
  - What was implemented correctly
  - Issues found (with file:line references)
  - Suggested fixes for each issue

### 4. Output

State: "Review complete. {N} issues found ({blocking}, {important}, {minor}). Run `/rpi/fix` to address issues or proceed to next phase."

If no issues: "Review complete. Implementation looks good. Ready for next phase or merge."
