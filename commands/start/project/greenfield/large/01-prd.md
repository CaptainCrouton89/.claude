---
description: Gather product requirements and define feature list
argument-hint: [project description]
---

# Phase 1: Product Requirements Document

**Project:** $ARGUMENTS

## Deliverable

`docs/product-requirements.yaml` with:
- Project name, tagline, summary
- Primary goal and success metrics
- Target users/personas
- Core features list with IDs (F-01, F-02, etc.)

## Steps

1. **Gather high-level information** via AskUserQuestion:
   - Project vision and goals
   - Target users
   - Core features (rough list)

2. **Draft PRD** using `pdocs template product-requirements`
   - Assign feature IDs sequentially
   - Keep concise—omit inferable details

3. **Iterate** if user provides feedback

4. **Write file** to `docs/product-requirements.yaml`

5. **Validate** with `pdocs check`

6. **Exit** with `klaude checkout` to return control

You must use this template; read it first: `pdocs template product-requirements`
