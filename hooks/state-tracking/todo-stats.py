#!/usr/bin/env python3
import json
import sys
import os

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError as e:
    print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
    sys.exit(1)

tool_name = input_data.get("tool_name", "")
tool_input = input_data.get("tool_input", {})

if tool_name != "TodoWrite":
    sys.exit(0)

todos = tool_input.get("todos", [])
session_id = input_data.get("session_id", "")

# Calculate stats
total = len(todos)
completed = sum(1 for todo in todos if todo.get("status") == "completed")
in_progress = sum(1 for todo in todos if todo.get("status") == "in_progress")
pending = sum(1 for todo in todos if todo.get("status") == "pending")

# Construct todo file path
home_dir = os.path.expanduser("~")
todo_path = f"{home_dir}/.claude/todos/{session_id}-agent-{session_id}.json"

# Print stats with file path
print(f"✓ {completed}/{total} completed | ⟳ {in_progress} in progress | ○ {pending} pending")
print(f"📄 {todo_path}")

sys.exit(0)
