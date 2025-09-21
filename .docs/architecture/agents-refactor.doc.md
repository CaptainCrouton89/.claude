# Agents Library Refactoring

## Overview
Major refactoring of the agent architecture to consolidate core agents, eliminate redundant functionality, and establish clearer organizational boundaries between core agents and specialized library agents.

## Refactoring Summary

### Deleted Agents from agents-library/
**Reason**: These agents were either redundant, overly specialized, or better handled by core agents

- `code-researcher.md` - Functionality absorbed by existing research patterns
- `documentation-writer.md` - Redundant with docs-git-committer agent
- `documenter.md` - Duplicate of documentation-writer functionality
- `feature-researcher.md` - Overlapped with existing research capabilities
- `html-video-animator.md` - **Moved** to `agents-library/video/` for better organization
- `markdown-to-html-converter.md` - Overly specific utility functionality
- `marketing-script-writer.md` - **Moved** to `agents-library/video/` for better organization
- `parallel-task-executor.md` - Functionality integrated into core workflow
- `root-cause-analyzer.md` - **Moved** to core `agents/` directory

### Modified Core Agents
**Reason**: Enhanced functionality and updated patterns

- `agents/code-finder-advanced.md` - Enhanced search and analysis capabilities
- `agents/code-finder.md` - Improved pattern matching and file discovery
- `agents/implementor.md` - Updated diagnostics to use `npx tsc-files --noEmit` instead of mcp__ide__getDiagnostics
- **Deleted** `agents/feature-planner.md` - Functionality integrated into other planning agents

### New Agents Added
**Reason**: Fill gaps in core functionality and establish new organizational patterns

- `agents/backend-developer.md` - **New** specialized agent for backend/API development with pattern analysis
- `agents/root-cause-analyzer.md` - **Promoted** from library to core for systematic debugging
- `agents-library/qa.md` - **New** skeleton for quality assurance workflows
- `agents-library/video/` - **New** directory structure for video-related specialized agents

## New Agent Organization Structure

### Core Agents (`agents/`)
**Purpose**: Essential agents for primary development workflows

- `backend-developer.md` - Backend/API development with pattern analysis
- `code-finder-advanced.md` - Advanced code search and analysis
- `code-finder.md` - Basic file and pattern discovery
- `docs-git-committer.md` - Documentation and git workflow management
- `frontend-ui-developer.md` - Frontend development and UI implementation
- `implementor.md` - Code implementation and modification
- `library-docs-writer.md` - Library documentation generation
- `root-cause-analyzer.md` - Systematic debugging and root cause analysis

### Library Agents (`agents-library/`)
**Purpose**: Specialized agents for specific domains or workflows

- `db-modifier.md` - Database operations and schema management
- `qa.md` - Quality assurance and testing workflows
- `research-specialist.md` - Specialized research and analysis
- `video/` - Video-related specialized agents
  - `html-video-animator.md` - HTML video animation creation
  - `marketing-script-writer.md` - Marketing video script development

## Migration Notes

### Removed Agent Functionality
- **Documentation tasks**: Use `agents/docs-git-committer.md` instead of removed documentation writers
- **Research tasks**: Use `agents-library/research-specialist.md` or enhanced code-finder agents
- **Root cause analysis**: Now promoted to core agent `agents/root-cause-analyzer.md`
- **Parallel execution**: Integrated into core workflow patterns, no dedicated agent needed

### New Capabilities
- **Backend development**: Use new `agents/backend-developer.md` for API/server development
- **Video content**: Use specialized agents in `agents-library/video/` directory
- **Quality assurance**: Use new `agents-library/qa.md` for testing workflows

### Pattern Changes
- **Diagnostics**: Implementor agent now uses `npx tsc-files --noEmit` for type checking
- **Organization**: Clear separation between core development agents and specialized library agents
- **Video specialization**: Video-related agents grouped in dedicated subdirectory

## Architecture Benefits

1. **Clearer Boundaries**: Core agents handle primary development workflows, library agents handle specialized domains
2. **Reduced Redundancy**: Eliminated duplicate documentation and research agents
3. **Better Organization**: Video-related agents grouped logically in subdirectory
4. **Enhanced Core**: Promoted root-cause-analyzer to core and added specialized backend-developer
5. **Maintainability**: Fewer agents with clearer, non-overlapping responsibilities

## Further Documentation
- Core agent descriptions: `agents/`
- Specialized agents: `agents-library/`
- Workflow patterns: `.docs/guides/`