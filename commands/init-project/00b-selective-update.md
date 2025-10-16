---
description: Identify documentation gaps and route to targeted update workflows
---

# Selective Update — Brownfield Compliant Docs

Your job is to identify which documents need updates or additions, then route to the appropriate manage-project workflows rather than regenerating everything.

---

## Context

The assessment found existing compliant documentation. Don't regenerate from scratch—instead, use targeted add/update commands to fill gaps or refresh stale content.

---

## Process

1. **Review assessment findings:**
   - Note which core documents are missing
   - Check `last_updated` dates (flag anything >90 days old as potentially stale)
   - Identify missing cross-references or orphaned IDs

2. **Build update plan:**
   - Missing documents → route to corresponding init-project step
   - Stale documents → ask user which to refresh
   - Gaps (e.g., missing stories for existing features) → route to manage-project/add workflows
   - Cross-reference issues → route to traceability pass

3. **Present plan:**
   ```
   Recommended updates:
   1. [Missing PRD → run /commands/init-project/01-prd.md]
   2. [Add stories for F-03 → run /commands/manage-project/add/add-story.md]
   3. [Refresh stale API contracts (last updated 2024-01-15) → run /commands/init-project/06-api-contracts.md]
   4. [Fix cross-references → run /commands/init-project/09-traceability-pass.md]
   ```

4. **Execute or delegate:**
   - For 1-2 quick updates: handle inline
   - For 3+ items: delegate to `documentor` agent with full plan
   - For complex gaps: route to `manage-project/implement/plan.md` for structured approach

5. **Run first command:**
   - Execute the highest-priority item immediately
   - After completion, daisy-chain to next item or confirm plan with user

---

## Routing Table

| Gap | Next Command |
|-----|-------------|
| Missing core doc (PRD, system-design, etc.) | `/commands/init-project/0[1-8]-*.md` |
| Missing user flow | `/commands/manage-project/add/add-flow.md` |
| Missing user story | `/commands/manage-project/add/add-story.md` |
| Missing feature spec | `/commands/manage-project/add/add-feature.md` |
| Missing API endpoint | `/commands/manage-project/add/add-api.md` |
| Stale document | `/commands/manage-project/update/update-*.md` |
| Cross-reference gaps | `/commands/init-project/09-traceability-pass.md` |

---

## Completion

After all updates applied, run `/commands/init-project/09-traceability-pass.md` for final consistency check.

If no updates needed, report "Documentation complete and current" and exit.

---

## Next Step

Present the plan, then **run the first command immediately**. Format:
```
Executing: /commands/init-project/[step].md
```

