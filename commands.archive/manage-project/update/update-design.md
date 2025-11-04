---
description: Update design specifications and reconcile with feature requirements
---

# Update Design Specification

Modify design spec: goals, components, screens, interactions.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

## ⚡ Delegation

**Default approach:** Delegate design-spec edits to `@agent-documentor` while you coordinate related workflows. Provide:
- Target file: `design-spec.yaml`
- Update details: requested updates, dependencies (flows/stories/components), and assumptions needing confirmation
- Context: user flows and feature specs that reference affected components/screens

Continue handling flow impact checks or next commands while they work. Monitor via hook updates; only `await` when their changes gate further progress.

**Inline exception:** Make direct edits yourself solely for explicit, narrow tweaks requested by the user; otherwise keep the async delegation default.

### 1. Show Current Design Spec State
Read `design-spec.yaml` and show summary.

### 2. Ask What to Update
- Design goals/principles
- Color palette/theme
- Typography
- Component definitions
- Screen definitions
- Interaction patterns
- Responsive breakpoints
- Accessibility requirements

### 3. Gather Update Details
Based on selection, collect new design information.

### 4. Check Flow Impact
If updating screens, check user flows that reference them.

### 5. Present Changes & Confirm
Show proposed design spec updates.

### 6. Apply Updates
Update `design-spec.yaml` and increment version.

### 7. Update Related Flows
Update user flows if screen changes affect them.

### 8. Validation
```bash
./check-project.sh
```

### 9. Next Steps

Present options to user:

```markdown
✓ Design specification updated (version incremented)
✓ User flows synchronized (if affected)

**Next Steps:**

**Option 1: Update Related Documentation**
- Generate design docs: `./generate-docs.sh`
- Update user flows: Check affected flows
- Update feature specs with new design details

**Option 2: Implement Design Changes**
- If components/screens changed: Identify affected features with `./list-features.sh`
- Then implement updates: `/manage-project/implement/00-orchestrate F-##`
  - Frontend components updated to match new designs
  - Styling/theme changes applied
  - Interaction patterns implemented
  - Accessibility requirements met

Which path would you like to take?
```

## Edge Cases

### design-spec.yaml not found
Run `/init-project/08-design-spec` first.

### Breaking component changes
Warn if removing variants used in screens.

### Color accessibility
Check WCAG contrast ratios.

### Screen references
Update flows if screen names change.

## Output
Updated design spec with new components/screens/interactions.
