# TypeScript SDK Reference

## Overview
Complete API reference documentation for the TypeScript Agent SDK, providing type-safe access to Claude Code's query interface, tool definitions, MCP server creation, and comprehensive type definitions for all SDK interactions.

## User Perspective
Developers import `@anthropic-ai/claude-agent-sdk` to programmatically control Claude Code sessions. The SDK provides three core functions (`query()`, `tool()`, `createSdkMcpServer()`) and extensive TypeScript types for all inputs, outputs, and configuration options. Developers primarily interact with the `query()` function to create Claude Code sessions, configure options, and process streamed message events.

## Data Flow
1. Developer calls `query()` with a prompt and options
2. SDK spawns Claude Code process or connects to existing session
3. Configuration is loaded from `settingSources` (if specified) and merged with programmatic options
4. Claude Code processes the request using configured tools, MCP servers, and system prompt
5. SDK streams back `SDKMessage` events (assistant messages, tool uses, results)
6. Developer processes messages via async iteration or hooks
7. Final `SDKResultMessage` contains usage statistics, cost, and result text

## Implementation

### Key Files
- `.docs/guides/typescript-sdk.md` - Complete API reference with all types and functions
- The reference is organized into sections: Functions, Types, Message Types, Hook Types, Tool Input/Output Types, Permission Types

### Core Functions

**`query()`** - Primary interaction point
- Accepts `prompt` (string or async iterable for streaming mode) and `options`
- Returns `Query` object extending `AsyncGenerator<SDKMessage, void>`
- Provides `interrupt()` and `setPermissionMode()` methods in streaming mode

**`tool()`** - Type-safe MCP tool creation
- Uses Zod schemas for input validation
- Returns `SdkMcpToolDefinition` for use with `createSdkMcpServer()`
- Handler receives type-inferred args and returns `CallToolResult`

**`createSdkMcpServer()`** - In-process MCP server
- Creates server running in same process as application
- Returns `McpSdkServerConfigWithInstance` for `mcpServers` option
- Accepts array of tools created with `tool()`

### Configuration Options

**`settingSources`** - Controls filesystem settings loading
- `[]` (default) - No filesystem settings loaded (SDK isolation)
- `['project']` - Load `.claude/settings.json` and CLAUDE.md files
- `['user', 'project', 'local']` - Load all settings (legacy behavior)
- Must include `'project'` to load CLAUDE.md project instructions
- Settings precedence: local > project > user (programmatic options override all)

**`systemPrompt`** - System prompt configuration
- `undefined` (default) - Empty system prompt
- `string` - Custom system prompt
- `{ type: 'preset', preset: 'claude_code', append?: string }` - Use Claude Code's system prompt with optional extensions
- Required preset form to use CLAUDE.md functionality

**`hooks`** - Event callbacks
- Keyed by `HookEvent`: `'PreToolUse'`, `'PostToolUse'`, `'SessionStart'`, `'SessionEnd'`, etc.
- Each event accepts array of `HookCallbackMatcher` with optional matcher and hooks
- Hook callbacks receive typed `HookInput` and return `HookJSONOutput` with control flow options

**Other key options:**
- `agents` - Programmatic subagent definitions
- `mcpServers` - MCP server configurations (stdio, SSE, HTTP, SDK)
- `allowedTools` / `disallowedTools` - Tool filtering
- `canUseTool` - Custom permission function
- `permissionMode` - `'default'`, `'acceptEdits'`, `'bypassPermissions'`, `'plan'`

### Tool Input/Output Types

**All built-in tools have typed interfaces:**
- Input types: `AgentInput`, `BashInput`, `FileEditInput`, `GrepInput`, etc.
- Output types: `TaskOutput`, `BashOutput`, `EditOutput`, `GrepOutput`, etc.
- Union types: `ToolInput`, `ToolOutput` (documentation-only for all tools)

**Example typed interactions:**
```typescript
// FileEditInput
interface FileEditInput {
  file_path: string;
  old_string: string;
  new_string: string;
  replace_all?: boolean;
}

// EditOutput
interface EditOutput {
  message: string;
  replacements: number;
  file_path: string;
}
```

