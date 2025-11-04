---
description: Initialize project documentation - routes to greenfield or brownfield workflows
argument-hint: [project description]
---

# Start Project Documentation

**User's Intent:** $ARGUMENTS

## Check filesystem and route

**Greenfield** (new project) → use `/start:project:greenfield $ARGUMENTS`
- No `docs/` or minimal
- No/minimal source code
- Keywords: "new", "from scratch", "starting fresh"

**Brownfield** (existing code) → use `/start:project:brownfield $ARGUMENTS`
- Existing codebase with implementation
- Missing/incomplete docs
- Keywords: "document existing", "reverse engineer"

If unclear after checking filesystem, ask: "Is this a new project from scratch, or existing code that needs documentation?"
