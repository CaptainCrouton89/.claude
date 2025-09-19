# Session Extraction Guide

## Storage Locations

### Primary Locations
- **SQLite Database**: `~/.claude/__store.db` - Contains basic message metadata
- **JSONL Files**: `~/.claude/projects/[project-name]/[session-id].jsonl` - Complete conversation traces

### Project Directory Structure
Projects are stored with sanitized paths: `/Users/silasrhyneer/Code/ASI/ASI-UPEARA-2` becomes `-Users-silasrhyneer-Code-ASI-ASI-UPEARA-2`

## Finding Sessions

### Search for Specific Content
```bash
# Find all JSONL files containing specific text
find ~/.claude/projects -name "*.jsonl" -type f -exec grep -l "search_text" {} \;

# Find sessions with both start and end markers
for file in $(find ~/.claude/projects -name "*.jsonl" -exec grep -l "start_text" {} \;); do
  if grep -q "end_text" "$file"; then
    echo "Found in: $file"
    echo "Session ID: $(basename "$file" .jsonl)"
  fi
done
```

## Message Schemas

### JSONL Line Structure
Each line in the JSONL file is a complete JSON object with these types:

#### User Message
```json
{
  "type": "user",
  "message": {
    "role": "user",
    "content": "string"
  },
  "uuid": "string",
  "timestamp": "ISO-8601",
  "sessionId": "uuid",
  "parentUuid": "uuid"
}
```

#### Assistant Message
```json
{
  "type": "assistant",
  "message": {
    "id": "msg_xxx",
    "role": "assistant",
    "content": [
      {
        "type": "thinking",
        "thinking": "string"
      },
      {
        "type": "text",
        "text": "string"
      },
      {
        "type": "tool_use",
        "id": "toolu_xxx",
        "name": "Task|Read|Write|etc",
        "input": {}
      }
    ]
  },
  "uuid": "string",
  "timestamp": "ISO-8601"
}
```

#### Tool Result
```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_xxx",
  "content": "string",
  "is_error": false
}
```

## Extraction Scripts

### Extract Task/Agent Calls Only
```python
import json

session_file = 'path/to/session.jsonl'
task_tool_ids = set()

with open(session_file, 'r') as f:
    with open('output.txt', 'w') as out:
        for line in f:
            data = json.loads(line)

            # User messages (skip system messages)
            if data.get('type') == 'user':
                content = data.get('message', {}).get('content', '')
                if (not content.startswith('Caveat:') and
                    not '<command-name>' in content and
                    not '<user-prompt-submit-hook>' in content):
                    out.write(f"\n[USER MESSAGE]\n{content}\n")

            # Assistant messages
            elif data.get('type') == 'assistant':
                content = data.get('message', {}).get('content', '')
                if isinstance(content, list):
                    for item in content:
                        if isinstance(item, dict):
                            # Skip thinking if not needed
                            if item.get('type') == 'text':
                                out.write(f"\n[ASSISTANT RESPONSE]\n{item.get('text', '')}\n")
                            elif item.get('type') == 'tool_use' and item.get('name') == 'Task':
                                tool_id = item.get('id', '')
                                task_tool_ids.add(tool_id)
                                tool_input = item.get('input', {})
                                out.write(f"\n[AGENT CALL: Task]\n")
                                out.write(f"  Agent Type: {tool_input.get('subagent_type')}\n")
                                out.write(f"  Description: {tool_input.get('description')}\n")

            # Tool results for Task calls only
            elif data.get('type') == 'tool_result':
                if data.get('tool_use_id') in task_tool_ids:
                    out.write(f"\n[AGENT RESULT]\n{data.get('content', '')}\n")
```

## Key Patterns to Filter

### Skip These User Message Types
- Messages starting with `"Caveat:"`
- Messages containing `<command-name>`, `<command-message>`, `<command-args>`
- Messages containing `<local-command-stdout>`
- Messages containing `<user-prompt-submit-hook>`

### Tool Names to Track
- `Task` - Agent delegation calls
- `Read`, `Write`, `Edit`, `MultiEdit` - File operations
- `Bash` - Shell commands
- `Grep`, `Glob` - Search operations
- `TodoWrite` - Task management

## Quick Commands

```bash
# Count messages in session
wc -l session.jsonl

# Extract session to JSON array
cat session.jsonl | jq -s '.' > session.json

# Get all agent calls
grep '"name":"Task"' session.jsonl | jq '.message.content[] | select(.type=="tool_use" and .name=="Task")'

# Check if session contains specific text
grep -q "target_text" session.jsonl && echo "Found"

# Extract user messages only
jq -r 'select(.type=="user") | .message.content' session.jsonl
```

## Multiple Session Handling

When multiple sessions match initial criteria:
1. Use additional unique text to differentiate (e.g., completion messages)
2. Check line counts - complete sessions are typically longer (1000+ lines vs 300-600 for incomplete)
3. Look for success/completion markers in assistant messages

## SQL Database Schema (Limited Use)

Tables in `~/.claude/__store.db`:
- `base_messages` - Message metadata
- `user_messages` - User message content
- `assistant_messages` - Assistant message content
- `conversation_summaries` - Session summaries

Note: Database contains limited info. JSONL files have complete conversation data including tool calls and thinking.

## Performance Tips

- Use `grep -l` first to find files, then process matches
- Cache extracted sessions locally to avoid re-processing
- For large extractions, process line-by-line rather than loading entire file
- Filter out thinking blocks early if not needed (they can be 50%+ of content)