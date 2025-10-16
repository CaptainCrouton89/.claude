---
name: Planning Implementation
description: Create structured implementation plans before coding. Use when breaking down complex features, refactors, or system changes. Validates requirements, analyzes codebase impact, and produces actionable task breakdowns with identified dependencies and risks.
---

# Planning Implementation

## When to Use

- Creating structured approach BEFORE implementing
- Breaking down complex work into steps
- Designing architecture for new features
- Planning refactoring or system changes
- Analyzing impact before major changes

## Core Steps

### 1. Clarify Requirements (if ambiguous)

**Ask discovery questions** (5-7 max):

1. **Happy Path:** Describe successful scenario step-by-step
2. **Edge Cases:** Empty state, invalid input, errors, large datasets?
3. **Scope Boundaries:** What's explicitly OUT of scope?
4. **Performance:** Instant (<100ms), fast (<1s), or eventual (loading)?
5. **Integration:** Interactions with existing features, APIs, auth?

**Feature-specific questions:**
- **Auth:** Credentials approach, session duration, failure handling?
- **CRUD:** Validation rules, concurrent edits, delete behavior?
- **Search:** Scope, match type, timing (live/submit)?
- **Real-time:** Update mechanism (polling/WebSocket), frequency, offline?

**Generate inferences with confidence levels:**
```markdown
[INFER-HIGH]: JWT in httpOnly cookies (security best practice)
[INFER-MEDIUM]: Debounced search 300ms (balance UX + performance)
[INFER-LOW]: Max 100 results per page (prevent UI overload)
```

**Get approval before proceeding** if requirements are unclear.

### 2. Investigation Phase (CRITICAL)

