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
- `agent-monitor.mjs`: Monitors agent file status and lifecycle via polling
  - **State tracking**: Maintains `.monitor-state.json` with file metadata (`mtime`, `status`, `size`, `notified`, `lastUpdateLine`) to deduplicate notifications
  - **Session filtering**: Notifies parent agent only if spawned by current session or current agent's parent session (via `spawnedBySessionId` registry check to prevent cross-session noise)
  - **Interruption detection**: Marks `in-progress` agents as interrupted when:
    - Process PID dies (registry check fails) AND interruption reason fires (`user_interrupt`, `prompt_input_exit`, `cancelled`, `user_cancel`) OR `SubagentStop` event
    - Updates registry status to interrupt parent agent polling
  - **Update extraction**: Scans `[UPDATE]` markers in agent response files, tracks `lastUpdateLine` to avoid duplicate notifications
  - **Event routing**: PostToolUse events return `hookSpecificOutput` (context-aware), other events use `systemMessage` (user-visible)
  - Integrates with registry (`.active-pids.json`) to notify parent agents of completion/failure/interruption
- `history-mcp.mjs`: MCP server providing history entry management tools
- `klaude-handler.js`: Legacy handler (migrate to .mjs pattern)

## Critical Requirements

- **MUST handle `SessionEnd` event**: Check `inputData.hook_event_name === 'SessionEnd'`
- **MUST validate `reason !== 'other'`**: Prevents infinite loops from internal SDK calls
- **ALWAYS use background workers**: Never block the main process
- **State management**: Use dedicated JSON files in `.claude/` or project root
- **Error tolerance**: Wrap I/O in try/catch, gracefully handle missing files/git failures
