# ~/.claude Architecture Overview

## Purpose
Comprehensive Claude Code development environment with specialized agents, hooks, commands, and state tracking for advanced multi-session workflows, debugging, and project orchestration.

---

## Directory Structure

### Core Configuration (Root Level)
```
~/.claude/
├── settings.json              # Main configuration (permissions, hooks, statusline)
├── CLAUDE.md                  # Code quality standards
├── ARCHITECTURE-OVERVIEW.md   # This document
├── new-system-prompt-exact.md # Custom system prompt variant
└── CLAUDE.md (in /hooks)      # Hook system documentation
```

### Major Subdirectories

#### 1. **hooks/** (27MB) — Lifecycle & State Management System
The central nervous system for Claude Code automation. Runs on session start/end, after tool usage, and user prompts.

**Structure:**
```
hooks/
├── lifecycle/                 # Session lifecycle management
│   ├── claude-md-manager.mjs   # Auto-generates CLAUDE.md for modified directories
│   ├── klaude-handler.js       # Legacy handler for klaude integration
│   ├── agent-cleanup.mjs       # Terminates tracked agent processes
│   ├── agent-monitor.mjs       # Monitors klaude agent completion
│   ├── session-history-logger.mjs # Logs changes to history.md
│   └── history-mcp.mjs         # MCP server for history management
├── state-tracking/            # Activity categorization & protocol injection
│   ├── activity-tracker.js     # Analyzes conversation history, injects protocols
│   ├── benchmark/              # Model comparison & performance testing
│   └── node_modules/           # Benchmarking dependencies (ai, openai SDK)
├── pre-tool-use/              # Runs before tools execute
│   ├── npm-to-pnpm-warning.py  # Warns on npm usage
│   └── agent-system/           # Subagent spawning & management
│       ├── agent-loader.js
│       ├── agent-file-resolver.js
│       ├── spawn-helpers.js
│       ├── mcp-manager.js
│       ├── registry-manager.js
│       └── frontmatter-parser.js
├── post-tool-use/             # Runs after tools complete
│   ├── code-quality-checker.py # Validates code standards
│   ├── typescript-error-fixer.py # Auto-fixes TS errors
│   └── parallel.py             # Parallel execution helper
├── user-prompt-submit/        # Runs on user message submission
│   ├── git-hook.py             # Git operations
│   ├── activity-observer.js    # Activity tracking
│   └── auto-copy-skills.mjs    # Auto-copies skills on init
├── notifications/             # Session end notifications
│   ├── play-sound.sh           # Audio notification
│   └── pushover-notification.py # Pushover service integration
└── statusline/
    └── statusline-wrapper.sh   # Status line display configuration
```

**Key Patterns:**
- `SessionStart`, `SessionEnd`, `PreToolUse`, `PostToolUse`, `Stop`, `Notification` hooks
- All background workers use `spawn()` with `detached: true`, `stdio: ['pipe', 'ignore', 'ignore']`
- Skip on `reason: 'other'` to prevent recursive triggers
- Structured logging to `~/.claude/logs/hooks.log`

#### 2. **commands/** (88KB) — Slash Command Definitions
Custom `/` commands exposed in Claude Code interface. Single `.md` files with frontmatter.

**Commands:**
```
commands/
├── collaborate.md         # Collaboration workflow
├── debug.md              # Debug issue systematically (delegates to agents)
├── fix-build.md          # Build failure fixes
├── git.md                # Git operations
├── learn.md              # Learn codebase structure
├── interview.md          # Interview/Q&A with codebase
├── investigate-fix.md    # Investigation + fix workflow
├── init-workspace.md     # Initialize new workspace
├── init-better.md        # Improved initialization
├── start.md              # Start new session
├── workflow.md           # Workflow templates
├── new-command.md        # Create new command
├── orchestration-mode.md # Multi-agent orchestration
├── init/
│   └── web/
│       └── design.md     # Web design initialization
└── plan/
    └── requirements.md   # Requirement planning
```

**Usage:** `/debug your issue` → loads debug.md with argument substitution

#### 3. **agents/** (15 markdown files) — Specialized Agent Definitions
Pre-configured agent personalities for delegating work via subagent system.

