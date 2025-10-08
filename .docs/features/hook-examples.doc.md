# Hook Examples Documentation

## Overview
Provides comprehensive real-world examples of hook event data structures and tool input/output patterns to help developers build and test custom hooks for the Claude Code hook system.

## User Perspective
Developers reference this guide when building custom hooks to understand the exact JSON structure they'll receive from different hook events and tools. The examples show actual captured data from the debug hook, making it easier to write validation logic, parse tool inputs, and handle responses correctly.

## Data Flow
1. User triggers an event (session start, prompt submission, tool use)
2. Claude Code captures the event data as structured JSON
3. Hook system passes JSON via stdin to registered hook commands
4. Hook commands parse the JSON to extract relevant fields
5. Developers use examples guide to understand available fields and structure

## Implementation

### Key Files
- `.docs/guides/hook-examples.md` - Comprehensive examples of all hook event types and tool inputs/outputs
- `.docs/guides/hooks.md` - Main hooks reference documentation with configuration and API details

### Event Categories Documented

#### Session Events
- `SessionStart` - New session initialization with source (startup/resume/clear/compact)
- `SessionEnd` - Session termination with reason (clear/logout/exit/other)
- `Stop` - Main conversation completion with permission mode
- `SubagentStop` - Subagent task completion

#### User Interaction Events
- `UserPromptSubmit` - User prompt submission with full prompt text

#### Tool Events
- `PreToolUse` - Before tool execution with tool_name and tool_input
- `PostToolUse` - After tool execution with tool_name, tool_input, and tool_response

### Tool Examples Documented
- `TodoWrite` - Todo list management with status transitions
- `Read` - File reading with content and metadata
- `Write` - File writing/updating with structured patches
- `Bash` - Shell command execution with stdout/stderr
- `Task` - Subagent creation with usage statistics

### Common Data Fields
All hook events include:
- `cwd` - Current working directory
- `hook_event_name` - Event type identifier
- `session_id` - Unique session identifier
- `transcript_path` - Path to session transcript

Tool events additionally include:
- `permission_mode` - Current permission level
- `tool_name` - Tool being invoked
- `tool_input` - Input parameters
- `tool_response` - Output (PostToolUse only)

## Configuration
No environment variables or feature flags required. This is documentation-only.

## Usage Example
```python
#!/usr/bin/env python3
import json
import sys

# Load hook input
input_data = json.load(sys.stdin)

# Reference hook-examples.md to understand structure
if input_data["hook_event_name"] == "PreToolUse":
    tool_name = input_data["tool_name"]
    tool_input = input_data["tool_input"]

    # Examples show Write tool has file_path and content
    if tool_name == "Write":
        file_path = tool_input["file_path"]
        content = tool_input["content"]

        # Validate based on documented structure
        if file_path.endswith(".env"):
            print("Cannot write to .env files", file=sys.stderr)
            sys.exit(2)

sys.exit(0)
```

## Testing
- Manual test: Review examples against actual hook execution with `claude --debug`
- Expected behavior: Examples match real hook event JSON structures exactly
- Validation: Use examples to build hooks, verify they parse data correctly

## Related Documentation
- Architecture: `.docs/guides/hooks.md` - Complete hooks system reference
- Guide: Hook system configuration and event types
- Connection: Examples support the main hooks architecture by providing concrete data structures for implementation
