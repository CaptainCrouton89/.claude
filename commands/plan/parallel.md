For this task, make a `/plans/[feature-name]/parallel-plan.md` document, outlining what needs to get done. You are the senior developer for this project, and you need to break down the problem into actionable tasks, optimized for parallel building.

Begin by looking at existing research. Read all other documents in $ARGUMENTS, starting with shared.md and requirements.md, if they exist. If no shared.md file is present, abort the plan and instruct the user to run `/shared` first.

After reading the research documents, read any other files you believe would be relevant to creating a comprehensive research plan.

Each task in the plan should be brief (a few file changes at most), and complete:

- Include the purpose of the task, along with any gotchas to be aware of
- Include paths to specific files relevant to the task
- Link to relevant documentation files, if present
- Name relevant tables, if any
- Do NOT include specific code; keep tasks more high level
- In the header of the task, in brackets, name any previous steps (1.1, 2, none, etc) that must be completed before the task can be performed.

At the top of the document, include a high level explanation of what needs to be done, as well as file paths of any relevant files so that the developer can immediately familiarize themselves with the core logic.

After listing all the steps of the plan, include any advice specific to this task—information that you only gleaned from seeing and understanding the full picture. The point is not to include general advice, but bulleted information that a developer would greatly benefit from knowing before implementing any individual task in the plan.

As an example of the format:
```
# Title
[3-4 sentence, information-dense breakdown]

## Critically Relevant Files and Documentation
- /src/path
- /more/paths
- /documentation/path
- /more-documentation/paths

## Implementation Plan

### Phase 1

#### Task 1.1: [relevant title] Depends on [none]

**READ THESE BEFORE TASK**
- /src/path
- /more/paths
- /documentation/path
- /more-documentation/paths

**Instructions**

Files to Create
- /file/path

Files to modify
- /file/path
- /file/path

Concise instructions on what needs to be implemented

...

#### Task X.X: [relevant title] Depends on [none]

**READ THESE BEFORE TASK**
- /src/path
- /more/paths
- /documentation/path
- /more-documentation/paths

**Instructions**

Files to Create
- /file/path

Files to modify
- /file/path
- /file/path

Concise instructions on what needs to be implemented

## Advice

- Useful advice to all agents
```

When you write this plan, it is CRITICAL that you do not make mistakes. After reading the existing documentation and research, write the parallel.md plan. THEN, perform some additional research of your own, and verify the plan makes sense. When performing the research, use dedicated research agents, in parallel, to validate different aspects of the plan.