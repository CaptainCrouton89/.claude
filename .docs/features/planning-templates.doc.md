# Planning Templates System

## Overview
Centralized template system for planning commands that moves template formats from inline documentation to reusable template files in the `/file-templates/` directory.

## User Perspective
When users run planning commands (`/shared`, `/requirements`, `/parallel`), the commands now reference standardized templates that ensure consistent document structure across all planning phases. The commands guide users through the same structured approach while reducing duplication in command definitions.

## Data Flow
1. User runs planning command (e.g., `/shared`, `/requirements`, `/parallel`)
2. Command reads template from `/file-templates/[command-type].template.md`
3. Command instructs user to follow template format for document creation
4. Resulting documents maintain consistent structure across planning phases
5. Templates ensure standardized sections for files, dependencies, and implementation details

## Implementation

### Key Files
- `commands/plan/shared.md` - Shared context planning command that references shared.template.md
- `commands/plan/requirements.md` - Requirements gathering command that references requirements.template.md
- `commands/plan/parallel.md` - Parallel implementation planning command that references parallel.template.md
- `file-templates/shared.template.md` - Template for shared context documents
- `file-templates/requirements.template.md` - Template for requirements documents
- `file-templates/parallel.template.md` - Template for parallel implementation plans

### Template Structure
- **Shared Template**: Defines structure for listing relevant files, tables, patterns, and documentation
- **Requirements Template**: Provides format for user flows, functional requirements, and file references
- **Parallel Template**: Outlines structure for implementation phases, task dependencies, and file operations

## Configuration
- Templates located in: `/file-templates/[template-type].template.md`
- Commands reference templates using absolute paths: `/Users/silasrhyneer/.claude/file-templates/`

## Usage Example
```bash
# User runs planning command
/shared

# Command reads template and instructs:
# "make a .docs/plans/[plan-dir]/shared.md document...
# using the template /Users/silasrhyneer/.claude/file-templates/shared.template.md"
```

## Testing
- Manual test: Run each planning command and verify it references the correct template
- Expected behavior: Commands should produce consistently structured documents following template formats

## Related Documentation
- Planning workflow: `commands/plan/`
- Template files: `file-templates/`