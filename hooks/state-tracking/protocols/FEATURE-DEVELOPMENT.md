# Feature Development Protocol

## Phase 1: Behavioral Unpacking (Ask 5-7 Questions)

Select questions based on feature type from DISCOVERY-QUESTIONS.md.

**Core question categories:**

### 1. Happy Path Discovery
```
"Describe the successful scenario step-by-step from user's perspective.
What do they see/do/experience?"
```

### 2. Edge Case Discovery
```
"What should happen when [obvious edge case]?
Examples: empty state, no results, invalid input, network error"
```

### 3. Performance Discovery
```
"How should this feel to the user?
Examples: Instant (<100ms)? Fast (<1s)? Eventual (loading state okay)?"
```

### 4. Error Discovery
```
"What should NEVER happen?
What would frustrate users most?"
```

### 5. Accessibility Discovery
```
"Should this work for:
- Screen reader users?
- Keyboard-only navigation?
- Mobile devices?
- Low-bandwidth connections?"
```

### 6. Scope Discovery
```
"For this feature, what's explicitly OUT of scope?
What should we NOT build yet?"
```

### 7. Integration Discovery (if relevant)
```
"Does this interact with:
- Existing features?
- External APIs?
- Database?
- Authentication?"
```

**Important:** Adapt questions to context. Don't ask all 7 if some are obvious.

---

## Phase 2: Technical Synthesis

Based on answers, generate:

### 2A: Behavioral Specification

```markdown
# Feature: [Name]

## User Scenarios

SCENARIO: [Happy path name]
  GIVEN [initial context]
    AND [additional context if needed]
  WHEN [user action]
  THEN [immediate outcome]
    AND [secondary outcome]
    AND [state change]

SCENARIO: [Edge case 1]
  GIVEN [context]
  WHEN [action]
  THEN [outcome]

SCENARIO: [Error case]
  GIVEN [context]
  WHEN [error condition]
  THEN [error handling]
    AND [user feedback]
    AND [recovery path]

## Out of Scope
- [Explicitly not building]
- [Deferred to later]
```

### 2B: Technical Inferences

```markdown
## Technical Inferences

[INFER-HIGH]: [Assumption based on explicit requirement]
  Reasoning: [Why this inference is confident]

[INFER-MEDIUM]: [Industry best practice for this scenario]
  Reasoning: [Why this is likely correct]

[INFER-LOW]: [Assumption that needs confirmation]
  Reasoning: [Why uncertain]

## Clarification Needed

Q: [Question about ambiguous requirement]
Q: [Question about unspecified detail]
```

**Confidence Level Guidelines:**

- **HIGH**: Human explicitly said this OR it's the only reasonable approach
- **MEDIUM**: Standard practice for this scenario, but alternatives exist
- **LOW**: Assumption filling gap, could be wrong

### 2C: Present for Approval

```
─────────────────────────────────────
BEHAVIORAL SPEC
─────────────────────────────────────
[Show scenarios in Gherkin format]

─────────────────────────────────────
TECHNICAL INFERENCES
─────────────────────────────────────
[Show inferences with confidence levels]

─────────────────────────────────────
QUESTIONS FOR CONFIRMATION
─────────────────────────────────────
[List ambiguities]

─────────────────────────────────────

Please review:
1. Do scenarios match your intent?
2. Any inferences to correct?
3. Answers to clarification questions?

Reply "approve" to proceed or correct any assumptions.
```

### 2D: Agent Assignment Strategy

After approval, determine which tasks benefit from parallel execution.

**Analyze task characteristics:**

```markdown
## Agent Assignment Analysis

**Independent Tasks** (can run in parallel):
- [ ] TASK-XXX: [Description] - No shared files/state with other tasks
- [ ] TASK-YYY: [Description] - No dependencies on incomplete work

**Dependent Tasks** (must run sequentially):
- [ ] TASK-ZZZ: [Description] - Depends on: TASK-XXX completion
- [ ] TASK-AAA: [Description] - Shares files with: TASK-YYY

**Agent Type Recommendations:**
- **frontend-ui-developer**: UI components, styling, accessibility
- **backend-developer**: API endpoints, database operations, business logic
- **code**: General implementation, refactoring, utilities
- **security**: Authentication, authorization, input validation
- **test**: Test writing, test infrastructure
```

**Parallelization Decision Framework:**

Parallelize when (see parallel.md lines 82-99):
- [ ] 2+ independent tasks exist (different files, no shared state)
- [ ] Tasks have minimal dependencies on each other
- [ ] Each task can be completed and verified independently
- [ ] Optimal batch size: 3-5 tasks

Do NOT parallelize when:
- [ ] Single file modification
- [ ] Tasks share the same file or state
- [ ] Complex interdependencies between tasks
- [ ] Sequential operations that build on each other

**Cross-references:**
- parallel.md lines 103-115: Layer-Based and Feature-Based Parallelization patterns
- parallel.md lines 39-57: Optimal Agent Usage and Context Provision

---

