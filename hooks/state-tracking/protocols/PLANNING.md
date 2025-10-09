# Planning Protocol

> **Project Context:** Review @.claude/memory/history.md to understand recent changes, existing patterns, and architectural decisions that should inform your plan.

---

## Step 1: Assess Request Clarity

**Before diving into planning, determine if you understand what needs to be built:**

### Clear Requirements ✅
User has provided specific details about what to build, how it should work, and the expected behavior.

→ **Proceed to Step 2: Investigation**

### Ambiguous Requirements ⚠️
User request is vague, missing key details, or could mean different things.

→ **Gather requirements first using these patterns:**

<requirements_gathering>

**Quick Discovery Questions:**

1. **Happy Path**: "Describe the successful scenario step-by-step from the user's perspective."

2. **Edge Cases**: "What should happen for: empty state, large datasets, invalid input, network failures, concurrent actions?"

3. **Performance Expectations**: "How should this feel? Instant (<100ms), fast (<1s), eventual (with loading), or background (no wait)?"

4. **Scope Boundaries**: "What's explicitly OUT of scope? What should we NOT build yet?"

5. **Integration Points**: "Does this interact with: existing features, external APIs, databases, auth/authorization?"

**Feature-Specific Questions** (use when relevant):

**For authentication/authorization:**
- Credentials approach? (Email/password, social login, magic link, 2FA?)
- Session duration? (Browser close / 7/30 days / never expire?)
- Failed login handling? (Generic error / account lock / CAPTCHA / rate limit?)

**For CRUD operations:**
- Validation rules? (Required fields, format rules, length limits, unique constraints?)
- Concurrent edit handling? (Last write wins / show conflict / lock?)
- Delete behavior? (Hard delete / soft delete / confirmation required?)

**For search/filtering:**
- Search scope? (Specific fields / all text / metadata?)
- Match type? (Exact / contains / fuzzy / full-text?)
- Timing? (Live / after pause / on Enter?)

**For real-time features:**
- Update mechanism? (Polling / WebSocket / SSE?)
- Update frequency? (1s / 5-10s / 1min / on action?)
- Offline behavior? (Queue actions / block / show offline mode?)

**Generate Inferences with Confidence Levels:**

```markdown
## Technical Inferences

### [INFER-HIGH] - Explicit or Industry Standard
- JWT tokens in httpOnly cookies (security best practice for "7-day sessions")
- Client + server validation (required fields mandate validation)

### [INFER-MEDIUM] - Common Practice, Alternatives Exist
- Debounced search 300ms (you said "live search" + performance consideration)
- Soft delete with isDeleted flag (you mentioned "undo capability")

### [INFER-LOW] - Filling Gaps
- Save search history in localStorage (common UX pattern)
- Max 100 search results per page (prevent UI overload)

## Clarification Needed
- Search across description or just title?
- Should filter state persist in URL for sharing?
```

**Present findings and confirm:**
"Here's my understanding with technical inferences marked by confidence level.

**HIGH** confidence inferences will be implemented unless you object.
**MEDIUM** confidence represents common approaches—let me know if you prefer differently.
**LOW** confidence items are gap-filling assumptions, easily changed.

Questions: [list any critical clarifications needed]

Ready to proceed with planning?"

</requirements_gathering>

→ **After requirements are clear, proceed to Step 2**

---

## Step 2: Investigation Phase

**CRITICAL: Before creating any plan, conduct thorough investigation. NOTHING can be left to assumptions.**

### Investigation Checklist

Before planning implementation:
- [ ] Read all relevant existing code files **completely** (not just snippets)
- [ ] Understand current system architecture and patterns
- [ ] Identify all dependencies and integration points
- [ ] Research external libraries and APIs if needed
- [ ] Identify existing patterns and conventions to follow
- [ ] Understand data models and database schemas
- [ ] Map current data flows and state management

### Parallel Investigation Strategy

**For complex or unfamiliar systems, parallelize research for efficiency.**

#### Pattern 1: Full-Stack Feature Investigation

**When to use:**
- Building features that span frontend + backend + database
- Need to understand complete system architecture
- Multiple independent domains to investigate

