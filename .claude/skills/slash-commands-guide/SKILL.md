---
name: Writing Slash Commands
description: Create and use custom slash commands to automate Claude Code workflows. Learn argument passing, frontmatter configuration, bash integration, and file references for building reusable prompts.
allowed-tools: Bash
---

# Slash Commands Guide

Slash commands are reusable prompt templates that automate recurring tasks in Claude Code. Define them once, invoke them anytime with `/command-name [args]`.

## Quick Start

### Create a Command

**Project-scoped** (shared with team):
```bash
mkdir -p .claude/commands
echo "Analyze this code for performance issues:" > .claude/commands/optimize.md
```

**Personal** (across all projects):
```bash
mkdir -p ~/.claude/commands
echo "Review this code for security vulnerabilities:" > ~/.claude/commands/security-review.md
```

Invoke with `/optimize` or `/security-review`.

---

## Custom Commands Architecture

| Scope | Location | Scope | Shareable |
|:---:|:---:|:---:|:---:|
| **Project** | `.claude/commands/` | Repository-specific | Yes (team) |
| **Personal** | `~/.claude/commands/` | All projects | No |

### Namespacing

Organize commands in subdirectories (no effect on invocation):

```
.claude/commands/
├── frontend/
│   └── component.md      # Invokes as `/component` (shows "project:frontend")
├── backend/
│   └── api.md           # Invokes as `/api` (shows "project:backend")
└── security-review.md   # Invokes as `/security-review`
```

**Note:** User-level and project-level commands with the same name conflict; only one is available.

---

## Arguments & Placeholders

### Capture All Arguments with `$ARGUMENTS`

Use `$ARGUMENTS` when you need all arguments as a single string:

```markdown
---
description: Fix issue with optional priority
argument-hint: [issue-number] [optional-priority]
---

Fix issue #$ARGUMENTS following our coding standards.
```

**Usage:** `/fix-issue 123` → `$ARGUMENTS` = `"123"`
**Usage:** `/fix-issue 123 high-priority` → `$ARGUMENTS` = `"123 high-priority"`

### Access Individual Arguments with `$1, $2, ...`

Use positional parameters for structured commands:

```markdown
---
description: Review pull request with priority and assignee
argument-hint: [pr-number] [priority] [assignee]
---

Review PR #$1 with priority $2 and assign to $3.
Focus on security, performance, and code style.
```

**Usage:** `/review-pr 456 high alice` → `$1="456"`, `$2="high"`, `$3="alice"`

**When to use positional:**
- Arguments have distinct roles (ID, priority, owner)
- Need defaults: `${3:-unassigned}`
- Reference arguments separately throughout command

---

## Frontmatter Configuration

All options are optional; commands work without frontmatter.

| Field | Purpose | Example |
|:---:|:---|:---|
| `description` | Shown in `/help` (required for SlashCommand tool) | `"Fix security issues"` |
| `argument-hint` | Argument syntax hint for autocomplete | `"[issue] [priority]"` |
| `allowed-tools` | Tools this command can invoke | `Bash(git add:*), Bash(git status:*)` |
| `model` | Override default model for this command | `"claude-3-5-haiku-20241022"` |
| `disable-model-invocation` | Prevent SlashCommand tool from triggering | `true` |

### Example with Full Frontmatter

```markdown
---
description: Create a git commit with staged changes
argument-hint: [message]
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
model: claude-3-5-haiku-20241022
---

Create a git commit with message: $ARGUMENTS
```

---

## Bash Execution & File References

### Run Bash Commands with `!`

Prefix inline commands with `!` to execute before the command runs. Requires `allowed-tools` with `Bash`:

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git log:*)
description: Create a git commit
---

## Context

- Current status: !`git status`
- Staged changes: !`git diff --cached`
- Recent commits: !`git log --oneline -5`

## Your Task

Create a single commit summarizing the changes.
```

**Output from bash commands is included in the prompt context.**

### Reference Files with `@`

Include file contents in commands:

```markdown
Review the implementation in @src/utils/helpers.js

Compare @src/old-version.js with @src/new-version.js
```

Use standard file references (e.g., `@docs/`, `@src/`).

---

## Pattern Examples

### Example 1: Priority-Based Issue Fix

```markdown
---
description: Fix issue with priority level
argument-hint: [issue-number] [priority-level]
---

