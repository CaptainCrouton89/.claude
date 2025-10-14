# Cursor CLI (`cursor-agent`) Reference Guide

## Installation

```bash
curl https://cursor.com/install -fsSL | bash
```

## Authentication

### Environment Variable (Recommended)
```bash
export CURSOR_API_KEY=sk_XXXX...
cursor-agent "your prompt"
```

### Command Line Flag
```bash
cursor-agent --api-key sk_XXXX... "your prompt"
```

Generate API keys at: Cursor Dashboard > Integrations > User API Keys

## CLI Command Syntax

### Basic Invocation
```bash
# Interactive mode (default)
cursor-agent

# Non-interactive with prompt
cursor-agent -p "your prompt" --output-format stream-json

# Resume previous conversation
cursor-agent resume
cursor-agent --resume [thread_id]

# List conversations
cursor-agent ls
```

### Key Flags

- `-p, --prompt` - Provide prompt directly (non-interactive mode)
- `--print` - Enable print mode for streaming output
- `--output-format` - Output format: `stream-json` (default), `json`, `text`
- `--stream-partial-output` - Enable character-level text deltas
- `--model` - Specify model (e.g., `-m gpt-5`)
- `--api-key` - Inline API key authentication
- `--force` - Force execution without confirmations
- `--resume [thread_id]` - Continue specific conversation

## Output Formats

### stream-json (NDJSON) - Default

Newline-delimited JSON events emitted in real-time. Each line is a complete JSON object.

#### Event Types

##### 1. System Initialization
```json
{
  "type": "init",
  "apiKeySource": "env",
  "cwd": "/path/to/directory",
  "session_id": "uuid-here",
  "model": "gpt-5",
  "permissionMode": "auto"
}
```

##### 2. User Message
```json
{
  "type": "user",
  "message": {
    "role": "user",
    "content": [{
      "type": "text",
      "text": "implement user authentication"
    }]
  },
  "session_id": "uuid-here"
}
```

##### 3. Assistant Text Delta
```json
{
  "type": "assistant",
  "message": {
    "role": "assistant",
    "content": [{
      "type": "text",
      "text": "I'll help you implement..."
    }]
  },
  "session_id": "uuid-here"
}
```

##### 4. Tool Call Start
```json
{
  "type": "tool_call",
  "subtype": "started",
  "call_id": "call-uuid",
  "tool_name": "read_file",
  "args": {
    "path": "src/auth.js"
  },
  "session_id": "uuid-here"
}
```

##### 5. Tool Call Complete
```json
{
  "type": "tool_call",
  "subtype": "completed",
  "call_id": "call-uuid",
  "tool_name": "read_file",
  "result": "file contents here...",
  "duration_ms": 123,
  "session_id": "uuid-here"
}
```

##### 6. Terminal Result (Success)
```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "duration_ms": 5234,
  "duration_api_ms": 3456,
  "result": "Full assistant response text...",
  "session_id": "uuid-here"
}
```

### json Format

Single JSON object emitted after completion:

```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "duration_ms": 5234,
  "duration_api_ms": 3456,
  "result": "Complete aggregated assistant text",
  "session_id": "uuid-here"
}
```

### text Format

Human-readable progress output (not structured).

## Stream Parsing Patterns

### Node.js NDJSON Parser
```javascript
const readline = require('readline');
const { spawn } = require('child_process');

const cursor = spawn('cursor-agent', [
  '-p', 'your prompt',
  '--print',
  '--output-format', 'stream-json'
]);

const rl = readline.createInterface({
  input: cursor.stdout,
  crlfDelay: Infinity
});

let assistantText = '';

rl.on('line', (line) => {
  try {
    const event = JSON.parse(line);

    switch(event.type) {
      case 'init':
        console.log(`Session started: ${event.session_id}`);
        break;

      case 'assistant':
        // Concatenate text deltas
        if (event.message?.content?.[0]?.text) {
          assistantText += event.message.content[0].text;
        }
        break;

      case 'tool_call':
        if (event.subtype === 'started') {
          console.log(`Calling ${event.tool_name}...`);
        }
        break;

      case 'result':
        if (event.subtype === 'success') {
          console.log('Complete response:', event.result);
        }
        break;
    }
  } catch (err) {
    console.error('Parse error:', err);
  }
});

cursor.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Process exited with code ${code}`);
  }
});
```

### Python NDJSON Parser
```python
import subprocess
import json

process = subprocess.Popen(
    ['cursor-agent', '-p', 'your prompt', '--print', '--output-format', 'stream-json'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

assistant_text = ''

for line in process.stdout:
    try:
        event = json.loads(line.strip())

        if event['type'] == 'assistant':
            # Extract and concatenate text deltas
            content = event.get('message', {}).get('content', [])
            if content and content[0].get('type') == 'text':
                assistant_text += content[0].get('text', '')

        elif event['type'] == 'tool_call' and event['subtype'] == 'started':
            print(f"Tool call: {event['tool_name']}")

        elif event['type'] == 'result' and event['subtype'] == 'success':
            print(f"Final result: {event['result']}")

    except json.JSONDecodeError:
        pass

return_code = process.wait()
if return_code != 0:
    print(f"Error: Process exited with code {return_code}")
```

## Practical Examples

### Code Review Automation
```bash
cursor-agent -p "Review the changes in src/ for security issues" \
  --print \
  --output-format stream-json \
  --model gpt-5
```

### CI/CD Integration
```bash
#!/bin/bash
export CURSOR_API_KEY=$CI_CURSOR_KEY

cursor-agent -p "Generate unit tests for the new payment module" \
  --print \
  --output-format json \
  --force | jq -r '.result' > tests.md
```

### Piping from stdin
```bash
cat README.md | cursor-agent \
  -p "Convert this to OpenAPI 3.0.3 YAML" \
  --print \
  --output-format stream-json
```

### With Partial Output Streaming
```bash
cursor-agent -p "Explain the codebase architecture" \
  --print \
  --output-format stream-json \
  --stream-partial-output
```

## Important Notes

1. **Security**: cursor-agent can read, modify, delete files and execute shell commands. Use only in trusted environments.

2. **Error Handling**: On failure, exit code is non-zero and error message goes to stderr. No well-formed JSON on failure.

3. **Thinking Events**: Suppressed in print mode - won't appear in stream.

4. **Backward Compatibility**: New fields may be added to events. Parsers should ignore unknown fields.

5. **TTY Detection**: Print mode auto-enabled for non-TTY stdout or piped stdin.

6. **Rate Limits**: Subject to your Cursor subscription limits.

## Gotchas & Edge Cases

- **Incomplete Streams**: Network issues or crashes may result in incomplete NDJSON streams without terminal event
- **Large Outputs**: Very large assistant responses may be split across multiple delta events
- **Tool Approval**: In interactive mode, tool calls require manual approval unless `--force` is used
- **Session Persistence**: Session IDs enable conversation threading but are not automatically persisted
- **Model Availability**: Model selection depends on your Cursor subscription tier

## Environment Variables

- `CURSOR_API_KEY` - API key for authentication
- `CURSOR_MODEL` - Default model (can be overridden with --model)
- `CURSOR_CWD` - Working directory for agent operations

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Authentication failure
- `3` - Network/API error
- `4` - User cancellation
- `5` - Tool execution error

## Version Checking

```bash
cursor-agent --version
cursor-agent status  # Check auth and connection
```

---

*Last Updated: January 2025*
*Based on Cursor CLI documentation and real-world usage patterns*