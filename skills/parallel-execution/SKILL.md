---
name: Executing Work in Parallel
description: Coordinate concurrent task execution through agent delegation. Plan independent work, manage dependencies, and execute multiple agents simultaneously. Use when handling multiple unrelated tasks, research investigations, or layer-based implementations that can run concurrently.
---

# Executing Work in Parallel

## Core Pattern

Parallel execution prevents context saturation and accelerates work through concurrent processing. Key principle: **implement shared dependencies first, then launch independent agents simultaneously**.

### When to parallelize
- **2+ independent tasks** — Different files or modules without interactions
- **Research investigations** — Multiple agents exploring different aspects
- **Layer-based work** — Database → API → Frontend stages
- **Multi-file refactoring** — Changes without interdependencies

### When NOT to parallelize
- **Single file modification** — Use direct tools
- **Sequential operations** — Tasks building on each other
- **Shared resource conflicts** — Multiple agents modifying same file
- **Complex interdependencies** — Most tasks depend on others

## Execution Framework

### Phase 1: Task Analysis
1. **Map all tasks** — Comprehensive list of everything needed
2. **Identify dependencies** — Document what depends on what
3. **Group independent work** — Find tasks running simultaneously
4. **Validate groupings** — Confirm groups are truly independent

### Phase 2: Implementation

**Step 1: Shared Dependencies**
Implement first alone (shared types, interfaces, schemas, core utilities). Never parallelize these—they block other work.

**Step 2: Parallel Execution**
Use single `function_calls` block with multiple Task invocations:
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">First parallel task</parameter>
    <parameter name="subagent_type">appropriate-agent</parameter>
    <parameter name="prompt">Detailed context and instructions...</parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Second parallel task</parameter>
    <parameter name="subagent_type">appropriate-agent</parameter>
    <parameter name="prompt">Detailed context and instructions...</parameter>
  </invoke>
</function_calls>
```

**Step 3: Wait and Reassess**
Let agents complete, then:
- Review results
- Identify newly unblocked work
- Plan next batch

**Step 4: Repeat**
Continue batching until complete.

## Common Patterns

### Layer-Based
```
Stage 1: Database schema + Type definitions + Core utilities
Stage 2: Service layer + API endpoints + Frontend components
Stage 3: Tests + Documentation + Configuration
```

### Feature-Based
```
Stage 1: Independent feature implementations
Stage 2: Integration points between features
Stage 3: Cross-cutting concerns
```

### Research-First
```
Stage 1: Multiple research agents investigating aspects
Stage 2: Consolidation and planning from findings
Stage 3: Parallel implementation of requirements
```

## Agent Delegation Checklist

✅ **Provide complete context**
- Exact file paths to read for patterns
- Target files to modify
- Existing conventions to follow
- Expected output format

✅ **Use appropriate agents**
- `backend-developer` — API, services, data layers
- `frontend-ui-developer` — Components, pages, styling
- `code-finder` — Semantic searches, flow tracing
- `validation-orchestrator` — Testing and verification
- `general-purpose` — Complex multi-agent work

✅ **Respect dependencies**
- Type dependencies (interfaces others use)
- Core utilities and shared functions
- Database schemas and migrations
- API contracts and payloads
- Never parallelize dependent tasks

## Thresholds

| Metric | Threshold |
|--------|-----------|
| Minimum tasks to parallelize | 2 independent tasks |
| Optimal group size | 3-5 independent tasks |
| Maximum concurrent agents | 7-8 (diminishing returns) |

## Critical Reminders

1. **Implement shared dependencies alone first** — Types, interfaces, schemas, base utilities
2. **Single function_calls block per batch** — All parallel invocations in one call
3. **Exact file paths** — Agents need explicit guidance
4. **Think between batches** — Reassess what's unblocked after each stage
5. **Monitor context limits** — Split complex tasks rather than overload agents
6. **Quality over speed** — Correctness and correctness always supersede parallelization
