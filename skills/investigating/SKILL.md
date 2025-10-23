---
name: Investigating Code Patterns
description: Systematically trace code flows, locate implementations, diagnose performance issues, and map system architecture. Use when understanding how existing systems work, researching concepts, exploring code structure, or answering "how/where/why is X implemented?" questions.
---

# Investigating Code Patterns

## When to Use This Skill

- Understanding how existing systems work end-to-end
- Researching concepts or technologies in your codebase
- Exploring code structure, patterns, and dependencies
- Answering "how/where/what" questions about implementations
- NOT for building new features (use implementation skills for that)

## Core Investigation Types

### 1. Code Flow: "How does X work?"
Trace execution end-to-end from entry point to outcome.

**Steps:**
1. Find the entry point (API endpoint, component, function)
2. Trace function calls and data transformations
3. Follow imports and dependencies
4. Identify key decision points and error handling

### 2. Code Location: "Where is X implemented?"
Find where functionality lives in the codebase.

**Steps:**
1. Search for relevant keywords using grep
2. Check related files and modules
3. Identify main implementation and supporting files
4. Verify entry points and usage patterns

### 3. Performance Analysis: "Why is X slow?"
Diagnose bottlenecks using 3-phase approach.

**Phase 1: Locate bottleneck**
- Find entry point where slowness occurs
- Trace execution path
- Identify all operations (DB queries, API calls, compute, I/O)
- Look for obvious issues: N+1 queries, nested loops, large payloads

**Phase 2: Root cause (if unclear)**
- Generate hypotheses ranked by likelihood
- Validate with evidence from code

**Phase 3: Fix or instrument**
- If fix clear → implement optimization
- If uncertain → add logging/profiling for user testing

**Common performance patterns:**

| Pattern | Symptoms | Fix Direction |
|---------|----------|---------------|
| N+1 queries | Sequential DB calls | Batch/eager loading |
| Algorithmic complexity | Grows with data | Optimize algorithm |
| Large payload | Network time high | Pagination/filtering |
| Missing cache | Same data fetched repeatedly | Add caching |
| Sequential operations | Waits in series | Parallelize |

### 4. Architecture Mapping: "How is X structured?"
Understand system organization, components, and integration points.

**Steps:**
1. Map component boundaries and responsibilities
2. Identify data flow patterns between layers
3. Document integration points and dependencies
4. Trace external service interactions

## Investigation Strategy

### Start with Documentation
Read in this order:
1. `docs/product-requirements.md` — project overview and features (F-##)
2. `docs/feature-spec/F-##-*.md` — technical details
3. `docs/system-design.md` — architecture
4. `docs/api-contracts.yaml` — API reference

### Choose Your Tools

**For known file paths:**
- `Read` — examine specific files directly

**For pattern searches:**
- `Grep` — find exact text matches (function names, imports, error messages)
- `Glob` — discover files by name pattern

**For semantic queries:**
- Launch `context-engineer` agent for complex, multi-file pattern discovery
- Use `senior-engineer` agent for subtle performance bottlenecks

### Parallel Investigation

Launch 2-4 independent agents for large codebases:

**Full-stack flow:**
- Agent 1: Frontend (UI, state, API calls)
- Agent 2: Backend (endpoints, services, database)
- Agent 3: Integration (tests, config, external APIs)

**Multi-service architecture:**
- Agent 1: Auth (authentication, tokens)
- Agent 2: User service (profile, sync)
- Agent 3: Authorization (permissions, RBAC)

**Performance issues:**
- Agent 1: Frontend perf (renders, bundle, assets)
- Agent 2: API/network (queries, payloads, caching)
- Agent 3: Backend perf (algorithms, database, services)

## Documenting Findings

### Code Flow Template
```markdown
## How [Feature] Works

### Purpose
[Brief description and why it exists]

### High-Level Flow
1. User action triggers [component/function] (file:line)
2. [Step 2 with file:line reference]
3. [Step 3 with file:line reference]
4. Final outcome

### Key Files
- `path/to/file.ts:123` - [Purpose]
- `path/to/other.ts:45` - [Purpose]

### Important Details
- Error handling: [Approach with file references]
- Edge cases: [How handled]
- Security: [Considerations if applicable]
```

### Code Location Template
```markdown
## Location: [Functionality]

### Main Implementation
`path/to/file.ts:45-120` - [Purpose]

### Related Files
- `path/component.tsx` - UI layer
- `path/service.ts` - Business logic
- `path/api.ts` - API integration

### Entry Points
1. [How users trigger this]
2. [System-initiated triggers]
```

### Performance Analysis Template
```markdown
## Performance Analysis: [Feature]

### Symptoms
- Slow when: [Condition]
- Observed: [X] seconds
- Expected: [Y] seconds

### Root Cause
[What's causing it with file:line evidence]

### Fix Options
**Option A: [Name]**
- Change: [What to do]
- Impact: [Expected improvement]
- Effort: [Time estimate]

**Recommendation:** [Which option and why]
```

### Architecture Mapping Template
```markdown
## Architecture: [System/Feature]

### Overview
[High-level description]

### Component Breakdown
**[Layer/Module Name]:**
- Responsibility: [What it does]
- Key files: [File paths]
- Dependencies: [What it needs]

### Data Flow
[Step-by-step or diagram]

### Integration Points
- [External services]
- [Related features]
```

## Investigation Workflow

1. **Clarify the question** — What are you trying to understand?
2. **Read project docs** — Start with overview, feature specs, architecture
3. **Choose investigation type** — Flow, location, performance, or architecture
4. **Search strategically** — Use direct tools or delegate to agents
5. **Document with file references** — Use `file:line` format for all findings
6. **Offer next steps** — Deeper investigation, documentation, or implementation

## Key Principles

- **File references matter** — Always cite `file:line` for evidence
- **Evidence-based** — Quote actual code, don't guess
- **Multi-domain issues need parallel agents** — Frontend + backend require separate investigators
- **Start simple** — Use direct grep/read before delegating
- **Consolidate findings** — Synthesize parallel agent results into coherent explanation
