# Protocol Directory Structure

This directory contains protocol definitions organized by development activity type. Each protocol provides specialized guidance for specific workflow patterns.

## Directory Organization

Each protocol subdirectory follows this structure:
- `strong.md` - Comprehensive protocol with detailed guidance (always present)
- `moderate.md` - Optional lighter-weight variant for simpler scenarios

## Available Protocols

### Development Activities
- **feature-development** - Building new functionality with parallel implementation patterns
- **bug-fixing** - Systematic debugging with root cause analysis
- **code-review** - Quality assessment and improvement recommendations
- **testing** - Test strategy, implementation, and validation

### Analysis & Planning
- **investigation** - Deep codebase exploration and pattern discovery
- **planning** - Breaking down complex work into parallelizable tasks
- **requirements-gathering** - Extracting and clarifying project needs

### Documentation & Security
- **documentation** - Creating technical docs, guides, and API references
- **security-audit** - Security analysis and vulnerability detection

### Meta
- **claude** - Working with Claude Code configuration and hooks

## Protocol Selection

**When to use protocols:**
- Activity-tracker hook automatically loads relevant protocol based on task classification
- Protocols provide specialized tool usage patterns and parallel execution strategies
- Each protocol optimizes workflow for specific development patterns

**Protocol intensity:**
- Use `strong.md` for complex, multi-step work requiring systematic approach
- Use `moderate.md` (when available) for simpler, focused tasks

## Key Patterns Across Protocols

### Parallel Execution
All protocols emphasize parallelization when appropriate:
- Launch 2+ agents for independent tasks in single message
- Batch tool calls (reads, searches) for efficiency
- Create shared dependencies first, then spawn parallel work

### Strategic Tool Usage
- **code-finder** - Quick location of specific code elements
- **code-finder-advanced** - Deep semantic analysis across codebase
- **root-cause-analyzer** - Systematic bug diagnosis
- **frontend-ui-developer** - UI component creation following design patterns
- **backend-developer** - API/service implementation with architectural consistency

### Evidence-Based Approach
- Read files directly to verify behavior
- Search for existing patterns before creating new code
- Base decisions on actual implementation, not assumptions

## Workflow Philosophy

1. **Investigate First** - Gather context through parallel research
2. **Plan Strategically** - Break work into independent, parallelizable units
3. **Execute Efficiently** - Launch agents for complex work, work directly for simple changes
4. **Validate Thoroughly** - Test, review, and verify all changes

## Integration with Activity Tracking

Protocols work with the activity-tracker hook:
- Hook detects activity type from conversation context
- Appropriate protocol loaded automatically
- Protocol guides tool usage and execution strategy
- State tracking maintains context across protocol phases
