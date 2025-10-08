# Bug-Fixing Protocol

## Step 1: Bug Discovery (Ask 3-5 Questions)

**Don't immediately jump to code.** Discover the full scope:

### Q1: Reproduction
```
"What are the exact steps to reproduce this bug?

Include:
- Starting state
- Actions taken
- Expected result
- Actual result
- Any error messages"
```

### Q2: Scope
```
"Does this happen:
- Always or intermittently?
- On all browsers/devices or specific ones?
- For all users or specific scenarios?
- In production, staging, or just local dev?"
```

### Q3: Recent Changes
```
"When did this start happening?
Did it work before? What changed?
(Check project.md Recent Tasks for clues)"
```

### Q4: Impact (if not obvious)
```
"Who is affected?
- All users?
- Specific user roles?
- Edge case only?

How urgent? (blocks work / annoying / minor)"
```

### Q5: Related Issues (optional)
```
"Are there other bugs that might be related?
Any similar issues fixed before?
(Check Project Learnings for patterns)"
```

---

## Step 2: Root Cause Diagnosis

### Debugging Workflow

**For Complex/Non-Obvious Bugs:**

1. **Understand the codebase** - Read relevant files/tables/documents to understand the codebase, and look up documentation for external libraries.
2. **Identify 5-8 most likely root causes** - List potential reasons for the issue
3. **Choose the 3 most likely causes** - Prioritize based on probability and impact
4. **Decide whether to implement or debug** - If the cause is obvious, implement the fix and inform the user. If the cause is not obvious, continue this workflow.

**Steps for Non-obvious Causes:**

5. **For each of the 3 causes, validate by adding targeted logging/debugging**
6. **Let the user test** - Have them run the code with the new logging
7. **Fix when solution is found** - Implement the actual fix once root cause is confirmed
8. **Remove debugging logs** - Clean up temporary debugging code

**Remember:**
- Reading the entire file usually uncovers more information than just a snippet
- Without complete context, edge cases will be missed
- Making assumptions leads to poor analysis—stepping through code and logic sequentially is the best way to find the root cause

### Standard Analysis Process

Based on answers:

1. **Check Project Learnings** - Have we seen this before?
2. **Form hypothesis** - What's likely causing this?
3. **Verify hypothesis** - Read relevant code, check logs

Present:
```
## Bug Analysis

**Symptom:** [User-facing problem]
**Root cause hypothesis:** [Technical explanation]
**Affected code:** [Files/functions]

**Reasoning:**
- [Evidence 1]
- [Evidence 2]

**Confidence:** HIGH/MEDIUM/LOW

Shall I investigate [file/area] to confirm?
```

---

## When to Use Root-Cause-Analyzer Agent

Use the root-cause-analyzer agent when:

### Scenarios for Agent Usage

**Complex Multi-File Bugs:**
- Bug spans multiple components/services
- Need to trace execution flow across 5+ files
- Unclear which subsystem is causing the issue

**System Integration Issues:**
- Bug involves interactions between distinct systems (e.g., auth + payments + notifications)
- Need to understand data flow across service boundaries
- External dependencies involved (APIs, databases, message queues)

**Performance Debugging:**
- Performance degradation with unclear cause
- Need to analyze multiple potential bottlenecks
- Requires profiling across system layers

**Race Conditions/Concurrency:**
- Intermittent bugs that suggest timing issues
- Multiple async operations interacting
- Need to trace concurrent execution paths

**Unknown Codebase Bugs:**
- New to the codebase and unfamiliar with architecture
- Bug in legacy code without clear documentation
- Need comprehensive investigation before diagnosis

### How to Use the Agent

```
Create a root-cause-analyzer agent task:

**Scope:** [Describe the bug and known symptoms]
**Focus areas:** [List suspected components/files]
**Investigation goals:**
- Trace execution flow from [entry point] to [failure point]
- Identify which component is responsible for [symptom]
- Map dependencies between [system A] and [system B]

**Output needed:**
- Root cause hypothesis with evidence
- Affected files and functions
- Recommended debugging approach
```

---

## Step 3: Solution Proposal

After confirming root cause:

```
## Proposed Fix

**Change:** [What code will change]
**Why:** [How this fixes the root cause]
**Side effects:** [What else might be affected - be explicit!]

**Testing plan:**
1. [How to verify fix works]
2. [How to verify no regressions]

**Alternative approaches:**
- [Option 2 - with trade-offs]

Proceed with this fix? (yes/try alternative)
```

