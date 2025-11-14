# Quick Guide to Custom Slash Commands

## Overview

Custom slash commands are Markdown files that let you save and reuse frequently-used prompts in Claude Code. They support arguments, bash execution, and file references.

## Where to Save

**Project Commands** (shared with team):
```
.claude/commands/my-command.md
```

**Personal Commands** (available across all projects):
```
~/.claude/commands/my-command.md
```

## Basic Structure

Create a `.md` file with your prompt:

```markdown
---
description: Brief description of what this command does
---

Your prompt here with optional $ARGUMENTS placeholder
```

The filename determines the command name (e.g., `review.md` → `/review`)

## Key Features

### Arguments

- `$ARGUMENTS` - All arguments passed to the command
- `$1`, `$2`, etc. - Individual arguments by position

Example:
```markdown
---
description: Add a new component
---

Create a React component named $1 in the $2 directory
```

Usage: `/new-component Button components/ui`

### Subdirectories (Namespacing)

Organize commands in folders:
```
.claude/commands/frontend/component.md  → /component (project:frontend)
.claude/commands/backend/api.md         → /api (project:backend)
```

### Bash Execution

Prefix commands with `!` to run bash first:

```markdown
---
description: Review recent changes
allowed-tools: Bash(git diff:*)
---

!git diff HEAD~1

Review the above git diff for potential issues
```

**Important**: Include `allowed-tools` with appropriate Bash permissions.

### File References

Use `@` to include file contents:

```markdown
Review the code in @src/components/Button.tsx for accessibility issues
```

## Frontmatter Options

```yaml
---
description: Brief command purpose
allowed-tools: Bash(git status:*), Read(**)
argument-hint: <feature-name>
model: sonnet  # or opus, haiku
disable-model-invocation: true  # prevents auto-execution
---
```

## Common Patterns

### Simple Prompt Shortcut

```markdown
---
description: Review code for security issues
---

Analyze $ARGUMENTS for security vulnerabilities including:
- SQL injection
- XSS attacks
- Authentication issues
- Data exposure
```

### Git Workflow

```markdown
---
description: Create feature branch and commit
allowed-tools: Bash(git:*)
---

!git checkout -b feature/$1
!git add .
!git commit -m "$ARGUMENTS"

Feature branch created and changes committed
```

### Code Generation

```markdown
---
description: Generate API endpoint
argument-hint: <endpoint-name>
---

Create a new REST API endpoint for $1 with:
- GET, POST, PUT, DELETE methods
- Input validation
- Error handling
- Tests
```

### Investigation

```markdown
---
description: Investigate feature implementation
---

Investigate how $ARGUMENTS is implemented:
1. Find all relevant files
2. Trace execution flow
3. Identify key components
4. Summarize architecture
```

## Tips

- **Keep it focused**: Each command should do one thing well
- **Use descriptive names**: `/review-security` is better than `/rs`
- **Document arguments**: Use `argument-hint` to show expected inputs
- **Test incrementally**: Start simple, add complexity as needed
- **Share project commands**: Commit `.claude/commands/` to version control
- **Organize by domain**: Use subdirectories for related commands

## Quick Start

1. Create the commands directory:
   ```bash
   mkdir -p .claude/commands
   ```

2. Create your first command:
   ```bash
   echo "---
description: Quick code review
---

Review $ARGUMENTS for:
- Code quality
- Best practices
- Potential bugs" > .claude/commands/review.md
   ```

3. Use it:
   ```
   /review src/components/Button.tsx
   ```

## Examples from Your Setup

Based on your `.claude/commands/` directory, you have sophisticated examples like:

- `/workflow` - Full feature development lifecycle
- `/git` - Commit and push with smart scoping
- `/start` - Intelligent entry point routing
- `/init-workspace` - Environment setup

Check these for advanced patterns and multi-phase workflows.
