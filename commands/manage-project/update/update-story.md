# Update User Story

Modify existing user story: status, criteria, feature link.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

### 1. Show All Stories
```bash
./list-stories.sh
```

### 2. Select Story
Enter story ID (e.g., US-113).

### 3. Show Current State
Display story content.

### 4. Ask What to Update
- Status (incomplete/in-progress/complete)
- Acceptance criteria (add/modify/mark complete)
- User story text
- Feature link
- Priority/estimation

### 5. Validate Changes
Check feature exists if changing link.

### 6. Present Changes & Confirm
Show proposed updates.

### 7. Apply Updates
Update `user-stories/US-###-*.yaml` with `last_updated` timestamp.

### 8. Validation
```bash
./check-project.sh --no-links
```

### 9. Next Steps
- Update another story: run this command again
- Check progress: `./list-stories.sh -s in-progress`

## Edge Cases

### Story not found
Available stories: US-101 through US-115.

### Invalid feature ID
Verify exists with `./list-features.sh | grep "F-06"`.

### Marking complete with incomplete criteria
Warn and get confirmation.

### Changing feature mid-implementation
Warn about potential confusion.

## Output
Updated story file with new status/criteria/feature link.