**Agents:**
```
agents/
├── Explore.md             # Context discovery specialist (YOURS - search engine)
├── Plan.md                # Planning & architecture specialist
├── general-purpose.md     # Default fallback agent
├── programmer.md          # Full-stack programmer
├── senior-programmer.md   # Senior-level code review
├── senior-architect.md    # Architecture decisions
├── junior-engineer.md     # Guided learning / junior work
├── frontend-engineer.md   # Frontend specialization
├── non-dev.md             # Non-developer tasks
├── advisor.md             # Strategic advising
├── library-docs-writer.md # Documentation specialist
└── statusline-setup.md    # Status line configuration
```

**Frontmatter:**
```yaml
---
name: AgentName
description: What this agent does
allowedAgents: [list of agents it can delegate to]
model: haiku|sonnet|opus
inheritProjectMcps: true/false
inheritParentMcps: true/false
color: terminal color
---
```

#### 4. **agents-library/** (880KB) — Reusable Agent Templates
Pre-built agent implementations for common tasks.

**Contents:**
```
agents-library/
├── db-modifier.md        # Database schema modifications
├── documentor.md         # Documentation generation
├── orchestrator.md       # Multi-agent orchestration
├── product-designer.md   # Product design workflows
├── research-specialist.md # Research & analysis
└── video/                # Video-related agents
```

#### 5. **docs/** (348KB) — Project Documentation Templates
Structured documentation from `init-project` workflow. Defines PRD, specs, architecture, data models.

**Structure:**
```
docs/
├── CLAUDE.md                      # Doc directory conventions
├── product-requirements.md        # PRD with features (F-##)
├── system-design.md              # Architecture & components
├── design-spec.md                # UI/UX screens
├── api-contracts.yaml            # OpenAPI definitions
├── data-plan.md                  # Metrics & tracking
├── feature-spec/                 # Feature specs (F-##-*.md)
├── user-stories/                 # User stories (US-###-*.md)
├── user-flows/                   # Primary user flows
├── guides/                        # Process docs & runbooks
├── architecture/                 # Architecture decisions
└── external/                     # External docs & references
```

**ID System:**
- Features: `F-01`, `F-02`, ... (PRD only)
- Stories: `US-101`, `US-102`, ... (linked to features)
- Files: kebab-case from titles (e.g., `user-authentication.md`)

#### 6. **projects/** (639MB) — Session Project Cache
Stores project state, git history, and tool outputs for each project worked on.

**Structure:**
```
projects/
├── -Users-silasrhyneer-Code-claude-tools-klaude/  # Main project
├── -Users-silasrhyneer-Code-Cosmo-Saturn/         # Other projects
└── [path-encoded project directories]/
    ├── .claude/                   # Project-specific state
    ├── state/                     # Session state
    ├── todos/                     # Todo tracking
    ├── debug/                     # Debug logs
    └── file-history/              # File change history
```

#### 7. **conversation-state/** (3.2MB) — Session State Management
JSON files tracking conversation context per session.

```
conversation-state/
└── {session_id}.json     # Protocol name, effort level, timestamp tracking
```

#### 8. **file-history/** (111MB) — File Change Tracking
Persistent history of all file modifications across sessions.

#### 9. **file-templates/** — File Generation Templates
Templates for initializing new files, configurations, etc.

#### 10. **debug/** (274MB) — Debug Logs
Detailed execution logs for troubleshooting.

#### 11. **shell-snapshots/** (274MB) — Bash Execution Snapshots
Snapshots of shell state and outputs.

#### 12. **todos/** (63MB) — Todo History
Historical todo lists and task tracking across sessions.

#### 13. **logs/** — Hook Execution Logs
```
logs/
├── hooks.log     # All hook execution events
└── [other logs]
```

#### 14. **state/** — Runtime State
Session-specific state files and caches.

#### 15. **skills/** — Custom Skills
Reusable skills/extensions (smaller than agents-library).

#### 16. **config/** — Configuration Files
Local configuration overrides.

---

## Hook System (Detailed)

### Event Lifecycle

**1. SessionStart**
- Triggered on session initialization
- Runs: `klaude hook session-start`
- Handles: Project context loading, history initialization

