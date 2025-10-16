# Create Product Requirements Document

Your job is to collaborate with the user to draft the PRD, then save it to `docs/product-requirements.yaml` using the template at @/file-templates/init-project/product-requirements.yaml.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/product-requirements.yaml to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Check if `<project_root>/docs/product-requirements.yaml` already exists. If so, read it and ask whether to improve/replace/skip.

---

## Process

## ⚡ Delegation

**Default approach:** Spawn a `@agent-documentor` to draft and save the PRD while you continue orchestrating. Provide:
- Target project root and output path (`<project_root>/docs/product-requirements.yaml`)
- Template reference `@/file-templates/init-project/product-requirements.yaml` plus cross-doc rules in `@/file-templates/init-project/CLAUDE.md`
- Collected answers, assumptions, and any open questions to document
- Instruction to write the file immediately and make edits if adjustments are requested
- Reminder to update metadata

Keep gathering inputs or lining up downstream commands while the documentor runs. Monitor through hook updates and only call `./agent-responses/await {agent_id}` if the deliverable blocks progress.

**Inline exception:** When the user explicitly requests a tiny tweak (e.g., correcting one field), you may edit directly; otherwise default to asynchronous delegation.

1. Gather project requirements:
   - Overview: project name, summary, problem statement
   - Scope: what's in scope and out of scope
   - Summary: goal, primary users, key problems solved
   - Initial feature list with IDs (F-01..F-n)
   - Success metrics

2. Ask for or confirm:
   - User stories stub (defer detailed stories to step 04; here just include 1–2 examples per top feature)
   - Non-functional requirements (performance, security, reliability, compliance, scalability)
   - Risks and mitigations

3. Make reasonable assumptions and call them out clearly in the document.

4. Produce the complete document with:
   - Feature List table (ID, Feature, Priority, Description, Owner)
   - Success Metrics table (Metric, Target, Measurement Method)
   - Risks table (Risk, Likelihood, Impact, Mitigation)

5. Write the file immediately with `version: 0.1`, `status: draft`, `last_updated: YYYY-MM-DD`.

6. If the user requests adjustments, edit the file accordingly.

---

## Output format
- Exactly match @/file-templates/init-project/product-requirements.yaml structure.

---

## Save location
- `<project_root>/docs/product-requirements.yaml`

---

## Traceability
- Feature IDs (F-01..F-n) must be unique and will be referenced by user stories, feature specs, and API contracts.
- Success metrics will drive the data plan.

---

## Next Step

After PRD is saved and approved, **immediately run:**
```
/commands/init-project/02-user-flows.md
```

No user confirmation needed—the workflow continues automatically.