---

## Parallel Bug Fixing

Use parallel agents when the fix requires **independent changes across multiple files**.

### When to Parallelize Bug Fixes

**Eligible Scenarios:**

1. **Multi-Component Bugs:**
   - Same bug exists in frontend + backend + mobile
   - Each fix is independent (different files, no shared state)
   - Example: Input validation bug in 3 separate API endpoints

2. **Bug Cascades:**
   - One root cause creates symptoms in multiple isolated areas
   - Each symptom requires separate fix
   - Example: Null handling bug affecting dashboard, reports, and exports

3. **Integration Bug Fixes:**
   - Bug requires changes across distinct systems
   - Each system can be fixed independently
   - Example: Data sync issue between auth service, user service, and cache layer

### When NOT to Parallelize

**Single Fix Point:**
- Bug has one clear location
- Fix is in a single file or closely related files

**Sequential Dependencies:**
- Fix in component A must complete before fixing component B
- Shared state or file modifications

**Complex Root Cause:**
- Still diagnosing the issue
- Unclear if multiple changes are needed

### Parallel Bug Fix Template

```
Bug confirmed in [N] independent locations.

Create [N] parallel implementor agents:

**Agent 1: Fix [Component A]**
- File: [path]
- Change: [specific fix]
- Verification: [test command]

**Agent 2: Fix [Component B]**
- File: [path]
- Change: [specific fix]
- Verification: [test command]

**Agent 3: Fix [Component C]**
- File: [path]
- Change: [specific fix]
- Verification: [test command]

Launch all agents in single function_calls block.
```

### Example: Parallel Bug Fix

```
Bug: Date formatting inconsistency across UI

Root cause: Missing timezone handling in 3 components

Parallel fix approach:
- Agent 1: Fix dashboard/analytics/Charts.tsx
- Agent 2: Fix reports/ReportGenerator.tsx
- Agent 3: Fix admin/UserActivity.tsx

Each agent:
1. Import formatDateWithTimezone utility
2. Replace Date.toLocaleDateString() calls
3. Add timezone parameter from user preferences
4. Verify output matches expected format
```

---

## Step 4: Implement + Validate

After approval:

1. **Fix the bug**

2. **Self-review checklist:**
   - [ ] Bug actually fixed (not just symptoms)
   - [ ] No new bugs introduced
   - [ ] Edge cases handled
   - [ ] Error messages improved if relevant
   - [ ] Performance not degraded

3. **Create test to prevent regression** (if possible)

---

## Step 5: Document Learning

If bug reveals a pattern or mistake:

```markdown
### PL-XXX: [Bug name]

**Discovered:** Bug-fix session, [date]

**Issue:**
[What went wrong]

**Root Cause:**
[Why it happened - architectural/assumption error]

**Solution:**
[How it was fixed]

**Prevention:**
Rule: [Specific practice to avoid in future]
Example: "Always validate user input server-side, even if client validates"

**Category:** Bug
```

Add to project.md under "Project Learnings".

---

## Step 6: Update State

```
✓ Bug fixed: [brief description]
✓ Root cause: [technical cause]
✓ Learning documented: PL-XXX
✓ Prevention rule: [practice to follow]

Files modified:
- [file]: [what changed]

Ready for next task? (yes/more bugs/new feature)
```

---

## Example Session

```
Human: "The search results show duplicates"

LLM: Let me discover the bug details:

1. What are exact steps to reproduce?
   - Search for what term?
   - How many duplicates?
   - Always or intermittent?

2. When did this start?
   - Did search work before?
   - What was built recently?

3. Does it happen:
   - All browsers or specific one?
   - All search terms or specific ones?

[Human answers...]

LLM:
## Bug Analysis

**Symptom:** Search results contain duplicate entries
**Root cause hypothesis:** Missing .distinct() in database query
**Affected code:** src/search/searchService.js:45

**Reasoning:**
- Duplicates suggest JOIN without deduplication
- Recent change added category filter (new JOIN added)
- Happens on all searches with category filter

**Confidence:** HIGH

Shall I check searchService.js to confirm?

[Human: yes]

LLM:
## Proposed Fix

**Change:** Add .distinct() to search query in searchService.js:45
**Why:** JOIN on categories creates cartesian product without deduplication
**Side effects:** None - results should be unique anyway

**Testing plan:**
1. Search with category filter → verify no duplicates
2. Search without filter → verify still works
3. Check performance → .distinct() might be slightly slower

**Alternative approaches:**
- Use subquery instead of JOIN (more complex, same result)

Proceed with this fix? (yes/try alternative)
```

