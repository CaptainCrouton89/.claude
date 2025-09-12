#!/usr/bin/env python3
import hashlib
import json
import logging
import os
import sys

# --- Logging Configuration ---
LOG_FILE = "/tmp/claude_supervisor.log"
STATE_FILE = "/tmp/claude_todo_hook.state" 

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename=LOG_FILE,
    filemode='a'
)

def main():
    logging.info("--- Supervisor PostToolUse Hook Triggered (Self-Reflection Prompter) ---")
    try:
        hook_input = json.load(sys.stdin)
        
        if hook_input.get("tool_name") != "ExitPlanMode":
            sys.exit(0)

        tool_input_data = hook_input.get("tool_input", {})
        plan_content = tool_input_data.get("plan", "")

        if not plan_content:
            logging.info("ExitPlanMode called, but 'plan' is empty. Exiting.")
            sys.exit(0)

        todo_content_full = plan_content
        
        current_hash = hashlib.md5(todo_content_full.encode()).hexdigest()
        last_hash = ""
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, 'r') as f:
                last_hash = f.read().strip()
        
        if current_hash == last_hash:
            logging.info("Plan has not changed. Skipping reflection prompt.")
            sys.exit(0)
            
        logging.info("New plan detected. Injecting reflection prompt.")
        
        # MODIFIED: The prompt now includes specific syntax instructions.
        reflection_prompt = """<system-reminder>
**Parallelize the Plan**

The initial plan has been drafted. Now, **think** to optimize its execution.

1. **Analyze Dependencies**: Critically review the list of tasks.
2. **Group for Parallelism**: Identify any tasks that are independent and can be executed concurrently. Group them into a parallel stage.
3. **Format for Parallel Execution**: Place multiple `<invoke name="Task">` calls inside a **single** `<function_calls>` block in your response, using the optimal agent for each task.
4. **Delegate Every Step**: Even stages that have just one step should be delegated to an agent, unless it is a trivial step. This avoids clogging your context window. And remember, no more than one task per agent.

<example>
Assistant: I will now run [list of tasks] in parallel.

<function_calls>
  <invoke name="Task">
    <parameter name="description">First parallel task...</parameter>
    <parameter name="prompt">Details for the first task...</parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Second parallel task...</parameter>
    <parameter name="prompt">Details for the second task...</parameter>
  </invoke>
</function_calls>

I will now run [list of tasks] in parallel.

...more parallel tasks

</example>

Please present your analysis of parallel stages and then proceed with the first stage. Remember, you MUST delegate steps to agents.

</system-reminder>"""

        response = {
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": reflection_prompt
            }
        }
        
        logging.info("Injecting context to trigger self-reflection and parallelization.")
        print(json.dumps(response), flush=True)

        with open(STATE_FILE, 'w') as f:
            f.write(current_hash)
        logging.info(f"Updated state file with new hash: {current_hash}")

    except Exception as e:
        logging.exception("An unexpected error occurred in the Supervisor hook.")

if __name__ == "__main__":
    main()

