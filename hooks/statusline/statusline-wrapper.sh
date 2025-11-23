#!/bin/bash

# Statusline wrapper that shows model, token usage, and output style
# Receives JSON input from stdin

# Read the JSON input from stdin
input=$(cat)

# Parse JSON and extract all needed information using Python
parsed=$(echo "$input" | python3 -c "
import json
import sys
import os

data = json.load(sys.stdin)

# Get model display name
model = data.get('model', {})
if isinstance(model, dict):
    model_name = model.get('display_name', 'unknown')
else:
    model_name = str(model)

# Get transcript path to read token usage
transcript_path = data.get('transcript_path', '')
tokens_used = 0
total_tokens = 200000  # Default budget

if transcript_path and os.path.exists(transcript_path):
    try:
        # Read all messages and sum up token usage
        with open(transcript_path, 'r') as f:
            for line in f:
                try:
                    msg = json.loads(line)
                    # Look for usage data in message.usage
                    if 'message' in msg and 'usage' in msg['message']:
                        usage = msg['message']['usage']
                        tokens_used += usage.get('input_tokens', 0)
                        tokens_used += usage.get('output_tokens', 0)
                        # Don't count cache tokens in the usage, they're just metadata
                except:
                    continue
    except:
        pass

# Get cwd
cwd = data.get('cwd', '')

# Format tokens with commas
tokens_formatted = f'{tokens_used:,}'

# Determine color based on token usage
color = ''
if tokens_used >= 175000:
    color = 'red'
elif tokens_used >= 150000:
    color = 'orange'
elif tokens_used >= 100000:
    color = 'yellow'

print(f'{model_name}|{tokens_formatted}|{color}|{cwd}')
")

# Split the parsed output
IFS='|' read -r model_name tokens_formatted color cwd <<< "$parsed"

# Determine settings file path
if [ -n "$cwd" ]; then
    settings_file="$cwd/.claude/settings.local.json"
else
    settings_file="$HOME/.claude/settings.local.json"
fi

# Get the current output style from settings.local.json
output_style="Sr. Software Developer"  # Default
if [ -f "$settings_file" ]; then
    style=$(python3 -c "
import json
import sys
try:
    with open('$settings_file', 'r') as f:
        data = json.load(f)
        print(data.get('outputStyle', 'Sr. Software Developer'))
except:
    print('Sr. Software Developer')
" 2>/dev/null)
    if [ -n "$style" ]; then
        output_style="$style"
    fi
fi

# Apply color codes based on token usage
case "$color" in
    red)
        color_code="\033[31m"
        ;;
    orange)
        color_code="\033[38;5;208m"
        ;;
    yellow)
        color_code="\033[33m"
        ;;
    *)
        color_code=""
        ;;
esac
reset_code="\033[0m"

# Display model, token usage (with color), and output style
if [ -n "$color_code" ]; then
    echo -e "$model_name | ${color_code}${tokens_formatted} tokens${reset_code} | $output_style"
else
    echo "$model_name | ${tokens_formatted} tokens | $output_style"
fi