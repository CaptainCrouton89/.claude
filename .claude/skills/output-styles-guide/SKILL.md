---
name: Output Styles Guide
description: Adapt Claude Code for different use cases beyond software engineering by customizing system prompts for teaching, learning, analysis, or domain-specific workflows.
allowed-tools: []
---

# Output Styles Guide

Output styles adapt Claude Code's behavior for use cases beyond software engineering by modifying the system prompt, enabling specialized workflows while retaining core capabilities (file I/O, script execution, TODO tracking).

## What Are Output Styles?

Output styles are customized system prompts that replace or supplement Claude Code's default software engineering focus. They:
- Exclude efficiency-focused coding instructions when not needed.
- Inject custom instructions tailored to a specific role or workflow.
- Persist at project level (`.claude/settings.local.json`) or user level (`~/.claude/output-styles`).
- Preserve tool access (Bash, file editing, TODO management).

## Built-In Output Styles

### Default
Standard Claude Code behavior optimized for software engineering: concise output, code verification, efficient task completion.

### Explanatory
Adds **"Insights"** sections between tasks to explain implementation choices and codebase patterns. Ideal for understanding complex code or teaching.

### Learning
Collaborative, learn-by-doing mode. Shares insights *and* requests your contribution on small code sections via `TODO(human)` markers. Best for skill-building or onboarding.

## Changing Your Output Style

**Interactive menu:**
```bash
/output-style
# or access via /config
```

**Direct command:**
```bash
/output-style explanatory
/output-style default
/output-style learning
```

Changes apply at project level and save to `.claude/settings.local.json`.

## Creating Custom Output Styles

### Quick start (guided):
```bash
/output-style:new I want an output style that [describes your use case]
```
Claude creates and saves a template; you refine it.

### Manual creation:

Create a markdown file at `~/.claude/output-styles/<name>.md` (user-level, shared across projects) or `.claude/output-styles/<name>.md` (project-level only).

**Structure:**
```markdown
---
name: My Custom Style
description: Brief description shown in /output-style menu
---

# Custom Style Instructions

You are an interactive CLI tool. [Your instructions here...]

## Specific Behaviors

[Define how the assistant behaves...]
```

**Example: Research Assistant Style**
```markdown
---
name: Research Assistant
description: Focused, depth-first analysis with citations and hypothesis tracking.
---

# Research Assistant Mode

You are a research partner specializing in deep investigation and synthesis.

## Specific Behaviors

- Request sources and cite evidence when making claims.
- Track open hypotheses explicitly.
- Summarize findings in bullet-point format with confidence levels.
- Flag uncertainty and propose next investigation steps.
```

### Best practices for custom styles:
- Be specific: "summarize in 3 bullets", "include citations", "ask for feedback".
- Retain tool flexibility: don't disable essential capabilities unless necessary.
- Test with a few tasks to verify behavior before distributing.

## Common Use Cases

| Use Case | Style | Benefit |
|----------|-------|---------|
| Learning codebase | Explanatory | Understand *why* code is structured this way |
| Onboarding engineers | Learning | Active participation, hands-on skill building |
| Research/analysis | Custom | Depth-first investigation, hypothesis tracking |
| Technical writing | Custom | Structured outlines, examples, glossary generation |
| Product/UX work | Custom | Personas, user flows, journey mapping focus |

## Output Styles vs. Related Features

| Feature | Purpose | Scope |
|---------|---------|-------|
| **Output Styles** | Persistent system prompt modification | Affects all main agent interactions |
| **CLAUDE.md** | Project-level instructions added *after* system prompt | Supplements default behavior; doesn't replace it |
| **--append-system-prompt** | Runtime system prompt additions | One-time append per session |
| **Agents** | Task-specific execution with custom tools/models | Single-purpose delegation; doesn't affect main loop |
| **Custom Slash Commands** | Stored user prompts (input templates) | Shorthand for repeated requests |

**Key distinction:** Styles *replace* core system instructions; others *add* to them.

## Tips & Troubleshooting

- **Not persisting?** Verify save location: `.claude/settings.local.json` for project, `~/.claude/output-styles/` for user-level styles.
- **Lost formatting?** Keep custom style descriptions under 100 chars for menu readability.
- **Want to share?** Save custom styles at project level (`.claude/output-styles/`) and commit to Git.
- **Reverting?** Run `/output-style default` or delete from `.claude/settings.local.json`.
- **Stacking instructions?** Use CLAUDE.md alongside styles to add project-specific rules to your custom style.

## Quick Reference

| Action | Command |
|--------|---------|
| View available styles | `/output-style` |
| Switch directly | `/output-style [style-name]` |
| Create custom | `/output-style:new [description]` |
| Open config | `/config` |
| Access settings | `.claude/settings.local.json` (project) or `~/.claude/output-styles/` (user) |
