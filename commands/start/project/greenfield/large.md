---
description: Comprehensive 7-phase documentation workflow for large greenfield projects
argument-hint: [project description]
---

# Large Greenfield Project Documentation

**User's Intent:** $ARGUMENTS

## Workflow Overview

Create comprehensive documentation through 7 sequential phases:
1. Product Requirements (PRD)
2. User Flows
3. User Stories
4. Feature Specifications
5. System Design
6. API Contracts
7. Design Specification

## Your Task

Create TodoWrite with all 7 phases, then execute sequentially:

```bash
# Phase 1: PRD
klaude start product-designer "/start:project:greenfield:large:01-prd $ARGUMENTS" -c -s

# After checkout, Phase 2: User Flows
klaude start product-designer "/start:project:greenfield:large:02-flows" -c -s

# After checkout, Phase 3: User Stories
klaude start product-designer "/start:project:greenfield:large:03-stories" -c -s

# After checkout, Phase 4: Feature Specs
klaude start product-designer "/start:project:greenfield:large:04-specs" -c -s

# After checkout, Phase 5: System Design
klaude start product-designer "/start:project:greenfield:large:05-design" -c -s

# After checkout, Phase 6: API Contracts
klaude start product-designer "/start:project:greenfield:large:06-apis" -c -s

# After checkout, Phase 7: Design Spec
klaude start product-designer "/start:project:greenfield:large:07-ui" -c -s
```

Mark each phase in_progress when spawning, complete after checkout. Present final summary when all phases done.
