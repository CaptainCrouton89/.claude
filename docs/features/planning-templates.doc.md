# Planning Templates System

## Overview
Centralized template system for planning commands that moves template formats from inline documentation to reusable template files in the `/file-templates/` directory.

## User Perspective
When users run planning commands (`/shared`, `/requirements`, `/parallel`, quick planners), the commands now reference standardized templates that ensure consistent document structure across all planning phases. The commands guide users through the same structured approach while reducing duplication in command definitions.

## Data Flow
1. User runs planning command (e.g., `/shared`, `/requirements`, `/parallel`)
2. Command reads template from `/file-templates/[template-name].template.md`
3. Command instructs user to follow template format for document creation
4. Resulting documents maintain consistent structure across planning phases
5. Templates ensure standardized sections for files, dependencies, and implementation details

## Implementation

### Key Files
- `commands/plan/shared.md` - references `shared.template.md`
- `commands/plan/requirements.md` - references `requirements.template.md`
- `commands/plan/parallel.md` - references plan templates by scope (quick/standard/comprehensive)
- `commands/plan/convert-to-context.md` - references `plan.quick.template.md`
- `file-templates/shared.template.md` - Template for shared context documents
- `file-templates/requirements.template.md` - Template for requirements documents
- `file-templates/plan.quick.template.md` - Quick plan template (small scope)
- `file-templates/plan.template.md` - Standard plan template (medium scope)
- `file-templates/plan.comprehensive.template.md` - Comprehensive plan template (large scope)
- `file-templates/investigation.template.md` - Canonical investigation doc template

### Template Structure
- **Shared Template**: Defines structure for listing relevant files, tables, patterns, and documentation
- **Requirements Template**: Provides format for user flows, functional requirements, and file references
- **Plan Templates**:
  - Quick: summary, steps, key files
  - Standard: summary, context, tasks, impacts, rollout
  - Comprehensive: investigation artifacts, impact analysis, parallel tasks, rollout/rollback
- **Investigation Template**: Context bundle capturing file references, data flows, patterns, tables, and integration points; used by async agents

## Async Agent Integration
- Async agents are enabled by `hooks/pre-tool-use/agent-interceptor.js` and monitored by `hooks/lifecycle/agent-monitor.mjs`.
- Planning commands instruct when to spawn `Explore` agents and link their outputs under `agent-responses/`.
- Plans should include an "Investigation Artifacts" section linking these outputs.

## Investigation Documents
- Canonical template: `~/.claude/file-templates/investigation.template.md`
- Storage location: `docs/plans/[feature-name]/investigations/[topic].md`
- Referenced by: plans (all scopes) under “Investigation Artifacts” and “Relevant Context”

## Configuration
- Templates located in: `/file-templates/[template-type].template.md`
- Commands reference templates using absolute paths: `~/.claude/file-templates/`

## Usage Example
```bash
# User runs planning command
/shared

# Command reads template and instructs:
# "make a docs/plans/[plan-dir]/shared.md document...
# using the template ~/.claude/file-templates/shared.template.md"
```

## Testing
- Manual test: Run each planning command and verify it references the correct template
- Expected behavior: Commands should produce consistently structured documents following template formats

## Related Documentation
- Template files: `file-templates/`
- Init project docs: `docs/product-requirements.md`, `docs/system-design.md`, `docs/api-contracts.yaml`, `docs/data-plan.md`