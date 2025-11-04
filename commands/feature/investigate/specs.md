---
description: Read and analyze existing spec documents for a feature
argument-hint: [feature ID]
---

# Investigate Feature Specifications

**Feature:** $ARGUMENTS

## Deliverable

`docs/investigations/{feature-id}-pdocs-spec-analysis.yaml`

## Steps

1. **Read template first**: `pdocs template investigation-topic`

2. **Read feature documentation**:
   - `docs/feature-specs/{feature-id}.yaml`
   - `docs/user-stories/*.yaml` (filter by feature_id)
   - `docs/requirements/{feature-id}.yaml` (if exists)

3. **Synthesize understanding**:
   - What is the feature trying to accomplish?
   - Key functional requirements
   - User stories and acceptance criteria
   - API endpoints mentioned
   - Data schema requirements
   - Dependencies and constraints

4. **Write investigation document** to `docs/investigations/{feature-id}-pdocs-spec-analysis.yaml`

## Guidelines

- Keep analysis concise and focused on implementation-relevant details
- Omit obvious information
- Highlight cross-cutting concerns and edge cases
- Note any ambiguities or missing information
