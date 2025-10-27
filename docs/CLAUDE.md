# /docs Directory

Generated project documentation from the init-project workflow.

## Structure

**Root documents:**
- `product-requirements.md` — PRD with features (F-##) and success metrics
- `system-design.md` — Architecture, components, data models
- `design-spec.md` — UI/UX screens, interactions
- `api-contracts.yaml` — OpenAPI endpoint definitions
- `data-plan.md` — Metrics, events, tracking

**Subdirectories:**
- `user-flows/` — Primary user flows (one `.md` per flow)
- `user-stories/` — User stories (US-### format, linked to features via `feature_id`)
- `feature-spec/` — Feature specs (F-## format, one per feature)
- `architecture/` — Architecture decision records
- `guides/` — Process docs, runbooks, troubleshooting

## ID & Naming

- **Features:** `F-01`, `F-02`, ... (PRD only)
- **Stories:** `US-101`, `US-102`, ... (must set `feature_id` in front-matter)
- **Files:** kebab-case slugs from titles (e.g., `user-authentication.md`)

## Critical Rules

**Traceability:**
- Every F-## in PRD → feature-spec/F-##-*.md
- Every story → links to PRD feature via `feature_id`
- Every API endpoint → referenced in feature spec
- Every success metric → tracking event in data-plan.md

**Before editing:** Always read upstream docs first (PRD → Flows → Stories → Specs). Workflow has hard dependencies.

**Idempotency:** Check if files exist before writing. Ask user: improve/replace/skip?

See parent CLAUDE.md for full conventions and edge cases.
