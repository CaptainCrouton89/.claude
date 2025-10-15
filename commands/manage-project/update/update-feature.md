# Update Existing Feature

Update both PRD feature entry and feature spec. Maintain consistency with dependent stories and APIs.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

### 1. Show Features
```bash
./list-features.sh
```

### 2. Select Feature
Enter feature ID to update (e.g., F-06).

### 3. Show Current State
Display PRD entry and feature spec content.

### 4. Ask What to Update
- Priority (P0/P1/P2/P3)
- Owner
- Description/summary
- Status (draft/approved/in-progress/complete)
- Technical details (APIs, data models, dependencies)
- Rollout plan

### 5. Check Downstream Impacts
If changing feature fundamentally:
- Check stories: `./list-stories.sh -f F-06`
- Check APIs: `./list-apis.sh | grep "F-06"`
- Check data plan if metrics affected

### 6. Present Changes & Confirm
Show proposed updates to both PRD and spec files.

### 7. Apply Updates
- Update `product-requirements.yaml` (increment version)
- Update `feature-specs/F-##-*.yaml`
- Update `last_updated` timestamps

### 8. Validation
```bash
./check-project.sh -v
```

### 9. Next Steps
- Update affected stories: run /manage-project/update/update-story
- Update APIs: run /manage-project/update/update-api
- Full consistency check: run /manage-project/validate/check-consistency

## Edge Cases

### Feature not found
Available features: F-01 through F-06. Choose valid ID.

### Spec file missing
Create spec first: `/manage-project/add/add-feature` (without updating PRD).

### Breaking changes
If changes affect contracts, warn and get confirmation.

## Output
Updated PRD and feature spec files with new version numbers and timestamps.
