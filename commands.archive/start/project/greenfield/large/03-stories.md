---
description: Break features into user stories with acceptance criteria
argument-hint: []
---

# Phase 3: User Stories

**Source:** Existing PRD and user flows

## Deliverable

`docs/user-stories/*.yaml` (10-30 story files) with:
- Story ID (US-101, US-102, etc.)
- Feature ID reference
- "As a / I want / so that" statement
- Acceptance criteria

## Steps

1. **Read template first**: `pdocs template user-story`

2. **Load PRD and flows** for context

3. **Extract stories** from flows and features

4. **List all stories** at high level as bullet points (10-30 stories):
   - Group by feature ID
   - Use format: "US-101: As [persona], I want [action]"
   - Just titles, no acceptance criteria yet

5. **Get user approval** on story list

6. **Update TodoWrite** with each story (or logical groups)

7. **Iterate through each story**:
   - Complete the "as a/I want/so that" statement
   - Ask clarifying questions for acceptance criteria
   - Identify edge cases
   - Draft story using template
   - Write to `docs/user-stories/{feature-name}-story.yaml` or individual files
   - Mark todo complete

8. **Validate** with `pdocs check` (verify feature_id references)

9. **Exit** with `klaude checkout`
