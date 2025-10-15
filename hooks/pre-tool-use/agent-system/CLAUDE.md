# Agent System Architecture

This directory implements the **agent spawning and orchestration system** for Claude Code. It intercepts Task tool calls, loads agent definitions, manages lifecycles, and delegates execution to either Claude SDK or Cursor CLI.

## Critical Patterns

### Agent Definition Loading
- **Files checked in order**: `~/.claude/agents/{type}.md` → `~/.claude/agents-library/{type}.md`
- **Frontmatter parsing**: Extract `model`, `allowedAgents`, `allowedMcpServers` from YAML block
- **Caching**: All definitions cached in memory; use `clearAgentCache()` to invalidate

### Process Spawning
- **Claude agents**: Use SDK via `agent-script.mjs` → `claude-runner.js`
- **Non-Anthropic models**: Use Cursor CLI via `cursor-runner.js`
- **Runner pattern**: Wrapper scripts handle process lifecycle, registry updates, log streaming
- All spawned processes are **detached** with `stdio: 'ignore'` for async execution

### Agent Output Streaming
- **Incremental streaming**: `agent-script.mjs` uses delta tracking via `blockStates` Map
- **Deduplication**: Compare full text across blocks to avoid duplicate output
- **Frontmatter updates**: Status changed from `in-progress` → `done`/`failed` on completion

### Environment Variables
Agent context passed via env vars (see `spawn-helpers.js`):
- `CLAUDE_AGENT_ID`, `CLAUDE_AGENT_DEPTH` - Identity and recursion tracking
- `AGENT_PROMPT`, `AGENT_CWD`, `AGENT_OUTPUT_STYLE` - Execution context
- `AGENT_ALLOWED_AGENTS`, `AGENT_MCP_SERVERS` - Permissions (JSON-encoded)

### Registry Management
- **File**: `agent-responses/.active-pids.json`
- **Structure**: `{ [agentId]: { pid, agentId, depth, parentAgentId } }`
- Enables process tracking, cleanup, and hierarchy inspection

## Module Responsibilities

- `agent-loader.js` - Definition parsing, caching, metadata extraction
- `agent-file-resolver.js` - File path resolution with fallback logic
- `frontmatter-parser.js` - YAML parsing and list normalization
- `spawn-helpers.js` - Environment setup, log initialization, process spawning
- `mcp-manager.js` - MCP server resolution and configuration merging
- `registry-manager.js` - Active agent tracking and persistence
- `agent-script.mjs` - Claude SDK execution with streaming and hooks
- `claude-runner.js`, `cursor-runner.js` - Process wrappers for detached execution

## Type Safety Notes
- **Never use `any`** - Import types from SDK: `import type { ... } from '@anthropic-ai/sdk'`
- `allowedAgents`, `allowedMcpServers` can be `null` (unrestricted) or `string[]` (whitelist)
- Registry entries typed as `{ pid: number, agentId: string, depth: number, parentAgentId: string | null }`