**2. UserPromptSubmit**
- Runs on every user message
- Multi-stage pipeline:
  ```
  git-hook.py              → Git status tracking
  activity-observer.js     → Categorizes activity & effort
  auto-copy-skills.mjs     → Copies skills on init
  klaude-handler.js        → Legacy handler
  → Returns: Protocol context injection
  ```
- State stored in: `~/.claude/conversation-state/{session_id}.json`

**3. PreToolUse**
- Runs before each tool invocation
- Matchers:
  - `Bash` → npm-to-pnpm-warning.py (warns on npm)
  - `Task` → klaude hook task (agent spawning)

**4. PostToolUse**
- Runs after tool completion
- Matchers:
  - `Write|Edit|MultiEdit` → code-quality-checker.py + parallel.py
  - `TodoWrite` → todo-stats.py
  - `*` (all) → klaude-handler.js, post-tool-use-updates hook

**5. Stop**
- Runs on session end
- Sequence:
  1. play-sound.sh (notification)
  2. typescript-error-fixer.py (auto-fixes)
  3. pushover-notification.py (sends alert)
  4. klaude-handler.js
- Triggers: `SessionEnd` hook

**6. SessionEnd**
- Final cleanup
- Runs:
  ```
  claude-md-manager.mjs         → Updates CLAUDE.md files
  session-history-logger.mjs    → Logs to history.md
  agent-cleanup.mjs             → Terminates agents
  agent-monitor.mjs             → Checks agent status
  klaude hook session-end       → Legacy handler
  ```

### State Tracking System

**Activity Categorization** (via activity-tracker.js):
- 10 categories: debugging, feature, investigating, code-review, planning, security-auditing, requirements-gathering, documenting, testing, other
- Effort scoring: 1-10 scale (1-2 trivial, 9-10 major)
- **Threshold injection**: Protocol context injected when confidence ≥ 0.8 and effort meets category threshold

**Protocol Levels:**
- `moderate.md`: For planning, investigating, feature, testing (effort threshold to threshold+2)
- `strong.md`: For all other qualifying activities (effort > threshold+2)

---

## Configuration Files

### settings.json Structure
```json
{
  "cleanupPeriodDays": 30,
  "includeCoAuthoredBy": false,
  "permissions": {
    "allow": [
      "Edit(*)",
      "Write(**)",
      "Read(**)",
      "Bash(git:*)",
      "Task(**)",
      "WebFetch(domain:*)",
      "mcp__*",
      ...
    ]
  },
  "hooks": {
    "PreToolUse": [...],
    "UserPromptSubmit": [...],
    "PostToolUse": [...],
    "Stop": [...],
    "SessionStart": [...],
    "SessionEnd": [...]
  },
  "statusLine": {
    "type": "command",
    "command": "~/.claude/hooks/statusline/statusline-wrapper.sh"
  },
  "alwaysThinkingEnabled": false
}
```

### Permissions Model
- Whitelisted capabilities (not blacklisted)
- Supports: Tool names, bash commands, MCP functions
- Wildcard patterns: `Tool(*)`, `Tool(**)`
- Domain filtering: `WebFetch(domain:*)`

---

## Key System Patterns

### 1. Auto-Generated Documentation
`claude-md-manager.mjs` generates CLAUDE.md for directories with changes:
- **State caching**: `claude-md-manager-cache.json` tracks file signatures
- **Deduplication**: Lock files prevent duplicate processing
- **Exclusion patterns**: `.claude-md-manager-ignore` (gitignore-style)

### 2. Subagent System (Pre-Tool-Use Hooks)
Agent spawning via `agent-system/`:
- **Registry manager**: Tracks active agents in `.active-pids.json`
- **File resolver**: Maps agent names to markdown definitions
- **Frontmatter parser**: Extracts agent configuration
- **MCP manager**: Sets up model context protocol connections
- **Runners**: `claude-runner.js`, `cursor-runner.js` for different IDEs

### 3. Activity Recognition
`activity-tracker.js` uses GPT-4 mini to categorize developer activity:
- **Input**: Recent conversation history + user prompt
- **Output**: Activity type + effort score + protocol injection
- **State persistence**: Cached in `conversation-state/{session_id}.json`

