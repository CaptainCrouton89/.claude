# Hook Event Examples

This document shows real examples of different hook events and tool inputs/outputs captured by the debug hook.

## Hook Event Types

### Session Events

#### SessionStart
Triggered when a new session begins.

```json
{
  "cwd": "/Users/silasrhyneer/Code/Klaude",
  "hook_event_name": "SessionStart",
  "session_id": "10ad1de4-613a-470f-9463-bf4fcac617eb",
  "source": "startup",
  "transcript_path": "/Users/silasrhyneer/.claude/projects/-Users-silasrhyneer-Code-Klaude/10ad1de4-613a-470f-9463-bf4fcac617eb.jsonl"
}
```

#### SessionEnd
Triggered when a session ends.

```json
{
  "cwd": "/Users/silasrhyneer/Code/Klaude",
  "hook_event_name": "SessionEnd",
  "reason": "clear",
  "session_id": "ab8470a8-943f-43f9-98dd-fdf9c17a799e",
  "transcript_path": "/Users/silasrhyneer/.claude/projects/-Users-silasrhyneer-Code-Klaude/ab8470a8-943f-43f9-98dd-fdf9c17a799e.jsonl"
}
```

#### Stop
Triggered when the main conversation stops.

```json
{
  "cwd": "/Users/silasrhyneer/Code/Klaude",
  "hook_event_name": "Stop",
  "permission_mode": "acceptEdits",
  "session_id": "10ad1de4-613a-470f-9463-bf4fcac617eb",
  "stop_hook_active": false,
  "transcript_path": "/Users/silasrhyneer/.claude/projects/-Users-silasrhyneer-Code-Klaude/10ad1de4-613a-470f-9463-bf4fcac617eb.jsonl"
}
```

#### SubagentStop
Triggered when a subagent (Task tool) completes.

```json
{
  "cwd": "/Users/silasrhyneer/Code/Klaude",
  "hook_event_name": "SubagentStop",
  "permission_mode": "default",
  "session_id": "daf05ac5-1785-4c0e-bd79-ba187720d7bd",
  "stop_hook_active": false,
  "transcript_path": "/Users/silasrhyneer/.claude/projects/-Users-silasrhyneer-Code-Klaude/daf05ac5-1785-4c0e-bd79-ba187720d7bd.jsonl"
}
```

### User Interaction Events

#### UserPromptSubmit
Triggered when the user submits a prompt.

```json
{
  "cwd": "/Users/silasrhyneer/Code/Klaude",
  "hook_event_name": "UserPromptSubmit",
  "permission_mode": "default",
  "prompt": "Make a todo list, write a very short file, mark a todo list item complete, run some bash echo hi, then close the todo list. This is for a test.",
  "session_id": "10ad1de4-613a-470f-9463-bf4fcac617eb",
  "transcript_path": "/Users/silasrhyneer/.claude/projects/-Users-silasrhyneer-Code-Klaude/10ad1de4-613a-470f-9463-bf4fcac617eb.jsonl"
}
```

### Tool Events

#### PreToolUse
Triggered before a tool is executed. Contains `tool_name` and `tool_input`.

#### PostToolUse
Triggered after a tool executes. Contains `tool_name`, `tool_input`, and `tool_response`.

## Tool Input/Output Examples

### TodoWrite Tool

#### Input
```json
{
  "todos": [
    {
      "activeForm": "Writing a short test file",
      "content": "Write a short test file",
      "status": "pending"
    },
    {
      "activeForm": "Running bash echo command",
      "content": "Run bash echo command",
      "status": "pending"
    }
  ]
}
```

#### Output
```json
{
  "newTodos": [
    {
      "activeForm": "Writing a short test file",
      "content": "Write a short test file",
      "status": "in_progress"
    },
    {
      "activeForm": "Running bash echo command",
      "content": "Run bash echo command",
      "status": "pending"
    }
  ],
  "oldTodos": [
    {
      "activeForm": "Writing a short test file",
      "content": "Write a short test file",
      "status": "pending"
    },
    {
      "activeForm": "Running bash echo command",
      "content": "Run bash echo command",
      "status": "pending"
    }
  ]
}
```

#### Clearing Todos
Input:
```json
{
  "todos": []
}
```

