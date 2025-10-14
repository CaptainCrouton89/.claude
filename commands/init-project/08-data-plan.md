# Create Data & Analytics Plan

Your job is to collaborate with the user to draft the data and analytics plan, then save it to `docs/data-plan.md` using the template at @/file-templates/init-project/data-plan.md.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/data-plan.md to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/charter.md` to extract success metrics and KPIs.
4. Read `<project_root>/docs/product-requirements.md` to extract success metrics and measurement methods.
5. Read `<project_root>/docs/feature-spec/*.md` to extract data structures (tables, columns) and events to track.
6. Read `<project_root>/docs/api-contracts.yaml` to understand endpoints and data flows.
7. Check if `<project_root>/docs/data-plan.md` already exists. If so, read it and ask whether to improve/replace/skip.

---

## Process
1. Draft the data plan covering:
   - **Data Sources:** table with Source, Description, Owner (e.g., PostgreSQL, Analytics DB, External API)
   - **Event Tracking Plan:** table with Event Name, Trigger, Properties, Destination (GA/Mixpanel/Segment) — map each success metric to trackable events
   - **Data Storage:** initial schema notes (reference feature specs), retention policy, privacy/compliance notes (GDPR, CCPA)
   - **Success Metrics Alignment:** explicit mapping from PRD metrics to events and data sources

2. Ensure all PRD success metrics have corresponding events and storage.

3. Make reasonable assumptions about analytics tools and privacy policies; call them out and ask for confirmation.

4. Present a summary of data sources, key events, and metrics alignment; ask for sign-off.

5. On sign-off, write the file with `last_updated: YYYY-MM-DD`.

---

## Output format
- Exactly match @/file-templates/init-project/data-plan.md structure.
- Include specific event names and properties (not placeholders).

---

## Save location
- `<project_root>/docs/data-plan.md`

---

## Traceability
- Event tracking must align with PRD success metrics.
- Data schema must align with feature specs and API contracts.
- Update PRD or feature specs if data plan reveals missing metrics or data structures.