## Configuration

**Installation:**
```bash
npm install @anthropic-ai/claude-agent-sdk
```

**Required environment:**
- Anthropic API key (via environment or settings)
- Node.js, Bun, or Deno runtime (auto-detected or specified via `executable`)
- Claude Code CLI installed (auto-detected or specified via `pathToClaudeCodeExecutable`)

## Usage Example

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

// Basic query with project settings
const result = query({
  prompt: "Add a new feature following project conventions",
  options: {
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code'
    },
    settingSources: ['project'],  // Load CLAUDE.md
    allowedTools: ['Read', 'Write', 'Edit', 'Grep', 'Glob']
  }
});

// Process messages
for await (const message of result) {
  if (message.type === 'assistant') {
    console.log('Claude:', message.message);
  } else if (message.type === 'result') {
    console.log('Cost:', message.total_cost_usd);
    console.log('Result:', message.result);
  }
}
```

**SDK-only application (no filesystem dependencies):**
```typescript
const result = query({
  prompt: "Review this PR",
  options: {
    // settingSources defaults to [], no filesystem deps
    agents: { reviewer: { /* ... */ } },
    mcpServers: { /* ... */ },
    allowedTools: ['Read', 'Grep', 'Glob']
  }
});
```

**Custom MCP tools:**
```typescript
import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

const fetchUser = tool(
  'fetchUser',
  'Fetches user data by ID',
  { userId: z.string() },
  async (args) => ({
    content: [{
      type: 'text',
      text: JSON.stringify({ id: args.userId, name: 'Alice' })
    }]
  })
);

const server = createSdkMcpServer({
  name: 'user-api',
  tools: [fetchUser]
});

const result = query({
  prompt: "Get user abc123",
  options: {
    mcpServers: { 'user-api': server }
  }
});
```

## Testing

**Manual test:**
1. Install SDK: `npm install @anthropic-ai/claude-agent-sdk`
2. Create script using `query()` with different option combinations
3. Run script and verify messages stream correctly
4. Check final result contains expected `usage`, `total_cost_usd`, `result` fields

**Expected behavior:**
- `query()` returns async generator yielding `SDKMessage` events
- Messages arrive in order: `system` (init), `user`, `assistant`, tool results, final `result`
- TypeScript types prevent invalid configurations at compile time
- Invalid runtime options throw clear errors

## Where Developers Should Look First

**Getting started:**
1. Installation section - Install command
2. `query()` function - Primary entry point
3. `Options` type - All configuration options (focus on `settingSources`, `systemPrompt`, `allowedTools`)
4. `SDKMessage` types - Understand what events you'll receive

**Common tasks:**
- **Configure tools:** `allowedTools`, `disallowedTools`, `canUseTool`
- **Load project settings:** Set `settingSources: ['project']` and `systemPrompt: { type: 'preset', preset: 'claude_code' }`
- **Create custom tools:** `tool()` and `createSdkMcpServer()`
- **Hook into events:** `hooks` option with `HookEvent` types
- **Control permissions:** `permissionMode`, `canUseTool`, `PermissionResult`
- **Type tool interactions:** Search for specific tool name in "Tool Input Types" or "Tool Output Types" sections

**Key type lookup:**
- Functions: `query()`, `tool()`, `createSdkMcpServer()`
- Core types: `Options`, `Query`, `SDKMessage`
- Configuration: `SettingSource`, `PermissionMode`, `AgentDefinition`, `McpServerConfig`
- Tools: Find by name in "Tool Input Types" (e.g., `BashInput`) or "Tool Output Types" (e.g., `BashOutput`)
- Hooks: `HookEvent`, `HookInput` subtypes, `HookJSONOutput`

## Related Documentation
- [SDK overview](/en/api/agent-sdk/overview) - General SDK concepts and workflows
- [Python SDK reference](/en/api/agent-sdk/python) - Python equivalent reference
- [CLI reference](/en/docs/claude-code/cli-reference) - Command-line interface documentation
- [Common workflows](/en/docs/claude-code/common-workflows) - Step-by-step usage guides
