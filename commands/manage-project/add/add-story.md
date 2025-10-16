# Add User Story

Add user story linked to existing feature.

@~/.claude/file-templates/init-project/CLAUDE.md
@~/.claude/file-templates/init-project/user-stories/story-title.yaml

## Process

## ⚡ Delegation

**Default approach:** Delegate story drafting to `@agent-documentor` so you can keep orchestrating. Provide:
- Output path (`user-stories/US-###-<slug>.yaml`) and template `@/file-templates/init-project/user-stories/story-title.yaml`
- Selected feature ID, gathered story inputs, acceptance criteria notes, and any pending questions
- Instruction to maintain sequential IDs and update metadata

Continue collecting user input or prepping next commands while the agent works. Monitor via hook updates; only `await` if you must review the draft before moving forward.

**Inline exception:** Apply quick manual edits only when the user asks for a single-field correction. Otherwise default to the async delegation path.

### 1. Show Available Features
```bash
./list-features.sh
```

### 2. Determine Next Story ID
```bash
./list-stories.sh --format ids
```

### 3. Gather Story Details
Ask for:
- Feature ID (must exist)
- User story: "As a [role], I want [goal], so that [benefit]"
- Acceptance criteria (2-5 Given/When/Then)

### 4. Present Draft & Confirm
Show story file preview.

### 5. Create Story File
Create `user-stories/US-###-<slug>.yaml` with template.

### 6. Validation
```bash
./check-project.sh --no-links
```

### 7. Next Steps
- Add another story: run this command again
- Check coverage: run /manage-project/validate/check-coverage

## Edge Cases

### No user-stories/ directory
Create: `mkdir -p <project_root>/docs/user-stories`

### ID conflicts
Increment if US-113 exists: US-114, etc.

### Invalid feature ID
Verify exists with `./list-features.sh | grep "F-06"`

### Incomplete criteria
Require at least 2 acceptance criteria.

## Output
New user story file linked to feature.
