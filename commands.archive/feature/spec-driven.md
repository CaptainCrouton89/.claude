---
description: Implement feature with existing spec (2.1 workflow)
argument-hint: [feature ID]
---

# Spec-Driven Feature Implementation

**Feature:** $ARGUMENTS

## Workflow Overview

Feature spec exists → parallel investigation → plan → implement → validate

## Your Task

Execute the complete workflow:

1. **Create TodoWrite** with all phases:
   - Parallel context gathering (specs + codebase)
   - Verify understanding
   - Plan implementation
   - Implement feature
   - Validate build

2. **PHASE 0: Parallel Context Gathering (BACKGROUND)**

Spawn both investigation agents WITHOUT `-c` flag (no checkout):

```bash
klaude start junior-engineer "/feature/investigate/specs $ARGUMENTS" -s
klaude start Explore "/feature/investigate/codebase $ARGUMENTS" -s
```

3. **WHILE PHASE 0 RUNS: Verify Understanding**

   - Read `docs/feature-specs/{feature-id}.yaml`
   - Read `docs/user-stories/*.yaml` (filter by feature_id)
   - Synthesize 2-3 sentence summary
   - Present to user: "I understand we're building: [summary]. Investigations running in background..."
   - Don't wait for user confirmation, continue immediately

4. **WAIT for investigations**: `./agent-responses/await {agent_001} {agent_002}`

Both investigation documents now exist in `docs/investigations/`.

5. **PHASE 1: Planning (CHECKOUT)**

```bash
klaude start Plan "/feature/plan $ARGUMENTS" -c -s
```

After checkout, plan exists at `docs/plans/{feature-id}/plan.yaml`.

6. **PHASE 2: Implementation (CHECKOUT)**

```bash
klaude start programmer "/feature/implement $ARGUMENTS" -c -s
```

After checkout, feature is implemented.

7. **PHASE 3: Validation (OPTIONAL CHECKOUT)**

Ask user: "Would you like me to validate the implementation?"

If yes: `klaude start programmer "/feature/validate $ARGUMENTS" -c -s`

If no: Skip validation

8. **Mark all todos complete** and summarize results

## Key Points

- Background agents spawn WITHOUT `-c` (no checkout)
- Use `./agent-responses/await` to block until investigations complete
- Plan and programmer spawn WITH `-c -s` (checkout + share context)
- Update TodoWrite as phases complete
- Validate understanding early while investigations run
