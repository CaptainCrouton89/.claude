#!/usr/bin/env python3
import hashlib
import json
import logging
import os
import sys
from pathlib import Path

# --- Logging Configuration ---
LOG_FILE = "/tmp/claude_supervisor.log"
STATE_FILE = "/tmp/claude_todo_hook.state"
PARALLEL_GUIDE_PATH = Path.home() / ".claude" / "guides" / "parallel.md" 

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

        # Load the shared parallel execution guide
        try:
            with open(PARALLEL_GUIDE_PATH, 'r') as f:
                parallel_guide_content = f.read()
            logging.info(f"Successfully loaded parallel guide from {PARALLEL_GUIDE_PATH}")
        except FileNotFoundError:
            logging.error(f"Parallel guide not found at {PARALLEL_GUIDE_PATH}")
            parallel_guide_content = "Error: Could not load parallel execution guide."
        except Exception as e:
            logging.error(f"Error loading parallel guide: {e}")
            parallel_guide_content = f"Error loading parallel guide: {e}"

        reflection_prompt = f"""<system-reminder>
**Parallelize the Plan**

The initial plan has been drafted. Now, review and apply these parallelization principles:

{parallel_guide_content}

CRITICAL ADDITIONAL REQUIREMENTS FOR THIS CONTEXT:
- ONLY use parallelization if there is more than one file to modify (with one file, implement it yourself)
- Delegate EVERY step, even single-task stages (unless trivial) to avoid clogging your context window
- No more than one primary task per agent

Please present your analysis of parallel stages based on the guide above, then proceed with the first stage.

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

