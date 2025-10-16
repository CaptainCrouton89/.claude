# Message Types Reference

Complete documentation of all `SDKMessage` types returned by the `query()` generator.

## SDKMessage Union

```typescript
type SDKMessage =
  | SDKSystemMessage
  | SDKUserMessage
  | SDKUserMessageReplay
  | SDKAssistantMessage
  | SDKPartialAssistantMessage
  | SDKResultMessage
  | SDKCompactBoundaryMessage;
```

---

## System Messages

### `SDKSystemMessage`

Emitted once at session initialization with environment and capabilities info.

```typescript
type SDKSystemMessage = {
  type: 'system';
  subtype: 'init';
  uuid: UUID;
  session_id: string;
  apiKeySource: 'user' | 'project' | 'org' | 'temporary';
  cwd: string;
  tools: string[];  // Available tool names
  mcp_servers: {
    name: string;
    status: string;  // 'ready', 'error', etc.
  }[];
  model: string;
  permissionMode: PermissionMode;
  slash_commands: string[];
  output_style: string;
}
```

**When:** Session starts or resumes
**Use:** Verify available tools and confirm session state

### `SDKCompactBoundaryMessage`

Emitted when conversation is compacted to save tokens (manual or automatic).

```typescript
type SDKCompactBoundaryMessage = {
  type: 'system';
  subtype: 'compact_boundary';
  uuid: UUID;
  session_id: string;
  compact_metadata: {
    trigger: 'manual' | 'auto';
    pre_tokens: number;
  };
}
```

---

## User Messages

### `SDKUserMessage`

User input sent to Claude (may lack UUID in initial send).

```typescript
type SDKUserMessage = {
  type: 'user';
  uuid?: UUID;
  session_id: string;
  message: APIUserMessage;  // From @anthropic-ai/sdk
  parent_tool_use_id: string | null;
}
```

### `SDKUserMessageReplay`

User message replayed with guaranteed UUID (for session history).

```typescript
type SDKUserMessageReplay = {
  type: 'user';
  uuid: UUID;  // Always present
  session_id: string;
  message: APIUserMessage;
  parent_tool_use_id: string | null;
}
```

**Note:** Use `uuid` for reliable session tracking across messages.

---

## Assistant Messages

### `SDKAssistantMessage`

Full assistant response with generated content or tool calls.

```typescript
type SDKAssistantMessage = {
  type: 'assistant';
  uuid: UUID;
  session_id: string;
  message: APIAssistantMessage;  // Contains: id, role, content[]
  parent_tool_use_id: string | null;
}
```

**Content blocks in `message.content`:**
- `{ type: 'text'; text: string }` – Generated text
- `{ type: 'tool_use'; id: string; name: string; input: object }` – Tool invocation
- `{ type: 'thinking'; thinking: string }` – Extended thinking output (if enabled)

### `SDKPartialAssistantMessage`

Streaming partial updates (only when `includePartialMessages: true`).

```typescript
type SDKPartialAssistantMessage = {
  type: 'stream_event';
  event: RawMessageStreamEvent;  // From @anthropic-ai/sdk
  parent_tool_use_id: string | null;
  uuid: UUID;
  session_id: string;
}
```

**Stream event types:**
- `content_block_start` – New content block starting
- `content_block_delta` – Partial content update
- `content_block_stop` – Content block complete
- `message_start`, `message_delta`, `message_stop` – Message lifecycle

---

## Result Messages

### `SDKResultMessage`

Final result when query completes or errors.

**Success case:**
```typescript
type SDKResultMessage = {
  type: 'result';
  subtype: 'success';
  uuid: UUID;
  session_id: string;
  duration_ms: number;
  duration_api_ms: number;
  is_error: false;
  num_turns: number;
  result: string;  // Summary of work done
  total_cost_usd: number;
  usage: NonNullableUsage;
  permission_denials: SDKPermissionDenial[];
}
```

**Error cases:**
```typescript
type SDKResultMessage = {
  type: 'result';
  subtype: 'error_max_turns' | 'error_during_execution';
  uuid: UUID;
  session_id: string;
  duration_ms: number;
  duration_api_ms: number;
  is_error: true;
  num_turns: number;
  total_cost_usd: number;
  usage: NonNullableUsage;
  permission_denials: SDKPermissionDenial[];
}
```

**Usage tracking:**
```typescript
type NonNullableUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
}
```

**Permission denials:**
```typescript
type SDKPermissionDenial = {
  tool_name: string;
  tool_use_id: string;
  tool_input: ToolInput;
}
```

---

## Processing Patterns

### Collect Results

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const result = query({ prompt: "Your task" });

let usage = { input: 0, output: 0 };
let cost = 0;

for await (const message of result) {
  if (message.type === 'result') {
    usage = message.usage;
    cost = message.total_cost_usd;
    console.log(`Completed in ${message.duration_ms}ms, cost: $${cost}`);
  }
}
```

### Monitor Tool Calls

```typescript
for await (const message of result) {
  if (message.type === 'assistant') {
    for (const block of message.message.content) {
      if (block.type === 'tool_use') {
        console.log(`Tool: ${block.name}, Input: ${JSON.stringify(block.input)}`);
      }
    }
  }
}
```

### Stream Partial Output

```typescript
const result = query({
  prompt: "Generate output",
  options: { includePartialMessages: true }
});

for await (const message of result) {
  if (message.type === 'stream_event') {
    if (message.event.type === 'content_block_delta') {
      process.stdout.write(message.event.delta.text);
    }
  }
}
```

---

## Related

- [Types Reference](./TYPES.md) – Options, AgentDefinition, PermissionMode
- [Tool Reference](./TOOLS.md) – ToolInput and ToolOutput schemas
- [Main SKILL.md](./SKILL.md) – Quick overview
