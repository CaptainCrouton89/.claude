# Add User Flow

Add user flow describing how users accomplish tasks.

@~/.claude/file-templates/init-project/CLAUDE.md
@~/.claude/file-templates/init-project/user-flows/user-flow-title.yaml

## Process

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
- Add another flow: run this command again
- Check coverage: run /manage-project/validate/check-coverage

## Edge Cases

### No user-flows/ directory
Create: `mkdir -p <project_root>/docs/user-flows`

### Complex flows
Split into multiple flows if too many branches.

### No related features
Link to at least one feature or explain why standalone.

## Output
New user flow file with steps, actors, and edge cases.