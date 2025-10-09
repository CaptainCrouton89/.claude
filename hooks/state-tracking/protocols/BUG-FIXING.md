# Bug-Fixing Protocol

## Step 1: Discover Scope (Ask 3-5 Questions)

1. **Reproduction:** Steps to reproduce, expected vs actual result, error messages
2. **Scope:** Always/intermittent? Which browsers/devices? Prod/staging/local?
3. **Recent Changes:** When did it start? Check project.md Recent Tasks
4. **Impact:** Who's affected? Urgency level?
5. **Related Issues:** Similar past bugs? Check Project Learnings

## Step 2: Diagnose Root Cause

### For Complex/Non-Obvious Bugs:

1. Read relevant files/docs completely (not just snippets)
2. List 5-8 most likely root causes
3. Prioritize top 3 causes
4. If obvious → implement and inform. If not → add targeted logging for top 3
5. User tests with new logging
6. Implement fix once confirmed
7. Remove debugging logs

### Present Analysis:

```
## Bug Analysis

**Symptom:** [User-facing problem]
**Root cause:** [Technical explanation]
**Affected code:** [Files/functions]
**Reasoning:** [Evidence]
**Confidence:** HIGH/MEDIUM/LOW

Proceed? (yes/investigate further)
```

## Step 3: Propose Solution

```
## Proposed Fix

**Change:** [What will change]
**Why:** [How this fixes root cause]
**Side effects:** [What else affected]
**Testing:** [Verify fix + no regressions]
**Alternatives:** [Other options with trade-offs]

Proceed? (yes/alternative)
```

## Step 4: Parallelize Fixes (When Applicable)

Use parallel agents for **independent changes across multiple files**.

### When to Parallelize:
- Same bug in multiple components (frontend + backend + mobile)
- Bug cascade: one root cause, multiple isolated symptoms
- Integration bugs requiring changes across distinct systems

### When NOT to Parallelize:
- Single file fix
- Sequential dependencies between fixes
- Still diagnosing root cause

### Parallel Execution:

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Fix Component A</parameter>
    <parameter name="subagent_type">implementor</parameter>
    <parameter name="prompt">
File: [path]
Change: [specific fix]
Verification: [test command]
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Fix Component B</parameter>
    <parameter name="subagent_type">implementor</parameter>
    <parameter name="prompt">
File: [path]
Change: [specific fix]
Verification: [test command]
    </parameter>
  </invoke>
</function_calls>
```

## Step 5: Implement + Validate

1. Fix the bug
2. Self-review:
   - Root cause addressed (not just symptoms)
   - No new bugs
   - Edge cases handled
   - Performance maintained
3. Create regression test if possible

## Step 6: Document Learning

If bug reveals pattern/mistake, add to project.md:

```markdown
### PL-XXX: [Bug name]

**Issue:** [What went wrong]
**Root Cause:** [Why it happened]
**Solution:** [How fixed]
**Prevention:** [Rule to avoid in future]
**Category:** Bug
```

## Agent Strategies

### Single Root-Cause-Analyzer
Use when: Complex bug, unclear cause, unfamiliar codebase

### Parallel Diagnosis
Use when: Bug might be in one of several distinct systems
Create multiple analyzers → review findings → implement fixes

### Investigation → Parallel Implementors
Use when: Known root cause affects multiple locations
Single analyzer identifies all locations → parallel implementors fix each

## Common Bug Patterns

- **Null/Undefined:** Check optional chaining, null checks, defaults
- **Performance:** Profile, measure, optimize targeted changes only
- **Race Conditions:** Identify concurrent ops, use locks/queues/atomics
- **Integration:** Check API contracts, error handling, mock failures
