# ~/.claude Quick Reference Guide

## Directory Structure at a Glance

```
~/.claude/
│
├── 🔧 CONFIGURATION
│   ├── settings.json              # Hook config, permissions, statusline
│   ├── CLAUDE.md                  # Code quality standards
│   └── config/                    # Local overrides
│
├── 🤖 AGENT SYSTEM
│   ├── agents/                    # Specialized agent definitions (15 types)
│   │   ├── Explore.md             # YOUR agent - context discovery
│   │   ├── Plan.md
│   │   ├── senior-architect.md
│   │   └── programmer.md
│   │
│   └── agents-library/            # Reusable agent templates
│       ├── orchestrator.md
│       ├── documentor.md
│       ├── db-modifier.md
│       └── research-specialist.md
│
├── 🎯 COMMANDS (Slash Commands)
│   └── commands/                  # /debug, /learn, /interview, /workflow
│       ├── debug.md               # Systematic debugging
│       ├── interview.md           # Q&A with codebase
│       ├── workflow.md
│       ├── learn.md
│       └── collaborate.md
│
├── 🔗 HOOKS (Automation Layer)
│   └── hooks/                     # Session & state lifecycle (27MB)
│       ├── lifecycle/             # Session start/end automation
│       │   ├── claude-md-manager.mjs      # Auto-generates CLAUDE.md
│       │   ├── session-history-logger.mjs # Logs to history.md
│       │   ├── agent-cleanup.mjs          # Terminates agents
│       │   └── klaude-handler.js          # Klaude CLI integration
│       │
│       ├── state-tracking/        # Activity recognition & protocol injection
│       │   └── activity-tracker.js # Analyzes activity → injects protocol
│       │
│       ├── pre-tool-use/          # Runs before tool invocation
│       │   ├── npm-to-pnpm-warning.py
│       │   └── agent-system/      # Subagent spawning
│       │       ├── agent-loader.js
│       │       ├── agent-file-resolver.js
│       │       ├── spawn-helpers.js
│       │       └── mcp-manager.js
│       │
│       ├── post-tool-use/         # Runs after tool execution
│       │   ├── code-quality-checker.py
│       │   ├── typescript-error-fixer.py
│       │   └── parallel.py
│       │
│       ├── user-prompt-submit/    # Runs on user message
│       │   ├── git-hook.py
│       │   ├── activity-observer.js
│       │   └── auto-copy-skills.mjs
│       │
│       ├── notifications/         # Session-end notifications
│       │   ├── play-sound.sh
│       │   └── pushover-notification.py
│       │
│       └── statusline/            # Status line configuration
│
├── 📚 DOCUMENTATION
│   └── docs/                      # Project documentation structure
│       ├── product-requirements.md  # PRD with features (F-##)
│       ├── system-design.md         # Architecture
│       ├── api-contracts.yaml       # OpenAPI definitions
│       ├── data-plan.md             # Metrics/events
│       ├── feature-spec/            # Feature specs (F-##-*.md)
│       ├── user-stories/            # User stories (US-###-*.md)
│       ├── user-flows/              # Primary user flows
│       └── guides/                  # Process docs & runbooks
│
├── 💾 STATE & HISTORY (Large Cache)
│   ├── projects/                  # Session project cache (639MB)
│   ├── conversation-state/        # Per-session context (3.2MB)
│   ├── file-history/              # File change tracking (111MB)
│   ├── shell-snapshots/           # Bash execution snapshots (274MB)
│   ├── debug/                     # Debug logs (274MB)
│   ├── todos/                     # Todo history (63MB)
│   ├── history.jsonl              # Full conversation history (2.8MB)
│   └── logs/                      # Hook execution logs
│
├── 🔨 OTHER
│   ├── file-templates/            # File generation templates
│   ├── skills/                    # Custom reusable skills
│   ├── examples/                  # Example configurations
│   └── .git/                      # Version control
```

---

## Hook Execution Flow

### Timeline Within a Session

