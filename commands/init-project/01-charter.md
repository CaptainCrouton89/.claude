# Create Project Charter

Your job is to collaborate with the user to draft the project charter, then save it to the target project's `docs/charter.md` using the template at @/file-templates/init-project/charter.md.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/charter.md to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Check if `<project_root>/docs/charter.md` already exists. If so, read it and ask whether to improve/replace/skip.

---

## Process
1. Ask for or confirm:
   - Project name and 2–3 sentence summary
   - Problem statement (why this matters)
   - SMART goals or OKRs
   - In-scope vs out-of-scope boundaries
   - Constraints (time/budget/resources), dependencies, assumptions
   - Stakeholders (roles/names/responsibilities)

2. Make reasonable assumptions where unspecified, call them out explicitly, and ask the user to confirm.

3. Produce a draft that mirrors the template structure and fields.

4. Present a concise summary of key choices and any open questions; ask for sign-off.

5. On sign-off, write the file and set `status: draft` and `last_updated: YYYY-MM-DD`.

---

## Output format
- Exactly match @/file-templates/init-project/charter.md structure and headings.
- Keep content succinct and actionable.

---

## Save location
- `<project_root>/docs/charter.md`

---

## Traceability
- This document will drive the PRD. Ensure goals and scope are crisp so downstream docs can reference them.
