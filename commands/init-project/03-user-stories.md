---
description: Collaborate with user to draft user stories with acceptance criteria
---

# Create User Stories

Your job is to collaborate with the user to draft user stories with acceptance criteria, then save them to `docs/user-stories/US-<###>-<slug>.yaml`.

---

## Pre-flight: re-initialize context
1. Run `pdocs template user-story` to understand the structure.
2. Read `<project_root>/docs/CLAUDE.md` for cross-document conventions if available.
3. Read `<project_root>/docs/product-requirements.yaml` to extract the feature list (F-01..F-n) and priorities.
4. Read `<project_root>/docs/user-flows/*.yaml` to understand the primary flows.
5. Check if `<project_root>/docs/user-stories/` already has files. If so, read them and ask whether to improve/add/skip.

---

## Process

## ⚡ Delegation

**Default approach:** Delegate story drafting to a `@agent-documentor` so you can continue orchestration. Provide:
- Output directory (`<project_root>/docs/user-stories/`) and template reference: "Run `pdocs template user-story` to view the structure"
- Feature priorities, related user flows, and any assumptions or open questions gathered
- Instructions to assign sequential IDs, link `feature_id`, write files immediately, and make edits if adjustments are requested
- Reminder to update metadata

Keep interviewing the user or preparing downstream commands while the agent works. Monitor via hook updates and only run `./agent-responses/await {agent_id}` when a draft must be reviewed before moving on.

**Inline exception:** Make direct edits only for tiny tweaks the user explicitly requests (e.g., a wording fix). Otherwise keep the async delegation default.

1. For each high-priority feature (F-01..F-k), generate 1–3 user stories covering the main flow and key edge cases.

2. Each story must include:
   - **User Story:** "As a [type of user], I want [goal], so that [benefit]"
   - **Acceptance Criteria:** Given/When/Then statements (testable)
   - **Context:** why this story matters; related features
   - **Technical Notes:** relevant APIs, data, dependencies
   - **Test Scenarios:** happy path, edge cases, errors
   - **Definition of Done:** checklist (ACs met, code reviewed, tests passing, QA approved)

3. Assign unique IDs: `US-101`, `US-102`, etc. Link each story to its `feature_id` (F-##).

4. Make reasonable assumptions about user needs and system behavior; call them out clearly in the documents.

5. Write one file per story immediately:
   - Filename: `docs/user-stories/US-<###>-<kebab-case-title>.yaml`
   - Front-matter: `story_id`, `feature_id`, `status: draft`, `priority`, `title`

6. If the user requests adjustments, edit the files accordingly.

---

## Output format
- Exactly match the structure from `pdocs template user-story`.
- Keep ACs specific and testable.

---

## Save location
- `<project_root>/docs/user-stories/US-<###>-<slug>.yaml` (one file per story)

---

## Traceability
- Stories link to features via `feature_id`.
- Stories inform feature specs (step 05) and test scenarios.
- Update PRD if stories reveal missing features or unclear requirements.

---

## Next Step

After user stories are saved and approved, **immediately run:**
```
/commands/init-project/04-feature-specs.md
```

No user confirmation needed—the workflow continues automatically.
