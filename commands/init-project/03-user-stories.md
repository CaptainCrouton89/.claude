# Create User Stories

Your job is to collaborate with the user to draft user stories with acceptance criteria, then save them to `docs/user-stories/US-<###>-<slug>.md` using the template at @/file-templates/init-project/user-stories/story-title.md.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/user-stories/story-title.md to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/product-requirements.md` to extract the feature list (F-01..F-n) and priorities.
4. Read `<project_root>/docs/user-flows/*.md` to understand the primary flows.
5. Check if `<project_root>/docs/user-stories/` already has files. If so, read them and ask whether to improve/add/skip.

---

## Process
1. For each high-priority feature (F-01..F-k), generate 1–3 user stories covering the main flow and key edge cases.

2. Each story must include:
   - **User Story:** "As a [type of user], I want [goal], so that [benefit]"
   - **Acceptance Criteria:** Given/When/Then statements (testable)
   - **Context:** why this story matters; related features
   - **Technical Notes:** relevant APIs, data, dependencies
   - **Test Scenarios:** happy path, edge cases, errors
   - **Definition of Done:** checklist (ACs met, code reviewed, tests passing, QA approved)

3. Assign unique IDs: `US-101`, `US-102`, etc. Link each story to its `feature_id` (F-##).

4. Make reasonable assumptions about user needs and system behavior; call them out and ask for confirmation.

5. Present a summary of stories (ID, title, feature, priority); ask for sign-off.

6. On sign-off, write one file per story:
   - Filename: `docs/user-stories/US-<###>-<kebab-case-title>.md`
   - Front-matter: `story_id`, `feature_id`, `status: draft`, `priority`, `title`

---

## Output format
- Exactly match @/file-templates/init-project/user-stories/story-title.md structure.
- Keep ACs specific and testable.

---

## Save location
- `<project_root>/docs/user-stories/US-<###>-<slug>.md` (one file per story)

---

## Traceability
- Stories link to features via `feature_id`.
- Stories inform feature specs (step 05) and test scenarios.
- Update PRD if stories reveal missing features or unclear requirements.