**Example:**
<example>
<function_calls>
  <invoke name="Task">
    <parameter name="description">Investigate backend patterns</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Analyze backend architecture for [feature domain]:

      **Focus areas:**
      - Services and controllers (services/, controllers/)
      - Database models and repositories (models/, repositories/)
      - API endpoints and routing (routes/, api/)
      - Validation and business logic patterns
      - External service integrations
      - Error handling conventions

      **Deliverables:**
      - Service architecture overview
      - API patterns and conventions (endpoint naming, response formats)
      - Database schema patterns
      - Common validation approaches
      - Error handling strategy
      - File:line references for key patterns to follow
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Investigate frontend patterns</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Analyze frontend architecture for [feature domain]:

      **Focus areas:**
      - Component structure (components/, pages/)
      - State management patterns (store/, hooks/, contexts/)
      - API client patterns (api/, services/)
      - Form handling and validation
      - UI component library and design system
      - Error handling and loading states

      **Deliverables:**
      - Component organization patterns
      - State management approach (Redux/Zustand/Context)
      - API integration patterns
      - Form validation patterns
      - Design system components available
      - File:line references for similar implementations
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Investigate data layer</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Analyze data layer for [feature domain]:

      **Focus areas:**
      - Database schema design patterns
      - Migration conventions
      - Repository/DAO patterns
      - Data validation rules
      - Relationship patterns (foreign keys, joins)
      - Caching strategies

      **Deliverables:**
      - Database schema conventions
      - Migration file patterns
      - Query patterns and optimizations
      - Data validation approach
      - File:line references for similar schemas
    </parameter>
  </invoke>
</function_calls>
</example>

#### Pattern 2: Architecture + Integration Investigation

**When to use:**
- Planning major features or system restructuring
- Need to understand both current system and external integration needs
- Evaluating multiple architectural approaches

**Example:**
<example>
Assistant: Let me begin investigating the current architecture.

<function_calls>
  <invoke name="Task">
    <parameter name="description">Analyze existing architecture</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Analyze existing system architecture:

      **Focus areas:**
      - Overall system organization and layer separation
      - Technology stack (frameworks, libraries, databases)
      - Current patterns and conventions
      - Service boundaries and responsibilities
      - Configuration management
      - Deployment architecture

      **Deliverables:**
      - Architecture overview
      - Technology decisions and constraints
      - Patterns to follow
      - Integration points with other systems
      - Configuration approach
      - File:line references for key architectural patterns
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Research integration requirements</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">
      Research integration requirements for [feature]:

      **Focus areas:**
      - External APIs and third-party services
      - Authentication/authorization integrations
      - Database connections and data sources
      - Message queues or event systems
      - Shared libraries and utilities
      - Deployment dependencies

      **Deliverables:**
      - External service requirements
      - Integration patterns to follow
      - Authentication/security considerations
      - Data flow between systems
      - Configuration requirements
      - File:line references for similar integrations
    </parameter>
  </invoke>
</function_calls>
</example>

#### Pattern 3: Single Domain, Deep Investigation

**When to use:**
- Feature is contained within single domain (frontend-only or backend-only)
- Codebase is unfamiliar and needs thorough understanding
- Need to trace complex flows within one layer

**Example:**
```xml
<invoke name="Task">
  <parameter name="description">Deep investigation of [domain]</parameter>
  <parameter name="subagent_type">code-finder-advanced</parameter>
  <parameter name="prompt">
    Perform comprehensive investigation of [domain] for [feature]:

    **Investigation goals:**
    1. Map complete file structure and organization
    2. Identify all similar existing features
    3. Document patterns, conventions, and anti-patterns
    4. Trace data flows and state management
    5. Identify reusable components and utilities
    6. Document integration points
    7. Find relevant tests to understand expected behavior

    **Deliverables:**
    - Complete file map with responsibilities
    - Similar feature implementations (file:line references)
    - Patterns to follow and anti-patterns to avoid
    - Data flow diagrams
    - Reusable utilities and components
    - Test patterns
  </parameter>
</invoke>
```

### Direct Investigation (No Agents)

**Use direct tools when:**
- You know exact file paths to read
- Investigation is simple and focused
- Quick lookups of specific patterns

**Approach:**
```
1. Use Grep to find relevant files
2. Use Read to examine files completely (not just snippets)
3. Use Glob to understand directory structure
4. Read configuration files, package.json, schema files
```

---

## Step 3: Create the Plan

**After thorough investigation, create a comprehensive, evidence-based plan.**

### Plan Template

