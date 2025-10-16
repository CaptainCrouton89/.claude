---
description: Comprehensive investigation with parallel agents to understand codebase and patterns
argument-hint: [F-## | S-## | API-METHOD-path]
---

# Implementation Phase 1: Investigation

Comprehensive investigation phase with parallel agent delegation to understand codebase, patterns, and constraints.

$ARGUMENTS

@docs/product-requirements.md
@docs/system-design.md
@docs/api-contracts.yaml
@docs/design-spec.md
@agent-code-finder
@agent-backend-developer
@agent-frontend-ui-developer

## Purpose

Gather complete context before planning. Understand existing patterns, integration points, constraints, and technical requirements.

## Process

### 1. Load Specification
Parse identifier from arguments (F-##, S-##, API-*, FLOW-##) and load relevant spec:
- **Feature:** Read `@docs/feature-spec/F-##-*.yaml`
- **Story:** Find in feature specs
- **API:** Read from `@docs/api-contracts.yaml`
- **Flow:** Read from `@docs/user-flows/`

### 2. Initial Scope Analysis
Identify key areas of codebase involved, integration points, technical constraints, and estimate complexity (simple/moderate/complex).

### 3. Clarifying Questions
Ask 5-7 discovery questions before delegating investigators:

**Universal questions:**
1. **Happy Path:** Successful scenario step-by-step?
2. **Edge Cases:** Empty state, invalid input, errors, large datasets?
3. **Scope Boundaries:** What's explicitly OUT of scope?
4. **Performance:** Instant (<100ms), fast (<1s), or eventual (loading)?
5. **Integration:** How does this interact with existing features/APIs/auth?
6. **Technical Constraints:** Specific patterns, libraries, or approaches required?
7. **Acceptance Criteria:** How will we know this is complete?

**Feature-specific questions:**
- **Auth:** Credentials, session duration, failure handling
- **CRUD:** Validation rules, concurrent edits, delete behavior
- **Search:** Scope, match type, timing (live/submit)
- **Real-time:** Update mechanism (polling/WebSocket), frequency
- **UI:** Design system components, responsive behavior, accessibility

**Generate technical inferences:**
```markdown
[INFER-HIGH]: JWT in httpOnly cookies (security best practice)
[INFER-MEDIUM]: Debounced search 300ms (balance UX + performance)
[INFER-LOW]: Max 100 results per page (prevent UI overload)
```

Present for confirmation before proceeding.

### 4. Delegate Investigation Agents
Based on scope analysis, spawn 2-5 investigation agents in parallel.

**Standard investigation pattern (full-stack):**

**Agent 1: Existing Patterns & Conventions**
- Prompt: "Find and document coding patterns, error handling, validation patterns, naming conventions for [feature area]."
- Focus: How similar features are implemented
- Output: `agent-responses/agent_{agent_id}.md`

**Agent 2: Related Code Structures**
- Prompt: "Find and document related code structures, similar implementations, reusable components for [feature]."
- Focus: What exists that can be leveraged or extended
- Output: `agent-responses/agent_{agent_id}.md`

**Agent 3: Integration Points & Dependencies**
- Prompt: "Document all integration points, dependencies, data flows, external APIs for [feature]."
- Focus: Where this touches other systems
- Output: `agent-responses/agent_{agent_id}.md`

**Agent 4: UI/UX Patterns (if frontend)**
- Use: `@agent-frontend-ui-developer` for pattern analysis
- Prompt: "Document component patterns, state management, styling approach, accessibility patterns for [feature]."
- Focus: Frontend-specific concerns
- Output: `agent-responses/agent_{agent_id}.md`

**Agent 5: Database & API Layer (if backend)**
- Use: `@agent-backend-developer` for pattern analysis
- Prompt: "Document data models, queries, API patterns, database schema for [feature]."
- Focus: Backend-specific concerns
- Output: `agent-responses/agent_{agent_id}.md`

**Alternative patterns:**

**For performance issues:**
- Agent 1: Frontend performance (renders, bundle, assets)
- Agent 2: API/Network (queries, payloads, caching)
- Agent 3: Backend performance (algorithms, database, external services)

**For architectural changes:**
- Agent 1: Current implementation (how it works now)
- Agent 2: Related features (integration points)
- Agent 3: Test coverage (what's tested, edge cases)

Delegate agents using `@agent-code-finder` for pattern discovery.

### 5. Monitor Investigation Progress
```markdown
## Investigation Agents Active
- [Agent {id}] Patterns investigation → agent-responses/agent_{id}.md
- [Agent {id}] Related code investigation → agent-responses/agent_{id}.md
- [Agent {id}] Integrations investigation → agent-responses/agent_{id}.md
- [Agent {id}] UI patterns investigation → agent-responses/agent_{id}.md
- [Agent {id}] Data layer investigation → agent-responses/agent_{id}.md
```

Monitor with: `./agent-responses/await {agent_id}`

### 6. Consolidate Investigation Results
Once all agents complete, synthesize findings:

```markdown
## Investigation Findings

### Key Files & Entry Points
[File paths with line numbers and purposes]

### Patterns to Follow
[Coding patterns, error handling, validation approaches]

### Integration Points
[How this connects to other systems]

### Technical Constraints
[Limitations, performance considerations, security requirements]

### Data Flow
[How data moves through the system]

### Gotchas & Edge Cases
[Important considerations and potential pitfalls]
```

### 7. Create Requirements Document
Create: `@docs/plans/implement-{item-id}-requirements.md`
- If the file does not exist, copy the scaffold from `@/file-templates/manage-project/plans/implement-requirements.md` before populating it.

Include:
- Original specification summary
- User clarifications and decisions
- Consolidated investigation findings
- Technical constraints from codebase
- Patterns and conventions to follow
- Integration requirements
- Success criteria and acceptance criteria
- File references from investigations

### 8. Present & Get Sign-Off
```markdown
## Requirements Document Complete

**Specification:** [F-##, S-##, etc.]
**Investigation Areas:** [List completed investigations]
**Key Findings:** [Highlight critical information]

**Document:** @docs/plans/implement-{item-id}-requirements.md

Ready to proceed to planning phase?
```

Wait for explicit user approval.

### 9. Handoff to Planning Phase
```markdown
✓ Investigation phase complete
✓ Requirements documented
✓ Investigation artifacts ready

**Next Step:** Run `/manage-project/implement/plan {item-id}` to create implementation plan.

The planning agent will use:
- @docs/plans/implement-{item-id}-requirements.md
- agent-responses/agent_*.md (all investigation findings)
```

## Output Artifacts

**Created:**
- `@docs/plans/implement-{item-id}-requirements.md` - Comprehensive requirements
- `agent-responses/agent_{agent_id}.md` - Investigation findings (2-5 files)

**Handoff to:** Planning phase (`/manage-project/implement/plan`)

## Edge Cases

### Simple Scope
If very simple (single file, no integration):
- Reduce to 1-2 investigation agents
- Create lightweight requirements doc
- Offer to skip straight to planning or execution

### No Existing Codebase
If building from scratch:
- Investigation focuses on: project structure, framework patterns, design system
- Document: scaffolding approach, folder structure, base utilities

### Complex Cross-Cutting Feature
If affects many systems:
- Spawn additional investigation agents (up to 6)
- Organize findings by subsystem

### Investigation Reveals Blockers
If critical blockers found:
- Document blockers clearly
- Identify resolution approaches
- May need to update specification or defer implementation
- Present options to user
