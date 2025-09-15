I have created detailed planning and research documentation for changes to the code, located here:

$ARGUMENTS

Specifically, the `parallel-plan.md` file contains the exact steps to take, and in what order. The other files contain documentation and other planning information that will be useful for implementing individual aspects of the master plan. 

1. Read `parallel-plan.md` and `shared.md`. Parallel-plan.md also contains a list of relevant files at the top that you must also read.
2. Make a comprehensive todo, with a todo item for each task in `parallel-plan.md`. For each todo, name the tasks it's dependent on. Don't include any testing steps, except for the last step which should run `get_compilation_errors` on /src. 
3. Delegate work to parallel-task-execution agents in batches. If a task is marked as independent, or if all of its dependencies have been completed, it must be run in parallel with any other such tasks. Prioritize parallel execution wherever possible.

   Each agent should:
   - Only implement the specific step assigned.
   - Be provided with links to the `parallel-plan.md`, the `shared.md` and other documentation.
   - Begin by reading and understanding the relevant sections.
   - Perform the task completely
   - Run mcp__ide__getDiagnostics on any files they edit, before returning, and make sure there are no errors.
   - Return a summary of changes made.

It is critical that these agents be used in batches—deploy all the agents in a batch in the same function call.
4. After each batch of agents finishes, identify which tasks can be run next. There may be multiple tasks that have all of their dependent tasks done. In this case, run those tasks in parallel as well.

Upon completing the plan, simply say "Done. Run /report for analysis."