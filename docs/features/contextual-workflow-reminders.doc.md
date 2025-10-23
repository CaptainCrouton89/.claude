# Contextual Workflow Reminders

## Overview
An intelligent hook system that detects user intent patterns and provides contextual workflow guidance for investigation, planning, parallelization, and prompt optimization tasks.

## User Perspective
When users write requests containing specific keywords or patterns, the system automatically provides relevant workflow reminders and best practices. This happens transparently through the hook system, appearing as system reminders in the chat interface to guide users toward effective task execution.

## Data Flow
1. User submits a request through the Claude interface
2. Pre-processing hook analyzes the prompt text for trigger patterns
3. Pattern matching engine identifies workflow category (investigation, planning, parallelization, or prompt optimization)
4. System displays appropriate contextual reminder with specific guidance
5. User receives targeted workflow advice before task execution begins

## Implementation

### Key Files
- `hooks/custom-reminder.py` - Main hook implementation with pattern detection and guidance prompts
- `guides/parallel.md` - Referenced guide for parallel execution best practices

### Pattern Detection
- **Investigation patterns**: `INVESTIGATION_PATTERNS` - Detects research, investigation, and discovery tasks
- **Planning patterns**: `PLANNING_PATTERNS` - Detects plan creation and implementation planning requests
- **Parallelization patterns**: `PARALLEL_PATTERNS` - Detects parallel execution and concurrent task requests
- **Prompt improvement patterns**: `PROMPT_IMPROVEMENT_PATTERNS` - Detects prompt optimization needs

### Workflow Guidance

#### Planning Workflow (`PLANNING_PROMPT`)
Comprehensive guidance for creating implementation plans including:
- Investigation requirements before planning
- Plan structure (summary, reasoning, current system, new design)
- Specific file path requirements
- What to exclude from plans

#### Investigation Workflow (`INVESTIGATION_PROMPT`)
Best practices for code discovery and analysis:
- When to use context-engineer vs direct tools
- Multiple agent strategies for complex investigations
- Flow from context gathering to implementation

#### Parallel Execution (`PARALLEL_PROMPT`)
References the comprehensive parallel execution guide at `~/.claude/guides/parallel.md` for:
- Dependency analysis
- Execution strategies
- Agent management best practices

## Configuration
- Pattern matching uses regex for flexible detection
- Prompts are modular and can be updated independently
- Exit codes prevent multiple reminder triggers

## Usage Example
```bash
# User input: "Make a plan for user authentication"
# Triggers: PLANNING_PATTERNS match
# Result: PLANNING_PROMPT displayed with comprehensive planning guidance

# User input: "Investigate how payments work"
# Triggers: INVESTIGATION_PATTERNS match
# Result: INVESTIGATION_PROMPT displayed with discovery workflow guidance
```

## Testing
- Manual test: Submit requests with trigger keywords and verify appropriate reminders appear
- Expected behavior: Single, relevant workflow reminder should display before task execution

## Related Documentation
- Guide: `guides/parallel.md` - Comprehensive parallel execution guidance
- Implementation: `hooks/custom-reminder.py` - Hook source code