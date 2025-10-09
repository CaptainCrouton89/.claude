# Planning Protocol

**Before creating any plan, conduct thorough investigation. NOTHING can be left to assumptions.**

---

## Step 1: Investigation Phase

**Investigation checklist:**
- [ ] Read all relevant existing code files
- [ ] Understand current system architecture
- [ ] Identify dependencies and integration points
- [ ] Research external libraries and APIs if needed
- [ ] Identify existing patterns to follow

### Research-First Pattern (Optional)

For complex or unfamiliar systems, parallelize research:

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Analyze existing codebase patterns</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Analyze codebase at [paths]. Identify:
      - File structure and organization patterns
      - Similar existing features/components
      - Technology stack and frameworks
      - Code patterns and conventions
      - Integration points and dependencies

      Summarize with file paths.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Research integration requirements</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">
      Analyze integration points at [paths]:
      - External APIs and third-party services
      - Internal services and dependencies
      - Database schemas and data models
      - Shared utilities

      Document integration requirements.
    </parameter>
  </invoke>
</function_calls>
```

---

## Step 2: Plan Structure

### 1. Summary

```markdown
## Summary

**Goal:** [One sentence: what will be implemented]

**Problem:** [Core problem being solved]

**Scope:**
- In-scope: [What's included]
- Out of scope: [What's excluded]
```

---

### 2. Reasoning

```markdown
## Reasoning

**Why this approach:**
- [Reason with evidence from investigation]
- [Reason with evidence from investigation]

**Trade-offs:**
| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Option A | ... | ... | Rejected: [reason] |
| Option B | ... | ... | **Chosen:** [reason] |

**Key decisions:**
1. [Decision] - [Evidence-based reasoning]
2. [Decision] - [Evidence-based reasoning]
```

---

### 3. Current System

```markdown
## Current System

### Key files:

**Backend:**
- `src/path/file.ts` - [Current responsibility]

**Frontend:**
- `components/File.tsx` - [Current responsibility]

**Database:**
- `table_name` - [Schema and purpose]

### Current data flow:
```
[Flow description based on investigation]
```
```

---

### 4. New System Design

```markdown
## New System Design

### New or modified files:

**New files:**
- `src/path/new.ts` - [Purpose and responsibility]

**Modified files:**
- `src/path/existing.ts` - [Specific changes with line numbers]
- `package.json` - [Dependencies to add]

### Integration points:
1. [Integration with existing system component]
2. [Integration with existing system component]

### New data flow:
```
[Flow description]
```
```

---

### 5. Additional Context

```markdown
## Additional Context

### Type definitions:
- `types/new.ts` - [New types needed]

### Configuration:
- [Environment variables, config changes]

### External dependencies:
- `package-name` (version) - [Purpose]

### Error handling:
- [Error cases, existing patterns to follow]
```

---

## Step 3: Plan Validation

### Quality Checklist

- [ ] **All file paths are exact** (discovered during investigation)
- [ ] **Current system accurately described** (based on actual code reads)
- [ ] **Dependencies explicitly mapped** (no missing integration points)
- [ ] **No assumptions** (every assertion backed by investigation)
- [ ] **Technology choices justified** (with reasoning)

### Anti-Patterns

**❌ Vague:**
```markdown
- Update the authentication file
```

**✅ Specific:**
```markdown
- `src/middleware/auth.ts` - Add WebSocket token validation (line ~34)
```

---

**❌ Generic:**
```markdown
- Follow best practices
- Make sure to handle errors
```

**✅ Specific:**
```markdown
- Use existing error classes from `src/errors/AppError.ts`
- Follow component pattern from `components/MessageList.tsx` (lines 15-45)
```

---

**❌ Code snippets in plan:**
```markdown
const server = io(app);
server.on('connection', (socket) => {
  // handle connection
});
```

**✅ High-level description:**
```markdown
- Initialize Socket.io server in `src/websocket/server.ts`
- Follow initialization pattern from `src/database/connection.ts` (lines 10-25)
```

---

## What NOT to Include

**Exclude:**
- ❌ Code snippets or implementation details
- ❌ Self-evident advice ("write clean code", "follow best practices")
- ❌ Vague descriptions without file references
- ❌ Step-by-step coding instructions

**Include:**
- ✅ What to build (feature description)
- ✅ Why this approach (architectural reasoning)
- ✅ Where to build it (specific file paths)
- ✅ How it integrates (dependencies, data flow)
- ✅ What patterns to follow (references to existing code)

---

## Example Plan Template

```markdown
# Plan: [Feature Name]

## Summary
**Goal:** [One sentence]
**Problem:** [Core problem]
**Scope:**
- In-scope: [What's included]
- Out of scope: [What's excluded]

## Reasoning
**Why this approach:**
- [Reason with evidence]

**Trade-offs:**
| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Option A | ... | ... | Rejected: [reason] |
| Option B | ... | ... | **Chosen:** [reason] |

**Key decisions:**
1. [Decision] - [Evidence-based reasoning]

## Current System
### Key files:
**Backend:**
- `path/to/file.ts` - [Current purpose]

**Database:**
- `table_name` - [Schema]

### Current data flow:
```
[Flow based on investigation]
```

## New System Design
### New or modified files:
**New files:**
- `path/to/new.ts` - [Purpose]

**Modified files:**
- `path/to/existing.ts` - [Changes with line numbers]

### Integration points:
1. [Integration with existing component]

### New data flow:
```
[Flow description]
```

## Additional Context
### Type definitions:
- `types/new.ts` - [New types]

### Configuration:
- [Environment variables]

### External dependencies:
- `package-name` (version) - [Purpose]

### Error handling:
- [Error cases, existing patterns to follow]
```

---

## Critical Requirements

**Every assertion based on investigation:**
- ✅ "Auth system uses JWT tokens in `src/middleware/auth.ts`" (verified)
- ❌ "Auth system probably uses JWT tokens" (assumption)

**Exact file paths:**
- ✅ `components/features/messaging/MessageList.tsx`
- ❌ `somewhere in the components folder`

**Dependencies explicitly mapped:**
- ✅ "WebSocket server depends on Express app from `src/server.ts` (line 15), JWT from `src/utils/jwt.ts` (line 23)"
- ❌ "WebSocket server needs Express and JWT"

---
