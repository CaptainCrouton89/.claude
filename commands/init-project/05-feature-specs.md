# Create Feature Technical Specifications

Your job is to collaborate with the user to draft technical specs for high-priority features, then save them to `docs/feature-spec/F-<##>-<slug>.md` using the template at @/file-templates/init-project/feature-spec/feature-title.md.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/feature-spec/feature-title.md to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/product-requirements.md` to extract the feature list (F-01..F-n) and priorities.
4. Read `<project_root>/docs/user-stories/*.md` to understand acceptance criteria and technical notes.
5. Check if `<project_root>/docs/feature-spec/` already has files. If so, read them and ask whether to improve/add/skip.

---

## Process
1. For each high-priority feature (F-01..F-k), create a technical spec covering:
   - **Summary:** Feature ID, related PRD sections, goal
   - **Functional Overview:** core logic, data schema, API endpoints, integration points
   - **Detailed Design:** data structures (tables, columns), API definitions (POST/GET endpoints, request/response schemas, errors), diagrams (Mermaid/UML)
   - **Dependencies:** libraries, services, data sources
   - **Testing Strategy:** unit, integration, E2E
   - **Rollout Plan:** feature flags, migration steps, monitoring metrics
   - **Open Questions:** unresolved technical decisions

2. Make reasonable assumptions about implementation details; call them out and ask for confirmation.

3. Present a summary of each spec (Feature ID, title, key APIs, open questions); ask for sign-off.

4. On sign-off, write one file per feature:
   - Filename: `docs/feature-spec/F-<##>-<kebab-case-title>.md`
   - Front-matter: `title`, `status: draft`, `feature_id` (must match PRD)

---

## Output format
- Exactly match @/file-templates/init-project/feature-spec/feature-title.md structure.
- Include concrete data structures and API signatures; avoid vague placeholders.

---

## Save location
- `<project_root>/docs/feature-spec/F-<##>-<slug>.md` (one file per feature)

---

## Traceability
- Feature ID must match PRD and user stories.
- API endpoints will feed into API contracts (step 07).
- Data structures will feed into data plan (step 08) and system design (step 06).
- Update PRD or stories if specs reveal missing requirements or infeasible designs.

