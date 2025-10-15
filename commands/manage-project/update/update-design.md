# Update Design Specification

Modify design spec: goals, components, screens, interactions.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

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
- Generate design docs: `./generate-docs.sh`
- Update user flows: check related flows

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