## Phase 3: Task Breakdown

After approval, generate atomic tasks:

```markdown
## Task Breakdown

TASK-001: [Atomic unit - one feature piece]
Agent Type: [frontend-ui-developer|backend-developer|code|security|test]
Estimated: [1.5-2.5 hours]
Deliverable: [What will work after this task]
Dependencies: [None | TASK-XXX must complete first]

TASK-002: [Next atomic unit]
Agent Type: [frontend-ui-developer|backend-developer|code|security|test]
Estimated: [1.5-2.5 hours]
Deliverable: [What will work]
Dependencies: [None | TASK-XXX must complete first]

[Continue...]

Total: [X tasks, Y-Z hours estimated]

## Parallel Execution Plan

**Batch 1** (Independent - run in parallel):
- TASK-001, TASK-002, TASK-003

**Batch 2** (Sequential - depends on Batch 1):
- TASK-004, TASK-005
```

**Atomic Task Guidelines:**
- Can be completed in one coding session
- Produces working, testable code
- Minimal dependencies on incomplete work
- Clear success criteria

Update project.md:
```markdown
## Current Focus

**Feature:** [Name]
**Status:** Ready for implementation
**Tasks:**
- [ ] TASK-001: [Description]
- [ ] TASK-002: [Description]
...
```

Present:
```
✓ Created task breakdown
✓ Updated project.md

Ready to execute TASK-001? (yes/review/modify)
```

---

## Phase 3.5: Parallel Execution Planning

Before implementation, determine optimal execution strategy based on task dependencies.

### Step 1: Dependency Analysis

Map task relationships:

```markdown
## Task Dependency Graph

TASK-001 (API endpoint) ──┐
                           ├──> TASK-004 (Integration test)
TASK-002 (UI component) ───┤
                           │
TASK-003 (Database schema) ┘

Independent: TASK-001, TASK-002, TASK-003 can run in parallel
Dependent: TASK-004 requires TASK-001, TASK-002, TASK-003 complete
```

### Step 2: Batch Planning

Group tasks into parallel batches using patterns from parallel.md:

**Pattern 1: Layer-Based Parallelization** (parallel.md lines 103-108)
```
Batch 1: Database schema + Type definitions + Core utilities
Batch 2: Service layer + API endpoints + Frontend components
Batch 3: Tests + Documentation + Configuration
```

**Pattern 2: Feature-Based Parallelization** (parallel.md lines 110-115)
```
Batch 1: Independent feature implementations
Batch 2: Integration points between features
Batch 3: Cross-cutting concerns and polish
```

### Step 3: Agent Context Preparation

For each parallel task, prepare context (parallel.md lines 52-57):

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">[Clear 5-10 word description]</parameter>
    <parameter name="subagent_type">[Appropriate agent type]</parameter>
    <parameter name="prompt">
      Read these files for context:
      - [file1.ts]: Existing pattern to follow
      - [file2.ts]: Type definitions to use

      Implement [specific deliverable]:
      - [Requirement 1]
      - [Requirement 2]

      Success criteria:
      - [What "done" looks like]

      Follow template from FEATURE-DEVELOPMENT.md lines XXX-YYY.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">[Next parallel task]</parameter>
    <parameter name="subagent_type">[Appropriate agent type]</parameter>
    <parameter name="prompt">[Detailed instructions...]</parameter>
  </invoke>
</function_calls>
```

### Step 4: Parallel Execution Examples

**Example 1: Search Feature (Layer-Based)**

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Implement search API endpoint</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">
      Read src/api/products.ts to understand existing API patterns.

      Create POST /api/search endpoint:
      - Accept query string, filters object
      - Return paginated results
      - Debounce-friendly (fast response)

      Follow API conventions from existing endpoints.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Create SearchBar UI component</parameter>
    <parameter name="subagent_type">frontend-ui-developer</parameter>
    <parameter name="prompt">
      Read src/components/Input.tsx for component patterns.

      Create SearchBar component:
      - Debounced input (300ms)
      - Loading state indicator
      - Keyboard navigation (up/down for results)
      - Clear button

      Follow accessibility patterns from Input component.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Add search indexes to database</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">
      Read migrations/001_initial.sql for migration patterns.

      Create migration to add:
      - Full-text index on products.name
      - Full-text index on products.description
      - Index on products.category

      Follow existing migration format.
    </parameter>
  </invoke>
</function_calls>
```

After batch completes: Implement TASK-004 (integration) sequentially.

