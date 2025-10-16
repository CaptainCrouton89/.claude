---
description: Collaborate with user to draft UI design specification and interaction patterns
---

# Create Design Specification

Your job is to collaborate with the user to draft the design specification, then save it to `docs/design-spec.yaml` using the template at @/file-templates/init-project/design-spec.yaml.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/design-spec.yaml to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/user-flows/*.yaml` to understand primary user flows and personas.
4. Read `<project_root>/docs/user-stories/*.yaml` to understand acceptance criteria and interaction requirements.
5. Read `<project_root>/docs/feature-spec/*.yaml` to extract API constraints and interaction patterns.
6. Check if `<project_root>/docs/design-spec.yaml` already exists. If so, read it and ask whether to improve/replace/skip.

---

## Process

## ⚡ Delegation

**Default approach:** Delegate drafting of the design spec to `@agent-documentor` so you can keep orchestrating. Provide:
- Output path (`<project_root>/docs/design-spec.yaml`) and template `@/file-templates/init-project/design-spec.yaml`
- Inputs from user flows, stories, feature specs, and any design-system assumptions gathered
- Instructions to cover accessibility/responsive requirements, link screens to Feature IDs, write the file immediately, and make edits if adjustments are requested

Continue collecting clarifications or lining up next steps while the agent works. Monitor via hook updates; only `await` when the draft blocks further progress.

**Inline exception:** Direct edits are reserved for explicit one-off tweaks; otherwise maintain asynchronous delegation as the norm.

1. Draft the design spec covering:
   - **Overview:** design goals (e.g., "Modern, accessible, mobile-first"), links to Figma/XD/Sketch (or note if not available), design system used (e.g., Material UI, Tailwind)
   - **Layouts & Components:** table with Screen, Description, Link, Notes — cover key screens from user flows
   - **Accessibility:** color contrast compliance (WCAG AA/AAA), keyboard navigation, screen reader notes
   - **Responsive Behavior:** breakpoints (mobile, tablet, desktop) and adaptive design notes
   - **Interaction Specs:** for each major component (Button, Form, Modal), specify states (default, hover, disabled) and animations (e.g., "fade-in 150ms")

2. Ensure design aligns with:
   - User flows (all screens in flows are covered)
   - Feature specs (interactions match API constraints)
   - User stories (ACs for UI behavior are met)

3. Make reasonable assumptions about design system and interaction patterns; call them out clearly in the document.

4. Write the file immediately with `last_updated: YYYY-MM-DD`.

5. If the user requests adjustments, edit the file accordingly.

---

## Output format
- Exactly match @/file-templates/init-project/design-spec.yaml structure.
- Include specific component names and interaction details (not vague placeholders).

---

## Save location
- `<project_root>/docs/design-spec.yaml`

---

## Traceability
- Screens must align with user flows.
- Interactions must align with feature specs and user stories.
- Update user stories or feature specs if design reveals missing requirements or infeasible UX.

---

## Next Step

After design spec is saved and approved, **immediately run:**
```
/commands/init-project/09-traceability-pass.md
```

No user confirmation needed—the workflow continues automatically.