```
┌─ SessionStart ─────────────────────────────────────┐
│  • Load project context                            │
│  • Initialize history                              │
└─────────────────────────────────────────────────────┘
                          ↓
┌─ User Message #1 ──────────────────────────────────┐
│  UserPromptSubmit Hooks:                           │
│  1. git-hook.py (track git status)                │
│  2. activity-observer.js (categorize activity)    │
│  3. auto-copy-skills.mjs (copy skills if init)    │
│  4. klaude-handler.js (legacy)                    │
│  → OUTPUT: Protocol context injected              │
└─────────────────────────────────────────────────────┘
                          ↓
┌─ Tool Invocation #1 ────────────────────────────────┐
│  PreToolUse Hooks:                                 │
│  • npm-to-pnpm-warning.py (validate Bash)          │
│  • Agent spawning (if Task tool)                   │
│                                                    │
│  → Tool executes                                   │
│                                                    │
│  PostToolUse Hooks:                                │
│  • code-quality-checker.py (validate code)         │
│  • typescript-error-fixer.py (auto-fix TS)         │
│  • parallel.py (parallel execution)                │
│  • klaude-handler.js (lifecycle)                   │
└─────────────────────────────────────────────────────┘
                          ↓
                  [User Message #2... N]
                          ↓
┌─ Session End ──────────────────────────────────────┐
│  Stop Hooks:                                       │
│  1. play-sound.sh (notification)                   │
│  2. typescript-error-fixer.py (final TS fixes)     │
│  3. pushover-notification.py (alert)               │
│                                                    │
│  SessionEnd Hooks:                                 │
│  1. claude-md-manager.mjs (update CLAUDE.md)       │
│  2. session-history-logger.mjs (log history)       │
│  3. agent-cleanup.mjs (terminate agents)           │
│  4. agent-monitor.mjs (check agent status)         │
│  5. klaude hook session-end                        │
└─────────────────────────────────────────────────────┘
```

---

## Activity Recognition & Protocol Injection

```
User Message
     ↓
activity-tracker.js (GPT-4 mini analyzes)
     ↓
┌─ Categorizes Activity ─────────────────────────────┐
│ Categories (10 types):                             │
│ • debugging       (effort threshold: 3)            │
│ • feature         (effort threshold: 7)            │
│ • investigating   (effort threshold: 6)            │
│ • planning        (effort threshold: 5)            │
│ • code-review     (effort threshold: 3)            │
│ • testing         (effort threshold: 7)            │
│ • ... 4 more categories                            │
└────────────────────────────────────────────────────┘
     ↓
┌─ Scores Effort (1-10 Scale) ───────────────────────┐
│ 1-2: Trivial (<10min)                              │
│ 3-4: Simple (10-30min)                             │
│ 5-6: Moderate (30-90min)                           │
│ 7-8: Complex (2-4hrs)                              │
│ 9-10: Major (hours to days)                        │
└────────────────────────────────────────────────────┘
     ↓
┌─ Injects Protocol (if confidence ≥ 0.8) ──────────┐
│ moderate.md → For planning/investigating/feature   │
│              (when effort = threshold to threshold+2)
│                                                    │
│ strong.md → For all other activities               │
│             (when effort > threshold+2)            │
│                                                    │
│ State cached in: ~/.claude/conversation-state/    │
│                  {session_id}.json                 │
└────────────────────────────────────────────────────┘
```

---

## Code Quality Enforcement Pipeline

```
File Edit/Write
     ↓
PostToolUse: code-quality-checker.py
     ↓
┌─────────────────────────────────────────────┐
│ TypeScript:                                  │
│  ✓ No 'any' types                            │
│  ✓ Proper error handling                     │
│  ✓ Consistent naming (camelCase, PascalCase)│
│                                              │
│ JavaScript:                                  │
│  ✓ Early error throwing (no fallbacks)       │
│  ✓ File organization                         │
│  ✓ Import sorting                            │
│                                              │
│ Python:                                      │
│  ✓ Black formatting                          │
│  ✓ MyPy type checking                        │
│  ✓ PEP 8 compliance                          │
└─────────────────────────────────────────────┘
     ↓
typescript-error-fixer.py (auto-fixes if possible)
     ↓
Quality report displayed
```

---

## Subagent Spawning System

```
/command or @agent reference
     ↓
PreToolUse: agent-system/ hooks
     ↓
┌─ agent-file-resolver.js ──────────────┐
│ Maps agent name → agents/*.md file     │
└────────────────────────────────────────┘
     ↓
┌─ frontmatter-parser.js ────────────────┐
│ Extracts:                              │
│ • name, description                    │
│ • allowedAgents (delegation list)      │
│ • model (haiku|sonnet|opus)            │
│ • inheritProjectMcps, inheritParentMcps
│ • color (terminal color)               │
└────────────────────────────────────────┘
     ↓
┌─ mcp-manager.js ───────────────────────┐
│ Sets up Model Context Protocol          │
└────────────────────────────────────────┘
     ↓
┌─ spawn-helpers.js ─────────────────────┐
│ Launches agent with:                   │
│ • detached: true                       │
│ • stdio: ['pipe', 'ignore', 'ignore']  │
│ • Tracking in: .active-pids.json       │
└────────────────────────────────────────┘
     ↓
Agent runs in background
```

---

## Settings.json Permissions Model

### Structure
```json
{
  "permissions": {
    "allow": [
      "Tool(pattern)",
      "Bash(command:pattern)",
      "mcp__service__function",
      "Domain(pattern)"
    ]
  }
}
```

### Wildcard Patterns
- `Edit(*)` — Allow Edit on any file
- `Edit(**)` — Recursive (all subdirs)
- `Bash(git:*)` — Only git commands
- `Bash(npm:*)` — Only npm commands
- `WebFetch(domain:*)` — WebFetch with any domain
- `mcp__*` — All MCP functions
- `Bash(grep:*,find:*)` — Comma-separated list

