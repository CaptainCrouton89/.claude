# Traceability & Consistency Pass

Your job is to perform a final cross-document consistency check and update any files with broken links, mismatched IDs, or missing details.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/CLAUDE.md to understand the cross-document conventions.
2. Read all files under `<project_root>/docs/`:
   - `product-requirements.yaml`
   - `system-design.yaml`
   - `design-spec.yaml`
   - `api-contracts.yaml`
   - `data-plan.yaml`
   - All `user-flows/*.yaml`
   - All `user-stories/*.yaml`
   - All `feature-spec/*.yaml`

---

## Process

## ⚡ Delegation

**Default approach:** Use `@agent-documentor` (and additional specialists if needed) to execute the cross-document fixes asynchronously while you coordinate reviews. Provide:
- Full list of discrepancies, affected file paths, and required alignment rules from this workflow
- Instructions to update files immediately, make edits if adjustments are requested, update `last_updated` fields, and maintain ID conventions
- Reminder to surface any unresolved blockers

Continue reconciling outstanding questions or prepping implementation workflows while they work. Monitor via hook updates; `await` only when you must verify the fixes before proceeding.

**Inline exception:** Apply manual edits yourself only for explicit, one-off corrections. Broader adjustments should remain delegated.

1. Verify cross-document consistency:
   - **Feature IDs (F-01..F-n):**
     - PRD Feature List ↔ Feature Specs (one-to-one match by ID and title)
     - User Stories `feature_id` field ↔ PRD Feature List
     - API Contracts endpoints reference correct Feature IDs (in comments or descriptions)
   - **Story IDs (US-101..):**
     - All user stories have unique IDs
     - User stories link to valid `feature_id`
     - Feature specs reference relevant story IDs in context
   - **Success Metrics:**
     - PRD Success Metrics ↔ Data Plan Event Tracking (all metrics have corresponding events)
     - Charter KPIs/OKRs ↔ PRD Success Metrics (aligned)
   - **API Contracts:**
     - All endpoints in feature specs appear in `api-contracts.yaml`
     - Request/response schemas in feature specs match OpenAPI definitions
   - **Data Structures:**
     - Feature spec data structures ↔ API contracts schemas
     - Feature spec data structures ↔ Data plan storage notes
   - **User Flows:**
     - All flows reference valid Feature IDs
     - All screens in flows appear in Design Spec
   - **Design Spec:**
     - All screens in Design Spec trace back to User Flows or User Stories
     - Interaction specs align with Feature Spec APIs

2. Identify inconsistencies:
   - Missing Feature IDs or Story IDs
   - Mismatched titles or descriptions
   - Missing API endpoints in contracts
   - Success metrics without tracking events
   - Screens in flows not covered in Design Spec
   - Any "TBD" or placeholder content left over

3. Update the affected files immediately:
   - Add missing IDs or cross-references
   - Align titles and descriptions
   - Fill in placeholders with concrete details
   - Update `last_updated` fields to current date

4. After updates, re-read all files and confirm consistency.

5. If the user identifies additional issues, make the necessary edits.

---

## Output format
- No new files created; only existing files updated.
- Present a final summary: "All documents consistent. Ready for implementation."

---

## Traceability
- This is the final gate before implementation. Ensure all IDs, metrics, APIs, and designs are aligned and complete.

---

## Completion

After all consistency checks pass and updates are applied, **report:**

```
✅ Init-project workflow complete.

Documentation suite ready:
- Product Requirements: ✓
- User Flows: ✓
- User Stories: ✓
- Feature Specs: ✓
- System Design: ✓
- API Contracts: ✓
- Data Plan: ✓
- Design Spec: ✓
- Cross-references validated: ✓

Next: Ready for implementation via /commands/manage-project/ workflows.
```

No further commands to run. The init workflow is complete.
