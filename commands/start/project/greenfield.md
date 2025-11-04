---
description: Initialize greenfield project - routes to small or large project workflows
argument-hint: [project description]
---

# Start Greenfield Project

**User's Intent:** $ARGUMENTS

## Ask about project size and route

**Large project** → use `/start:project:greenfield:large $ARGUMENTS`
- Team: 3+ developers
- Scope: 200+ files, 3+ months
- Complex: Multiple services, formal design system
- Keywords: "team", "enterprise", "production"
- **Workflow:** 7-phase comprehensive docs (2-4 hours)

**Small project** → use `/start:project:greenfield:small $ARGUMENTS`
- Team: 1-2 developers
- Scope: <100 files, days/weeks
- Simple: Monolithic, basic UI
- Keywords: "personal", "prototype", "MVP"
- **Workflow:** Minimal docs (30-60 min)

Ask if unclear: "How many developers? What's the timeline and complexity?"

**Defaults:** Solo dev → small; Team → large
