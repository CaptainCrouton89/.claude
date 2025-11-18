---
description: Implement feature according to plan
argument-hint: [feature ID]
---

# Implement Feature

**Feature:** $ARGUMENTS

## Context

You have been delegated implementation of this feature. A plan exists with task breakdown and investigations have been completed.

## Steps

1. **Read implementation plan**: `docs/plans/{feature-id}/plan.yaml`

2. **Read investigations**:
   - `docs/investigations/{feature-id}-pdocs-spec-analysis.yaml`
   - `docs/investigations/{feature-id}-pdocs-codebase-analysis.yaml`

3. **Read feature spec**: `docs/feature-specs/{feature-id}.yaml`

4. **Implement according to plan**:
   - Follow task breakdown from plan
   - Use patterns identified in codebase investigation
   - Satisfy all acceptance criteria from spec
   - Follow existing code conventions and architecture

5. **Run build validation**: Execute project build command (npm run build, pnpm build, etc.)

6. **Update feature spec** implementation status:
   ```yaml
   implementation_status:
     progress: 100
     completed_components: ["Component A", "Component B"]
   ```

## Guidelines

- Work through tasks systematically
- Don't skip validation steps from the plan
- Ask user for clarification if requirements are ambiguous
- Keep implementation focused on the feature scope
- Update TodoWrite if you create one for tracking sub-tasks
