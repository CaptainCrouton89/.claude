# Create User Flows

Your job is to collaborate with the user to draft 2–5 primary user flows, then save them to `docs/user-flows/<slug>.md` using the template at @/file-templates/init-project/user-flows/user-flow-title.md.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/user-flows/user-flow-title.md to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/charter.md` and `<project_root>/docs/product-requirements.md` to extract primary users, top features (F-01..F-n), and goals.
4. Check if `<project_root>/docs/user-flows/` already has files. If so, read them and ask whether to improve/add/skip.

---

## Process
1. Identify 2–4 key personas from PRD (e.g., "Admin User", "End Consumer").

2. For each top feature (F-01..F-n), draft a primary flow:
   - **Trigger:** what initiates the flow
   - **Steps:** numbered sequence (user action → system response)
   - **Outcome:** successful end state
   - **Edge Cases / Errors:** what can go wrong

3. Make reasonable assumptions about user goals and system behavior; call them out and ask for confirmation.

4. Present a summary of personas and flows; ask for sign-off.

5. On sign-off, write one file per flow:
   - Filename: `docs/user-flows/<kebab-case-flow-name>.md`
   - Front-matter: `title: <Flow Name>`
   - Include personas table and flow details per template

---

## Output format
- Exactly match @/file-templates/init-project/user-flows/user-flow-title.md structure.
- Each flow should reference the relevant feature ID (F-##) in the description.

---

## Save location
- `<project_root>/docs/user-flows/<slug>.md` (one file per flow)

---

## Traceability
- Flows inform user stories (step 04) and feature specs (step 05).
- Update PRD if flows reveal missing features or personas.
