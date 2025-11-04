---
description: Orchestrate project documentation workflows with intelligent intent routing
---

# Manage Project — Orchestrated Workflow

Understand user intent, show current state, route to appropriate commands.

@~/.claude/file-templates/init-project/CLAUDE.md

---

## ⚡ Delegation Decision

Most manage-project commands route to specialized workflows that should **delegate aggressively**:

### DELEGATE to specialists:
- **`implement/` workflows** → `programmer`, or orchestrator agent
- **`add/add-feature`, `update/update-*`** → `documentor` (document generation/updates)
- **`validate/*` checks** → `senior-engineer` (comprehensive audits)
- **Complex multi-step flows** → Create orchestrator agent to coordinate phases

### HANDLE DIRECTLY:
- **Intent routing** (this file) — lightweight command selection
- **Single-file queries** — e.g., showing current state, quick reads
- **User interaction gates** — confirmations, approvals, clarifications

**Quick reference:** See `@CLAUDE.md` for full delegation heuristics.

---

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
| Start work (smart routing) | run /manage-project/start |
| Implement feature/story/API | run /manage-project/implement/00-orchestrate |
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

**Complete feature development (recommended):**
1. `start.md` - Intelligently adds feature/story/API/flow
2. `implement/00-orchestrate.md` - Full investigation → planning → implementation → validation

**Adding complete feature manually:**
1. `add/add-feature.md`
2. `add/add-story.md` (×N)
3. `add/add-api.md` (×N)
4. `validate/check-consistency.md`
5. `implement/00-orchestrate.md` - Implement the feature

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