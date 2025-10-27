---
description: Add new feature to product requirements and create specification
argument-hint: [feature name or description]
---

# Add New Feature

Add feature to PRD and create feature specification.

Templates: `pdocs template product-requirements`, `pdocs template feature-spec`

## Process

## ⚡ Delegation

**Default approach:** Spawn `@agent-documentor` to handle PRD updates and feature-spec creation asynchronously while you gather details. Provide:
- Target files: `product-requirements.yaml`, `feature-specs/F-##-<slug>.yaml`
- Template references: "Run `pdocs template product-requirements` and `pdocs template feature-spec` to view structures"
- Feature inputs: collected feature details, dependencies, and any open questions
- Context: existing features via `./list-features.sh` output

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

Present options to user:

```markdown
✓ Feature F-## added to product requirements
✓ Feature specification created: @docs/feature-specs/F-##-[slug].yaml

**Next Steps:**

**Option 1: Add Supporting Documentation (Recommended)**
- Add user stories: `/manage-project/add/add-story`
- Add API endpoints: `/manage-project/add/add-api`
- Add user flows: `/manage-project/add/add-flow`

**Option 2: Implement Immediately**
- Start implementation: `/manage-project/implement/00-orchestrate F-##`
  - This will run investigation → planning → execution → validation phases
  - You'll have opportunities to review and approve at each phase

**Option 3: Gather Detailed Requirements First**
- Create comprehensive requirements: `/plan/requirements [feature name]`
  - Best for complex features needing upfront clarity
  - Produces detailed requirements doc before implementation

Which path would you like to take?
```

## Edge Cases

### No feature-specs/ directory
Create: `mkdir -p <project_root>/docs/feature-specs`

### ID conflicts
Increment if F-06 exists: F-07, etc.

### Minimal info
Use defaults: P2 priority, "TBD" owner, draft status.

## Output
Updated PRD and new feature spec file.
