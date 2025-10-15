# Create System Design Brief

Your job is to collaborate with the user to draft the high-level system design, then save it to `docs/system-design.md` using the template at @/file-templates/init-project/system-design.md.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/system-design.md to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/product-requirements.md` for constraints, dependencies, and non-functional requirements (performance, scalability, reliability).
4. Read `<project_root>/docs/feature-spec/*.md` to extract common components, APIs, data structures, and dependencies.
5. Check if `<project_root>/docs/system-design.md` already exists. If so, read it and ask whether to improve/replace/skip.

---

## Process
1. Draft the system design covering:
   - **Overview:** summarize what the system must do; link to a high-level architecture diagram (or describe it in text/Mermaid)
   - **Core Components:** table with Component, Description, Owner, Dependencies (e.g., API Gateway, Frontend, Backend Services, Database, Auth Service)
   - **Data Flow:** describe how data moves between components (use Mermaid diagram if helpful)
   - **Tech Stack Considerations:** frontend, backend, database, infra/deployment
   - **Scalability & Reliability:** initial load expectations, redundancy/backup plans, observability strategy
   - **Open Questions:** unresolved architecture decisions

2. Ensure the design covers all features from the PRD and aligns with feature specs.

3. Make reasonable assumptions about tech choices; call them out and ask for confirmation.

4. Present a summary of key architectural decisions and open questions; ask for sign-off.

5. On sign-off, write the file with `status: draft`, `last_updated: YYYY-MM-DD`.

---

## Output format
- Exactly match @/file-templates/init-project/system-design.md structure.
- Include specific component names and tech stack choices (not just "TBD").

---

## Save location
- `<project_root>/docs/system-design.md`

---

## Traceability
- Components and data flow must align with feature specs.
- Tech stack will inform API contracts (step 07) and design spec (step 09).
- Update feature specs or PRD if system design reveals infeasible requirements.

