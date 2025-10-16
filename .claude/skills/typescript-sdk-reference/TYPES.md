# Types Reference

Comprehensive documentation of configuration and utility types.

---

## Options Type

Main configuration object for `query()` function.

### Execution & Model

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `model` | `string` | CLI default | Claude model ID (e.g., `'claude-opus'`, `'claude-sonnet'`) |
| `maxThinkingTokens` | `number` | `undefined` | Max tokens for extended thinking (applicable models only) |
| `maxTurns` | `number` | `undefined` | Halt after N conversation turns |
| `fallbackModel` | `string` | `undefined` | Fallback model if primary fails |

### Tool & Permissions

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `allowedTools` | `string[]` | All tools | Restrict which tools Claude can use |
| `disallowedTools` | `string[]` | `[]` | Explicitly deny specific tools |
| `canUseTool` | `CanUseTool` function | `undefined` | Custom permission function with fine-grained control |
| `permissionMode` | `PermissionMode` | `'default'` | Global permission behavior (see below) |
| `permissionPromptToolName` | `string` | `undefined` | MCP tool for custom permission prompts |

### File System & Execution

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `cwd` | `string` | `process.cwd()` | Working directory for file operations |
| `additionalDirectories` | `string[]` | `[]` | Extra directories Claude can access |
| `env` | `Dict<string>` | `process.env` | Environment variables available to operations |
| `executable` | `'bun' \| 'deno' \| 'node'` | Auto-detect | JavaScript runtime for execution |
| `executableArgs` | `string[]` | `[]` | Arguments passed to the executable |
| `pathToClaudeCodeExecutable` | `string` | Auto-detect | Path to Claude Code binary |
| `extraArgs` | `Record<string, string \| null>` | `{}` | Additional arguments passed through |

### Initialization & Settings

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `systemPrompt` | `string \| { type: 'preset'; preset: 'claude_code'; append?: string }` | `undefined` | Custom or preset system instructions |
| `settingSources` | `('user' \| 'project' \| 'local')[]` | `[]` | Load filesystem settings (CLAUDE.md, settings.json) |
| `resume` | `string` | `undefined` | Resume previous session by ID |
| `forkSession` | `boolean` | `false` | Fork new session on resume instead of continuing |
| `continue` | `boolean` | `false` | Continue most recent conversation |

### Streaming & Events

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `includePartialMessages` | `boolean` | `false` | Emit `stream_event` messages during generation |
| `hooks` | `Partial<Record<HookEvent, HookCallbackMatcher[]>>` | `{}` | Event hooks (PreToolUse, PostToolUse, etc.) |
| `stderr` | `(data: string) => void` | `undefined` | Callback for stderr output |

### External Integrations

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `mcpServers` | `Record<string, McpServerConfig>` | `{}` | MCP server configs (stdio, SSE, HTTP, SDK) |
| `strictMcpConfig` | `boolean` | `false` | Enforce strict MCP configuration validation |
| `agents` | `Record<string, AgentDefinition>` | `undefined` | Programmatic subagent definitions |

### Cancellation

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `abortController` | `AbortController` | New instance | Cancellation token for the operation |

---

## PermissionMode Type

Controls Claude's access to file operations and tools.

```typescript
type PermissionMode =
  | 'default'           // Prompt user for file edits, tool use
  | 'acceptEdits'       // Auto-accept file edits without prompting
  | 'bypassPermissions' // Skip all permission checks
  | 'plan'              // Planning mode—no execution, only output plans
```

### Decision Table

| Mode | File Edit | Tool Use | Query | Use Case |
|------|-----------|----------|-------|----------|
| `'default'` | Prompt | Prompt | Run | Interactive sessions |
| `'acceptEdits'` | Auto-accept | Prompt | Run | Semi-automated, trust edits |
| `'bypassPermissions'` | Auto-accept | Auto-accept | Run | CI/CD, full automation |
| `'plan'` | Output only | Output only | No-op | Planning, safety checks |

### Dynamic Changes

Change permissions mid-session using the `Query.setPermissionMode()` method:

```typescript
const result = query({ prompt: "Your task", options: { permissionMode: 'default' } });

for await (const msg of result) {
  if (msg.type === 'assistant') {
    // Switch to bypass mode after analysis
    await result.setPermissionMode('bypassPermissions');
  }
}
```

---

## AgentDefinition Type

Configuration for programmatically defined subagents.

```typescript
type AgentDefinition = {
  description: string;           // When to use this agent (required)
  prompt: string;                // System prompt (required)
  tools?: string[];              // Allowed tools; inherits all if omitted
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';  // Model override
}
```

### Example: Custom Subagent

```typescript
const agents = {
  'code-reviewer': {
    description: 'Review code for quality, security, and performance',
    prompt: `You are a senior code reviewer. Evaluate code against these criteria:
1. Security: Check for vulnerabilities
2. Performance: Identify bottlenecks
3. Maintainability: Assess clarity and patterns`,
    tools: ['Read', 'Grep', 'Bash'],
    model: 'opus'  // Use powerful model for review
  },
  'test-writer': {
    description: 'Write comprehensive unit tests',
    prompt: `You are an expert test engineer specializing in coverage and edge cases.`,
    tools: ['Read', 'Write', 'Edit'],
    model: 'sonnet'
  }
};

const result = query({
  prompt: "Review this code for security issues",
  options: { agents }
});
```

