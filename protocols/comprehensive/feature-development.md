# Feature Development Protocol

Complete lifecycle for building new features from requirements to implementation, with strategic async agent delegation.

## Artifacts

**Inputs:**
- `docs/product-requirements.md` - Project goals, scope, and existing features
- `docs/system-design.md` - Architecture patterns
- `docs/design-spec.md` - Design system and UI patterns

**Outputs:**
- `docs/product-requirements.md` - Updated with new Feature ID (F-##)
- `docs/user-flows/<feature-slug>.md` - User flow
- `docs/user-stories/US-###-<slug>.md` - Implementation slices
- `docs/feature-spec/F-##-<slug>.md` - Technical design
- `docs/plans/<slug>/plan.md` - Implementation plan (if complex)
- Implementation report

**Handoffs:**
- Implementation agents read feature spec + plan + investigation artifacts
- Validation agents read user stories, specs, and requirements for acceptance criteria
- Documentation agents reference feature spec for technical details

## Naming Conventions
- Feature specs: `docs/feature-spec/F-##-<slug>.md`
- User flows: `docs/user-flows/<feature-slug>.md`
- User stories: `docs/user-stories/US-###-<slug>.md`
- Plans: `docs/plans/<feature-slug>/plan.md`
- Investigation: `agent-responses/agent_<id>.md`

## Shared Dependency Setup
Before parallelizing implementation, create shared types, interfaces, and core utilities first. Then spawn parallel agents with clear boundaries (mirroring main.md patterns).

## When to Use
- Adding new user-facing functionality
- Building new capabilities that didn't exist before
- Implementing features from PRD or user requests

## Core Steps

### 1. Requirements Clarification
**Read existing project documentation:**
- `docs/product-requirements.md` for project goals, scope, and existing features
- `docs/system-design.md` for architecture patterns
- `docs/design-spec.md` for design system and UI patterns

**Ask 5-7 discovery questions based on feature type:**

**Core questions:**
1. **Happy Path:** Describe successful scenario step-by-step from user's perspective
2. **Edge Cases:** Empty state, no results, invalid input, network errors?
3. **Scope Boundaries:** What's explicitly OUT of scope for MVP?
4. **Integration:** How does this interact with existing features, APIs, auth?
5. **Performance:** Instant (<100ms), fast (<1s), or eventual (loading states)?
6. **Accessibility:** Screen reader, keyboard navigation, mobile requirements?
7. **Error Handling:** What should NEVER happen? What would frustrate users?

**Feature-specific questions:**
- **CRUD:** Validation rules, concurrent edits, delete confirmation, soft/hard delete
- **Search:** Real-time/submit, fuzzy matching, sorting, empty results UX
- **Forms:** Validation timing, required fields, unsaved changes warning
- **Real-time:** Polling/WebSocket, conflict resolution, offline handling
- **Auth:** Password rules, session duration, lockout policy

**Parallel investigation (if needed):**
- Spawn `code-finder` to locate existing patterns for similar features
- Spawn `general-purpose` to research third-party integration approaches
- Wait for results: `./agent-responses/await {agent_id}`

### 2. Behavioral Specification
**Create behavioral spec with user responses:**

```markdown
# Feature: [Name]

SCENARIO: [Happy path]
  GIVEN [context]
  WHEN [action]
  THEN [outcome]
    AND [state change]

SCENARIO: [Edge case]
  GIVEN [context]
  WHEN [action]
  THEN [outcome]

SCENARIO: [Error case]
  GIVEN [context]
  WHEN [error condition]
  THEN [error handling]
    AND [user feedback]

## Out of Scope
- [Deferred items]
```

**Technical inferences with confidence:**
```markdown
[INFER-HIGH]: [Explicit requirement or only reasonable approach]
[INFER-MEDIUM]: [Standard practice, alternatives exist]
[INFER-LOW]: [Assumption needing confirmation]

## Clarification Needed
Q: [Ambiguous requirements]
```

**Get user approval:**
"Review scenarios, inferences, and answer questions. Reply 'approve' to proceed."

### 3. Documentation Planning
**Update project docs with feature:**

Run `/manage-project/add/add-feature` to:
- Assign next Feature ID (F-##)
- Add to feature list in `docs/product-requirements.yaml`
- Create feature spec file in `docs/feature-specs/F-##-<slug>.yaml`
- Define acceptance criteria and success metrics

This command handles ID assignment, file creation, and validation automatically.

**For comprehensive features, delegate doc creation:**
- Agent 1: Create user flows from behavioral spec
- Agent 2: Break into user stories with AC
- Agent 3: Draft feature spec with architecture

Wait for completion or continue with planning yourself

### 4. Technical Planning & Parallelization Analysis
**Analyze for parallel execution opportunities:**

**ALWAYS parallelize when:**
- 2+ independent tasks (different files, modules, layers)
- No shared dependencies or state conflicts
- Research and investigation tasks
- Optimal batch: 3-5 concurrent tasks

**Execute sequentially ONLY when:**
- Single file modification
- Shared resource conflicts
- Hard dependencies between tasks

**Common parallelization patterns:**

**Layer-Based:**
```
Batch 1: Database schema + API types + Utilities (parallel)
Batch 2: Service layer + API endpoints + Components (parallel)  
Batch 3: Tests + Analytics + Documentation (parallel)
```

**Feature-Based:**
```
Batch 1: Independent feature modules (parallel)
Batch 2: Integration between modules (parallel when possible)
Batch 3: Cross-cutting concerns (parallel)
```

**Task breakdown template:**
```markdown
## Implementation Plan

### Batch 1 (Parallel)
- Task 1: [Atomic unit] - [agent-type]
- Task 2: [Atomic unit] - [agent-type]
- Task 3: [Atomic unit] - [agent-type]

### Batch 2 (Sequential dependencies)
- Task 4: [Atomic unit] - [agent-type]
- Task 5: [Atomic unit] - [agent-type]

### Batch 3 (Parallel)
- Task 6: [Atomic unit] - [agent-type]
```

**Atomic = One session, working code, clear success criteria**

### 5. Parallel Implementation
**Agent selection by task:**
- `backend-developer`: API endpoints, services, data layer
- `frontend-ui-developer`: React components, UI, forms
- `general-purpose`: Utilities, config, cross-cutting
- `code-finder`: Pattern discovery, architecture research

**Artifact Passing Strategy:**
Agents build on previous work by reading artifact files.

**Pattern: Requirements → Investigation → Plan → Implementation**
1. Requirements phase creates feature spec
2. Investigation agents create `agent-responses/agent_<id>.md`
3. Planning agent creates `docs/plans/<slug>/plan.md`
4. Implementation agents read plan + investigation responses

**Launch parallel batch with shared artifacts:**

First, ensure shared dependencies are ready (types, interfaces). Then spawn agents referencing `docs/plans/<slug>/plan.md` and `agent-responses/agent_<id>.md` files.

**Monitor progress:**
- Wait for completion: `./agent-responses/await {agent_id}`
- Or continue other work until completion alerts

**Post-batch review:**
1. Review accomplishments - what's working
2. Identify blockers or new dependencies
3. Determine unblocked work
4. Plan next parallel batch
5. Launch next batch

### 6. Quality & Self-Review
**Before presenting work, verify:**

**Spec Alignment:**
- [ ] APIs match `docs/api-contracts.yaml`
- [ ] Events match `docs/data-plan.md`
- [ ] UI matches `docs/design-spec.md`
- [ ] Behavior satisfies story AC from `docs/user-stories/`

**Code Quality:**
- [ ] Functions < 50 lines
- [ ] Clear, meaningful names
- [ ] No magic numbers or hardcoded values
- [ ] Error handling with try-catch for async
- [ ] Null/undefined checks

**Accessibility:**
- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG

**Performance:**
- [ ] Time complexity ≤ O(n log n)
- [ ] No unnecessary re-renders
- [ ] Debounced user inputs
- [ ] Efficient data structures

**Edge Cases:**
- [ ] Empty states handled
- [ ] Loading states shown
- [ ] Error states with friendly messages
- [ ] Input boundaries validated

### 7. Testing
**Write tests per story acceptance criteria:**
- Unit tests for business logic
- Integration tests for API endpoints
- Component tests for UI interactions
- E2E tests for critical flows

**Parallel test implementation:**
- Spawn agents to write tests for independent modules
- Each agent focuses on one test type or feature area

### 8. Documentation Updates
**Update project documentation using slash commands:**

Run `/manage-project/add/add-story` for each user story to:
- Create `docs/user-stories/US-###-<slug>.yaml` files
- Link stories to feature via `feature_id: F-##`
- Assign sequential story IDs automatically
- Include acceptance criteria in Given/When/Then format

Run `/manage-project/add/add-api` for each new API endpoint to:
- Add endpoints to `docs/api-contracts.yaml`
- Tag endpoints with feature ID (F-##)
- Ensure OpenAPI schema compliance
- Update related feature specs automatically

Run `/manage-project/update/update-design` to update design specs with new UI components or patterns.

**Trace feature through docs:**
- Feature ID (F-##) in PRD
- User stories (US-###) with `feature_id: F-##`
- Feature spec citing PRD and story IDs
- API contracts referencing F-##
- Data events mapping to PRD metrics

**Update status fields:**
- Change from `draft` to `approved` after review
- Update `last_updated` dates

### 9. Validation & Handoff
**Final verification:**
- [ ] All user story AC passing
- [ ] Feature spec matches implementation
- [ ] API contracts accurate
- [ ] Analytics events firing correctly
- [ ] Documentation complete and linked
- [ ] No blockers or open questions

**Run validation commands:**
- `/manage-project/validate/check-consistency` to verify all IDs and links are valid
- `/manage-project/validate/check-coverage` to ensure features have specs and stories
- `/manage-project/validate/check-api-alignment` to verify API specs match feature specs

**Traceability check:**
- PRD features ↔ feature specs ↔ user stories
- Success metrics ↔ data events
- API spec ↔ implementation
- User flows ↔ UI implementation

## Agent Quantity Guidelines

**Investigation phase:** 2-3 agents for parallel research

**Planning phase:** 1-3 agents for documentation creation (if complex)

**Implementation phase:** 
- 3-5 agents optimal for parallel development
- Max 6 agents (diminishing returns)
- Each focuses on one layer/module/feature

**Testing phase:** 2-4 agents for parallel test creation

**Review phase:** Usually self-review, or delegate to `completion-validator`


