---
description: Create epic plan with feature ordering
argument-hint: [epic description]
---

# Create Epic Plan

**Epic:** $ARGUMENTS

## Deliverable

`docs/plans/{epic-name}/epic-plan.yaml`

## Steps

1. **Read PRD**: `docs/product-requirements.yaml`

2. **Query existing features**: `pdocs list features --format json`

3. **Analyze epic description** and identify constituent features:
   - Which features already have specs?
   - Which features need to be created?
   - Use user's description to determine scope

4. **Determine dependency order**:
   - Which features depend on others?
   - Which can be built in parallel?
   - Consider data dependencies, API dependencies, UI dependencies

5. **Create epic plan**: `docs/plans/{epic-name}/epic-plan.yaml`
   ```yaml
   epic_name: "Epic Name"
   description: "Epic description"
   features:
     - feature_id: F-XX
       name: "Feature name"
       has_spec: true|false
       spec_path: "docs/feature-specs/F-XX.yaml" # if has_spec
       description: "Brief description" # if no spec
       dependencies: [F-YY, F-ZZ]
   build_order:
     - phase: 1
       features: [F-XX]
       rationale: "Why this order"
     - phase: 2
       features: [F-YY, F-ZZ]
       rationale: "These can run in parallel"
   ```

6. **Present plan to user** (you're checked out to them)

## Guidelines

- Be realistic about dependencies
- Group independent features in same phase for parallel work
- Explain rationale for build order
- Flag features that need spec creation
