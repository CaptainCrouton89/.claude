For this task, make a `.docs/plans/[feature-name]/parallel-plan.md` document, outlining what needs to get done, following the format here `/Users/silasrhyneer/.claude/file-templates/parallel.template.md`. You are the senior developer for this project, and you need to break down the problem into actionable tasks, optimized for parallel building.

Begin by looking at existing research. Read all other documents in $ARGUMENTS, starting with shared.md and requirements.md, if they exist. If no shared.md file is present, abort the plan and tell me to run `/shared` first.

After reading the research documents, read any other files you believe would be relevant to creating a comprehensive research plan. 

Each task in the plan should be brief (a few file changes at most), and complete:

- Include the purpose of the task, along with any gotchas to be aware of
- Include paths to specific files relevant to the task
- Link to relevant documentation files, if present
- Name relevant tables, if any
- Do NOT include specific code; keep tasks more high level
- In the header of the task, in brackets, name any previous steps (1.1, 2, none, etc) that must be completed before the task can be performed.
- Name the agent that should be used for that task (e.g. `frontend-ui-developer`)

At the top of the document, include a high level explanation of what needs to be done, as well as file paths of any relevant files so that the developer can immediately familiarize themselves with the core logic.

When you write this plan, it is CRITICAL that you do not make mistakes. If there is not enough information to write a *comprehensive* plan, then _more research is required_. Remember—quality and completeness is critical, so do not be lazy—it is disasterous for the developer who relies on the accuracy of your plan during implementation.