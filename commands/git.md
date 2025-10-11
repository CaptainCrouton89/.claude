I have just finished one or more changes. It's time to commit and push.

## Phase 1: Analysis

Analyze git diffs, running any additional `git` commands necessary to understand the scope of change.

## Phase 2: Commit Strategy

### For Small Changes
**When:** Single feature, <3 files, or trivial changes
**Action:** Stage and commit: `git add [files] && git commit -m "type(scope): message"`

### For Large Changes
**When:** Multiple features, 3+ files with substantial changes, or complex modifications
**Action:** Create multiple logical commits grouping related changes

## Phase 3: Create Commits

### Small Changes
1. Stage all relevant files
2. Create single commit with conventional commit message
3. Push to remote

### Large Changes
1. **Group related changes logically:**
   - Feature A files together
   - Feature B files together
   - Refactoring changes separate from features
   - Documentation updates with their features

2. **Stage and commit in batches:**
```bash
# Feature A
git add src/feature-a.js src/feature-a-utils.js
git commit -m "feat(feature-a): implement new feature"

# Feature B
git add src/feature-b.js
git commit -m "feat(feature-b): add feature"

# Refactoring
git add src/refactored-module.js
git commit -m "refactor(module): improve structure"
```

3. Push all commits: `git push origin [branch]`

## Commit Message Format

Follow Conventional Commits: `type(scope): subject`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style/formatting
- `refactor` - Code restructuring
- `test` - Adding/updating tests
- `chore` - Maintenance tasks

## Final Steps

1. Create commits in logical batches
2. Push to remote: `git push origin [branch]`
3. List commits created

## Key Reminders

- **Small changes:** Single commit
- **Large changes:** Multiple logical commits grouping related work
- **Commit messages:** Follow conventional commits format
- **Clean separation:** Group changes by feature/purpose
