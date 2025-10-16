# Create Data & Analytics Plan

Your job is to collaborate with the user to draft the data and analytics plan, then save it to `docs/data-plan.yaml` using the template at @/file-templates/init-project/data-plan.yaml.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/data-plan.yaml to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/product-requirements.yaml` to extract success metrics, KPIs, and measurement methods.
4. Read `<project_root>/docs/feature-spec/*.yaml` to extract data structures (tables, columns) and events to track.
5. Read `<project_root>/docs/api-contracts.yaml` to understand endpoints and data flows.
6. Check if `<project_root>/docs/data-plan.yaml` already exists. If so, read it and ask whether to improve/replace/skip.

---

## Process

## ⚡ Delegation

**Default approach:** Delegate the data-plan drafting to `@agent-documentor` so you can keep orchestration flowing. Provide:
- Output path (`<project_root>/docs/data-plan.yaml`) and template `@/file-templates/init-project/data-plan.yaml`
- Success metrics from the PRD, structured data from feature specs, and API context, plus any assumptions
- Instructions to map every metric to events/sources, surface privacy callouts, write the file immediately, and make edits if adjustments are requested
- Reminder to update metadata

Continue collecting clarifications or prepping the next command while the agent works. Monitor via hook updates; `await` only when you must review the deliverable before advancing.

**Inline exception:** Direct manual edits are limited to explicit single-field tweaks requested by the user. Otherwise default to async delegation.

1. Draft the data plan covering:
   - **Data Sources:** table with Source, Description, Owner (e.g., PostgreSQL, Analytics DB, External API)
   - **Event Tracking Plan:** table with Event Name, Trigger, Properties, Destination (GA/Mixpanel/Segment) — map each success metric to trackable events
   - **Data Storage:** initial schema notes (reference feature specs), retention policy, privacy/compliance notes (GDPR, CCPA)
   - **Success Metrics Alignment:** explicit mapping from PRD metrics to events and data sources

2. Ensure all PRD success metrics have corresponding events and storage.

3. Make reasonable assumptions about analytics tools and privacy policies; call them out clearly in the document.

4. Write the file immediately with `last_updated: YYYY-MM-DD`.

5. If the user requests adjustments, edit the file accordingly.

---

## Output format
- Exactly match @/file-templates/init-project/data-plan.yaml structure.
- Include specific event names and properties (not placeholders).

---

## Save location
- `<project_root>/docs/data-plan.yaml`

---

## Traceability
- Event tracking must align with PRD success metrics.
- Data schema must align with feature specs and API contracts.
- Update PRD or feature specs if data plan reveals missing metrics or data structures.

---

## Next Step

After data plan is saved and approved, **immediately run:**
```
/commands/init-project/08-design-spec.md
```

No user confirmation needed—the workflow continues automatically.
