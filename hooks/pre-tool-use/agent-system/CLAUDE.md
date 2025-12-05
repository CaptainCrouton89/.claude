# Agent System Architecture

This directory implements the **agent spawning and orchestration system** for Claude Code. It intercepts Task tool calls, loads agent definitions, manages lifecycles, and delegates execution to either Claude SDK or Cursor CLI.

## Critical Patterns

### Agent Definition Loading
- **Files checked in order**: `~/.claude/agents/{type}.md` → `~/.claude/agents-library/{type}.md`
- **Frontmatter parsing**: Extract `model`, `allowedAgents`, `allowedMcpServers` from YAML block
- **Caching**: All definitions cached in memory; use `clearAgentCache()` to invalidate

### Model Specification & Thinking Budget
- Agent definitions specify model in frontmatter (e.g., `model: sonnet`)
- **Haiku normalization**: Old "haiku" mapped to `claude-haiku-4-5-20251001` in `spawn-helpers.cjs:130-132`
- **Thinking budget**: Optional `thinkingBudget` passed via `AGENT_THINKING_BUDGET` env var → `maxThinkingTokens` in query options
- Model propagated through env vars: `CLAUDE_RUNNER_MODEL` → `AGENT_MODEL` → query options
- Validation: Both `spawn-helpers.cjs` and `claude-runner.cjs` throw if model missing

### Process Spawning
- **Claude agents**: Use SDK via `agent-script.mjs` → `claude-runner.cjs`
- **Non-Anthropic models**: Use Cursor CLI via `cursor-runner.cjs`
- **Runner pattern**: Wrapper scripts handle process lifecycle, registry updates, log streaming
- All spawned processes are **detached** with `stdio: 'ignore'` for async execution

### Session Tracking & Transcript Tailing
- **Session capture**: On first message, `captureSessionInfo()` stores session ID and resolves transcript path
- **Transcript resolution**: Attempts `~/.claude/projects/{sanitized_cwd}/session_{id}.jsonl` → `{id}.jsonl` → legacy paths
- **Transcript tailing**: `tailTranscript()` polls for transcript file growth, processes JSONL records, extracts user/assistant messages
- **Session markers**: Parent session ID stored for hierarchy tracking via `.session-markers/{pid}.json`
- **Registry session fields**: `sessionId`, `transcriptPath`, `parentSessionId`, `parentPid` updated during execution

### Agent Output & Status Tracking
- **Direct output**: SDK/Cursor agents output directly to terminal (non-blocking)
- **Registry status tracking**: `updateAgentStatus()` updates `.active-pids.json` with completion status
- **Status lifecycle**: Registry status transitions `in-progress` → `done`/`failed` on completion
- **Text delta handling**: Incremental text appended via `appendDeltaText()`; full text via `appendFullText()` with duplicate detection
- Parent agents poll registry to check child agent progress

### Environment Variables
Agent context passed via env vars (see `spawn-helpers.cjs`):
- `CLAUDE_AGENT_ID`, `CLAUDE_AGENT_DEPTH` - Identity and recursion tracking
- `CLAUDE_PARENT_PID` - Parent process ID for session marker discovery
- `AGENT_PROMPT`, `AGENT_CWD`, `AGENT_OUTPUT_STYLE` - Execution context
- `AGENT_MODEL`, `CLAUDE_RUNNER_MODEL` - Model specification (required, validated)
- `AGENT_THINKING_BUDGET` - Optional thinking token budget (numeric string)
- `AGENT_ALLOWED_AGENTS`, `AGENT_MCP_SERVERS` - Permissions (JSON-encoded)
- `CLAUDE_RUNNER_REGISTRY_PATH` - Registry file path for status updates

### Registry Management
- **File**: `.active-pids.json` (project root)
- **Structure**: `{ [agentId]: { pid, depth, parentId, agentType, status, sessionId, transcriptPath, parentSessionId, parentPid, spawnedBySessionId, ... } }`
- **Status field**: Tracks agent completion (`in-progress`, `done`, `failed`, `interrupted`)
- **Session fields**: Enable parent-child session correlation and transcript tailing
- Enables process tracking, cleanup, parent polling, hierarchy inspection

## Module Responsibilities

- `agent-loader.cjs` - Definition parsing, caching, metadata extraction
- `agent-file-resolver.cjs` - File path resolution with fallback logic
- `frontmatter-parser.cjs` - YAML parsing and list normalization
- `spawn-helpers.cjs` - Environment setup, model validation, log initialization, process spawning
- `mcp-manager.cjs` - MCP server resolution and configuration merging
- `registry-manager.cjs` - Registry I/O, entry creation, PID/status/session tracking
- `agent-script.mjs` - SDK execution, transcript tailing, session capture, text streaming, status updates
- `claude-runner.cjs`, `cursor-runner.cjs` - Process wrappers for detached execution

## Type Safety Notes
- **Never use `any`** - Import types from SDK: `import type { ... } from '@anthropic-ai/sdk'`
- `allowedAgents`, `allowedMcpServers` can be `null` (unrestricted) or `string[]` (whitelist)
- Registry entries: `{ pid, depth, parentId, agentType, status, sessionId, transcriptPath, ... }`
- Model must be provided and is validated at spawn time