---

## Agent-Based Debugging Strategies

Choose the right agent strategy based on bug complexity and scope.

### Strategy 1: Single Root-Cause-Analyzer

**When to use:**
- Complex bug with unclear root cause
- Need comprehensive investigation before fixing
- Unfamiliar codebase or system

**Workflow:**
```
1. Create root-cause-analyzer agent with investigation scope
2. Agent analyzes and returns hypothesis + evidence
3. Review findings and decide on fix approach
4. Implement fix yourself OR create implementor agent
```

**Example:**
```
"Performance degradation in API - unclear which endpoint is slow"

Agent task:
- Profile all API endpoints
- Analyze database query patterns
- Check caching behavior
- Identify bottleneck with evidence

Output: Detailed analysis → Implement fix based on findings
```

### Strategy 2: Parallel Diagnosis + Parallel Fix

**When to use:**
- Bug might be in one of several distinct systems
- Each system needs separate investigation
- Multiple potential root causes across different domains

**Workflow:**
```
1. Create multiple root-cause-analyzer agents (one per domain)
2. Each investigates their area in parallel
3. Review all findings to identify actual root cause
4. Create parallel implementor agents for multi-location fixes (if needed)
```

**Example:**
```
"Users report intermittent login failures"

Parallel diagnosis agents:
- Agent 1: Investigate auth service (API, session management)
- Agent 2: Investigate database (connection pool, query performance)
- Agent 3: Investigate frontend (token handling, network requests)

One agent finds issue → Implement fix in that domain
Multiple agents find issues → Parallel fix with implementors
```

### Strategy 3: Investigation Agent → Parallel Implementors

**When to use:**
- Bug root cause is known to affect multiple locations
- Each fix location needs careful implementation
- Want to parallelize the fix phase after diagnosis

**Workflow:**
```
1. Single root-cause-analyzer identifies all affected locations
2. Review findings and confirm fix approach for each
3. Create parallel implementor agents (one per location)
4. Each implements their specific fix independently
```

**Example:**
```
"SQL injection vulnerability in user input validation"

1. Investigation agent scans codebase for all user input points
   Output: 8 endpoints need parameterized queries

2. Create 8 parallel implementor agents:
   - Each fixes one endpoint with proper parameter binding
   - Each adds input validation
   - Each updates tests

3. All agents run simultaneously → Faster remediation
```

### Agent Strategy Decision Tree

```
Is root cause obvious?
├─ YES → Fix directly OR single implementor agent
└─ NO → Investigation needed
    │
    ├─ Single system suspected?
    │  └─ YES → Single root-cause-analyzer → Implement
    │
    └─ Multiple systems might be involved?
       └─ YES → Parallel root-cause-analyzers
           │
           ├─ One system has the bug?
           │  └─ Fix that system
           │
           └─ Multiple systems need fixes?
              └─ Parallel implementors for each
```

### Agent Coordination Best Practices

**Context Provision:**
- Give each agent only relevant files/context
- Avoid redundant investigation by clearly separating domains
- Reference shared utilities/types all agents should use

**Verification:**
- Each agent should verify their fix independently
- Run tests after all parallel agents complete
- Check for integration issues between fixes

**Progress Tracking:**
- Use TodoWrite to track agent progress
- Mark investigation complete before starting implementation
- Document findings for future reference

---

## Common Bug Patterns

### Null/Undefined Errors
- Check: Optional chaining usage
- Verify: Null checks before access
- Consider: Default values

### Performance Issues
- Profile: Identify bottleneck
- Measure: Before/after metrics
- Optimize: Targeted changes only

### Race Conditions
- Identify: Concurrent operations
- Solution: Locks, queues, or atomics
- Test: Stress testing

### Integration Errors
- Check: API contract changes
- Verify: Error handling
- Test: Mock failure scenarios

---

## Quality Criteria

Bug fix complete when:
- [ ] Root cause identified and verified
- [ ] Fix addresses cause, not just symptom
- [ ] Self-review checklist passed
- [ ] Regression test created (if applicable)
- [ ] Learning documented in project.md
- [ ] No new bugs introduced

---
