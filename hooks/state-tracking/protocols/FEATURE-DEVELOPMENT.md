# Feature Development Protocol

## Phase 1: Behavioral Unpacking (5-7 Questions)

Select from DISCOVERY-QUESTIONS.md based on feature type:

1. **Happy Path**: Describe successful scenario step-by-step from user's perspective
2. **Edge Cases**: What happens with empty state, no results, invalid input, network errors?
3. **Performance**: Instant (<100ms), fast (<1s), or eventual (loading)?
4. **Errors**: What should NEVER happen? What would frustrate users?
5. **Accessibility**: Screen reader, keyboard, mobile, low-bandwidth requirements?
6. **Scope**: What's explicitly OUT of scope?
7. **Integration**: Existing features, APIs, database, auth interactions?

Adapt to context. Skip obvious questions.

---

## Phase 2: Technical Synthesis

### 2A: Behavioral Specification (Gherkin)

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

### 2B: Technical Inferences

```markdown
[INFER-HIGH]: [Explicit requirement or only reasonable approach]
[INFER-MEDIUM]: [Standard practice, alternatives exist]
[INFER-LOW]: [Assumption needing confirmation]

## Clarification Needed
Q: [Ambiguous requirements]
```

### 2C: Present for Approval

Show: Behavioral spec, inferences with confidence, clarification questions.

Ask: "Review scenarios, inferences, and answer questions. Reply 'approve' to proceed."

### 2D: Parallelization Analysis

After approval, determine task independence:

**Parallelize when:**
- 2+ independent tasks (different files, no shared state)
- Optimal: 3-5 tasks per batch

**Sequential when:**
- Single file modification
- Shared files/state
- Complex interdependencies

**Agent types:** frontend-ui-developer, backend-developer, code, security, test

---

## Phase 3: Task Breakdown

```markdown
TASK-001: [Atomic unit]
Agent: [type]
Deliverable: [What works after]
Dependencies: [None | TASK-XXX]

TASK-002: [Next unit]
...

## Execution Plan
Batch 1 (parallel): TASK-001, TASK-002, TASK-003
Batch 2 (sequential): TASK-004, TASK-005
```

**Atomic = One session, working code, clear success criteria**

Update project.md Current Focus section. Present: "Ready to execute TASK-001?"

---

## Phase 3.5: Parallel Execution

### Execution Patterns

**Layer-Based:** DB schema + Types → Services + API + UI → Tests + Docs
**Feature-Based:** Independent features → Integrations → Cross-cutting

### Agent Prompt Template

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">[5-10 words]</parameter>
    <parameter name="subagent_type">[agent-type]</parameter>
    <parameter name="prompt">
Read [file1.ts] for patterns.

Implement [deliverable]:
- [Requirement 1]
- [Requirement 2]

Success: [What "done" looks like]
    </parameter>
  </invoke>
</function_calls>
```

### Execution Example (ONE kept)

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Search API endpoint</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">
Read src/api/products.ts for API patterns.

Create POST /api/search:
- Accept query string, filters
- Return paginated results
- Fast response (<100ms)
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">SearchBar UI component</parameter>
    <parameter name="subagent_type">frontend-ui-developer</parameter>
    <parameter name="prompt">
Read src/components/Input.tsx for patterns.

Create SearchBar:
- Debounced input (300ms)
- Loading indicator
- Keyboard navigation
- Clear button
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Search database indexes</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">
Read migrations/001_initial.sql for format.

Add indexes:
- products.name (full-text)
- products.description (full-text)
- products.category
    </parameter>
  </invoke>
</function_calls>
```

### Post-Batch Review

After batch: List completed, discovered issues, unblocked tasks, next batch.

---

## Phase 4: Implementation

### Pre-Implementation
Load: project.md, PERFORMANCE-DIRECTIVES.md, latest snapshot
Verify: Spec clear, dependencies available, learnings reviewed, test approach understood

### Implementation
Write code following inferences + performance directives.

### Self-Review Checklist

**Accessibility:** Semantic HTML, ARIA labels, keyboard nav, contrast
**Performance:** Time complexity ≤ O(n log n), no re-renders, debounced inputs, efficient structures
**Errors:** Try-catch async, friendly messages, graceful degradation, null checks
**Edge Cases:** Empty states, loading states, boundaries
**Quality:** Functions < 50 lines, clear names, no magic numbers, testable

Fix before presenting.

### State Compression (2-4K tokens)

```markdown
## Snapshot: TASK-XXX
Date: [ISO]
Changes: [File]: [What/why]
New Interfaces: // Signatures only
Next Task Needs: [Key points]
Assumed Working: [Features]
```

### Update project.md

1. Current Focus → Mark complete, show next
2. Architecture → Add new components
3. Learnings → Add issues

Keep < 20K tokens. Present: "TASK-XXX complete. Ready for TASK-YYY?"

---

## Appendix: Feature-Specific Questions

**CRUD:** Validation rules, concurrent edits, delete confirmation, soft/hard delete
**Search:** Scope, real-time/submit, fuzzy match, sorting, empty results
**Auth:** Password requirements, session duration, remember me, forgot password, lockout
**Forms:** Validation timing, required fields, error placement, unsaved warning
**Real-time:** Polling/WebSocket, frequency, conflicts, offline
**Visualization:** Interactivity, responsive, accessibility, export

Adapt from DISCOVERY-QUESTIONS.md.

---

## Success Criteria

- [ ] All tasks completed
- [ ] Self-review passed
- [ ] State snapshots created
- [ ] project.md updated
- [ ] Tests written (if applicable)
