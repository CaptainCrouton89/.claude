---
description: After /rpi/plan - execute with parallel agents
argument-hint: <plan-path or description>
---
# Implement Plan

**Input:** $ARGUMENTS

Parse the input above. It may be:
- A direct path to a plan file
- A topic name (look in `.claude/plans/{topic}.plan.md`)
- A description with guidance on what to prioritize, skip, or handle differently

Extract the plan reference and any implementation guidance.

## Objective

Execute the implementation plan by delegating work to agents. Maximize parallelism while respecting dependencies.

## Process

### 1. Read the Plan

- Load the plan document provided as input
- If the plan references sub-plans (large multi-phase plans), **implement only the current phase**—do not attempt all phases at once. Otherwise, your job is to make sure the entire thing is implemented.
- Identify the dependency graph between tasks

### 2. Execute with Parallel Agents

**Delegation strategy:**
- Use `silas-toolkit:junior-engineer` for well-specified, bounded tasks
- Use `silas-toolkit:programmer` for tasks requiring pattern analysis or multi-file changes
- Always use `run_in_background: true`

**Dependency management:**
- Launch all tasks with no dependencies immediately (parallel batch)
- As each agent completes, check what dependent tasks are now unblocked
- Launch newly unblocked tasks immediately—don't wait for the entire batch
- Continue until all tasks in the current phase are complete

**Agent prompts should include:**
- The specific task from the plan
- Relevant context document paths (from `.claude/context/`)
- Any constraints or patterns to follow
- Clear success criteria

Note: agents should usually not run tests or try to validate changes—other agents may be running, and one agent that runs typechecks may falsely find errors from unrelated code.

### 3. Monitor Progress

- Track which agents are running and which have completed
- Surface any agent failures or blockers immediately
- If an agent reports a blocker, assess whether to:
  - Resolve the blocker and re-run
  - Adjust the approach
  - Escalate to the user

### 4. Phase Completion

When all tasks in the current phase are complete:

State: "Phase {N} implementation complete. Ready for review (`/rpi/review`) or continue to next phase."

**Do not** automatically proceed to the next phase—allow the user to review first.

## Notes

- For large plans, expect to run `/rpi/implement` multiple times (once per phase)
- Code review happens separately via `/rpi/review`
- Keep the user informed of progress, especially for long-running implementations
