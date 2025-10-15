I have created detailed planning and research documentation for changes to the code, located here:

$ARGUMENTS

Specifically, the `parallel-plan.md` file contains the exact steps to take, and in what order. The other files contain documentation and other planning information that will be useful for implementing individual aspects of the master plan. 

1. Read `parallel-plan.md` and `shared.md`. Parallel-plan.md also contains a list of relevant files at the top that you must also read.
2. Make a comprehensive todo, with a todo item for each task in `parallel-plan.md`. For each todo, name the tasks it's dependent on. Don't include any testing steps, except for the last step which should run type validation. 
3. Delegate work to specified agents in batches. If a task is marked as independent, or if all of its dependencies have been completed, it must be run in parallel with any other such tasks. Prioritize parallel execution wherever possible.

Each agent should:
- Only implement the specific step assigned.
- Be provided with links to the `parallel-plan.md`, the `shared.md` and other documentation.
- Begin by reading and understanding the relevant sections.
- Perform the task completely
- Run typechecking on any files they edit, before returning, and make sure there are no errors in the files they edited.

It is critical that these agents be used in batches—deploy all the agents in a batch in the same function call.

4. After deploying agents, monitor their completion asynchronously. As soon as any agent completes, check if new tasks have all their dependencies satisfied and immediately deploy agents for those tasks. You don't need to wait for entire batches to complete—deploy new agents as soon as their dependencies are met. Use `./agent-responses/await {agent_id}` to check status or wait for the agent monitor to alert you. Maximize parallelism by continuously deploying agents whose dependencies are satisfied, rather than waiting for arbitrary batch boundaries.

Remember:
Agents need to be delegated with dependency orchestration in mind. For example, if one agent creates an api endpoint, and a later agent consumes it, that later agent needs to be given the contract or a link to the api endpoint so that their types match. Likewise, if one agent creates a type file, the other agents should respect it rather than duplicating efforts. It is your job to orchestrate this, and therefore your fault if delegated agents fail.

Upon completing the plan, simply say "Done. Run /report for analysis."