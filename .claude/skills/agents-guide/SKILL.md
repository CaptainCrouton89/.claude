---
name: Subagents Guide
description: Specialized AI assistants for task-specific workflows with separate context. Learn when to delegate, configure tools, and apply best practices.
allowed-tools: Read, Glob, Grep, Bash
---

# Subagents Guide

## What Are Subagents?

Subagents are pre-configured AI personalities that Claude Code delegates to handle specific task types. Each operates independently with:

- **Separate context** — Prevents main conversation pollution, keeps focus on high-level objectives
- **Custom system prompt** — Guides behavior for specific domains
- **Dedicated tools** — Granular permission control per subagent
- **Reusability** — Available across projects, shareable with teams

## Key Benefits

| Benefit | Impact |
|---------|--------|
| **Context Preservation** | Main thread stays focused; subagent pollution isolated |
| **Specialized Expertise** | Domain-tuned instructions improve success rates |
| **Flexible Permissions** | Grant only necessary tools to each subagent |
| **Reusability** | One config used across projects and teams |

## When to Use Subagents

**Delegate when:**
- Task matches a pre-defined expertise area
- You want isolated context for deep work
- Multiple independent tasks can run in parallel
- Tool access should be restricted
- You need consistent behavior across projects

**Don't delegate:**
- Simple one-off changes (≤3 files)
- Active debugging with rapid iteration
- Tasks requiring main conversation context

## Quick Start

```bash
# Open subagents interface (Recommended approach)
/agents

# Or create manually: project subagents go here
mkdir -p .claude/agents

# User subagents (available everywhere)
mkdir -p ~/.claude/agents
```

**Steps:**
1. Run `/agents` command
2. Select "Create New Agent"
3. Describe purpose, select tools, customize system prompt
4. Save — subagent is now available

## File Format

Subagents are Markdown files with YAML frontmatter:

```markdown
---
name: subagent-name
description: When this subagent should be used and its expertise area
tools: Read, Write, Bash  # Optional — inherit all if omitted
model: sonnet            # Optional — sonnet, opus, haiku, or 'inherit'
---

Your system prompt goes here. Define role, capabilities, constraints,
and specific instructions. Include examples, checklists, and best practices.
```

### Configuration Fields

| Field | Required | Notes |
|-------|----------|-------|
| `name` | ✓ | lowercase, hyphens only; used for invocation |
| `description` | ✓ | Natural language; used for auto-delegation. Use "proactively" to trigger automatic use |
| `tools` | — | Comma-separated list. Omit to inherit all tools from main thread |
| `model` | — | `sonnet` (default), `opus`, `haiku`, or `'inherit'` for consistency |

## File Locations & Priority

| Type | Location | Scope | Priority |
|------|----------|-------|----------|
| **Project** | `.claude/agents/` | This project only | Higher |
| **User** | `~/.claude/agents/` | All projects | Lower |

Project subagents override user-level ones with the same name.

## Tool Configuration Best Practices

**Principle: Least Privilege**

Only grant tools necessary for the subagent's purpose. This:
- Improves security and focus
- Prevents unintended actions
- Makes subagent behavior more predictable

**Common tool combinations:**

```yaml
# Code reviewer
tools: Read, Grep, Glob, Bash

# Data analyst
tools: Read, Write, Bash

# Test automation
tools: Bash, Read, Edit, Write

# Debugger
tools: Read, Edit, Bash, Grep, Glob

# Documentation writer
tools: Read, Write, Glob, Grep
```

Omit `tools` to let subagent inherit all (including MCP tools).

## Invocation Methods

### Automatic Delegation

Claude Code proactively delegates when:
- Task description matches subagent purpose
- Subagent `description` field matches context
- Appropriate tools are configured

To encourage automatic use, include "proactively" in description:
```yaml
description: Use proactively to run tests and fix failures
```

### Explicit Invocation

Request a subagent directly:
```
Use the code-reviewer subagent to check my recent changes
Have the debugger investigate this test failure
Ask the data-scientist subagent for a SQL analysis
```

## Example Subagents

### Code Reviewer

```markdown
---
name: code-reviewer
description: Expert code review specialist. Use proactively after writing code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked, run git diff to identify recent changes and review modified files.

Review checklist:
- Readability and naming
- No duplicated code
- Proper error handling
- No exposed secrets
- Input validation implemented
- Test coverage adequate
- Performance considerations addressed

Organize feedback by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)

Include specific examples for all recommendations.
```

### Test Automation

```markdown
---
name: test-runner
description: Test automation expert. Use proactively to run tests and fix failures.
tools: Bash, Read, Edit
---

You are a test automation specialist. When you see code changes, proactively run appropriate tests.

If tests fail:
1. Analyze failure messages and logs
2. Identify root cause
3. Fix the issue while preserving test intent
4. Re-run tests to confirm

For each failure, provide:
- Root cause explanation
- Code fix
- Prevention recommendations

Focus on fixing the underlying issue, not just symptoms.
```

### Debugger

```markdown
---
name: debugger
description: Debugging specialist. Use proactively when encountering errors or unexpected behavior.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

Debugging process:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

For each issue, provide:
- Root cause explanation with evidence
- Specific code fix
- Testing approach
- Prevention recommendations

Focus on fixing the underlying issue, not just symptoms.
```

## Best Practices

**Design focused subagents**
- Single, clear responsibility per subagent
- Improves performance and predictability
- Easier to test and iterate

**Write detailed system prompts**
- Include specific instructions and examples
- Define constraints and decision rules
- More guidance = better performance

**Limit tool access intentionally**
- Only grant necessary tools
- Improves security and focus
- Prevents unintended side effects

**Start with Claude-generated agents**
- Generate initial subagent with Claude, then customize
- Provides solid foundation for iteration
- Better results than building from scratch

**Version control project subagents**
- Check `.claude/agents/` into git
- Team benefits from shared, improved subagents
- Track subagent evolution over time

**Use specific descriptions for auto-delegation**
- Include action verbs: "use proactively", "automatically", "must be used"
- Match task keywords from your workflow
- Example: "Use proactively to analyze errors and fix bugs"

## Advanced: Chaining Subagents

For complex workflows, sequence multiple subagents:

```
> First use the code-analyzer subagent to find performance issues,
  then use the optimizer subagent to fix them
```

Each subagent completes its work, then the next is invoked with its results.

## Performance Considerations

**Latency trade-off:**
- Subagents preserve main context (allows longer sessions)
- Each subagent invocation requires initial context gathering
- Suitable for focused, substantial work (not quick tweaks)

**When to use subagents:** Substantial work, deep investigation, complex logic, long tasks
**When to skip:** Quick edits (≤3 files), rapid iteration, simple clarifications

## Management

### Using `/agents` Command (Recommended)

```bash
/agents
```

Provides interactive interface to:
- View all available subagents
- Create new subagents with guided setup
- Edit existing subagents and tool permissions
- Delete custom subagents
- See active subagents when duplicates exist

### Direct File Management

Create project subagent:
```bash
mkdir -p .claude/agents
cat > .claude/agents/test-runner.md << 'EOF'
---
name: test-runner
description: Use proactively to run tests and fix failures
---

[Your system prompt here]
EOF
```

Create user subagent:
```bash
mkdir -p ~/.claude/agents
# Create file same way as project subagent
```

## Related Documentation

- [Slash commands](/en/docs/claude-code/slash-commands)
- [Settings](/en/docs/claude-code/settings) — Configure subagent models and defaults
- [Hooks](/en/docs/claude-code/hooks) — Automate workflows with event handlers
