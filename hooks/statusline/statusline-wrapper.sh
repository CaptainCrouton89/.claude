#!/bin/bash

# Statusline wrapper - uses built-in context window info from v2.0.65+
# Input fields: model, cwd, session_id, transcript_path, conversation_id,
#               total_cost_usd, tokens_remaining, tokens_used, context_window_tokens, max_context_window_tokens

input=$(cat)

parsed=$(echo "$input" | python3 -c "
import json
import sys

data = json.load(sys.stdin)

# Model display name
model = data.get('model', {})
model_name = model.get('display_name', str(model)) if isinstance(model, dict) else str(model)

# Context window tokens (built-in since v2.0.65)
context_tokens = data.get('context_window_tokens', 0)
max_tokens = data.get('max_context_window_tokens', 200000)

# Format with commas
tokens_str = f'{context_tokens:,}'
max_str = f'{max_tokens // 1000}k'

# Color based on % used
pct = context_tokens / max_tokens if max_tokens > 0 else 0
if pct >= 0.875:
    color = 'red'
elif pct >= 0.75:
    color = 'orange'
elif pct >= 0.5:
    color = 'yellow'
else:
    color = ''

print(f'{model_name}|{tokens_str}|{max_str}|{color}|{data.get(\"cwd\", \"\")}')
")

IFS='|' read -r model_name tokens_str max_str color cwd <<< "$parsed"

# Output style from local settings
output_style="Sr. Software Developer"
settings_file="${cwd:-.}/.claude/settings.local.json"
[ ! -f "$settings_file" ] && settings_file="$HOME/.claude/settings.local.json"
if [ -f "$settings_file" ]; then
    style=$(python3 -c "import json; print(json.load(open('$settings_file')).get('outputStyle',''))" 2>/dev/null)
    [ -n "$style" ] && output_style="$style"
fi

# Color codes
case "$color" in
    red)    cc="\033[31m" ;;
    orange) cc="\033[38;5;208m" ;;
    yellow) cc="\033[33m" ;;
    *)      cc="" ;;
esac
reset="\033[0m"

# Output: model | tokens/max | style
if [ -n "$cc" ]; then
    echo -e "$model_name | ${cc}${tokens_str}/${max_str}${reset} | $output_style"
else
    echo "$model_name | ${tokens_str}/${max_str} | $output_style"
fi
