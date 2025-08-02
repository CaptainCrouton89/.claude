For this task, make a `/plans/[plan-dir]/parallel-plan.md` document, outlining what needs to get done. You are the senior developer for this project, and you need to break down the problem into actionable tasks, optimized for parallel building.

First, create a `/plans/[plan-dir]/shared.md` file that documents high-level information relevant to all tasks. This file should name relevant files and high-level patterns, using the following format:

```
# Title
[3-4 sentence, information-dense breakdown]

## Relevant Files
- [/src/path]
- [/more/paths]

## Patterns
- Existing service for [feature], needs extending, etc.
- Reuse these ui components
- Other info
```

Then write the parallel plan document.

Each task in the plan should be brief (a few file changes at most), and complete:

- Include the purpose of the task, along with any gotchas to be aware of
- Include paths to specific files relevant to the task
- Link to relevant documentation files, if present
- Name relevant tables, if any
- Do NOT include specific code; keep tasks more high level
- In the header of the task, in brackets, name any previous steps (1.1, 2, none, etc) that must be completed before the task can be performed.

At the top of the document, include a high level explanation of what needs to be done, as well as file paths of any relevant files so that the developer can immediately familiarize themselves with the core logic.

After listing all the steps of the plan, include any advice specific to this task—information that you only gleaned from seeing and understanding the full picture. The point is not to include general advice, but bulleted information that a developer would greatly benefit from knowing before implementing any individual task in the plan.