Output:
```json
{
  "newTodos": [],
  "oldTodos": [
    {
      "activeForm": "Writing a short test file",
      "content": "Write a short test file",
      "status": "completed"
    },
    {
      "activeForm": "Running bash echo command",
      "content": "Run bash echo command",
      "status": "in_progress"
    }
  ]
}
```

### Read Tool

#### Input
```json
{
  "file_path": "/Users/silasrhyneer/Code/Klaude/test.txt"
}
```

#### Output
```json
{
  "file": {
    "content": "Test",
    "filePath": "/Users/silasrhyneer/Code/Klaude/test.txt",
    "numLines": 1,
    "startLine": 1,
    "totalLines": 1
  },
  "type": "text"
}
```

### Write Tool

#### Input
```json
{
  "content": "test",
  "file_path": "/Users/silasrhyneer/Code/Klaude/test.txt"
}
```

#### Output (File Update)
```json
{
  "content": "test",
  "filePath": "/Users/silasrhyneer/Code/Klaude/test.txt",
  "structuredPatch": [
    {
      "lines": [
        "-Test",
        "\\ No newline at end of file",
        "+test",
        "\\ No newline at end of file"
      ],
      "newLines": 1,
      "newStart": 1,
      "oldLines": 1,
      "oldStart": 1
    }
  ],
  "type": "update"
}
```

### Bash Tool

#### Input
```json
{
  "command": "echo hi",
  "description": "Echo test message"
}
```

#### Output
```json
{
  "interrupted": false,
  "isImage": false,
  "stderr": "",
  "stdout": "hi"
}
```

### Task Tool (Agents)

#### Input
```json
{
  "description": "Say hi",
  "prompt": "Please say \"hi\" to the user.",
  "subagent_type": "general-purpose"
}
```

#### Output
```json
{
  "content": [
    {
      "text": "Hi! I'm Claude Code, ready to help you with the Klaude observer pattern system. I can help you work with observers, analyze the codebase, create new observer configurations, or assist with any development tasks in this project. What would you like to work on?",
      "type": "text"
    }
  ],
  "totalDurationMs": 4445,
  "totalTokens": 12747,
  "totalToolUseCount": 0,
  "usage": {
    "cache_creation": {
      "ephemeral_1h_input_tokens": 0,
      "ephemeral_5m_input_tokens": 0
    },
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 12682,
    "input_tokens": 4,
    "output_tokens": 61,
    "service_tier": "standard"
  }
}
```

## Complete PreToolUse/PostToolUse Example

### PreToolUse Event
```json
{
  "cwd": "/Users/silasrhyneer/Code/Klaude",
  "hook_event_name": "PreToolUse",
  "permission_mode": "default",
  "session_id": "10ad1de4-613a-470f-9463-bf4fcac617eb",
  "tool_input": {
    "todos": [
      {
        "activeForm": "Writing a short test file",
        "content": "Write a short test file",
        "status": "pending"
      }
    ]
  },
  "tool_name": "TodoWrite",
  "transcript_path": "/Users/silasrhyneer/.claude/projects/-Users-silasrhyneer-Code-Klaude/10ad1de4-613a-470f-9463-bf4fcac617eb.jsonl"
}
```

### PostToolUse Event
```json
{
  "cwd": "/Users/silasrhyneer/Code/Klaude",
  "hook_event_name": "PostToolUse",
  "permission_mode": "default",
  "session_id": "10ad1de4-613a-470f-9463-bf4fcac617eb",
  "tool_input": {
    "todos": [
      {
        "activeForm": "Writing a short test file",
        "content": "Write a short test file",
        "status": "pending"
      }
    ]
  },
  "tool_name": "TodoWrite",
  "tool_response": {
    "newTodos": [
      {
        "activeForm": "Writing a short test file",
        "content": "Write a short test file",
        "status": "pending"
      }
    ],
    "oldTodos": []
  },
  "transcript_path": "/Users/silasrhyneer/.claude/projects/-Users-silasrhyneer-Code-Klaude/10ad1de4-613a-470f-9463-bf4fcac617eb.jsonl"
}
```

## Common Fields

All hook events include:
- `cwd`: Current working directory
- `hook_event_name`: Type of hook event
- `session_id`: Unique session identifier
- `transcript_path`: Path to session transcript

Tool events additionally include:
- `permission_mode`: Current permission level (`default`, `acceptEdits`, etc.)
- `tool_name`: Name of the tool being used
- `tool_input`: Input parameters passed to the tool
- `tool_response`: (PostToolUse only) Output from the tool
