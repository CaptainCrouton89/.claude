# Feature Development Protocol (Moderate)

## Phase 1: Requirements Clarification

**Quick discovery questions (3-5 questions):**

1. **Happy Path**: Describe the successful scenario step-by-step
2. **Key Interactions**: What actions should users take? What happens?
3. **Scope Boundaries**: What's explicitly OUT of scope?
4. **Integration Points**: Does this interact with existing features, APIs, databases?

**Generate inferences:**

```markdown
## Technical Inferences

### [INFER-HIGH] - Explicit or Standard
- [Inference based on explicit requirements]

### [INFER-MEDIUM] - Common Practice
- [Inference based on common patterns]

### [INFER-LOW] - Assumption
- [Gap-filling assumption]

## Clarification Needed
- [Critical questions]
```

**Present and confirm:**
"Here's my understanding with inferences. HIGH confidence items will be implemented unless you object. Questions: [list]

Ready to proceed?"

---

## Phase 2: Planning

### 2A: Investigation (if needed)

**Use agents to understand codebase:**

```xml
<invoke name="Task">
  <parameter name="description">Investigate [area]</parameter>
  <parameter name="subagent_type">code-finder</parameter>
  <parameter name="prompt">
Investigate [feature area]:

**Key Areas:**
- [Domain 1]
- [Domain 2]

**Deliverables:**
- Affected files with file:line references
- Patterns to follow
- Integration points
  </parameter>
</invoke>
```

### 2B: Task Breakdown

```markdown
Batch 1 (parallel)
- Task 1: [Description - agent type]
- Task 2: [Description - agent type]

Batch 2
- Task 3: [Description - agent type]
```

**Parallelize when possible:**
- 2+ independent tasks = parallel execution
- Single message with multiple agent calls
- Tasks touching different files = good candidates

---

## Phase 3: Implementation

### 3A: Parallel Execution

**Agent prompt template:**

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">[Deliverable in 5-10 words]</parameter>
    <parameter name="subagent_type">[agent-type]</parameter>
    <parameter name="prompt">
Read [file.ts] for existing patterns.

Implement [specific deliverable]:
- [Requirement 1]
- [Requirement 2]

Success criteria: [Clear definition of done]
    </parameter>
  </invoke>
</function_calls>
```

**Example - 2 parallel tasks:**

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Create search API</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">
Read api/products.ts for patterns.

Create POST /api/search endpoint:
- Accept query and filters
- Return paginated results
- Target <100ms response

Success: Endpoint returns formatted results
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Create search UI</parameter>
    <parameter name="subagent_type">frontend-ui-developer</parameter>
    <parameter name="prompt">
Read components/Input.tsx for patterns.

Create SearchBar component:
- Debounced input (300ms)
- Loading spinner
- Keyboard navigation

Success: Component renders with all states
    </parameter>
  </invoke>
</function_calls>
```

### 3B: Self-Review

**Before presenting:**
- [ ] Accessibility: Semantic HTML, ARIA, keyboard nav
- [ ] Performance: No obvious inefficiencies
- [ ] Errors: Try-catch, friendly messages
- [ ] Edge Cases: Empty states, loading states

Fix issues before showing to user.

### 3C: Track Progress

Update todo list or project tracker with completed tasks.

Present: "TASK-001 complete. Ready for TASK-002?"

---

## Phase 4: Testing (if needed)

**Quick validation:**
- Test happy path manually
- Check edge cases
- Verify error handling

**Write tests if requested:**
- Unit tests for pure logic
- Integration tests for workflows

---

## Success Criteria

- [ ] Requirements clarified with inferences
- [ ] Tasks broken down clearly
- [ ] Parallel execution used where possible
- [ ] Self-review passed
- [ ] Progress tracked
