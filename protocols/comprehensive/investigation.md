# Investigation Protocol

Systematic approach to understanding codebases, tracing flows, analyzing performance, and answering "how/where/what" questions.

## Artifacts

**Inputs:**
- `docs/product-requirements.md` - Project overview and features (F-##)
- `docs/feature-spec/F-##-*.md` - Technical details
- `docs/system-design.md` - Architecture
- `docs/api-contracts.yaml` - API reference

**Outputs:**
- Investigation findings

**Handoffs:**
- Planning agents read investigation findings to create plans
- Implementation agents read investigation + plan files for context
- Documentation agents read investigation to create architecture docs

## Naming Conventions
- Investigation artifacts: `agent-responses/agent_<id>.md`
- Reports: inline or `docs/investigations/<topic-slug>.md`

## When to Use
- Understanding how existing systems work
- Researching concepts or technologies
- Exploring code structure and patterns
- Learning how things are implemented (NOT building new things)

## Core Steps

### 1. Clarify Investigation Type
**Ask: What are you trying to understand?**

1. **Code flow:** "How does X work end-to-end?"
2. **Code location:** "Where is X implemented?"
3. **Performance analysis:** "Why is X slow?"
4. **Architecture understanding:** "How is X structured?"
5. **Pattern discovery:** "Where do we do Y in the codebase?"

**Read project documentation first:**
- `docs/product-requirements.md` for project overview and features (F-##)
- `docs/feature-spec/F-##-*.md` for technical details
- `docs/system-design.md` for architecture
- `docs/api-contracts.yaml` for API reference

### 2. Investigation Strategy
**Choose approach based on scope:**

**Direct search (simple queries):**
- Known file path → use `read_file`
- Simple pattern → use `grep`
- File by name → use `glob_file_search`

**Single agent investigation:**
- Clear entry point, single domain
- Sequential discovery needed
- Small codebase or focused area

**Parallel agent investigation:**
- Multi-domain (frontend + backend + database)
- Independent search spaces
- Large codebase or complex flows
- 2-4 agents optimal

### 3. Agent Selection
**Choose agent by investigation need:**

| Investigation Type | Agent | Why |
|-------------------|-------|-----|
| Find specific code/files | `code-finder` | Pattern discovery, file location |
| Trace multi-file flows | `code-finder` | End-to-end flow analysis |
| Architecture mapping | `code-finder` | System structure understanding |
| Performance diagnosis | `root-cause-analyzer` | Bottleneck identification, hypothesis generation |
| Pattern analysis | `general-purpose` | Cross-cutting analysis |

### 4. Parallel Investigation Patterns
**When to parallelize (2-4 agents):**

**Pattern 1: Full-stack flow investigation**
- Agent 1: Frontend flow (UI components, state, API calls)
- Agent 2: Backend flow (endpoints, services, database)
- Agent 3: Integration points (tests, config, external APIs)

**Pattern 2: Multi-service architecture**
- Agent 1: Auth service (authentication, token management)
- Agent 2: User service (profile, data sync)
- Agent 3: Authorization (middleware, permissions, RBAC)

**Pattern 3: Performance investigation**
- Agent 1: Frontend performance (renders, bundle, assets)
- Agent 2: API/Network (queries, payloads, caching)
- Agent 3: Backend performance (algorithms, database, external services)

**Pattern 4: Feature archaeology**
- Agent 1: Current implementation (how it works now)
- Agent 2: Related features (integration points)
- Agent 3: Test coverage (what's tested, edge cases)

**Delegate parallel investigation agents** for independent domains. Results saved to `agent-responses/agent_<id>.md`.

Wait for results: `./agent-responses/await {agent_id}`

### 5. Investigation Output Templates

**For Code Flow Explanation:**
```markdown
## How [Feature] Works

### Purpose
[Brief description and why it exists]

### High-Level Flow
1. User action triggers [component/function]
2. [Step 2 with file:line reference]
3. [Step 3 with file:line reference]
4. Final outcome

### Key Files
- `path/to/file.ts:123` - [Purpose]
- `path/to/other.ts:45` - [Purpose]

### Data Flow
**Input:** [Structure]
**Processing:** [Steps with file references]
**Output:** [Result]

### Important Details
- Security: [Considerations]
- Error handling: [Approach]
- Edge cases: [How handled]
```

**For Performance Investigation:**
```markdown
## Performance Analysis: [Feature]

### Symptoms
- Slow when: [Condition]
- Observed: [X] seconds
- Expected: [Y] seconds

### Investigation
**Phase 1: Locate bottleneck**
[File:line where slowness occurs]

**Phase 2: Root cause**
[What's causing it - with evidence]

### Fix Options
**Option A: [Name]**
- Change: [What to do]
- Impact: [Expected improvement]
- Risk: [Assessment]
- Effort: [Time estimate]

**Recommendation:** [Which option and why]
```

**For Code Location:**
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

### Usage Example
[Code snippet showing how to use]
```

**For Architecture Mapping:**
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
[Diagram or step-by-step flow]

### Integration Points
- [External services]
- [Related features]
```

### 6. Performance Investigation (Special Flow)
**3-phase approach for "Why is X slow?"**

**Phase 1: Locate the slow operation**
- Use `code-finder` to find entry point
- Trace execution path
- Identify all operations (DB, API, compute, I/O)
- Look for obvious issues (N+1 queries, nested loops, large payloads)

**Phase 2: Analyze root cause**
- If obvious → skip to Phase 3
- If unclear → use `root-cause-analyzer`
  - Generate 5-8 hypotheses
  - Rank by likelihood
  - Identify validation approach

**Common performance patterns:**
| Pattern | Symptoms | Fix Direction |
|---------|----------|---------------|
| N+1 queries | Multiple sequential DB calls | Batch/eager loading |
| Algorithmic complexity | Grows with data | Optimize algorithm |
| Large payload | Network time high | Pagination/filtering |
| Missing cache | Same data fetched repeatedly | Add caching |
| Sequential operations | Waits in series | Parallelize |

**Phase 3: Fix or instrument**
- If fix clear → implement optimization
- If uncertain → add logging/profiling and ask user to test

### 7. Consolidate & Present
**Synthesize findings from parallel agents:**
- Combine into coherent explanation
- Cross-reference between layers
- Verify no contradictions
- Provide file:line references throughout

**Present with context from docs:**
- Reference Feature IDs (F-##) if applicable
- Link to relevant specs or design docs
- Note any deviations from documented behavior

### 8. Offer Next Steps & Artifact Handoff
**After investigation, ask:**
1. **Implement fix?** (if issue found) → Pass `agent-responses/agent_<id>.md` to implementation agents
2. **Deeper dive?** (explain specific part)
3. **Related investigation?** (explore connected area)
4. **Documentation?** (create architecture docs or diagrams)
5. **Create plan?** → Pass investigation artifacts to planning agent

**If investigation reveals documentation gaps in structured projects:**
- Run `/manage-project/add/add-feature` if discovered feature isn't documented
- Run `/manage-project/add/add-api` if found undocumented API endpoints
- Run `/manage-project/update/update-requirements` if scope/requirements are outdated
- Run `/manage-project/validate/check-consistency` to verify current state

**Artifact Handoff Pattern:**
Investigation findings in `agent-responses/agent_<id>.md` become input for:
- **Planners:** Read investigation to create comprehensive plans
- **Implementers:** Read investigation + plan for complete context
- **Documenters:** Read investigation to create architecture docs
- **Other investigators:** Build on previous findings

## Agent Strategy

**Research phase:**
- 2-4 agents for parallel investigation of independent domains
- Each focuses on one subsystem, layer, or perspective
- Max 6 agents (diminishing returns)

**Analysis phase:**
- Usually consolidate yourself
- May delegate to `root-cause-analyzer` for complex performance issues

**Documentation phase:**
- May delegate to `documentor` to create architecture docs from findings