**Read project documentation first:**
- `docs/product-requirements.md` - project goals, existing features (F-##)
- `docs/feature-spec/F-##-*.md` - technical details
- `docs/system-design.md` - architecture patterns
- `docs/api-contracts.yaml` - API standards
- `docs/design-spec.md` - UI patterns

**Investigation checklist:**
- [ ] ALL affected files identified (complete impact analysis)
- [ ] Current system architecture understood
- [ ] All dependencies and integration points mapped
- [ ] Existing patterns and conventions documented
- [ ] Data models and schemas reviewed
- [ ] Current data flows traced
- [ ] ALL call sites found (especially for refactors)
- [ ] Test impact assessed
- [ ] Breaking changes identified

**Investigation approach (choose based on scope):**

**Small/contained features:**
Use direct tools (Grep, Glob, Read) for focused analysis.

**Large/complex changes or refactors:**
Delegate to `code-finder` agents in parallel for comprehensive impact analysis:
- Find ALL affected files across codebase
- Identify every usage, call site, and dependency
- Map integration points and data flows
- Discover existing patterns to follow
- Identify breaking changes and ripple effects

**Parallel investigation patterns:**

**Pattern 1: Full-stack feature/refactor**
- Agent 1: Backend analysis (services, APIs, models, call sites, integrations)
- Agent 2: Frontend analysis (components, state, API clients, dependencies)
- Agent 3: Data layer (schema, queries, migrations, integrity)

**Pattern 2: Architecture + integration**
- Agent 1: Current system (organization, stack, patterns, boundaries)
- Agent 2: Integration needs (external APIs, auth, database, libraries)

**Pattern 3: Single domain** (contained feature)
- Agent 1: Complete domain analysis (ALL files, call sites, dependencies, imports, tests, config)

### 3. Create Implementation Plan

**Write plan to `docs/plans/[feature-slug]/plan.md`**

Use templates for structure:
- Small: `~/.claude/file-templates/plan.quick.template.md`
- Medium: `~/.claude/file-templates/plan.template.md`
- Large: `~/.claude/file-templates/plan.comprehensive.template.md`

**Plan template structure:**

```markdown
# Implementation Plan: [Feature Name]

## Overview
[Brief description of what we're building and why]

## Requirements Summary
[Key requirements from clarification phase]

## Investigation Artifacts
[Link agent responses or summarize findings]

## Tasks

### Task 1: [Name]
**What:** [What needs to be done]
**Files:** [Files to create/modify]
**Dependencies:** None / Requires Task X

### Task 2: [Name]
**What:** [What needs to be done]
**Files:** [Files to create/modify]
**Dependencies:** Requires Task 1

## Parallelization Opportunities
[Identify groups of independent tasks]

## Integration Points
- [External systems or APIs]
- [Existing features that interact]

## Testing Strategy
- [Key test scenarios]
- [Coverage requirements]

## Risks
- [Potential issues or unknowns]
- [Breaking changes]

## Key Decisions
- [Important technical decisions with reasoning]
```

**Plan size: 3-6 main tasks** (break complex work into manageable chunks)

**Identify parallelization:**
```markdown
## Batch 1 (Parallel - no shared dependencies)
- Task 1: Backend API endpoint
- Task 2: Frontend component
- Task 3: Database migration

## Batch 2 (Sequential - depends on Batch 1)
- Task 4: Integration layer
- Task 5: Tests
```

**Default to sequential unless clear benefit to parallel execution.**

### 4. Link Plan to Project Docs (if applicable)

Update project documentation using available commands:

**Before implementation:**
- Validate current documentation state
- Add new features if plan introduces them (creates F-## IDs, entries)
- Update requirements if plan changes scope, metrics, or risks

**After implementation:**
- Add user stories linked to features
- Add new API endpoints
- Update design if UI components or patterns were added

**Documentation scope:**
- `docs/product-requirements.yaml`
- `docs/feature-specs/F-##-[slug].yaml`
- `docs/user-stories/US-###-[slug].yaml`
- `docs/api-contracts.yaml`
- `docs/system-design.yaml`
- `docs/data-plan.yaml`
- `docs/design-spec.yaml`

### 5. Present Plan for Approval

Share:
- Key tasks (3-6 items)
- Major integration points
- Any breaking changes
- Parallelization opportunities

**Get explicit approval before implementation.**

## Investigation Checklist by Category

**For new features:**
- [ ] Read existing feature specs for patterns
- [ ] Check system design for architecture guidance
- [ ] Review API contracts for naming conventions
- [ ] Examine similar features in codebase
- [ ] Identify all affected domains

**For refactors:**
- [ ] Find ALL files importing/using the code
- [ ] Identify ALL call sites (not just obvious ones)
- [ ] Locate ALL tests
- [ ] Check configuration files
- [ ] Find documentation references
- [ ] Identify ripple effects

**For integrations:**
- [ ] Review existing integration patterns
- [ ] Check authentication/authorization approach
- [ ] Understand error handling conventions
- [ ] Identify shared utilities
- [ ] Map external API dependencies

## Common Patterns

### Quick Planning (Small changes)

```markdown
# Plan: [Feature Name]

## Goal
[What we're building and why]

## Tasks
1. [Task] - [Files] - [Dependencies]
2. [Task] - [Files] - [Dependencies]
3. [Task] - [Files] - [Dependencies]

## Key Decisions
- [Important technical decision with reasoning]

## Risks
- [Potential issues]
```

### Investigation Tools

**Direct investigation:**
- `Read` - Examine existing code and docs
- `Grep` - Find all usages, imports, call sites
- `Glob` - Find files by pattern

**Comprehensive investigation (refactors, large features):**
```bash
# Find all imports
grep -r "import.*ComponentName" --include="*.tsx"

# Find all usages
grep -r "ComponentName" --include="*.ts"

# Find tests
grep -r "describe.*ComponentName" --include="*.test.ts"
```

**For parallel analysis:**
- Delegate `code-finder` agents for pattern discovery
- Monitor agent responses from `agent-responses/` directory
- Link investigation artifacts in final plan

## Example: Planning a New API Feature

### Step 1: Clarify
- Happy path: User creates X, receives Y response
- Edge cases: Invalid input, duplicate keys, concurrent requests
- Performance: Response time <200ms
- Integration: Requires authentication, updates cache

### Step 2: Investigate
- Read `docs/api-contracts.yaml` for naming/structure patterns
- Search for similar endpoints (e.g., CRUD patterns)
- Find authentication middleware usage
- Check cache invalidation patterns
- Identify all affected services

### Step 3: Plan
- Task 1: Add API schema to contracts
- Task 2: Implement controller/handler
- Task 3: Add service layer logic
- Task 4: Implement persistence
- Task 5: Add cache invalidation
- Task 6: Write tests

### Step 4: Approval
Share plan with stakeholders, get sign-off.

### Step 5: Handoff
Pass plan + investigation results to implementation agents.

## Key Principles

- **Nothing is left to assumptions.** Thorough investigation is mandatory.
- **Default to agent-based impact analysis** for refactors and cross-cutting changes.
- **Use direct tools for small, contained features** to stay efficient.
- **Breaking changes must be identified early** and communicated clearly.
- **Plans enable parallel execution** when dependencies are clear.
- **Approval gates prevent rework.** Always get sign-off before implementation.
