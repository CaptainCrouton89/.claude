---
description: Create implementation plan from investigations and spec
argument-hint: [feature ID]
---

# Create Implementation Plan

**Feature:** $ARGUMENTS

## Deliverable

`docs/plans/{feature-id}/plan.yaml`

## Steps

1. **Read template first**: `pdocs template plan`

2. **Read investigation outputs**:
   - `docs/investigations/{feature-id}-pdocs-spec-analysis.yaml`
   - `docs/investigations/{feature-id}-pdocs-codebase-analysis.yaml`

3. **Read feature spec**: `docs/feature-specs/{feature-id}.yaml`

4. **Create task breakdown**:
   - Identify all files to create/modify
   - Break work into logical tasks with clear boundaries
   - Determine task dependencies and execution order
   - Assign appropriate agent types (programmer/junior-engineer)
   - Define exit criteria and validation steps

5. **Write plan** to `docs/plans/{feature-id}/plan.yaml`

6. **Present plan summary** to user (you're checked out to them)

## Guidelines

- Make tasks concrete and actionable
- Keep task granularity appropriate (not too small, not too large)
- Identify risks and unknowns explicitly
- Reference specific file paths and patterns from codebase investigation
- Define clear success criteria
