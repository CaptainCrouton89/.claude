#!/usr/bin/env python3
import json
import re
import sys

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError as e:
    print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
    sys.exit(1)

tool_name = input_data.get("tool_name", "")
tool_input = input_data.get("tool_input", {})
command = tool_input.get("command", "")

# Only process Bash tool calls
if tool_name != "Bash" or not command:
    sys.exit(0)

# Check for npm commands (but not npx)
npm_patterns = [
    r'\bnpm\s+install\b',
    r'\bnpm\s+i\b',
    r'\bnpm\s+run\b',
    r'\bnpm\s+start\b',
    r'\bnpm\s+build\b',
    r'\bnpm\s+test\b',
    r'\bnpm\s+dev\b',
    r'\bnpm\s+ci\b',
    r'\bnpm\s+add\b',
    r'\bnpm\s+remove\b',
    r'\bnpm\s+update\b',
    r'\bnpm\s+audit\b',
    r'\bnpm\s+list\b',
    r'\bnpm\s+ls\b'
]

for pattern in npm_patterns:
    if re.search(pattern, command):
        # Convert npm command to pnpm equivalent
        pnpm_suggestion = command.replace('npm', 'pnpm', 1)
        # Special case for npm i -> pnpm install
        if 'npm i ' in command or command.endswith('npm i'):
            pnpm_suggestion = pnpm_suggestion.replace('pnpm i', 'pnpm install')
        
        warning_message = f"Consider using pnpm instead of npm for better performance and disk efficiency.\n\nSuggested command: {pnpm_suggestion}\n\nIf you want to proceed with npm anyway, please confirm."
        
        print(warning_message, file=sys.stderr)
        # Exit code 2 blocks the tool call and shows stderr to Claude
        sys.exit(2)

# Allow the command to proceed if no npm patterns found
sys.exit(0)