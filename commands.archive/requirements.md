Define a new feature and produce `docs/plans/[feature-name]/requirements.md` using the canonical template at `/Users/silasrhyneer/.claude/file-templates/requirements.template.md`.

At a high level, the feature is:

$ARGUMENTS

Instructions:
- Use the requirements-gathering workflow for discovery: `/Users/silasrhyneer/.claude/protocols/comprehensive/requirements-gathering.md`.
- Ask targeted questions focusing on: user flow, technical implementation, and constraints.
- Investigate the codebase in parallel (1-3 agents) if needed to understand current state.
- If investigations are performed, document each using the canonical template at `/Users/silasrhyneer/.claude/file-templates/investigation.template.md` and save under `docs/plans/[feature-name]/investigations/`.
- **CRITICAL:** Resolve ALL technical inferences and clarifications with the user BEFORE creating the requirements document.
- The final requirements document should contain ONLY confirmed decisions—no open questions or unresolved inferences.
- When all unknowns are resolved, populate the template exactly and confirm with the user before saving.

Integration with docs/ (init-project):
- Ensure the requirements reference or create these docs if they don't exist yet:
  - `docs/product-requirements.md`
  - `docs/user-flows/[feature-slug].md`
  - `docs/feature-spec/[feature-slug].md`
  - `docs/api-contracts.yaml`
  - `docs/system-design.md`
  - `docs/data-plan.md`

Output:
- Save the completed requirements to `docs/plans/[feature-name]/requirements.md`.
- Ensure the “Relevant Files” section is comprehensive to enable downstream planning.