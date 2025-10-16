# Create User Flows

Your job is to collaborate with the user to draft 2–5 primary user flows, then save them to `docs/user-flows/<slug>.yaml` using the template at @/file-templates/init-project/user-flows/user-flow-title.yaml.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/user-flows/user-flow-title.yaml to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/product-requirements.yaml` to extract primary users, top features (F-01..F-n), and goals.
4. Check if `<project_root>/docs/user-flows/` already has files. If so, read them and ask whether to improve/add/skip.

---

## Process

## ⚡ Delegation

**Default approach:** Spawn a `@agent-documentor` to draft each user-flow file asynchronously. Provide:
- Target directory (`<project_root>/docs/user-flows/`) and template `@/file-templates/init-project/user-flows/user-flow-title.yaml`
- Persona and feature context pulled from the PRD plus any clarifications/assumptions
- Guidance on naming slugs, referencing Feature IDs, and capturing edge cases per this workflow
- Instruction to write files immediately and make edits if adjustments are requested
- Expectation to update metadata

Continue interviewing the user and teeing up downstream steps while the agent works. Monitor via hook updates; call `./agent-responses/await {agent_id}` only if you must review the draft before proceeding.

**Inline exception:** Handle quick touch-ups yourself only when the user asks for a single-field correction; otherwise keep delegation as the default.

1. Identify 2–4 key personas from PRD (e.g., "Admin User", "End Consumer").

2. For each top feature (F-01..F-n), draft a primary flow:
   - **Trigger:** what initiates the flow
   - **Steps:** numbered sequence (user action → system response)
   - **Outcome:** successful end state
   - **Edge Cases / Errors:** what can go wrong

3. Make reasonable assumptions about user goals and system behavior; call them out clearly in the documents.

4. Write one file per flow immediately:
   - Filename: `docs/user-flows/<kebab-case-flow-name>.yaml`
   - Front-matter: `title: <Flow Name>`
   - Include personas table and flow details per template

5. If the user requests adjustments, edit the files accordingly.

---

## Output format
- Exactly match @/file-templates/init-project/user-flows/user-flow-title.yaml structure.
- Each flow should reference the relevant feature ID (F-##) in the description.

---

## Save location
- `<project_root>/docs/user-flows/<slug>.yaml` (one file per flow)

---

## Traceability
- Flows inform user stories (step 04) and feature specs (step 05).
- Update PRD if flows reveal missing features or personas.

---

## Next Step

After user flows are saved and approved, **immediately run:**
```
/commands/init-project/03-user-stories.md
```

No user confirmation needed—the workflow continues automatically.
