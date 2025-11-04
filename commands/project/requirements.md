---
description: Gather requirements and create spec documents for new feature
argument-hint: [feature description]
---

# Gather Feature Requirements

**Feature Description:** $ARGUMENTS

## Deliverables

- `docs/feature-specs/{feature-id}.yaml`
- `docs/user-stories/US-*.yaml` (multiple)

## Steps

1. **Read templates first**:
   - `pdocs template feature-spec`
   - `pdocs template user-story`

2. **Gather requirements via AskUserQuestion** (aim for <10 questions total):
   - Feature goal and summary
   - Key functional requirements
   - User personas and stories
   - Data schema needs
   - API endpoints needed
   - Non-functional requirements (performance, security, etc.)

3. **Create feature spec**: `docs/feature-specs/{feature-id}.yaml`
   - Use next available feature ID (check existing features)
   - Keep concise—omit obvious details
   - Focus on what's different or complex

4. **Create user stories**: `docs/user-stories/US-*.yaml`
   - One file per story
   - Link to feature_id
   - Include clear acceptance criteria

5. **Validate**: Run `pdocs check` to ensure documents are valid

6. **Spawn detached doc update**: `klaude start junior-engineer "/project/docs/update {feature-id}" -s`
   - No `-c` flag = runs in background
   - Updates PRD with new feature

7. **Checkout**: Run `klaude checkout` to return control to orchestrator

## Guidelines

- Keep questions focused and consolidated
- Make reasonable assumptions and document them
- Omit inferable information from specs
- No editorializing in documentation
- Validate before checking out
