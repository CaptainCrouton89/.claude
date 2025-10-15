For this task, create a `docs/plans/[feature-name]/plan.md` document using the appropriate template:

- Small scope: `/Users/silasrhyneer/.claude/file-templates/plan.quick.template.md`
- Medium scope: `/Users/silasrhyneer/.claude/file-templates/plan.template.md`
- Large/cross-cutting: `/Users/silasrhyneer/.claude/file-templates/plan.comprehensive.template.md`

Process:
1. Read existing research in `docs/plans/[feature-name]/` (start with `shared.md` and `requirements.md`). If `shared.md` is missing, abort and ask to run `/shared` first.
2. Use async agents as needed for impact analysis. Spawn `code-finder` agents; progress is tracked under `agent-responses/` (powered by `hooks/pre-tool-use/agent-interceptor.js` and `hooks/lifecycle/agent-monitor.mjs`). Save each investigation to `docs/plans/[feature-name]/investigations/[topic].md` using `/Users/silasrhyneer/.claude/file-templates/investigation.template.md`, and link outputs in the plan’s “Investigation Artifacts”.
3. Fill the chosen template exactly. Keep tasks brief, include dependencies, file paths, and an agent assignment per task.
4. Save to `docs/plans/[feature-name]/plan.md`.

Quality bar:
- Follow `protocols/comprehensive/planning.md` for investigation rigor.
- Prefer linking templates over inline structure; do not restate the template here.