```markdown
# Plan: [Feature Name]

## Summary

**Goal:** [One sentence: what will be implemented]

**Problem:** [Core problem being solved or feature being added]

---

## Reasoning

**Why this approach:**
- [Reason backed by investigation findings]
- [Reason backed by investigation findings]
- [Reason backed by investigation findings]

## Current System

### Key files:

**Backend:**
- `src/services/auth.ts` - [Current responsibility, discovered at line X]
- `src/routes/api.ts` - [Current endpoints, discovered at line Y]

**Frontend:**
- `components/Dashboard.tsx` - [Current functionality, discovered at line Z]
- `store/userSlice.ts` - [State management approach]

**Database:**
- `users` table - [Schema: columns discovered in migration file]
- `sessions` table - [Schema and relationships]

### Current data flow:

[Describe flow based on investigation]
User action → Component handler (Dashboard.tsx:45) →
API call (authClient.ts:67) → Backend endpoint (api.ts:123) →
Service (auth.ts:89) → Database query (repository.ts:34) →
Response processing → State update (userSlice.ts:56) → UI update


---

## New System Design

### New or modified files:

**New files:**
- `src/services/notification.ts` - [Purpose and responsibilities]
- `components/NotificationCenter.tsx` - [UI component for notifications]
- `database/migrations/2024_add_notifications.sql` - [Schema changes]

**Modified files:**
- `src/routes/api.ts` - Add notification endpoints (after line ~167 where other feature endpoints are)
- `components/Dashboard.tsx` - Integrate NotificationCenter component (line ~89, in sidebar section)
- `store/rootReducer.ts` - Add notificationSlice (line ~23, with other feature slices)

### Integration points:
1. **User service** - Notification recipients from user table
2. **WebSocket server** - Real-time notification delivery (existing WebSocket setup in server.ts:234)
3. **Email service** - Email notifications use existing SendGrid integration (services/email.ts:45)

### New data flow:

[Describe new or modified flow]
Trigger event → Notification service creates entry →
Database insert → WebSocket broadcast to connected clients →
Client receives notification → Redux store update →
NotificationCenter re-renders → Toast appears
```

### What to Include in Plans

**✅ DO Include:**
- **What to build** - Feature descriptions, component purposes
- **Where to build it** - Specific file paths discovered during investigation
- **How it integrates** - Dependencies, data flows, integration points
- **What patterns to follow** - References to existing code with file:line numbers

**❌ DON'T Include:**
- Code snippets or implementation details
- Self-evident advice ("write clean code", "follow best practices")
- Vague descriptions without file references
- Step-by-step coding instructions
- Generic recommendations without specific file paths
- Assumptions not validated during investigation

---

## Example: Complete Planning Session

**User Request:** "Add real-time notifications to the app"

**Step 1: Assess Clarity**
→ Request is somewhat vague. Need to gather requirements.

**Discovery Questions:**
1. "What events should trigger notifications? (New messages, system alerts, user actions?)"
2. "Where should notifications appear? (Toast messages, notification center, both?)"
3. "Should they persist? (Dismissible, permanent record, both?)"
4. "Real-time delivery method preference? (WebSocket, polling, SSE?)"

**User Responses:**
- "New messages and system alerts"
- "Both toast and notification center"
- "Keep permanent record, toasts are dismissible"
- "WebSocket for real-time"

**Generate Inferences:**
```markdown
### [INFER-HIGH]
- WebSocket for delivery (user specified)
- Notification persistence in database (user wants permanent record)
- Both UI components needed (user specified)

### [INFER-MEDIUM]
- Toast auto-dismiss after 5 seconds (common UX pattern)
- Mark as read functionality (standard notification behavior)
- Email fallback for offline users (common for important notifications)

### [INFER-LOW]
- Notification preferences per user (nice-to-have feature)
- Sound/browser notification support (enhancement)
```

→ Confirmed with user, proceed to investigation

**Step 2: Parallel Investigation**

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Investigate backend architecture</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Analyze backend for notification feature:
      - Existing WebSocket setup
      - Database schema patterns
      - Service layer patterns
      - API endpoint conventions
      Return specific file paths and patterns.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Investigate frontend patterns</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Analyze frontend for notification feature:
      - Component organization
      - State management approach
      - Toast/modal patterns
      - WebSocket client setup
      Return specific file paths and patterns.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Investigate database and schemas</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Analyze database patterns:
      - Migration file conventions
      - Schema design patterns
      - Indexing strategies
      Return specific patterns and file references.
    </parameter>
  </invoke>
</function_calls>
```

**Step 3: Create Plan**

[Use template above with findings from investigation]

**Result:** Comprehensive, evidence-based plan ready for implementation

