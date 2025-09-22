#!/bin/bash

# Statusline wrapper that adds output style to the ccusage statusline
# Receives JSON input from stdin, passes to ccusage, then appends output style

# Read the JSON input from stdin
input=$(cat)

# Get the current working directory from the JSON
cwd=$(echo "$input" | python3 -c "import json, sys; print(json.load(sys.stdin).get('cwd', ''))")

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

# Pass the input to ccusage statusline with compact options
# Remove visual burn rate indicators and keep output minimal
statusline=$(echo "$input" | npx ccusage statusline --visual-burn-rate off)

# Process statusline to make it more compact
# Remove emojis and shorten labels
compact_statusline=$(echo "$statusline" | sed -E '
    s/🤖 //g
    s/💰 /\$/g
    s/💬 /\$/g
    s/🚀 /\$/g
    s/🔥 /\$/g
    s/🧠 //g
    s/ session//g
    s/ today//g
    s/ block//g
    s/ left//g
')

# Append the output style without emoji
echo "$compact_statusline | $output_style"