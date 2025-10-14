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

**Parallelization is your primary execution strategy.** After approval, analyze task independence to maximize concurrent execution.

**ALWAYS parallelize when you have:**
- **2+ independent tasks** — Different files, modules, or layers with no shared dependencies
- **Research and investigation** — Exploring multiple aspects of the problem space
- **Multi-file refactoring** — Changes that don't affect each other's state
- **Optimal batch size: 3-5 concurrent tasks** — Sweet spot for efficiency gains

**Execute sequentially ONLY when:**
- **Single file modification** — One focused change in one location
- **Shared resource conflicts** — Multiple tasks modifying the same file
- **Hard dependencies exist** — Task B requires Task A's completed output

**Default mindset: "Can these run in parallel?" Not "Should they?"**

Available agents: frontend-ui-developer, backend-developer, code-finder, root-cause-analyzer

---

## Phase 3: Task Breakdown

```markdown
Batch 1 (parallel)
- Task 1: [Atomic unit - agent type]
- Task 2: [Atomic unit - agent type]
- Task 3: [Atomic unit - agent type]

Batch 2 (sequential)
- Task 4: [Atomic unit - agent type]
- Task 5: [Atomic unit - agent type]
```

**Atomic = One session, working code, clear success criteria**

Update project.md Current Focus section. Present: "Ready to execute TASK-001?"

---

## Phase 3.5: Parallel Execution

### Common Execution Patterns

**Layer-Based Parallelization:**
```
Batch 1: DB schema + Type definitions + Core utilities (parallel)
Batch 2: Service layer + API endpoints + Frontend components (parallel)
Batch 3: Tests + Documentation + Configuration (parallel)
```

**Feature-Based Parallelization:**
```
Batch 1: Independent feature implementations (parallel)
Batch 2: Integration points between features (parallel when possible)
Batch 3: Cross-cutting concerns and polish (parallel)
```

### Agent Prompt Template

**Critical: Provide context, be explicit, enable success**

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">[5-10 words describing deliverable]</parameter>
    <parameter name="subagent_type">[agent-type]</parameter>
    <parameter name="prompt">
Read [file1.ts, file2.ts] for existing patterns and conventions.

Implement [specific deliverable]:
- [Explicit requirement 1]
- [Explicit requirement 2]
- [Explicit requirement 3]

Success criteria: [Clear definition of "done"]
    </parameter>
  </invoke>
</function_calls>
```

**Example parallel execution approach:** Search feature with 3 independent tasks (API endpoint, UI component, database optimization) touching different files with no shared state — perfect for parallel execution.

### Post-Batch Review

After each batch completes:
1. **Review accomplishments** — What got done, what's working
2. **Identify blockers** — New dependencies or issues discovered
3. **Determine unblocked work** — What can now proceed
4. **Plan next batch** — Group newly available independent tasks
5. **Continue** — Launch next parallel batch

**Remember: Think in batches of parallel work, not sequential tasks.**

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