**Example 2: Form Validation (Feature-Based)**

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Client-side validation utilities</parameter>
    <parameter name="subagent_type">frontend-ui-developer</parameter>
    <parameter name="prompt">
      Create src/utils/validation.ts:
      - validateEmail(email): boolean
      - validatePassword(password): {valid: boolean, errors: string[]}
      - validateRequired(value): boolean

      Follow patterns from DISCOVERY-QUESTIONS.md lines 245-290 (Forms).
      Return descriptive error messages.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Server-side validation middleware</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">
      Read src/middleware/auth.ts for middleware patterns.

      Create src/middleware/validate.ts:
      - Express middleware for request validation
      - Reject malformed/malicious input
      - Return 400 with field-specific errors

      Never trust client-side validation alone.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Validation error UI components</parameter>
    <parameter name="subagent_type">frontend-ui-developer</parameter>
    <parameter name="prompt">
      Create src/components/FormError.tsx:
      - Inline error messages under fields
      - Error summary at form top
      - Accessible (ARIA live regions)

      Read src/components/Alert.tsx for styling patterns.
    </parameter>
  </invoke>
</function_calls>
```

### Step 5: Post-Batch Review

After each parallel batch completes (parallel.md lines 133-141):

```markdown
## Batch 1 Review

**Completed:**
- ✓ TASK-001: API endpoint created, tested
- ✓ TASK-002: UI component implemented
- ✓ TASK-003: Database migration applied

**Discovered:**
- API response format needs standardization
- UI component needs loading state refinement

**Unblocked:**
- TASK-004: Integration test can now proceed
- TASK-005: Error handling can be added

**Next Batch:**
- TASK-004, TASK-005 (now independent)
```

---

## Phase 4: Implementation

For each task:

### Step 1: Load Context
- project.md (architecture, learnings)
- PERFORMANCE-DIRECTIVES.md (quality rules)
- Latest snapshot (if exists)

### Step 2: Pre-Implementation Verification
```
Before coding TASK-XXX, verify:
✓ Behavioral spec clear?
✓ Dependencies available?
✓ Project learnings reviewed? (avoid past mistakes)
✓ Performance directives loaded?
✓ Test approach understood?
```

### Step 3: Implementation
Write code following inferences + performance directives.

### Step 4: Self-Review
BEFORE presenting code:

```
ACCESSIBILITY
□ Semantic HTML / proper elements
□ ARIA labels on interactive elements
□ Keyboard navigation works
□ Color contrast sufficient

PERFORMANCE
□ Time complexity acceptable (O(n log n) max)
□ No unnecessary re-renders
□ Debounced user inputs
□ Efficient data structures

ERROR HANDLING
□ Try-catch on async operations
□ User-friendly error messages
□ Graceful degradation
□ Null/undefined checks

EDGE CASES
□ Empty states handled
□ Loading states shown
□ Null checks present
□ Boundary conditions tested

CODE QUALITY
□ Functions < 50 lines
□ Clear variable names
□ No magic numbers
□ Proper code organization
□ Can be tested
□ Edge cases testable
```

If any □ fails, fix before presenting.

### Step 5: State Compression
Create snapshot (2-4K tokens):

```markdown
## Snapshot: TASK-XXX

**Date:** [ISO date]
**Feature:** [Name]
**Task:** TASK-XXX - [Description]

## Changes Made
- [File]: [What changed and why]
- [File]: [What changed and why]

## New Interfaces/Functions
\`\`\`typescript
// Only signatures, not implementations
interface NewThing {
  prop: type;
}

function newFunction(params): returnType
\`\`\`

## What Next Task Needs to Know
- [Key point 1]
- [Key point 2]

## What Can Be Assumed Working
- [Feature piece 1]
- [Feature piece 2]

## Discarded Details
[Implementation specifics no longer needed in context]
```

### Step 6: Update project.md

Update these sections:
1. **Current Focus** → Mark task complete, show next
2. **Architecture Overview** → Add new components/patterns
3. **Project Learnings** → Add if issues discovered

**Keep project.md under 20K tokens:**
- Move old state snapshots to separate files
- Reference interfaces, not full implementations
- Summarize architecture, don't duplicate code

Present:
```
✓ TASK-XXX complete
✓ Self-review passed
✓ State compressed
✓ project.md updated

Files modified:
- [file]: [summary]

Ready for TASK-YYY? (yes/review/break)
```

---

## Discovery Question Selection (Feature-Specific)

### CRUD Operations
- Data validation rules?
- Concurrent edit handling?
- Delete confirmation?
- Soft vs hard delete?

### Search/Filter
- Search scope (what fields)?
- Real-time or submit?
- Fuzzy matching?
- Result sorting?
- Empty results message?

### Authentication
- Password requirements?
- Session duration?
- Remember me?
- Forgot password flow?
- Account lockout?

### Forms
- Validation timing (on blur/submit)?
- Required fields?
- Error message placement?
- Unsaved changes warning?

### Real-time Features
- Polling vs WebSocket?
- Update frequency?
- Conflict resolution?
- Offline support?

### Data Visualization
- Interactivity level?
- Responsive behavior?
- Accessibility (data tables)?
- Export options?

**Adapt from DISCOVERY-QUESTIONS.md templates.**

---

## Success Criteria

Feature complete when:
- [ ] All tasks from breakdown completed
- [ ] Self-review checklist passed for each
- [ ] State snapshots created
- [ ] project.md updated with learnings
- [ ] Tests written (if applicable)
- [ ] Documentation updated (if needed)

---
