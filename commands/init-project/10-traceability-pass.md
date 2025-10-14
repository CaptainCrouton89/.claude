# Traceability & Consistency Pass

Your job is to perform a final cross-document consistency check and update any files with broken links, mismatched IDs, or missing details.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/CLAUDE.md to understand the cross-document conventions.
2. Read all files under `<project_root>/docs/`:
   - `charter.md`
   - `product-requirements.md`
   - `system-design.md`
   - `design-spec.md`
   - `api-contracts.yaml`
   - `data-plan.md`
   - All `user-flows/*.md`
   - All `user-stories/*.md`
   - All `feature-spec/*.md`

---

## Process
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

3. Present a summary of inconsistencies and proposed fixes; ask for sign-off.

4. On sign-off, update the affected files:
   - Add missing IDs or cross-references
   - Align titles and descriptions
   - Fill in placeholders with concrete details
   - Update `last_updated` fields to current date

5. After updates, re-read all files and confirm consistency.

---

## Output format
- No new files created; only existing files updated.
- Present a final summary: "All documents consistent. Ready for implementation."

---

## Traceability
- This is the final gate before implementation. Ensure all IDs, metrics, APIs, and designs are aligned and complete.

