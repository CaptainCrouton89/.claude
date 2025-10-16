---
name: TypeScript SDK Reference
description: Comprehensive reference for the TypeScript Agent SDK with functions, types, and interfaces for programmatic Claude Code interactions
allowed-tools:
  - Read
  - Write
  - Edit
  - Task
---

# TypeScript SDK Reference

A comprehensive reference for building applications with the **Anthropic Agent SDK** (TypeScript), enabling programmatic interactions with Claude Code and custom tool integrations.

## Installation

```bash
npm install @anthropic-ai/claude-agent-sdk
```

## Quick Start

### Core Functions

| Function | Purpose | Key Use Case |
|----------|---------|--------------|
| **`query()`** | Primary interface for Claude Code interactions | Send prompts, stream responses, manage multi-turn conversations |
| **`tool()`** | Define MCP tools with type-safe schemas | Create custom tools for agents using Zod validation |
| **`createSdkMcpServer()`** | Create in-process MCP servers | Host tools natively in your application |

### Example: Basic Query

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const result = query({
  prompt: "Analyze this code and suggest improvements",
  options: {
    allowedTools: ['Read', 'Grep'],
    model: 'claude-opus'
  }
});

for await (const message of result) {
  if (message.type === 'assistant') {
    console.log(message.message.content);
  }
}
```

## Main Functions Reference

### `query()`

Streams Claude Code responses with full message type support. Returns an async generator of `SDKMessage` objects.

**Parameters:**
- `prompt`: string or async iterable of messages (streaming mode)
- `options`: Configuration object (see [Options](#key-configuration-options) below)

**Returns:** `Query` object (extends `AsyncGenerator<SDKMessage, void>`)

**Key Methods:**
- `.interrupt()` – Interrupt streaming (streaming mode only)
- `.setPermissionMode(mode)` – Change permissions dynamically (streaming mode only)

### `tool()`

Creates type-safe MCP tool definitions using Zod schemas. Handlers receive validated inputs and must return `CallToolResult`.

**Parameters:**
- `name`: Tool identifier
- `description`: Natural language description
- `inputSchema`: Zod schema defining inputs
- `handler`: Async function `(args: z.infer<Schema>, extra?: unknown) => Promise<CallToolResult>`

**Returns:** `SdkMcpToolDefinition<Schema>`

### `createSdkMcpServer()`

Creates an in-process MCP server for hosting custom tools. Runs in the same Node.js process—no subprocess overhead.

**Parameters:**
- `name`: Server identifier
- `version`: Optional semantic version
- `tools`: Array of tool definitions from `tool()`

**Returns:** `McpSdkServerConfigWithInstance` (ready for `mcpServers` option)

---

## Key Configuration Options

### Essential Options

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `allowedTools` | `string[]` | All available | Restrict which tools Claude can use |
| `disallowedTools` | `string[]` | `[]` | Explicitly block tools |
| `model` | `string` | CLI default | Override Claude model (e.g., `'claude-opus'`) |
| `cwd` | `string` | `process.cwd()` | Working directory for operations |
| `abortController` | `AbortController` | New instance | Control task cancellation |

### Advanced Options

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `systemPrompt` | string or preset object | None | Custom system instructions or Claude Code preset |
| `agents` | `Record<string, AgentDefinition>` | `undefined` | Programmatically define subagents with custom prompts |
| `mcpServers` | `Record<string, McpServerConfig>` | `{}` | Connect stdio, SSE, HTTP, or SDK MCP servers |
| `settingSources` | `('user' \| 'project' \| 'local')[]` | `[]` | Load filesystem settings (CLAUDE.md, settings.json) |
| `permissionMode` | `PermissionMode` | `'default'` | `'default'`, `'acceptEdits'`, `'bypassPermissions'`, or `'plan'` |
| `maxThinkingTokens` | `number` | `undefined` | Token limit for extended thinking |
| `maxTurns` | `number` | `undefined` | Maximum conversation turns before stopping |
| `resume` | `string` | `undefined` | Resume a previous session by ID |
| `forkSession` | `boolean` | `false` | Fork to new session on resume instead of continuing |

---

## Message Types Overview

The `query()` generator yields `SDKMessage` objects. Common types:

| Message Type | When Emitted | Key Fields |
|--------------|-------------|------------|
| `'system'` | Session initialization | `tools`, `model`, `permissionMode`, `slash_commands` |
| `'user'` | User input sent | `message` (APIUserMessage), `uuid` |
| `'assistant'` | Claude responds | `message` (APIAssistantMessage with content/tool_use) |
| `'result'` | Query completes | `subtype` ('success' or error), `usage`, `total_cost_usd` |
| `'stream_event'` | Partial streaming data | `event` (only if `includePartialMessages: true`) |

See [Message Types Reference](./MESSAGE_TYPES.md) for complete definitions.

---

## Types Reference Overview

### Core Configuration Types

- **`Options`** – Query configuration with 20+ properties (Tools, MCP, permissions, execution)
- **`PermissionMode`** – Control execution permissions: `'default'`, `'acceptEdits'`, `'bypassPermissions'`, `'plan'`
- **`SettingSource`** – Filesystem config scope: `'user'`, `'project'`, `'local'`

### Agent & Tool Types

- **`AgentDefinition`** – Subagent config: `description`, `prompt`, `tools`, `model` override
- **`SdkMcpToolDefinition`** – Output of `tool()` function with Zod schema binding
- **`McpServerConfig`** – Union of stdio, SSE, HTTP, or SDK server configs

### MCP Server Configuration

| Config Type | Transport | Use Case |
|------------|-----------|----------|
| `McpStdioServerConfig` | stdio (subprocess) | External tools, sandboxing |
| `McpSSEServerConfig` | Server-Sent Events | Remote tools, pub/sub patterns |
| `McpHttpServerConfig` | HTTP | REST-based tools, cloud integrations |
| `McpSdkServerConfigWithInstance` | In-process | Custom tools, no subprocess overhead |

### Hook Types

- **`HookEvent`** – Event names: `PreToolUse`, `PostToolUse`, `Notification`, `UserPromptSubmit`, `SessionStart`, `SessionEnd`, etc.
- **`HookCallback`** – Async function receiving hook input and returning decisions
- **`HookInput`** – Union of all hook input types; each extends `BaseHookInput`

See [Types Reference](./TYPES.md) for detailed type definitions.

---

## Tool Input/Output Reference

### Built-in Tool Inputs

All tool names map to input schemas:

| Tool | Purpose | Key Input |
|------|---------|-----------|
| `Task` | Delegate to subagent | `description`, `prompt`, `subagent_type` |
| `Bash` | Run shell commands | `command`, optional `timeout`, `run_in_background` |
| `Read` | Read files/images/PDFs | `file_path`, optional offset/limit |
| `Write` / `Edit` | Modify files | `file_path`, `content` or old/new strings |
| `Glob` | Pattern matching | `pattern`, optional `path` |
| `Grep` | Regex search | `pattern`, optional filters (glob, type, -B/-A/-C) |
| `WebFetch` | Fetch & analyze URLs | `url`, `prompt` for AI analysis |
| `WebSearch` | Web search | `query`, optional domain filters |
| `NotebookEdit` | Jupyter notebooks | `notebook_path`, `new_source`, `edit_mode` |
| `TodoWrite` | Task tracking | `todos` array with status, content, activeForm |

See [Tool Reference](./TOOLS.md) for complete input/output schemas and examples.

---

## Common Patterns

### Streaming with Progress

```typescript
const result = query({
  prompt: "Your task here",
  options: {
    includePartialMessages: true,
    permissionMode: 'bypassPermissions'
  }
});