### 4. Code Quality Enforcement
`code-quality-checker.py`:
- Validates TypeScript (no `any` type)
- Checks error handling patterns
- Validates file organization

### 5. History Tracking
`session-history-logger.mjs`:
- MCP-based history management
- Logs substantive changes to `history.md`
- Tracks conversation turns and outcomes

---

## Data Storage

### Conversation State (~/.claude/conversation-state/)
```json
{
  "session_id": "uuid",
  "protocol_name": "moderate.md | strong.md | null",
  "effort_level": 1-10,
  "timestamp": "ISO8601"
}
```

### Project Cache (~/.claude/projects/{project-path}/)
- Mirrors local project structure
- Stores: git state, session todos, debug logs, file history
- **Cleanup**: 30-day retention (configurable in settings.json)

### History (~/.claude/history.jsonl)
Line-delimited JSON with all conversation entries and outcomes.

---

## Typical Workflow

1. **Session Start** → SessionStart hook runs → klaude session-start loads project context
2. **User Message** → UserPromptSubmit hooks run:
   - Git status tracked
   - Activity categorized (determines protocol)
   - Protocol context injected into conversation
3. **Tool Usage** → PreToolUse hooks validate, PostToolUse hooks check quality
4. **Session End** → Stop hook notifies, SessionEnd hook:
   - Updates CLAUDE.md files
   - Logs history
   - Cleans up agents
   - Pushes notifications

---

## Integration Points

### MCP (Model Context Protocol)
- `history-mcp.mjs`: Manages history entries
- Supports context-aware LLM interactions
- Integrates with activity-tracker for protocol selection

### External Services
- **Pushover**: Push notifications on session end (`pushover-notification.py`)
- **Klaude CLI**: Legacy integration via `klaude hook` commands

### IDE Integration
- Claude Code (primary)
- Cursor support via `cursor-runner.js`

---

## Performance & Cleanup

- **Cleanup period**: 30 days (configurable)
- **Cache invalidation**: File signature tracking (mtime + size)
- **Deduplication**: Lock files prevent duplicate hook execution
- **Background workers**: All async hooks use `detached: true` to prevent blocking

---

## Security & Validation

### Permissions
- Whitelist-based (settings.json "allow" list)
- Bash command restrictions (git, npm, python, node only by default)
- MCP function restrictions

### Error Handling
- Hooks wrapped in try/catch
- Graceful fallback on missing files/git failures
- Hook timeout configurations per command

### Code Quality
- TypeScript validation (no `any` type)
- Error handling pattern checks
- Follows codebase conventions from CLAUDE.md

---

## Codebase Size Summary

| Directory | Size | Purpose |
|-----------|------|---------|
| projects/ | 639MB | Session project cache |
| shell-snapshots/ | 274MB | Bash execution snapshots |
| debug/ | 274MB | Debug logs |
| file-history/ | 111MB | File change tracking |
| todos/ | 63MB | Todo history |
| hooks/ | 27MB | Lifecycle automation |
| other/ | ~13MB | Config, docs, commands, agents |

**Total: ~1.4GB** (active development environment with full history)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| settings.json | Hook configuration, permissions |
| CLAUDE.md | Code quality standards |
| commands/*.md | Slash commands |
| agents/*.md | Agent definitions |
| docs/CLAUDE.md | Documentation standards |
| hooks/lifecycle/*.mjs | Session lifecycle |
| hooks/state-tracking/activity-tracker.js | Activity categorization |
| hooks/pre-tool-use/agent-system/ | Agent spawning |

---

## Summary

This is a **sophisticated, multi-layered development environment** designed for:
- **Advanced project management** (todos, state tracking, file history)
- **Intelligent activity recognition** (protocols injected based on dev activity)
- **Subagent orchestration** (spawning specialized agents for complex tasks)
- **Automated quality enforcement** (code checks, TS validation, git tracking)
- **Session persistence** (conversation state, project caching, history)
- **DevOps integration** (Pushover notifications, git hooks, shell snapshots)

The system is **highly modular** and extensible through hooks, commands, and agent definitions.
