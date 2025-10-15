# Init-Project Workflow Guide

For agents working through YAML-based documentation workflow. Re-read upstream docs at each step—no context persists after chat resets.

## IDs & Linking

- Features: `F-01`, `F-02` (zero-padded) | Stories: `US-101`, `US-102` (3 digits) | Files: kebab-case slugs
- Stories/specs MUST set `feature_id: F-##` matching PRD
- APIs note feature IDs in descriptions | Data events map to PRD metrics

## Files

Pure YAML (no markdown). Required top-level: `title`, `template` path.

**Root:** `docs/{product-requirements,system-design,design-spec,api-contracts,data-plan}.yaml`
**Multi:** `docs/{user-flows,user-stories,feature-specs}/<slug>.yaml`

## Workflow

PRD → User Flows → User Stories → Feature Specs → System Design → API Contracts → Data Plan → Design Spec → Traceability Pass

**List existing before creating:**
```bash
./docs/user-stories/list-stories.sh
./docs/feature-specs/list-features.sh
./docs/check-project.sh -v  # validate all
```

## Idempotency

Check files exist before writing. If exist: read fully, ask (i)mprove/(r)eplace/(s)kip. Never overwrite without approval.

For multi-file docs: list first, offer per-item choices, check ID conflicts with list scripts.

## Assumptions & Sign-off

State assumptions explicitly, ask confirmation, iterate until sign-off. Never write without approval. Example:
> "Assuming: B2B SaaS users, F-01 (Auth) + F-02 (Dashboard), 1000 MAU by Q2. Confirm?"

## Traceability

Every doc references upstream:
- Flows → PRD features (F-##)
- Stories → `feature_id`, flows
- Specs → story IDs, PRD
- APIs → feature IDs
- Data → PRD metrics

Update upstream if gaps found. Propose edits, wait for approval.

## Pitfalls

1. Orphaned IDs (every PRD F-## needs spec with matching `feature_id`)
2. Empty fields (assume reasonably, don't leave blank)
3. Inconsistent naming (keep titles/IDs aligned)
4. Missing metrics (every PRD metric needs tracking event)
5. Vague ACs (use Given/When/Then)
6. API mismatches (specs ↔ contracts)
7. Invalid YAML (2-space indent, quote special chars)

## Final Check

Run `./docs/check-project.sh -v` then manually verify cross-refs:
- PRD F-## ↔ Specs ↔ Stories
- Metrics ↔ Events
- Spec APIs ↔ Contracts
- Flows ↔ Design

Fix mismatches, get sign-off, confirm ready.

## Edge Cases

**Multi-feature stories:** Set `feature_id` to primary, note others in Context.
**Incremental rollout:** Use feature flags, track `feature_enabled` events.
**Third-party APIs:** Note as dependencies, include auth/limits, flag privacy.
**No mockups:** Describe layouts in text, note "pending", still specify states/accessibility.

