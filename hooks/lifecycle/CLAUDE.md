# Lifecycle Hooks

SessionEnd hooks that run background workers after conversations complete.

## Patterns

**Detached background execution**: All hooks spawn `--background` workers using `spawn()` with `detached: true`, `stdio: ['pipe', 'ignore', 'ignore']`, and `child.unref()` to avoid blocking session termination.

**Skip on `reason: 'other'`**: Check `inputData.reason === 'other'` to avoid recursive triggers from SDK `query()` calls within hooks.

**Structured logging**: Use `appendLog()` with format `[EVENT] context | outcome` to `~/.claude/logs/hooks.log`.

**SDK integration**: Import from `~/.claude/claude-cli/sdk.mjs` for autonomous agent execution.

## Hook Responsibilities

- `claude-md-manager.mjs`: Auto-generates/updates CLAUDE.md files for directories with changes
  - **State caching**: Tracks file signatures (`mtime`, `size`) in `claude-md-manager-cache.json` to skip unchanged files
  - **Deduplication**: Uses lock files to prevent duplicate processing across parent/child sessions
  - **Configuration**: Uses gitignore-style exclusion patterns from:
    - Global: `~/.claude/.claude-md-manager-ignore`
    - Local: `.claude-md-manager-ignore` (project root)
  - Patterns support wildcards, one per line, `#` for comments
- `session-history-logger.mjs`: Logs substantive changes to history.md via history-mcp
- `agent-cleanup.mjs`: Terminates tracked agent processes
- `agent-monitor.mjs`: Monitors klaude agent completion via registry polling
  - Checks `.active-pids.json` for agent status changes
  - Notifies on completion/failure
- `history-mcp.mjs`: MCP server providing history entry management tools
- `klaude-handler.js`: Legacy handler (migrate to .mjs pattern)

## Critical Requirements

- **MUST handle `SessionEnd` event**: Check `inputData.hook_event_name === 'SessionEnd'`
- **MUST validate `reason !== 'other'`**: Prevents infinite loops from internal SDK calls
- **ALWAYS use background workers**: Never block the main process
- **State management**: Use dedicated JSON files in `.claude/` or project root
- **Error tolerance**: Wrap I/O in try/catch, gracefully handle missing files/git failures
