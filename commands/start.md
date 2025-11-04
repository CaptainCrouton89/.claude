---
description: Intelligent entry point for work on any feature, requirement, story, or update
argument-hint: [description of what you want to start working on]
---

# Start Working

**User's Intent:** $ARGUMENTS

## Route to appropriate workflow

Check if this is:
- **Project initialization** → use `/start:project $ARGUMENTS`
  - Keywords: "new project", "initialize", "setup", "from scratch"
  - No `docs/` directory or it's empty
  - Describes project vision, not specific feature

- **Feature work** → use `/start:feature $ARGUMENTS`
  - Keywords: feature ID (F-##), story ID (US-###), "implement", "build"
  - `docs/` exists with specs
  - Describes specific capability

If unclear, ask: "Starting a new project or working on a feature?"
# Modified content