### Current Allowed Tools
- File operations: Read, Edit, Write, Glob, Grep
- Shell: Bash (git, npm, pnpm, python, node, find, grep, etc.)
- Web: WebFetch, WebSearch
- Tasks: Task, TodoRead, TodoWrite
- External: Context7, MCP functions

---

## Key Patterns & Conventions

### Hook Development
```javascript
// All hooks:
// 1. Skip on reason: 'other' (prevents infinite loops)
// 2. Use detached: true for background workers
// 3. Wrap I/O in try/catch
// 4. Log to ~/.claude/logs/hooks.log
// 5. Use appendLog format: [EVENT] context | outcome

if (inputData.reason === 'other') return;
```

### Agent Definition
```yaml
---
name: AgentName
description: Short description
allowedAgents: [OtherAgent]
model: haiku
inheritProjectMcps: true
inheritParentMcps: false
color: yellow
---

[Your agent system prompt here...]
```

### CLAUDE.md Generation
Auto-generated by `claude-md-manager.mjs` for:
- Directories with code changes
- Project root on session end
- Exclusions via `.claude-md-manager-ignore` (gitignore-style)

### Activity Scoring
```
Effort = 1-10 scale
Protocol injection IF:
  • Confidence ≥ 0.8
  • Effort ≥ Category threshold

moderate.md = threshold ≤ effort ≤ threshold+2
strong.md = effort > threshold+2
```

---

## Project State Management

### Session State
Location: `~/.claude/conversation-state/{session_id}.json`
```json
{
  "session_id": "uuid",
  "protocol_name": "moderate.md | strong.md | null",
  "effort_level": 5,
  "timestamp": "2024-11-26T14:32:00Z"
}
```

### Project Cache
Location: `~/.claude/projects/{project-path}/`
Contains:
- Git state snapshot
- Per-session todos
- Debug logs
- File change history

### History File
Location: `~/.claude/history.jsonl`
Format: Line-delimited JSON (one entry per line)

---

## Common Tasks

### Create New Slash Command
1. Create `commands/mycommand.md`
2. Add frontmatter with `argument-hint`
3. Write markdown with `$ARGUMENTS` placeholder
4. Usage: `/mycommand arg1 arg2`

### Create New Agent
1. Create `agents/myagent.md`
2. Add frontmatter with name, description, model, etc.
3. Write system prompt
4. Reference in commands: `@agent-myagent`

### Add Hook
1. Create script in `hooks/{lifecycle|pre-tool-use|post-tool-use|etc}/`
2. Register in `settings.json` under `hooks.EventName`
3. Handle `inputData.reason === 'other'` to skip recursive calls
4. Use detached background workers

### Debug Activity Tracking
Location: `~/.claude/conversation-state/{session_id}.json`
- Check: protocol_name, effort_level, timestamp
- Adjust: activity-tracker.js thresholds for your workflow

---

## Performance Notes

- **Large cache**: ~1.4GB total (normal for active dev)
- **Cleanup period**: 30 days (configured in settings.json)
- **Cache invalidation**: File signature tracking (mtime + size)
- **Deduplication**: Lock files prevent duplicate hook execution
- **Background workers**: All async hooks use `detached: true`

---

## Troubleshooting Checklist

| Issue | Location |
|-------|----------|
| Hooks not running | settings.json hooks section |
| Agent won't spawn | agents/{agentname}.md frontmatter |
| Command not working | commands/{command}.md syntax |
| State persisting incorrectly | ~/.claude/conversation-state/ |
| Code quality checks failing | hooks/post-tool-use/code-quality-checker.py |
| Activity recognition wrong | hooks/state-tracking/activity-tracker.js |
| Projects not cached | ~/.claude/projects/{project-path}/ |
| History missing | ~/.claude/history.jsonl |

---

## Key Files to Edit

| File | When | Notes |
|------|------|-------|
| settings.json | Add permissions, change hook config | Requires session restart |
| CLAUDE.md | Update code standards | Read by code-quality-checker |
| agents/*.md | Create new agent | Update frontmatter carefully |
| commands/*.md | Create new command | Test with `/command arg` |
| hooks/{type}/*.js/.py | Add automation | Handle error cases, avoid blocking |
| docs/CLAUDE.md | Document standards | Separate from root CLAUDE.md |

---

## Summary

This is a **sophisticated multi-layer system** for:
- **Activity recognition** → Protocol injection based on what you're doing
- **Subagent orchestration** → Spawn specialized agents for complex work
- **Session automation** → Lifecycle hooks for git, history, cleanup
- **Code quality** → Automatic validation and fixing
- **Project caching** → Persistent state across sessions
- **Custom commands** → `/command` slash commands with args
- **Agent library** → Reusable specialized personalities

Everything is **configurable**, **extensible**, and **logged** for debugging.
