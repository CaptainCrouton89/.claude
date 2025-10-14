# Investigation Protocol (Basic)

Streamlined approach to understanding codebases, tracing flows, and answering "how/where/what" questions using direct tools.

## Artifacts

**Inputs:**
- `docs/charter.md` - Project overview
- `docs/product-requirements.md` - Features (F-##)
- `docs/feature-spec/F-##-*.md` - Technical details
- `docs/system-design.md` - Architecture
- `docs/api-contracts.yaml` - API reference

**Outputs:**
- Investigation findings (inline or brief report)

## When to Use
- Understanding how existing systems work
- Researching concepts or technologies
- Exploring code structure and patterns
- Learning how things are implemented (NOT building new things)

## Core Steps

### 1. Read Project Documentation
**Start with existing docs:**
- `docs/charter.md` for project overview
- `docs/product-requirements.md` for features (F-##)
- `docs/feature-spec/F-##-*.md` for technical details
- `docs/system-design.md` for architecture
- `docs/api-contracts.yaml` for API reference

### 2. Investigation Strategy
**Use direct tools based on what you need to find:**

**For known file paths:**
- Use `read_file` to examine specific files
- Use `list_dir` to explore directory structure

**For pattern searches:**
- Use `grep` for exact text matches (function names, imports, error messages)
- Use `codebase_search` for semantic queries ("how does authentication work?")

**For file discovery:**
- Use `glob_file_search` for files by name pattern

### 3. Trace and Analyze
**Follow the code flow:**

**For code flow investigation:**
- Find entry point (API endpoint, component, function)
- Trace function calls and data transformations
- Follow imports and dependencies
- Identify key decision points

**For code location:**
- Search for relevant keywords
- Check related files and modules
- Identify main implementation and helpers

**For performance analysis:**
- Locate the slow operation
- Identify all operations (DB, API, compute, I/O)
- Look for obvious issues (N+1 queries, nested loops, large payloads)

**For architecture understanding:**
- Map component boundaries
- Identify data flow patterns
- Document integration points

### 4. Document Findings
**Present concise findings with file references:**

**For Code Flow:**
```markdown
## How [Feature] Works

### Purpose
[Brief description]

### High-Level Flow
1. [Step 1 with file:line reference]
2. [Step 2 with file:line reference]
3. [Step 3 with file:line reference]
4. [Final outcome]

### Key Files
- `path/to/file.ts:123` - [Purpose]
- `path/to/other.ts:45` - [Purpose]
```

**For Code Location:**
```markdown
## Location: [Functionality]

### Main Implementation
`path/to/file.ts:45-120` - [Purpose]

### Related Files
- `path/component.tsx` - [Purpose]
- `path/service.ts` - [Purpose]

### Entry Points
[How this gets triggered]
```

**For Performance Investigation:**
```markdown
## Performance Analysis: [Feature]

### Issue
- Slow when: [Condition]
- Observed: [X] seconds

### Root Cause
[What's causing it - with file:line evidence]

### Fix Options
**Option A:** [Description]
- Impact: [Expected improvement]
- Effort: [Estimate]

**Recommendation:** [Which option and why]
```

**For Architecture Mapping:**
```markdown
## Architecture: [System/Feature]

### Overview
[High-level description]

### Component Breakdown
**[Module Name]:**
- Responsibility: [What it does]
- Key files: [Paths]
- Dependencies: [What it needs]

### Integration Points
- [External services or related features]
```

## Investigation Patterns

**Common patterns by investigation type:**

| Investigation Type | Tools to Use | Focus |
|-------------------|--------------|-------|
| Find specific code | `grep`, `glob_file_search` | Pattern matching, file location |
| Trace flows | `read_file`, `codebase_search` | Follow execution path |
| Architecture mapping | `codebase_search`, `read_file` | System structure |
| Performance diagnosis | `grep`, `read_file` | Bottleneck identification |

**Performance investigation patterns:**

| Pattern | Symptoms | Fix Direction |
|---------|----------|---------------|
| N+1 queries | Multiple sequential DB calls | Batch/eager loading |
| Algorithmic complexity | Grows with data | Optimize algorithm |
| Large payload | Network time high | Pagination/filtering |
| Missing cache | Same data fetched repeatedly | Add caching |
| Sequential operations | Waits in series | Parallelize |

