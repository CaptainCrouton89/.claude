# Planning Protocol (Moderate)

> **Project Context:** Review {cwd}/.claude/memory/history.md to understand recent changes, existing patterns, and architectural decisions that should inform your plan.

> **⚠️ Pre-Production Context:** This project is in pre-production. **Make breaking changes without hesitation when they improve the codebase.** Do not maintain backwards compatibility or use fallbacks—refactor boldly.

---

## Step 1: Assess Request Clarity

**Before diving into planning, determine if you understand what needs to be built:**

### Clear Requirements ✅
User has provided specific details about what to build, how it should work, and the expected behavior.

→ **Proceed to Step 2: Investigation**

### Ambiguous Requirements ⚠️
User request is vague, missing key details, or could mean different things.

→ **Ask focused clarification questions:**

**Quick Discovery Questions:**

1. **Happy Path**: "Describe the successful scenario step-by-step from the user's perspective."

2. **Key Interactions**: "What are the main actions users will take? What should happen when they do?"

3. **Scope Boundaries**: "What's explicitly OUT of scope? What should we NOT build yet?"

4. **Integration Points**: "Does this interact with: existing features, external APIs, databases, auth/authorization?"

**Generate Inferences with Confidence Levels:**

```markdown
## Technical Inferences

### [INFER-HIGH] - Explicit or Industry Standard
- JWT tokens in httpOnly cookies (security best practice for "7-day sessions")

### [INFER-MEDIUM] - Common Practice, Alternatives Exist
- Debounced search 300ms (you said "live search" + performance consideration)

### [INFER-LOW] - Filling Gaps
- Save search history in localStorage (common UX pattern)

## Clarification Needed
- Search across description or just title?
```

**Present findings and confirm:**
"Here's my understanding with technical inferences marked by confidence level. HIGH confidence inferences will be implemented unless you object. Questions: [list any critical clarifications needed]

Ready to proceed with planning?"

→ **After requirements are clear, proceed to Step 2**

---

## Step 2: Investigation Phase

**Conduct focused investigation to understand the codebase and affected areas.**

### Investigation Checklist

Before planning implementation:
- [ ] Identify the main areas affected by this change
- [ ] Understand current patterns and conventions to follow
- [ ] Review relevant existing code
- [ ] Map key integration points
- [ ] Identify existing components/utilities to leverage

### Investigation Strategy: Agent-First with Lifecycle Monitoring

**For most tasks, start with agents to identify affected areas:**

Use code-finder agents to systematically discover patterns and affected code. Agents write real-time responses to `agent-responses/{agent_id}.md` files—monitor via hook alerts or use `./agent-responses/await {agent_id}` to wait for completion.

**Use agents when:**
- Working in unfamiliar codebases (default)
- Multiple integration points to trace
- Complex dependency chains
- Refactoring shared utilities

**Example targeted investigation:**

```xml
<invoke name="Task">
  <parameter name="description">Investigate [specific area]</parameter>
  <parameter name="subagent_type">code-finder-advanced</parameter>
  <parameter name="prompt">
Investigate [feature/refactor] focusing on:

**Key Areas:**
- [Primary domain: e.g., authentication flows]
- [Secondary domain: e.g., API endpoints]
- [Integration points]

**Deliverables:**
1. List of main affected files with file:line references
2. Current patterns and conventions in use
3. Key integration points
4. Recommended approach based on findings
  </parameter>
</invoke>
```

---

## Step 3: Create the Plan

**After investigation, create a clear, actionable plan.**

**IMPORTANT: Write the final plan to `.docs/plans/[relevant-name].md` in the project repository.**

### Plan Template

```markdown
# Plan: [Feature/Refactor Name]

## Summary

**Goal:** [One sentence: what will be implemented/changed]

**Type:** [Feature | Refactor | Enhancement | Bug Fix]

**Problem:** [Core problem being solved or improvement being made]

---

## Reasoning

**Why this approach:**
- [Reason backed by investigation findings with file:line references]
- [Reason backed by investigation findings with file:line references]

**Alternatives considered:**
- [Alternative 1: Why it was rejected]

---

## Impact Analysis

### Main Affected Files

**Files requiring changes:** [X files total]

**Backend (Y files):**
- `src/services/auth.ts:45-67` - [What changes + why]
- `src/routes/api.ts:123` - [What changes + why]

**Frontend (Z files):**
- `components/Dashboard.tsx:89` - [What changes + why]
- `store/userSlice.ts:12-34` - [What changes + why]

**Tests (M files):**
- `tests/auth.test.ts` - [How tests need to update]

### Key Integration Points

1. **User service** (`services/user.ts:45`) - [How it connects]
2. **WebSocket server** (`server.ts:234`) - [Integration details]

---

## Current System

### Relevant Files

**Backend:**
- `src/services/auth.ts` - [Current responsibility, discovered at line X]
- `src/routes/api.ts` - [Current endpoints, discovered at line Y]

**Frontend:**
- `components/Dashboard.tsx` - [Current functionality, discovered at line Z]

### Current Flow

User action → Component handler (Dashboard.tsx:45) →
API call (authClient.ts:67) → Backend endpoint (api.ts:123) →
Service (auth.ts:89) → Response → State update (userSlice.ts:56) → UI update

---

## New/Modified System Design

### New Files

- `src/services/notification.ts` - [Purpose and responsibilities]
- `components/NotificationCenter.tsx` - [UI component for notifications]

### Modified Files

- `src/routes/api.ts:167` - Add notification endpoints (follows pattern at line 123-145)
- `components/Dashboard.tsx:89` - Integrate NotificationCenter (sidebar section)

### New/Modified Flow

Trigger event → Notification service creates entry →
Database insert → Client notification → Redux store update →
NotificationCenter re-renders → Toast appears

---

## Implementation Checklist

- [ ] Main affected files identified
- [ ] Key integration points validated
- [ ] Test updates identified
- [ ] Configuration changes noted
```

### What to Include in Plans

**✅ DO Include:**
- **Main affected files** - Primary files that will be modified/created
- **What to build/change** - Clear descriptions with specific file:line references
- **Key integration points** - Important dependencies and connections with file:line numbers
- **Patterns to follow** - References to existing code with file:line numbers

**❌ DON'T Include:**
- Code snippets or implementation details
- Self-evident advice ("write clean code", "follow best practices")
- Vague descriptions without file references
- Step-by-step coding instructions

---

## Key Takeaway

**Focus on clarity and practicality:**
- Understand requirements through targeted questions
- Investigate enough to create an informed plan
- Document the main areas affected
- Keep the plan clear and actionable
