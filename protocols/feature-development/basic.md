# Feature Development Protocol (Basic)

Streamlined approach to building new features from requirements to implementation with pragmatic agent delegation.

## Artifacts

**Inputs:**
- `docs/charter.md` - Project goals and scope
- `docs/product-requirements.md` - Existing features and context
- `docs/system-design.md` - Architecture patterns
- `docs/design-spec.md` - Design system and UI patterns

**Outputs:**
- `docs/product-requirements.md` - Updated with new Feature ID (F-##)
- `docs/feature-spec/F-##-<slug>.md` - Technical design
- Implementation code
- Tests for acceptance criteria

## When to Use
- Adding new user-facing functionality
- Building new capabilities that didn't exist before
- Implementing features from PRD or user requests

## Core Steps

### 1. Requirements Clarification
**Read existing project documentation:**
- `docs/charter.md` for project goals and scope
- `docs/product-requirements.md` for existing features and context
- `docs/system-design.md` for architecture patterns
- `docs/design-spec.md` for design system and UI patterns

**Ask 5-7 essential discovery questions:**

**Core questions:**
1. **Happy Path:** Describe successful scenario step-by-step
2. **Edge Cases:** Empty state, invalid input, errors?
3. **Scope Boundaries:** What's OUT of scope for MVP?
4. **Integration:** How does this interact with existing features/APIs/auth?
5. **Performance:** Instant (<100ms), fast (<1s), or eventual (loading)?

**Feature-specific (pick relevant ones):**
- **CRUD:** Validation rules, concurrent edits, delete behavior
- **Search:** Real-time/submit, matching type, sorting
- **Forms:** Validation timing, required fields, unsaved changes
- **Real-time:** Mechanism (polling/WebSocket), conflict resolution
- **Auth:** Password rules, session duration, lockout policy

### 2. Create Behavioral Specification
**Document confirmed behavior:**

```markdown
# Feature: [Name]

SCENARIO: [Happy path]
  GIVEN [context]
  WHEN [action]
  THEN [outcome]

SCENARIO: [Key edge case]
  GIVEN [context]
  WHEN [action]
  THEN [outcome]

## Out of Scope
- [Deferred items]
```

**Present inferences (High & Medium confidence only):**
```markdown
[INFER-HIGH]: [Explicit requirement]
[INFER-MEDIUM]: [Standard practice]

## Clarification Needed
Q: [Any remaining questions]
```

**Get user approval to proceed**

### 3. Update Project Documentation
**Add to `docs/product-requirements.md`:**
- Assign next Feature ID (F-##)
- Add feature with description
- Include acceptance criteria

**Create `docs/feature-spec/F-##-[slug].md`:**
- Technical design
- API endpoints (if applicable)
- Data model (if applicable)
- UI components (if applicable)

### 4. Create Implementation Plan
**Simple task list (5-8 items):**

```markdown
## Implementation Tasks

1. [Setup/foundation task]
2. [Core implementation task]
3. [Integration task]
4. [UI task if applicable]
5. [Error handling]
6. [Testing]
7. [Documentation]
```

**Note dependencies:**
- Mark which tasks can run in parallel
- Identify sequential dependencies

### 5. Implementation
**Execute tasks sequentially or delegate when beneficial:**

**Implement yourself for:**
- Small features (single file/component)
- Tightly coupled logic
- Quick iterations

**Delegate to agents when it makes sense:**
- Independent modules can be built in parallel
- Different layers (backend + frontend simultaneously)
- Complex features with clear boundaries
- Time-sensitive work that benefits from parallelization

**Agent selection by task:**
- `backend-developer`: API endpoints, services, data layer
- `frontend-ui-developer`: React components, UI, forms
- `general-purpose`: Utilities, config, cross-cutting concerns

**If delegating:**
- Ensure shared types/interfaces are ready first
- Pass feature spec and plan to agents
- Review and integrate agent outputs

### 6. Quality Check
**Before presenting work:**

**Spec Alignment:**
- [ ] APIs match `docs/api-contracts.yaml` (if applicable)
- [ ] UI matches `docs/design-spec.md` (if applicable)
- [ ] Behavior satisfies acceptance criteria

**Code Quality:**
- [ ] Functions < 50 lines
- [ ] Clear, meaningful names
- [ ] Error handling with try-catch for async
- [ ] Null/undefined checks

**Edge Cases:**
- [ ] Empty states handled
- [ ] Loading states shown
- [ ] Error states with friendly messages
- [ ] Input validation

### 7. Testing
**Write tests for acceptance criteria:**

- Unit tests for business logic
- Integration tests for API endpoints (if applicable)
- Component tests for UI interactions (if applicable)

**Focus on:**
- Happy path
- Key edge cases
- Error scenarios

### 8. Documentation Update
**Update feature spec:**
- Implementation notes
- Key decisions made
- Any deviations from original plan

**Update other docs if needed:**
- `docs/api-contracts.yaml`: New endpoints
- `docs/data-plan.md`: New analytics events (if applicable)

### 9. Final Validation
**Verify completion:**
- [ ] All acceptance criteria passing
- [ ] Feature spec matches implementation
- [ ] Key tests written and passing
- [ ] Documentation updated

## Implementation Strategies

**Sequential (default):**
```markdown
1. Database/types → 2. Services → 3. API → 4. UI → 5. Tests
```

**Parallel (when beneficial):**
```markdown
Batch 1: Database schema + API types + UI components (parallel)
Batch 2: Service layer + API integration + Tests (after Batch 1)
```

**Incremental (complex features):**
```markdown
Phase 1: Core happy path working end-to-end
Phase 2: Edge cases and error handling
Phase 3: Polish and optimization
```

## When to Delegate to Agents

**Good candidates for delegation:**
- ✅ Independent backend API and frontend component
- ✅ Multiple isolated utilities or helpers
- ✅ Parallel test writing for different modules
- ✅ Documentation creation for different audiences

**Keep yourself for:**
- ❌ Single file changes
- ❌ Tightly coupled logic
- ❌ Rapid iteration needed
- ❌ Unclear requirements

