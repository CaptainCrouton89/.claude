# Commands Directory

Custom slash commands for Claude Code workflows. Each command is a markdown file defining specialized behaviors.

## Structure

- **Root commands** (/*.md): Direct invocations for single-purpose tasks (git workflows, fixes, init)
- **Subdirectories**: Grouped command families for complex workflows

### Command Categories

**analyze/** - Code analysis and investigation commands
**docs/** - Documentation generation and management
**execute/** - Implementation execution patterns (implement-plan.md, quick-with-subtasks.md)
**plan/** - Planning workflows (requirements.md, project.md, parallel.md, shared.md, etc.)
**qa/** - Quality assurance and validation commands
**report/** - Reporting and output generation
**research/** - Deep investigation commands (deep.md)
**role/** - Role-switching commands (architect.md, planner.md)
**archive/** - Deprecated or experimental commands

## Command File Patterns

Commands follow consistent structure:
1. **Arguments section** - `$ARGUMENTS` placeholder for user input
2. **Phase-based execution** - Clear phases (Analysis → Decision → Action)
3. **Agent delegation guidelines** - When to delegate vs. work directly
4. **Output expectations** - What the command produces

## Key Conventions

**Delegation Philosophy**
- Small changes (<3 files): Handle directly
- Large changes (3+ files, complex): Delegate to parallel agents
- Always provide specific file paths to agents (never make them search)

**Agent Coordination**
- Launch parallel agents in single function_calls block
- Use `./agent-responses/await {agent_id}` to monitor
- Agents write to `agent-responses/{agent_id}.md`

**Command Invocation**
- Commands receive user arguments via `$ARGUMENTS`
- Support both direct execution and orchestration modes
- Most commands defer to specialized agents for complex work

## Critical Patterns

**git-doc.md** - Post-change documentation workflow with parallel agent delegation for large changes
**workflow.md** - Complete feature lifecycle: Requirements → Planning → Implementation → Validation
**orchestrate.md** - Pure orchestration mode (delegate everything except critical reads)

## Documentation Standards

**Feature changes** → .docs/features/ (via feature-doc.template.md)
**Architecture changes** → .docs/architecture/ (system-wide only)
**Directory patterns** → local CLAUDE.md (RARELY - 90% of changes don't need this)

**Never update root CLAUDE.md**

## Agent Instruction Pattern

Each agent delegation must include:
- Specific files to read/analyze (no searching)
- Template location if generating docs
- Output file path
- Focus areas based on task type

## Commit Strategy

After agent-based documentation:
- Commit features with their docs together
- Use conventional commits: `type(scope): message`
- Group related changes logically
- Push after all commits complete
