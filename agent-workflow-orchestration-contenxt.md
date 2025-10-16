# Agent Workflow Orchestration Context

## Key Directories and Files
- `commands/init-project/` – Sequential slash-commands for bootstrapping project documentation (PRD through traceability). `00-orchestrate.md` coordinates the end-to-end run; numbered steps (01-09) generate each document set while enforcing idempotency, user approval gates, and traceability links.
- `file-templates/init-project/` – Source templates and helper scripts that the init-project commands copy into real project repos (`docs/`). Includes `CLAUDE.md` with cross-doc conventions, YAML/markdown skeletons for each artifact, and validation scripts like `check-project.sh` and `generate-docs.sh` to keep outputs consistent.
- `commands/manage-project/` – Ongoing project workflows. The orchestrator (`00-orchestrate.md`) and `start.md` route work; subfolders (`implement/`, `add/`, `update/`, `validate/`, `query/`) encapsulate phased implementation (investigate → plan → execute → validate), artifact CRUD, and health checks so agents keep long-running efforts aligned with docs.
- `agents/` – Role definitions (system prompts, allowed delegations, model choices) for specialized workers such as `backend-developer`, `documentor`, and `validation-orchestrator`. Main agents delegate by referencing `@agent-name` to spin up task-specific collaborators.
- `hooks/pre-tool-use/agent-interceptor.js` – Intercepts task spawns, enforces recursion limits and allowlists, and wires asynchronous delegation. Spawned agents stream progress into `agent-responses/agent_{id}.md`, enabling background execution that can be polled or awaited via `/await` while the primary agent keeps context clean.
- `hooks/lifecycle/agent-monitor.mjs` – Lifecycle hook that automatically captures subagent updates and reports them back to the main session, so status changes stream without extra manual polling.
- `await` (script) – Convenience wrapper in repo root to wait on background agent completion by tailing the corresponding `agent-responses/` file.

## Desired Outcomes to Uphold
- Primary agent keeps conversation light by delegating aggressively; context stays focused on orchestration rather than performing every task inline.
  - Quick, low-impact tasks can stay with the primary agent, but substantial feature or doc work should move to specialized subagents.
  - When to invoke the heavier workflows vs. lightweight handling is still an open question to refine.
- Async subagents handle parallelizable or “busy work” tasks, with active monitoring of their `agent-responses/*.md` outputs and explicit awaiting when dependencies exist.
- Subagents are preferred even for major implementation work; e.g., the primary agent can spawn an implementor orchestrator that in turn coordinates frontend and backend specialists for a large feature.
- Project documentation lives in `docs/` and always adheres to the templates/workflows from `file-templates/`, including approvals, traceability, and sign-off gates described in the command files from `commands/`.
- Long-form work follows chained slash-command workflows (especially under `commands/manage-project/`) so phases stay structured, documentation stays current, and agents know the next step in multi-phase efforts.
- Delegations should bundle precise context (file paths, relevant docs, command references, other agents' responses) so subagents can work independently with minimal follow-up. 
  - Workflows specific to subagents should be handled using the agent's .md file in `agents/`.
- Agents should surface status updates referencing `agent-responses/*.md` artifacts, keeping the main thread aware of background progress without flooding it with raw logs.
- Changes to documentation or implementation should flow through the prescribed slash-commands rather than ad-hoc edits, maintaining approval gates and traceability checks.
- Prompts, templates, and agent briefs stay information-dense—assume agents can infer best practices, avoid redundant guidance, and favor concise task framing. Incomplete sentences are acceptable—and non-code artifacts created by agent should obey this same guidance.

## Desired Flexibilities to Preserve
These outcomes intentionally keep the workflow light-touch; solutions should maintain them unless priorities shift.
- Preserve operators’ freedom to edit files directly without enforced pre-commit hooks or command-only guardrails.
- Allow ad-hoc documentation (e.g., README tweaks) to live outside `commands/` without mandatory traceability wiring.
- Keep polling of `agent-responses/` discretionary rather than bound to formal cadences or SLAs.
- Prefer manual review of `agent-responses/` over building a summary command that collates recent activity.
- Let operators assemble context bundles manually instead of relying on reusable templates or helper scripts.
- Make referencing prior `agent-responses/` logs optional; avoid prescriptive documentation around it.
- Continue permitting users to skip orchestrated command flows when they deem ad-hoc execution appropriate.
- Accept manual workflow restarts based on inspecting `docs/` artifacts; no automatic state persistence required.
- Restrict slash-command guidance to chaining the next command or checking user intent—no stricter guardrails.
- Rely on `.active-pids.json` for active agent tracking without layering an additional summary view.