---

## SettingSource Type

Controls which filesystem-based configuration sources are loaded.

```typescript
type SettingSource = 'user' | 'project' | 'local';
```

### Sources & Locations

| Source | File | Scope | Precedence |
|--------|------|-------|-----------|
| `'user'` | `~/.claude/settings.json` | Global | Lowest (overridden by others) |
| `'project'` | `.claude/settings.json` | Per-repo | Medium |
| `'local'` | `.claude/settings.local.json` | Git-ignored | Highest (overrides all) |

### Precedence Order

When multiple sources are loaded, settings merge with this priority (highest to lowest):
1. Local settings (`.claude/settings.local.json`)
2. Project settings (`.claude/settings.json`)
3. User settings (`~/.claude/settings.json`)
4. Programmatic options (always override filesystem)

### Default Behavior

When `settingSources` is **omitted** or **`[]`**, the SDK **does not** load any filesystem settings. This provides isolation for SDK applications.

### Loading CLAUDE.md

To load project instructions from `CLAUDE.md`:

```typescript
const result = query({
  prompt: "Add a feature following project conventions",
  options: {
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code'  // Enable Claude Code system prompt
    },
    settingSources: ['project']  // Load .claude/settings.json & CLAUDE.md
  }
});
```

---

## Permission Control Types

### CanUseTool Function

Custom permission callback for granular tool access control.

```typescript
type CanUseTool = (
  toolName: string,
  input: ToolInput,
  options: {
    signal: AbortSignal;
    suggestions?: PermissionUpdate[];
  }
) => Promise<PermissionResult>;
```

### PermissionResult

```typescript
type PermissionResult =
  | {
      behavior: 'allow';
      updatedInput?: ToolInput;        // Optional input sanitization
      updatedPermissions?: PermissionUpdate[];
    }
  | {
      behavior: 'deny';
      message: string;                  // Reason for denial
      interrupt?: boolean;              // Stop session?
    };
```

### PermissionUpdate

Modify permissions dynamically during execution.

```typescript
type PermissionUpdate =
  | {
      type: 'addRules' | 'replaceRules' | 'removeRules';
      rules: PermissionRuleValue[];
      behavior: 'allow' | 'deny' | 'ask';
      destination: PermissionUpdateDestination;
    }
  | {
      type: 'setMode';
      mode: PermissionMode;
      destination: PermissionUpdateDestination;
    }
  | {
      type: 'addDirectories' | 'removeDirectories';
      directories: string[];
      destination: PermissionUpdateDestination;
    };
```

---

## MCP Server Configuration Types

### McpServerConfig Union

```typescript
type McpServerConfig =
  | McpStdioServerConfig
  | McpSSEServerConfig
  | McpHttpServerConfig
  | McpSdkServerConfigWithInstance;
```

### Stdio (Subprocess)

```typescript
type McpStdioServerConfig = {
  type?: 'stdio';
  command: string;              // Executable path
  args?: string[];              // Command arguments
  env?: Record<string, string>; // Environment variables
}
```

**Use:** External tools, sandboxed execution

### SSE (Server-Sent Events)

```typescript
type McpSSEServerConfig = {
  type: 'sse';
  url: string;                              // Server endpoint
  headers?: Record<string, string>;         // Auth headers
}
```

**Use:** Remote tools, pub/sub patterns

### HTTP

```typescript
type McpHttpServerConfig = {
  type: 'http';
  url: string;                              // Server endpoint
  headers?: Record<string, string>;         // Auth headers
}
```

**Use:** REST-based tools, cloud integrations

### SDK (In-Process)

```typescript
type McpSdkServerConfigWithInstance = {
  type: 'sdk';
  name: string;                             // Server name
  instance: McpServer;                      // Actual server instance
}
```

**Use:** Custom tools, no subprocess overhead (fastest)

---

## Hook Types

### HookEvent

Available hook events for lifecycle monitoring.

```typescript
type HookEvent =
  | 'PreToolUse'         // Before tool execution
  | 'PostToolUse'        // After tool completes
  | 'Notification'       // User notifications
  | 'UserPromptSubmit'   // User input sent
  | 'SessionStart'       // Session initialized
  | 'SessionEnd'         // Session closed
  | 'Stop'               // Stop button pressed
  | 'SubagentStop'       // Subagent stopped
  | 'PreCompact';        // Before conversation compaction
```

### HookCallback

```typescript
type HookCallback = (
  input: HookInput,                    // Event-specific data
  toolUseID: string | undefined,       // Associated tool
  options: { signal: AbortSignal }     // Cancellation token
) => Promise<HookJSONOutput>;
```

### BaseHookInput

All hooks inherit common fields:

```typescript
type BaseHookInput = {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode?: string;
}
```

### Hook Output

```typescript
type HookJSONOutput = {
  continue?: boolean;             // Continue execution?
  suppressOutput?: boolean;       // Hide output?
  decision?: 'approve' | 'block'; // Approve/block action
  systemMessage?: string;         // Add context to prompt
  reason?: string;                // Explanation
  hookSpecificOutput?: {
    // Hook-specific decisions
  };
};
```

---

## Related

- [Message Types](./MESSAGE_TYPES.md) – SDKMessage definitions
- [Tool Reference](./TOOLS.md) – Tool input/output schemas
- [Main SKILL.md](./SKILL.md) – Quick overview
