# Parallel Execution and Agent Management Guide

## Core Philosophy

Parallelization through agent delegation is a powerful strategy for efficient task execution. By distributing work across multiple specialized agents, we prevent context window saturation, improve success rates, and enable concurrent processing of independent tasks.

## Fundamental Principles

### 1. Task Independence Analysis
Before parallelizing, critically analyze task relationships:
- **Independent tasks**: Can execute simultaneously without affecting each other
- **Dependent tasks**: Require completion of prerequisite tasks before starting
- **Critical path**: The sequence of dependent tasks that determines minimum completion time

### 2. Dependency Management
Dependencies are critical and must be strictly respected:
- **Type dependencies**: Interfaces, types, and schemas that other code relies on
- **Core utilities**: Shared functions, helpers, and base classes
- **Database schemas**: Table structures and migrations that affect data access
- **API contracts**: Endpoints and payloads that consumers depend on

Tasks with dependencies MUST run after their prerequisites complete.

## Execution Strategy

### Phase 1: Analysis
1. **Map all tasks**: Create comprehensive list of everything that needs to be done
2. **Identify dependencies**: Document which tasks depend on others
3. **Group independent work**: Find tasks that can run simultaneously
4. **Validate groupings**: Double-check that grouped tasks are truly independent

### Phase 2: Implementation
1. **Execute independent groups**: Run all tasks in a group simultaneously
2. **Wait for completion**: Let all agents in the group finish
3. **Analyze results**: Review what was accomplished
4. **Plan next batch**: Based on completed work, identify what can now be done
5. **Repeat**: Continue until all tasks are complete

## Agent Management Best Practices

### Agent Limitations
- **Context capacity**: Agents have limited context windows - don't overload them
- **Instruction processing**: Too many instructions reduce agent effectiveness
- **Knowledge gaps**: Agents don't inherit your context - provide necessary information

### Optimal Agent Usage
- **One primary task per agent**: Focus agents on single, well-defined objectives
- **Provide context**: Tell agents which files to read for background knowledge
- **Clear instructions**: Be specific about what needs to be done and where
- **Right agent for the job**: Use specialized agents for their intended purposes

### Context Provision Strategy
When delegating to agents, include:
- **Relevant file paths**: Exact locations of files to read or modify
- **Documentation references**: Links to relevant docs or specifications
- **Critical context**: Key information the agent needs but won't discover independently
- **Success criteria**: Clear definition of task completion

## Parallel Execution Syntax

Always use a single `function_calls` block for parallel execution:

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">First parallel task</parameter>
    <parameter name="subagent_type">appropriate-agent-type</parameter>
    <parameter name="prompt">Detailed instructions...</parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Second parallel task</parameter>
    <parameter name="subagent_type">appropriate-agent-type</parameter>
    <parameter name="prompt">Detailed instructions...</parameter>
  </invoke>
  <invoke name="Bash">
    <parameter name="command">concurrent command</parameter>
  </invoke>
</function_calls>
```

## Decision Framework

### When to Parallelize
- **Multiple independent changes**: Different files or modules that don't interact
- **Research tasks**: Investigating different aspects of a problem
- **Test suites**: Running different test categories
- **Documentation updates**: Updating different doc sections
- **Multi-file refactoring**: When changes don't have interdependencies

### When NOT to Parallelize
- **Single file modification**: One focused change in one location
- **Sequential operations**: Tasks that naturally build on each other
- **Shared resource conflicts**: Multiple agents modifying the same file
- **Complex interdependencies**: When most tasks depend on others

### Parallelization Thresholds
- **Minimum**: Only parallelize when 2+ independent tasks exist
- **Optimal**: Groups of 3-5 independent tasks per batch
- **Maximum**: Avoid more than 7-8 concurrent agents (diminishing returns)

## Common Patterns

### Pattern 1: Layer-Based Parallelization
```
Stage 1: Database schema + Type definitions + Core utilities
Stage 2: Service layer + API endpoints + Frontend components
Stage 3: Tests + Documentation + Configuration
```

### Pattern 2: Feature-Based Parallelization
```
Stage 1: Independent feature implementations
Stage 2: Integration points between features
Stage 3: Cross-cutting concerns and polish
```

### Pattern 3: Research-First Parallelization
```
Stage 1: Multiple research agents investigating different aspects
Stage 2: Consolidation and planning based on findings
Stage 3: Parallel implementation of discovered requirements
```

## Critical Reminders

1. **Everything must be delegated**: Don't implement tasks yourself if they can be delegated
2. **Respect dependencies**: Never parallelize dependent tasks
3. **Think between batches**: Reassess what's possible after each stage completes
4. **Provide sufficient context**: Agents need explicit guidance and file references
5. **Monitor agent limits**: Split complex tasks rather than overloading single agents
6. **Use appropriate agents**: Match agent specialization to task requirements

## Post-Batch Analysis

After each parallel batch completes:
1. Review what was accomplished
2. Identify any new dependencies or blockers
3. Determine what's now unblocked
4. Plan the next optimal batch
5. Continue until all tasks complete

Remember: The goal is efficient execution through smart parallelization, not maximum parallelization at all costs. Quality and correctness always supersede speed.