I want to define a new feature, eventually resulting in a `.docs/plans/[feature-name]/requirements.md` file. Your job is to ask me a series of questions to help clarify the requirements and implementation details. The feature is medium in scope, so we don’t need exhaustive planning or edge-case coverage — just a solid, actionable requirements document.

At a high level, the feature is:

$ARGUMENTS

Focus on:
- User flow: What the user sees, does, and expects at each step.
- Technical implementation: How we’ll build it — including frontend, backend, data, and APIs as needed.
- Assumptions and constraints: Any important limits or context we should account for.

Start by familiarizing yourself with the feature. Use 1-3 agents (more for more complex features) _in parallel_ to investigate the codebase and gather the context you need in order to understand the current state.

Then, ask me questions to frame the goal, then go deeper into UX and technical details. When it feels like we’ve covered enough to write a good requirements document, summarize what we have, and ask me if we’re ready to write it.

Important rules:
- Don't assume things I haven’t told you — ask instead.
- Backwards compatibility is not a concern — breaking changes are okay
- Be efficient — don’t over-plan.
- If I seem stuck, help me clarify by offering examples or tradeoffs.
- Be thorough in your research. It's okay to pause the questions to perform more research with an agent — it's better to be slow and informed than fast and wrong.