---
description: Implement a phase from a plan document with verification and approval pause
argument-hint: <plan-file-path>
---

# Implement Phase from Plan

**Plan file:** $ARGUMENTS

## Instructions

1. **Read the plan document** at the specified path
2. **Create a todo list** from the plan steps using TodoWrite
3. **Implement each step** sequentially:
   - Mark the current step as `in_progress`
   - Complete the implementation
   - Mark as `completed` immediately after finishing
   - Move to the next step
4. **Run verification** after all steps complete:
   - Type checking (tsc, mypy, etc.) as appropriate for the codebase
   - Linting if configured
   - Note any pre-existing errors vs new errors
5. **Pause for user approval** before proceeding to the next phase

## Delegation Guidelines

- For straightforward implementation steps, do them directly
- For complex multi-file changes, consider delegating to a `silas-toolkit:programmer` agent
- Always share the plan document path with delegated agents
- Tell delegated agents to "do no more than instructed"

## Output

Summarize what was implemented and verification results. Ask if the user wants to proceed to the next phase or has questions.
