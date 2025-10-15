# Manage Project — Orchestrated Workflow

Understand user intent, show current state, route to appropriate commands.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

### 1. Show Current State
```bash
./check-project.sh --format summary
```

### 2. Understand Intent
Ask: "What would you like to do?"

Route based on response:

| Intent | Command |
|--------|---------|
| Add feature | run /manage-project/add/add-feature |
| Add story | run /manage-project/add/add-story |
| Add API | run /manage-project/add/add-api |
| Add flow | run /manage-project/add/add-flow |
| Update feature | run /manage-project/update/update-feature |
| Update story | run /manage-project/update/update-story |
| Update API | run /manage-project/update/update-api |
| Update requirements | run /manage-project/update/update-requirements |
| Update design | run /manage-project/update/update-design |
| Check consistency | run /manage-project/validate/check-consistency |
| Check coverage | run /manage-project/validate/check-coverage |
| Check API alignment | run /manage-project/validate/check-api-alignment |
| Query state | run /manage-project/query/current-state |

### 3. Guided Questions (if unclear)
If intent unclear, ask:
- "Adding new or modifying existing?"
- "What specifically: feature, story, API, requirements, design?"

### 4. Multi-Step Workflows

**Adding complete feature:**
1. `add/add-feature.md`
2. `add/add-story.md` (×N)
3. `add/add-api.md` (×N)
4. `validate/check-consistency.md`

**Requirements change:**
1. `update/update-requirements.md`
2. Check affected features with `./list-features.sh`
3. `update/update-feature.md` (×N)
4. `validate/check-consistency.md`

**API redesign:**
1. `update/update-api.md`
2. Check affected specs with `./list-apis.sh`
3. `update/update-feature.md`
4. `validate/check-api-alignment.md`

### 5. Confirm & Route
State understanding, confirm routing, then execute command.

## Special Cases

### No docs/ directory
Run init-project/00-orchestrate first.

### No bash utilities
Offer to copy from `@~/.claude/file-templates/init-project/` to project `docs/` directory.

### Multiple tasks
Break down: "Add feature 1, then feature 2, then update design."

## Summary
Show state → Understand intent → Route to command → Execute → Offer next steps.