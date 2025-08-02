I have created detailed planning and research documentation for changes to the code, located here:

$ARGUMENTS

Specifically, the `parallel-plan.md` file contains the exact steps to take, and in what order. The other files contain documentation and other planning information that will be useful for implementing individual aspects of the master plan. 

1. Read `parallel-plan.md` and `shared.md`. Parallel-plan.md also contains a list of relevant files at the top that you must also read.
2. Make a comprehensive todo, with a todo item for each task in `parallel-plan.md`. For each todo, name the tasks it's dependent on. Don't include any testing steps, except for the last step which should run `get_compilation_errors` on /src. 
3. Delegate work to subagents. If a task is marked as independent or if all of its prerequisite tasks are done, it should be done in parallel. It is critical that you execute tasks in parallel whenever possible. When creating subagents, do the following: 
   - Each agent should only implement its assigned step.
   - Each agent should be explicitly given links to the master plan, and the planning documentation. It should start by reading the plan and research docs there.
   - Each agent should run `get_compilation_errors` on the files it edited before returning a summary of its changes.
4. After each wave of parallel tasks finishes, identify which tasks can be run next. There may be multiple tasks that have all of their dependent tasks done. In this case, run those tasks in parallel as well.

Upon completing the plan, simply say "Done. Run /report for analysis."