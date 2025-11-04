---
description: Update PRD to include new feature
argument-hint: [feature ID]
---

# Update Project Documentation

**Feature:** $ARGUMENTS

## Deliverable

Updated `docs/product-requirements.yaml`

## Steps

1. **Read newly created feature spec**: `docs/feature-specs/{feature-id}.yaml`

2. **Extract key information**:
   - feature_id
   - title
   - summary

3. **Read existing PRD**: `docs/product-requirements.yaml`

4. **Add feature to features list**:
   ```yaml
   features:
     - feature_id: F-XX
       title: "Feature title"
       summary: "Brief feature summary"
   ```

5. **Validate**: Run `pdocs check` to ensure PRD is still valid

## Note

This command runs in background (detached), no checkout needed.
