# Add New Feature

Add feature to PRD and create feature specification.

@~/.claude/file-templates/init-project/CLAUDE.md
@~/.claude/file-templates/init-project/feature-spec/feature-title.yaml
@agent-documentor

## Process

## ⚡ Delegation

**Default approach:** Spawn `@agent-documentor` to handle PRD updates and feature-spec creation asynchronously while you gather details. Provide:
- Target files (`product-requirements.yaml`, `feature-specs/F-##-<slug>.yaml`) and relevant templates in `@/file-templates/init-project/`
- Collected feature inputs, dependencies, and any open questions that require confirmation
- Instruction to align IDs and update metadata

Continue gathering answers or routing follow-up commands while the agent works. Rely on hook updates for status and only run `./agent-responses/await {agent_id}` when the written docs block the next step.

**Inline exception:** Direct edits are acceptable only when the user explicitly wants a tiny tweak (e.g., adjust priority). Otherwise, stick with asynchronous delegation.

### 1. Show Existing Features
```bash
./list-features.sh
```

### 2. Gather Feature Details
Ask for:
- Title
- Description
- Priority (P0/P1/P2/P3)
- Owner
- Dependencies (optional)

### 3. Present Draft & Confirm
Show PRD addition and spec file preview.

### 4. Update PRD
Add to `product-requirements.yaml` features list, update version/timestamp.

### 5. Create Feature Spec
Create `feature-specs/F-##-<slug>.yaml` with template structure.

### 6. Validation
```bash
./check-project.sh --no-links
```

### 7. Next Steps
- Add stories: run /manage-project/add/add-story
- Add APIs: run /manage-project/add/add-api
- Add flows: run /manage-project/add/add-flow

## Edge Cases

### No feature-specs/ directory
Create: `mkdir -p <project_root>/docs/feature-specs`

### ID conflicts
Increment if F-06 exists: F-07, etc.

### Minimal info
Use defaults: P2 priority, "TBD" owner, draft status.

## Output
Updated PRD and new feature spec file.