Fix GitHub issue #$1 with priority "$2".

Steps:
1. Understand the issue context
2. Write minimal, focused fix
3. Consider edge cases
4. Ensure tests pass
```

**Usage:** `/fix-issue 42 high`

---

### Example 2: Bash-Powered Code Review

```markdown
---
allowed-tools: Bash(git diff:*), Bash(git log:*)
description: Review recent commits for code quality
argument-hint: "[number-of-commits]"
---

## Context

Recent changes:
!`git log --oneline -${1:-5}`

Full diff:
!`git diff HEAD~${1:-5}...HEAD`

## Your Task

Provide a code quality review focusing on readability, performance, and best practices.
```

**Usage:** `/review-commits 3` → Reviews last 3 commits

---

### Example 3: Multi-Argument Configuration Command

```markdown
---
description: Set up feature flags for testing
argument-hint: feature [enable|disable] [environment]
---

Configure feature "$1" to be $2 in the $3 environment.

Verify:
- Feature flag exists in @src/config/features.ts
- Environment is valid (dev, staging, production)
- Changes are tested before deployment
```

**Usage:** `/feature dark-mode enable staging`

---

## SlashCommand Tool Integration

The `SlashCommand` tool allows Claude to invoke your custom commands programmatically.

### Enable Auto-Invocation

Add to CLAUDE.md or project instructions:

```markdown
When appropriate, use /optimize to analyze code performance.
When fixing bugs, use /fix-issue with the issue number.
```

### Requirements for Tool Access

1. Command must have `description` frontmatter
2. Command must NOT have `disable-model-invocation: true`
3. User must allow `SlashCommand` tool in permissions

### Disable Specific Commands

Prevent Claude from auto-invoking a command:

```markdown
---
disable-model-invocation: true
description: Manual review only
---

Your command content...
```

### Permission Rules

Fine-grained control via `/permissions`:

```
SlashCommand:/commit         # Exact match: /commit only
SlashCommand:/review-pr:*    # Prefix match: /review-pr with any args
```

Deny `SlashCommand` entirely to disable all auto-invocation.

---

## Best Practices

✅ **Do:**
- Use descriptive names matching functionality (e.g., `/optimize`, `/security-review`)
- Include `description` for discoverability via `/help` and SlashCommand tool
- Add `argument-hint` for clear usage patterns
- Keep commands focused on a single responsibility
- Use bash execution for context that changes (git status, timestamps)

❌ **Don't:**
- Embed static content that belongs in code (use file references instead)
- Create commands without descriptions (breaks tool integration)
- Overload with too many positional arguments (>3 becomes hard to remember)
- Assume tools are available without declaring `allowed-tools`

---

## Built-in Slash Commands (Reference)

Essential commands you get for free:

| Command | Purpose |
|:---|:---|
| `/help` | List all commands (built-in + custom) |
| `/config` | Open Settings interface |
| `/status` | Show version, model, account |
| `/cost` | Token usage statistics |
| `/model` | Switch AI model |
| `/memory` | Edit CLAUDE.md |
| `/rewind` | Rewind conversation or code |
| `/clear` | Clear history |
| `/agents` | Manage custom AI subagents |
| `/mcp` | Manage MCP server connections |

---

## Workflow Integration

**In CLAUDE.md or project instructions:**

```markdown
## Custom Commands

Use these commands to accelerate development:

- `/optimize [file]` — Analyze code performance
- `/security-review [file]` — Check for vulnerabilities
- `/commit [message]` — Create atomic commits
- `/test [suite]` — Run tests with focus
```

**In conversations:**

```
> I'll use /optimize to check this function for performance issues.
```

Claude recognizes the slash and may auto-invoke if `SlashCommand` tool is enabled.

---

## See Also

- **MCP Slash Commands**: Commands exposed by MCP servers (pattern: `/mcp__server__prompt`)
- **Plugin Commands**: Commands from installed plugins (pattern: `/plugin-name:command` or just `/command`)
- **Interactive Mode**: Keyboard shortcuts and input modes
- **Permissions**: Fine-grained tool and command access control
