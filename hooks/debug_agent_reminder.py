#!/usr/bin/env python3
import json
import logging
import os
import re
import sys
from collections import defaultdict

# --- Logging Configuration ---
LOG_FILE = "/tmp/claude_debug_hook.log"
STATE_FILE = "/tmp/claude_debug_issues.state"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename=LOG_FILE,
    filemode='a'
)

# Debug-related keywords
DEBUG_KEYWORDS = [
    r'\bbug\b', r'\bdebug\b', r'\berror\b', r'\bfail\b', r'\bfailing\b',
    r'\bbroken\b', r'\bcrash\b', r'\bcrashing\b', r'\bissue\b', r'\bproblem\b',
    r'\btrouble\b', r'\btroubleshoot\b', r'\bfix\b', r'\bfixing\b',
    r'\bnot working\b', r'\bdoesn\'t work\b', r'\bwon\'t work\b'
]

def load_issue_history():
    """Load previous debugging issue patterns"""
    if not os.path.exists(STATE_FILE):
        return defaultdict(int)
    
    try:
        with open(STATE_FILE, 'r') as f:
            return defaultdict(int, json.load(f))
    except Exception as e:
        logging.error(f"Failed to load issue history: {e}")
        return defaultdict(int)

def save_issue_history(history):
    """Save debugging issue patterns"""
    try:
        with open(STATE_FILE, 'w') as f:
            json.dump(dict(history), f)
    except Exception as e:
        logging.error(f"Failed to save issue history: {e}")

def extract_issue_signature(message):
    """Create a signature for the issue to track recurrence"""
    # Extract key technical terms to identify similar issues
    tech_terms = re.findall(r'\b(?:function|method|class|module|import|syntax|type|variable|undefined|null|exception)\b', message.lower())
    return '|'.join(sorted(set(tech_terms))) if tech_terms else 'general'

def contains_debug_keywords(text):
    """Check if text contains debugging-related keywords"""
    text_lower = text.lower()
    return any(re.search(pattern, text_lower, re.IGNORECASE) for pattern in DEBUG_KEYWORDS)

def main():
    logging.info("--- Debug Agent Reminder Hook Triggered ---")
    
    try:
        hook_input = json.load(sys.stdin)
        
        # Only process user prompt submissions
        if hook_input.get("hookEventName") != "UserPromptSubmit":
            sys.exit(0)
        
        user_message = hook_input.get("userMessage", "")
        
        if not user_message or not contains_debug_keywords(user_message):
            logging.info("No debug keywords detected. Skipping.")
            sys.exit(0)
        
        logging.info("Debug keywords detected in user message.")
        
        # Load issue history
        issue_history = load_issue_history()
        issue_signature = extract_issue_signature(user_message)
        
        # Track this issue
        issue_history[issue_signature] += 1
        current_count = issue_history[issue_signature]
        
        # Save updated history
        save_issue_history(issue_history)
        
        # Determine if this is a complex/recurring issue
        is_recurring = current_count > 1
        is_complex = len(user_message.split()) > 30  # Long messages often indicate complexity
        
        if is_recurring or is_complex:
            reminder_text = """

**Debug Strategy Reminder**: For challenging or recurring debugging tasks, consider using multiple specialized agents to investigate different theories in parallel:

- `general-purpose` agent: Overall codebase investigation and pattern analysis
- `code-finder` agent: Locate relevant code sections, similar patterns, error sources
- `implementor` agent: Test fixes and implement solutions for specific theories

Example parallel approach:
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Investigate error patterns</parameter>
    <parameter name="prompt">Search codebase for similar error patterns and related code...</parameter>
    <parameter name="subagent_type">code-finder</parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Analyze system behavior</parameter>
    <parameter name="prompt">Examine logs, state, and runtime behavior to understand...</parameter>
    <parameter name="subagent_type">general-purpose</parameter>
  </invoke>
</function_calls>
```

This parallel investigation approach is especially valuable for complex bugs where the root cause isn't immediately obvious."""
        
        else:
            # Simple reminder for first-time or simple issues
            reminder_text = """

**Debug Note**: For complex debugging tasks, consider using specialized agents (`code-finder`, `general-purpose`, `implementor`) to investigate different aspects in parallel."""
        
        response = {
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": reminder_text
            }
        }
        
        logging.info(f"Injecting debug reminder. Issue signature: {issue_signature}, Count: {current_count}")
        print(json.dumps(response), flush=True)
        
    except Exception as e:
        logging.exception("An unexpected error occurred in the Debug Agent Reminder hook.")

if __name__ == "__main__":
    main()