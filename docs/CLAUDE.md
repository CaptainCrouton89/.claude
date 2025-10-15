# Cross-Document Conventions & Best Practices

This guide covers non-obvious rules for agents working through the init-project workflow. Agents will run steps independently after chat resets, so every step must re-read relevant upstream docs.

---

## ID & Naming Conventions

**Feature IDs:** `F-01`, `F-02`, ..., `F-n` (zero-padded, unique across PRD)
**Story IDs:** `US-101`, `US-102`, ..., `US-n` (three digits, unique across project)
**Slugs:** kebab-case filenames derived from titles (e.g., `user-authentication` from "User Authentication")

**Linking:**
- User stories MUST set `feature_id: F-##` in front-matter to link back to PRD features.
- Feature specs MUST include `Feature ID: F-##` and cite `Related PRD Sections`.
- API contracts SHOULD include comments or descriptions referencing Feature IDs (e.g., `# F-01: User Authentication`).
- Data plan events SHOULD map back to PRD success metrics explicitly (e.g., "Metric: MAU → Event: user_login").

---

## File Naming & Structure

**Root docs:**
- `docs/product-requirements.md`
- `docs/system-design.md`
- `docs/design-spec.md`
- `docs/api-contracts.yaml`
- `docs/data-plan.md`

**Multi-file docs:**
- `docs/user-flows/<slug>.md` — one file per primary flow (e.g., `onboarding.md`, `checkout.md`)
- `docs/user-stories/US-<###>-<slug>.md` — one file per story (e.g., `US-101-user-login.md`)
- `docs/feature-spec/F-<##>-<slug>.md` — one file per feature (e.g., `F-01-authentication.md`)

**Front-matter fields (YAML):**
- For stories: `story_id`, `feature_id`,.
- For feature specs: `feature_id` (matching PRD exactly).
---

## Workflow Order & Dependencies

**Critical dependency chain:**
1. Charter → PRD (goals, scope, success metrics)
2. PRD → User Flows (features, personas)
3. User Flows → User Stories (flows, acceptance criteria)
4. User Stories → Feature Specs (stories, technical details)
5. Feature Specs → System Design (components, data, APIs)
6. Feature Specs → API Contracts (endpoint signatures)
7. PRD + Feature Specs → Data Plan (metrics, events, storage)
8. User Flows + User Stories → Design Spec (screens, interactions)
9. All → Traceability Pass (consistency check)

**Agents MUST re-read upstream docs at the start of each step.** Never assume prior context exists after a chat reset.

---

## Idempotency & Re-runs

**Before writing any file:**
1. Check if it already exists using `read_file` or `list_dir`.
2. If it exists, read it fully.
3. Ask the user: "I found `<filename>`. Do you want to (i)mprove it, (r)eplace it, or (s)kip this step?"
4. Never overwrite without explicit confirmation.

**For multi-file steps (flows, stories, specs):**
- List existing files first.
- Offer per-item choices: improve, add new, rename, skip.
- If user wants to add, generate new IDs that don't conflict with existing ones.

---

## Assumptions & User Interaction

**Make reasonable assumptions, but:**
1. State them explicitly in a bulleted list.
2. Ask the user to confirm or correct.
3. Iterate until the user gives explicit sign-off.

**Example:**
> "I'm assuming:
> - Primary users are B2B SaaS admins and end-users.
> - MVP scope includes F-01 (Auth), F-02 (Dashboard), F-03 (Reports).
> - Success metric: 1000 MAU by Q2.
> 
> Confirm or adjust?"

**Never write files without sign-off.** Always present a summary of key decisions and open questions first.

---

## Cross-Document Traceability

**Every document must reference upstream dependencies:**
- PRD cites Charter goals and scope.
- User Flows cite PRD features (F-##).
- User Stories cite PRD features (via `feature_id`) and reference Flows.
- Feature Specs cite PRD sections and Story IDs.
- API Contracts cite Feature IDs in endpoint descriptions.
- Data Plan cites PRD success metrics and Feature Spec data structures.
- Design Spec cites User Flows and User Stories.

**Update upstream docs if downstream steps reveal gaps:**
- If a feature spec uncovers a missing requirement → update PRD.
- If API design forces data model changes → update feature spec.
- If design reveals a missing flow → update user flows.

**Propose edits explicitly and wait for approval before applying.**

---

## Common Pitfalls to Avoid

1. **Orphaned IDs:** Every F-## in PRD must have a corresponding `feature-spec/F-##-*.md`. Every US-### must link to a valid F-##.
2. **Placeholders:** Avoid "TBD", "TODO", or vague descriptions. If you don't know, make a reasonable assumption and flag it as an open question.
3. **Inconsistent naming:** If PRD says "User Authentication" (F-01), the feature spec must be `F-01-user-authentication.md` and title must match.
4. **Missing metrics:** Every success metric in PRD must have a tracking event in Data Plan.
5. **Untestable ACs:** User story acceptance criteria must be Given/When/Then with concrete conditions, not vague goals like "works well".
6. **API mismatches:** Every endpoint in feature specs must appear in `api-contracts.yaml` with matching request/response schemas.

---

## Final Consistency Check (Step 10)

**The traceability pass is not optional.** After all docs are generated:
1. Read ALL files under `<project_root>/docs`.
2. Build a cross-reference matrix:
   - PRD Feature List (F-##) ↔ Feature Specs ↔ User Stories (feature_id)
   - PRD Success Metrics ↔ Data Plan Events
   - Feature Spec APIs ↔ API Contracts endpoints
   - User Flows screens ↔ Design Spec layouts
3. Identify mismatches and propose fixes.
4. Update files only after user sign-off.
5. Confirm: "All documents consistent. Ready for implementation."

---

## Edge Cases

**Multi-feature stories:**
- Some stories may span multiple features (e.g., "Onboarding flow" touches Auth, Profile, Dashboard).
- Set `feature_id` to the primary feature; note the others in Context or Technical Notes.

**Incremental rollout:**
- Use feature flags in Feature Specs Rollout Plan.
- Data Plan should track flag states as events (e.g., `feature_enabled`).

**Third-party integrations:**
- Treat external APIs as dependencies in Feature Specs.
- Include auth/rate-limit notes in API Contracts.
- Flag privacy/compliance implications in Data Plan.

**Design without mockups:**
- If no Figma/XD links exist, describe layouts in text and note "Design artifacts pending" in Design Spec Overview.
- Still specify component states, breakpoints, and accessibility requirements.

---

## When to Update This Guide

If agents repeatedly hit the same issue across multiple projects (e.g., missing event tracking, inconsistent API naming), update this guide with a new rule or example. Keep it under 100 lines by consolidating related rules.

