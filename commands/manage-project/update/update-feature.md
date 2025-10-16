---
description: Update feature specification and reconcile with related documents
---

# Update Existing Feature

Update both PRD feature entry and feature spec. Maintain consistency with dependent stories and APIs.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

## ⚡ Delegation

**Default approach:** Delegate documentation updates to `@agent-documentor` so the primary agent can focus on orchestration. Provide:
- Target files (`product-requirements.yaml`, `feature-specs/F-##-<slug>.yaml`) and relevant template references
- Diff summary or bullet list of requested changes, downstream impacts, and any open questions for confirmation
- Instruction to synchronize IDs/versions, and refresh `last_updated`

Continue coordinating dependency checks or next steps while the agent works. Monitor via hook updates; only `await` when their changes block subsequent actions.

**Inline exception:** Make direct edits only when the user asks for a minimal tweak. Otherwise keep asynchronous delegation as the default.

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

Present options to user:

```markdown
✓ Feature F-## updated in product requirements and specification
✓ Documentation synchronized

**Next Steps:**

**Option 1: Update Related Documentation**
- Update affected stories: `/manage-project/update/update-story`
- Update APIs: `/manage-project/update/update-api`
- Check consistency: `/manage-project/validate/check-consistency`

**Option 2: Re-implement Based on Changes**
- If changes require code updates: `/manage-project/implement/00-orchestrate F-##`
  - Existing plan will be updated based on new requirements
  - Investigation phase will identify what changed
  - Only affected components will be re-implemented

Which path would you like to take?
```

## Edge Cases

### Feature not found
Available features: F-01 through F-06. Choose valid ID.

### Spec file missing
Create spec first: `/manage-project/add/add-feature` (without updating PRD).

### Breaking changes
If changes affect contracts, warn and get confirmation.

## Output
Updated PRD and feature spec files with new version numbers and timestamps.
