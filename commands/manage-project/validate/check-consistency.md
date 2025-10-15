# Check Documentation Consistency

Run traceability checks across all docs. Identify inconsistencies, broken links.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

### 1. Run Automated Validation
```bash
./check-project.sh -v
```

### 2. Parse Results
Categorize issues: errors (critical), warnings (important), passed (good).

### 3. Identify Issues
Check for:
- Orphaned stories (feature_id doesn't exist)
- Missing specs (features without spec files)
- Broken links (invalid references)
- Empty required fields

### 4. Explain Each Issue
For each issue: problem, impact, fix suggestion.

### 5. Run Additional Checks
- Feature coverage: `./list-features.sh` vs spec files
- API alignment: `./list-apis.sh` vs feature specs
- Metric tracking: PRD metrics in data-plan.yaml

### 6. Offer Fixes
For each issue, offer automated or guided fixes.

### 7. Apply Fixes
Update files, re-validate after each fix.

### 8. Generate Report
Summary with before/after status, remaining issues.

### 9. Next Steps
Fix remaining issues or accept current state.

## Output
Validation report with issues, fixes applied, final status.