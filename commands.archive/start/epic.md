---
description: Initialize epic (multi-feature) implementation
argument-hint: [epic description]
---

# Start Epic Development

**User's Intent:** $ARGUMENTS

## Route to Epic Orchestration

This is a straightforward router to the epic orchestration workflow.

Execute:

```bash
klaude start general-purpose "/epic/orchestrate $ARGUMENTS" -s
```

The orchestrator will:
1. Plan the epic (identify features and dependencies)
2. Iterate through each feature
3. Coordinate validation

You will be checked out to the orchestrator for the full epic lifecycle.
