---
description: Add user flow describing how users accomplish tasks and goals
---

# Add User Flow

Add user flow describing how users accomplish tasks.

@~/.claude/file-templates/init-project/CLAUDE.md
@~/.claude/file-templates/init-project/user-flows/user-flow-title.yaml

## Process

## ⚡ Delegation

**Default approach:** Delegate creation of flow docs to `@agent-documentor` while you keep orchestrating. Provide:
- Output directory (`user-flows/<slug>.yaml`) and template `@/file-templates/init-project/user-flows/user-flow-title.yaml`
- Persona information, flow steps, edge cases gathered from the user, plus any assumptions needing confirmation
- Instruction to reference relevant Feature IDs and update metadata consistently

Continue gathering additional details or routing follow-up commands while the agent works. Monitor via hook updates; only `await` when their output blocks the next step.

**Inline exception:** Manual edits are fine only for explicit single-field adjustments; otherwise rely on async delegation.

### 1. Show Existing Flows
```bash
./list-flows.sh
```

### 2. Show Features
```bash
./list-features.sh
```

### 3. Gather Flow Details
Ask for:
- Flow name
- Primary actor
- Goal
- Steps (numbered sequence)
- Features involved
- Alternate paths
- Edge cases

### 4. Present Draft & Confirm
Show flow file preview.

### 5. Create Flow File
Create `user-flows/<slug>.yaml` with template.

### 6. Check Related Docs
Update related stories or design spec if affected.

### 7. Validation
```bash
./check-project.sh
```

### 8. Next Steps

Present options to user:

```markdown
✓ User flow added: @docs/user-flows/[slug].yaml
✓ Linked to relevant features

**Next Steps:**

**Option 1: Add More Documentation**
- Add another flow: `/manage-project/add/add-flow`
- Check coverage: `/manage-project/validate/check-coverage`

**Option 2: Implement This Flow**
- Start implementation: `/manage-project/implement/00-orchestrate FLOW-[slug]`
  - Runs investigation → planning → execution → validation
  - Implements complete end-to-end user flow

**Option 3: Add Supporting Details**
- Add user stories for flow steps: `/manage-project/add/add-story`
- Add API endpoints needed: `/manage-project/add/add-api`

Which path would you like to take?
```

## Edge Cases

### No user-flows/ directory
Create: `mkdir -p <project_root>/docs/user-flows`

### Complex flows
Split into multiple flows if too many branches.

### No related features
Link to at least one feature or explain why standalone.

## Output
New user flow file with steps, actors, and edge cases.
