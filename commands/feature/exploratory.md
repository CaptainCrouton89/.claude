---
description: Implement feature without existing spec (2.2 workflow)
argument-hint: [feature description]
---

# Exploratory Feature Development

**Feature Description:** $ARGUMENTS

## Workflow Overview

No spec → gather requirements → create specs → run 2.1 workflow

## Your Task

Execute the complete workflow:

1. **Create TodoWrite** with phases:
   - Gather requirements and create specs
   - Update project docs (PRD)
   - [Then same as 2.1: investigate → plan → implement]

2. **PHASE 0: Requirements Gathering (CHECKOUT)**

```bash
klaude start product-designer "/project/requirements $ARGUMENTS" -c -s
```

User works with product-designer to create specs. Product designer will:
- Gather requirements via questions
- Create `docs/feature-specs/{feature-id}.yaml`
- Create `docs/user-stories/US-*.yaml` files
- Spawn detached doc update agent (background)
- Checkout back to you

After checkout, specs exist and you have the feature ID.

3. **Run 2.1 Workflow**

Now that specs exist, execute EXACT same steps as 2.1:

- PHASE 0: Parallel investigation (specs + codebase) - background
- Verify understanding while background runs
- PHASE 1: Planning (checkout to planner)
- PHASE 2: Implementation (checkout to programmer)
- PHASE 3: Validation (optional)

Use the feature ID from the newly created spec.

4. **Mark all todos complete** and summarize results

## Key Points

- First phase: checkout to product-designer for requirements
- Product designer spawns detached doc-update agent (no blocking)
- After specs created, run 2.1 workflow identically
- Use feature ID from newly created spec for subsequent commands