for await (const msg of result) {
  if (msg.type === 'stream_event') {
    // Handle streaming events
    console.log('Streaming:', msg.event);
  } else if (msg.type === 'result') {
    console.log('Cost:', msg.total_cost_usd, 'Usage:', msg.usage);
  }
}
```

### Custom MCP Tools

```typescript
import { tool, createSdkMcpServer, query } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

const myTool = tool(
  'my-calculator',
  'Add two numbers',
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: 'text', text: `Result: ${a + b}` }]
  })
);

const server = createSdkMcpServer({
  name: 'my-tools',
  tools: [myTool]
});

const result = query({
  prompt: "Use my-calculator to add 5 + 3",
  options: {
    mcpServers: { 'my-tools': server }
  }
});
```

### Loading Project Settings

```typescript
const result = query({
  prompt: "Add a feature following project conventions",
  options: {
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code'  // Enables Claude Code system prompt
    },
    settingSources: ['project'],  // Load .claude/settings.json & CLAUDE.md
    allowedTools: ['Read', 'Write', 'Edit', 'Bash']
  }
});
```

---

## Related Resources

- **[Full API Reference](../../docs/external/typescript-sdk.md)** – Complete type definitions and schemas
- **[Message Types Reference](./MESSAGE_TYPES.md)** – SDKMessage union types and examples
- **[Types Reference](./TYPES.md)** – Detailed Options, AgentDefinition, PermissionMode docs
- **[Tool Reference](./TOOLS.md)** – Input/output schemas for all built-in tools
- **[SDK Overview](https://docs.anthropic.com/en/api/agent-sdk/overview)** – Getting started guide
- **[Common Workflows](https://docs.anthropic.com/en/docs/claude-code/common-workflows)** – Step-by-step patterns
- **[CLI Reference](https://docs.anthropic.com/en/docs/claude-code/cli-reference)** – Command-line interface docs
