---
description: Update product requirements and identify affected downstream documents
---

# Update Product Requirements

Modify PRD: scope, metrics, risks, features. Maintain consistency.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

## ⚡ Delegation

**Default approach:** Delegate PRD and related doc edits to `@agent-documentor` while you manage orchestration. Provide:
- Target files (`product-requirements.yaml` and any downstream docs) plus relevant templates/conventions
- Requested updates, dependencies to check, and assumptions needing confirmation

Continue coordinating impact analysis or follow-up workflows while the agent works. Monitor via hook updates; only `await` when their edits block the next steps.

**Inline exception:** Manual edits are limited to explicit narrow fixes the user asks for; otherwise maintain the async delegation default.

### 1. Show Current PRD State
Read `product-requirements.yaml` and show summary.

### 2. Ask What to Update
- Overview (summary, goal, problem)
- Scope (in/out of scope)
- Features list (add/remove/modify)
- Success metrics
- Risks and mitigations
- Timeline/constraints

### 3. Gather Update Details
Based on selection, collect new information.

### 4. Check Downstream Impacts
- Features: `./list-stories.sh -f F-03` (stories affected)
- Metrics: `./list-apis.sh | grep -i mau` (tracking affected)
- Scope: Check if features need updates

### 5. Present Changes & Confirm
Show proposed PRD and related doc updates.

### 6. Apply Updates
Update `product-requirements.yaml` and increment version.

### 7. Update Related Docs
Update data-plan.yaml, feature specs if metrics/features changed.

### 8. Validation
```bash
./check-project.sh -v
```

### 9. Next Steps
- Update affected features: run /manage-project/update/update-feature
- Full consistency check: run /manage-project/validate/check-consistency

## Edge Cases

### PRD not found
Run init-project/00-orchestrate first.

### Removing features
Warn about orphaned stories/APIs, offer to archive instead.

### Metric conflicts
If changing metrics, check data-plan.yaml for tracking.

### Scope expansion
Moving items in-scope may require new features.

## Output
Updated PRD with new version and related docs maintained.
