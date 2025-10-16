# Create System Design Brief

Your job is to collaborate with the user to draft the high-level system design, then save it to `docs/system-design.yaml` using the template at @/file-templates/init-project/system-design.yaml.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/system-design.yaml to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/product-requirements.yaml` for constraints, dependencies, and non-functional requirements (performance, scalability, reliability).
4. Read `<project_root>/docs/feature-spec/*.yaml` to extract common components, APIs, data structures, and dependencies.
5. Check if `<project_root>/docs/system-design.yaml` already exists. If so, read it and ask whether to improve/replace/skip.

---

## Process

## ⚡ Delegation

**Default approach:** Delegate the system-design brief to `@agent-documentor` so you can keep coordinating subsequent steps. Provide:
- Output path (`<project_root>/docs/system-design.yaml`) and template `@/file-templates/init-project/system-design.yaml`
- Summaries from PRD, feature specs, and any architectural assumptions or constraints collected
- Instructions to surface open questions, align components with Feature IDs, write the file immediately, and make edits if adjustments are requested
- Reminder to refresh metadata

Continue probing for requirements or prepping next workflows while the agent works. Monitor via hook updates; only `await` if their deliverable blocks downstream routing.

**Inline exception:** Apply direct edits yourself only when the user requests a tiny adjustment. Otherwise keep the async delegation default.

1. Draft the system design covering:
   - **Overview:** summarize what the system must do; link to a high-level architecture diagram (or describe it in text/Mermaid)
   - **Core Components:** table with Component, Description, Owner, Dependencies (e.g., API Gateway, Frontend, Backend Services, Database, Auth Service)
   - **Data Flow:** describe how data moves between components (use Mermaid diagram if helpful)
   - **Tech Stack Considerations:** frontend, backend, database, infra/deployment
   - **Scalability & Reliability:** initial load expectations, redundancy/backup plans, observability strategy
   - **Open Questions:** unresolved architecture decisions

2. Ensure the design covers all features from the PRD and aligns with feature specs.

3. Make reasonable assumptions about tech choices; call them out clearly in the document.

4. Write the file immediately with `status: draft`, `last_updated: YYYY-MM-DD`.

5. If the user requests adjustments, edit the file accordingly.

---

## Output format
- Exactly match @/file-templates/init-project/system-design.yaml structure.
- Include specific component names and tech stack choices (not just "TBD").

---

## Save location
- `<project_root>/docs/system-design.yaml`

---

## Traceability
- Components and data flow must align with feature specs.
- Tech stack will inform API contracts (step 07) and design spec (step 09).
- Update feature specs or PRD if system design reveals infeasible requirements.

---

## Next Step

After system design is saved and approved, **immediately run:**
```
/commands/init-project/06-api-contracts.md
```

No user confirmation needed—the workflow continues automatically.
