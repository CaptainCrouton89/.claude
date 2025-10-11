# Investigation Protocol (Moderate)

> **Project Context:** Review {cwd}/.claude/memory/history.md to understand recent changes and feature implementations that may be relevant to your investigation.

---

## Agent Selection

**code-finder-advanced** (default):
- Multi-file flows and architecture
- Tracing dependencies
- Pattern discovery

**code-finder** (simple cases):
- Known location, simple searches
- Single file/directory focus

**root-cause-analyzer** (debugging):
- Performance issues
- Bug diagnosis

**Direct tools** (when path is known):
- Grep/Glob/Read for quick lookups

---

## Investigation Strategy

### Single Agent Approach
**When to use:**
- Clear entry point
- Same domain/directory
- Sequential discovery works

**Pattern:**
```xml
<invoke name="Task">
  <parameter name="description">Investigate [feature]</parameter>
  <parameter name="subagent_type">code-finder-advanced</parameter>
  <parameter name="prompt">
Investigate [feature]:

**Focus areas:**
- [Primary domain: e.g., authentication]
- [Secondary domain: e.g., API endpoints]

**Deliverables:**
- Component flow diagram
- File:line references for key logic
- Integration points
- Patterns to follow
  </parameter>
</invoke>
```

### Parallel Agent Approach
**When to use:**
- Multi-domain (frontend + backend)
- Independent search spaces
- Speed matters

**Pattern:**
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Investigate backend</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Investigate backend implementation of [feature]:

      Focus: Services, API endpoints, database models
      Return: Architecture, file:line references, integration points
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Investigate frontend</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Investigate frontend implementation of [feature]:

      Focus: Components, state management, API calls
      Return: Component hierarchy, user flow, file:line references
    </parameter>
  </invoke>
</function_calls>
```

---

## Output Formats

### Code Flow Explanation

```markdown
## How [Feature] Works

### Purpose
[Brief description]

### High-Level Flow
1. User triggers [action]
2. [Component A] handles event (file.ts:line)
3. Calls [Function B] (file.ts:line)
4. Response processed by [Function C] (file.ts:line)
5. UI updates

### Key Files
- `file.ts:line` - [What it does]
- `file.ts:line` - [What it does]

### Data Flow
Input → Validation → Processing → API → Response → UI Update
```

### Performance Investigation

```markdown
## Performance Analysis: [Feature]

### Bottleneck
**Found:** [What's slow] taking Xms
**Location:** file.ts:line

### Root Cause
[Why it's slow with evidence]

### Fix Options
**Option A:** [Approach]
- Estimated improvement: Xms → Yms
- Effort: [time estimate]

**Recommendation:** [Which option and why]
```

### Code Location

```markdown
## Code Location: [Functionality]

### Main Implementation
**Primary file:** `file.ts`
- Lines X-Y: [What it does]

### Related Components
**UI:** `components/X.tsx:line`
**API:** `api/X.ts:line`
**State:** `store/X.ts:line`

### Entry Points
1. `file.ts:line` - [User-initiated]
2. `file.ts:line` - [System-initiated]
```

---

## Follow-Up Offer

After investigation, offer next steps:

```
Based on this investigation, I can:
1. **Implement fix** (if performance issue found)
2. **Deeper dive** (explain specific part)
3. **Related investigation** (connected feature)
4. **Documentation** (create diagram/docs)

What would you like?
```

---

## Quality Criteria

- [ ] Question fully answered
- [ ] Code locations with file:line
- [ ] Data flow explained (if relevant)
- [ ] Performance metrics (if applicable)
- [ ] Concrete examples
- [ ] Next steps offered
