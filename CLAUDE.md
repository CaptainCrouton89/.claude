# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a personal AI workflow orchestration system built around Claude Code. It provides:
- **5 specialized agent types** for delegated work (orchestrator, planner, programmer, junior-engineer, context-engineer, senior-engineer, library-docs-writer, non-dev)
- **Multi-phase project management** (init-project with 9 sequential documentation stages)
- **Git hooks integration** for automatic CLAUDE.md generation and subdirectory documentation
- **Reusable templates** for plans, investigations, requirements, and feature docs
- **Custom command system** for complex workflows

Not all directories are actively used—focus on `/agents`, `/commands`, and `/file-templates` for core patterns.

## Build/Development/Testing

**This is NOT a traditional build project.** It's a documentation and workflow orchestration system.

No compilation, build, or test commands. It's primarily markdown files with embedded workflow instructions.

For development:
- Edit agent definitions in `agents/[agent-name].md`
- Add commands in `commands/` directory
- Modify templates in `file-templates/`
- No linting, testing, or build process required

## High-Level Architecture

### Core Components

**Agent System** (`agents/`)
- Each agent is a markdown file with YAML frontmatter defining the agent's role and constraints
- Agents can be invoked via `claude` CLI: `/delegate @agents/orchestrator.md [task]`
- **orchestrator**: Manages large multi-phase tasks through strategic delegation
- **planner**: Creates detailed implementation plans from requirements/investigations
- **programmer**: Complex multi-file implementations with pattern analysis
- **junior-engineer**: Well-specified tasks following existing patterns
- **context-engineer**: Codebase exploration, pattern discovery, file finding
- **senior-engineer**: Code review, architectural guidance, technical validation
- **library-docs-writer**: Async documentation research and compression
- **non-dev**: Operational tasks, analysis, planning, coordination

**Command System** (`commands/`)
- Workflow markdown files that orchestrate multi-step processes
- Entry point: `commands/workflow.md` — comprehensive feature dev lifecycle
- **init-project/** (9 sequential stages):
  - 00-orchestrate.md: Assessment → automatic routing
  - 00a/00b/00c: Conditional paths (assess, selective update, legacy normalize)
  - 01-prd.md through 09-traceability-pass.md: Sequential documentation stages
- **manage-project/**: add/ and implement/ subcommands for ongoing work
- **Git integration**: `/git-doc.md`, `/git.md` for commit documentation

**Template System** (`file-templates/`)
- `claude.template.md`: CLAUDE.md structure for directories
- `plan.template.md`: Implementation plan format
- `investigation.template.md`: Investigation document structure
- `requirements.template.md`: Requirements specification format
- `feature-doc.template.md`: Feature documentation format

**Git Hooks Integration** (`hooks/`)
- `post-commit`: Auto-generates/updates CLAUDE.md files after commits
- Analyzes changed files, determines if directory-level CLAUDE.md needed
- Delegates to subdirectory agents for documentation updates
- Root-level CLAUDE.md generation with codebase analysis

### Key Patterns & Conventions

**Agent Delegation Decision Framework**
- **DELEGATE when**: Scope >3-4 files, parallelizable work, deep investigation, complex logic, multi-phase workflows, document generation
- **HANDLE DIRECTLY when**: Scope ≤3 files, active debugging, quick wins, context already loaded, user interaction needed
- See root `CLAUDE.md` for detailed heuristics

**Multi-Phase Workflow Structure**
- All complex work follows: **Investigation → Planning → Implementation → Validation**
- Investigation agents run in parallel, each producing focused `.md` files in `agent-responses/`
- Planner synthesizes investigations into detailed plans
- Implementation agents use plans to build features
- Senior-engineer validates independently

**Documentation Standards**
- All templates in `file-templates/` use specific YAML frontmatter
- Investigation docs written to `agent-responses/{agent_id}.md` by executing agents
- Plans written to `docs/plans/[feature]/plan.md`
- Feature docs in `docs/features/[feature].md`
- Each directory with >5 files should have its own CLAUDE.md

**Command Structure**
- Files use markdown with YAML frontmatter for metadata
- `$ARGUMENTS` placeholder for user input
- Multi-step workflows daisy-chain through sequential command files
- Conditional routing based on assessment results (greenfield vs brownfield)

**Code Quality Standards** (from root)
- NEVER use `any` type—look up actual types
- It's okay to break code when refactoring (pre-production mindset)
- ALWAYS throw errors early and often—no fallbacks

## Critical Context

**Not a Traditional Codebase**
- No package.json at root, no build step, no tests
- `claude-cli/` is imported from external package (@anthropic-ai/claude-code)
- This entire repo is a custom automation system *for managing workflows with Claude*

**Delegation Hierarchy**
- Orchestrator: Top-level task decomposition, never codes
- Planner: Strategy + structure (never codes)
- Programmer/Junior-Engineer: Implementation only
- Context-Engineer: Investigation/discovery
- Senior-Engineer: Review/guidance
- Library-Docs-Writer: Async documentation
- Non-Dev: Operational/analytical tasks

**Command Execution Flow**
- User runs `/workflow [feature description]` from project
- Workflow file calls user for clarifications, then delegates to orchestrator
- Orchestrator breaks work into phases, spawns specialized agents
- Agents update progress to `agent-responses/{id}.md`
- Main orchestrator monitors with `./agent-responses/await {agent_id}`
- All work ultimately produces code, docs, or validated builds

**Git Hook Automation**
- After every commit, post-commit hook triggers
- Analyzes changed files to determine if CLAUDE.md updates needed
- Creates CLAUDE.md for directories with >5 files if missing
- Suggests updates to existing CLAUDE.md if changes are significant
- Delegates to subdirectory agents for large documentation updates

**Directory Organization**
- `agents/`: Agent role definitions (markdown)
- `commands/`: Workflow command definitions (markdown)
- `file-templates/`: Reusable document templates (markdown)
- `hooks/`: Git hooks for automation
- `docs/`: Reference documentation, investigation outputs
- `agent-responses/`: Live agent output files during execution
- `projects/`: Project-specific configurations and history
- `skills/`, `mcp/`, `mcp-library/`: Custom skills and MCP integrations
- `output-styles/`: Claude Code output style definitions
- `.claude/`: Claude Code IDE settings and plugins

## Notes

- Check `README.md` for quick overview—deliberately minimal, refers to `/agents`, `/commands` as inspiration
- This is the user's personal AI orchestration system; it's intentionally idiosyncratic
- MCP boilerplate available at [github.com/CaptainCrouton89/mcp-boilerplate](https://github.com/CaptainCrouton89/mcp-boilerplate)
