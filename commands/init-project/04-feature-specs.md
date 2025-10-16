# Create Feature Technical Specifications

Your job is to collaborate with the user to draft technical specs for high-priority features, then save them to `docs/feature-spec/F-<##>-<slug>.yaml` using the template at @/file-templates/init-project/feature-spec/feature-title.yaml.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/feature-spec/feature-title.yaml to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/product-requirements.yaml` to extract the feature list (F-01..F-n) and priorities.
4. Read `<project_root>/docs/user-stories/*.yaml` to understand acceptance criteria and technical notes.
5. Check if `<project_root>/docs/feature-spec/` already has files. If so, read them and ask whether to improve/add/skip.

---

## Process

## ⚡ Delegation

**Default approach:** Hand feature-spec drafting to `@agent-documentor` so you can keep coordinating the workflow. Provide:
- Output directory (`<project_root>/docs/feature-spec/`) and template `@/file-templates/init-project/feature-spec/feature-title.yaml`
- Relevant PRD, user story, and flow context plus any assumptions/open decisions needing callouts
- Instructions to reference Feature IDs consistently, document APIs/data structures, and request approval before saving each spec with refreshed timestamps

Continue clarifying requirements or prepping later steps while the agent works. Monitor via streaming updates; use `./agent-responses/await {agent_id}` only when the draft must gate later actions.

**Inline exception:** Apply direct edits yourself only when the user asks for a quick micro-change; default remains asynchronous delegation.

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
   - Filename: `docs/feature-spec/F-<##>-<kebab-case-title>.yaml`
   - Front-matter: `title`, `status: draft`, `feature_id` (must match PRD)

---

## Output format
- Exactly match @/file-templates/init-project/feature-spec/feature-title.yaml structure.
- Include concrete data structures and API signatures; avoid vague placeholders.

---

## Save location
- `<project_root>/docs/feature-spec/F-<##>-<slug>.yaml` (one file per feature)

---

## Traceability
- Feature ID must match PRD and user stories.
- API endpoints will feed into API contracts (step 07).
- Data structures will feed into data plan (step 08) and system design (step 06).
- Update PRD or stories if specs reveal missing requirements or infeasible designs.

---

## Next Step

After feature specs are saved and approved, **immediately run:**
```
/commands/init-project/05-system-design.md
```

No user confirmation needed—the workflow continues automatically.
