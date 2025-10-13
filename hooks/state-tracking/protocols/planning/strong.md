# Planning Protocol

> **Project Context:** Review {cwd}/.claude/memory/history.md to understand recent changes, existing patterns, and architectural decisions that should inform your plan.

> **⚠️ Pre-Production Context:** This project is in pre-production. **Make breaking changes without hesitation when they improve the codebase.** Do not maintain backwards compatibility or use fallbacks—refactor boldly.

---

## Step 1: Assess Request Clarity

**This protocol applies to both new features AND refactoring tasks.**

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
- [ ] **Identify ALL parts of the codebase affected by this change** (use code-finder agents)
- [ ] Identify all dependencies and integration points
- [ ] Research external libraries and APIs if needed
- [ ] Identify existing patterns and conventions to follow
- [ ] Understand data models and database schemas
- [ ] Map current data flows and state management
- [ ] **Find all call sites, usages, and dependent code** (refactors especially)

### Default Investigation Strategy: Impact Analysis with Code-Finder

**ALWAYS start with code-finder agents to identify ALL affected areas.**

This is critical for both features and refactors. Many plans fail because they miss affected code.

**Standard Impact Analysis (Use for 90% of tasks):**

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Comprehensive impact analysis</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
Perform comprehensive impact analysis for [feature/refactor]:

**Investigation Goals:**
1. Find ALL files that will be affected by this change
2. Identify every usage, call site, and dependency
3. Map integration points across the entire codebase
4. Discover patterns to follow or anti-patterns to avoid
5. Identify potential breaking changes or ripple effects

**Specific Areas to Investigate:**
- [Domain 1: e.g., authentication flows]
- [Domain 2: e.g., API endpoints]
- [Domain 3: e.g., UI components]
- [Domain 4: e.g., database schemas]

**For Refactors, MUST include:**
- All call sites of functions/classes being changed
- All imports and dependencies
- All tests that reference affected code
- All configuration files that might reference these structures

**Deliverables:**
1. Complete list of affected files with file:line references
2. Current patterns and conventions in use
3. Integration points and dependencies map
4. Ripple effect analysis (what breaks if we change X?)
5. Recommended approach based on findings
    </parameter>
  </invoke>
</function_calls>
```

**Why this matters:** Plans are incomplete when they miss affected areas. Code-finder agents excel at comprehensive codebase analysis.

### Agent Lifecycle Management

**Monitoring Agent Progress:**
- Agents write real-time responses to `agent-responses/{agent_id}.md` files
- Hook system alerts automatically on updates and completion
- Use `./agent-responses/await {agent_id}` to actively wait for specific agents
- Add `--watch` flag to return after first update instead of completion
- Status tracking: in-progress → done/failed/interrupted

**Recursion Depth Limits:**
- Maximum 3 levels of agent nesting (tracked via CLAUDE_AGENT_DEPTH)
- Agents at depth 3 cannot spawn more agents
- Plan accordingly when deep delegation is needed

**Forbidden Agents:**
- Agents cannot spawn themselves (self-spawning prevention)
- Each agent type maintains a forbidden agents list
- Registry system tracks active agents with PIDs in `.active-pids.json`

**Best Practices:**
- Launch independent agents in parallel (single function_calls block)
- Use await command for blocking operations or continue other work
- Check agent status before starting dependent tasks
- Monitor via hook alerts rather than manual polling

### Parallel Investigation Strategy

**After initial impact analysis, parallelize deeper investigation if needed.**

#### Pattern 1: Full-Stack Feature/Refactor Investigation

**When to use:**
- Building features that span frontend + backend + database
- Refactoring that affects multiple layers
- Need to understand complete system architecture
- Multiple independent domains to investigate

**Example:**
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Investigate backend impact</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
Analyze backend for [feature/refactor]:

**Impact Analysis:**
- All affected services and controllers
- API endpoints that need changes or additions
- Database models and repositories impacted
- All call sites if refactoring existing code
- External service integrations affected

**Pattern Analysis:**
- Service architecture patterns to follow
- API conventions (endpoint naming, response formats)
- Database schema patterns
- Validation approaches
- Error handling strategies

**Deliverables:**
- Complete list of affected backend files (file:line)
- All call sites and dependencies
- Ripple effects from proposed changes
- Patterns to follow
- Integration points that will be affected
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Investigate frontend impact</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
Analyze frontend for [feature/refactor]:

**Impact Analysis:**
- All components affected by this change
- State management updates needed
- API client changes required
- All usages if refactoring existing components
- UI components that depend on affected code

**Pattern Analysis:**
- Component organization patterns
- State management approach (Redux/Zustand/Context)
- API integration patterns
- Form/validation patterns
- Design system components available

**Deliverables:**
- Complete list of affected frontend files (file:line)
- Component dependency tree
- State management impacts
- UI/UX patterns to follow
- Breaking changes and migration needs
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Investigate data layer impact</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
Analyze data layer for [feature/refactor]:

**Impact Analysis:**
- Schema changes required
- All queries affected by schema changes
- Migration dependencies and order
- Data integrity considerations
- Performance implications

**Pattern Analysis:**
- Database schema conventions
- Migration file patterns
- Repository/DAO patterns
- Query optimization patterns
- Indexing strategies

**Deliverables:**
- Schema change requirements (file:line)
- All affected queries and repositories
- Migration strategy
- Data validation updates needed
- Performance considerations
    </parameter>
  </invoke>
</function_calls>
```

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

#### Pattern 3: Single Domain Impact Investigation

**When to use:**
- Feature/refactor is contained within single domain (frontend-only or backend-only)
- Codebase is unfamiliar and needs thorough understanding
- Need to trace complex flows within one layer
- Refactoring utilities, helpers, or shared code

**Example:**
```xml
<invoke name="Task">
  <parameter name="description">Deep impact analysis of [domain]</parameter>
  <parameter name="subagent_type">code-finder-advanced</parameter>
  <parameter name="prompt">
Perform comprehensive investigation of [domain] for [feature/refactor]:

**Impact Analysis Goals:**
1. Find ALL files affected by this change
2. Identify all call sites and usages (critical for refactors)
3. Map dependency chains and ripple effects
4. Locate all imports and references
5. Find tests that will need updates
6. Identify configuration or build files affected

**Pattern Analysis Goals:**
1. Document existing patterns and conventions
2. Identify similar implementations to follow
3. Trace data flows and state management
4. Find reusable components and utilities
5. Understand anti-patterns to avoid

**For Refactors, MUST include:**
- Every file that imports the code being changed
- Every function/component that calls the code being changed
- Every test that references the code
- Every type/interface that depends on the code
- Every configuration that references the code

**Deliverables:**
- Complete list of affected files (file:line)
- Full dependency/usage tree
- Ripple effect analysis
- Migration requirements for breaking changes
- Patterns to follow
- Test update requirements
  </parameter>
</invoke>
```

### Direct Investigation (Rare - Only for Trivial Changes)

**Use direct tools ONLY when:**
- Single file change with zero dependencies
- You already know the complete codebase structure
- Investigation is trivial (e.g., changing a constant value)

**Default to code-finder agents for everything else.**

**If using direct tools:**
```
1. Use Grep to find ALL usages/references (not just a few)
2. Use Read to examine files completely (never snippets)
3. Use Glob to verify you haven't missed affected areas
4. Double-check imports, tests, and configuration files
```

**Warning:** Direct investigation often misses affected code. Use agents unless you're 100% certain of the scope.

---

## Step 3: Create the Plan

**After thorough investigation, create a comprehensive, evidence-based plan.**

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
- [Reason backed by investigation findings with file:line references]

**Alternatives considered:**
- [Alternative 1: Why it was rejected]
- [Alternative 2: Why it was rejected]

---

## Impact Analysis

### ALL Affected Files

**Files requiring changes:** [X files total]

**Backend (Y files):**
- `src/services/auth.ts:45-67` - [What changes + why]
- `src/routes/api.ts:123` - [What changes + why]
- `src/middleware/validate.ts:34` - [What changes + why]

**Frontend (Z files):**
- `components/Dashboard.tsx:89` - [What changes + why]
- `components/LoginForm.tsx:23,56,78` - [Multiple locations, what changes]
- `store/userSlice.ts:12-34` - [What changes + why]

**Database (N files):**
- `migrations/2024_add_notifications.sql` - [New migration, what it does]
- `schema.prisma:45` - [Schema changes]

**Tests (M files):**
- `tests/auth.test.ts` - [How tests need to update]
- `tests/components/Dashboard.test.tsx` - [Component test updates]

**Configuration (P files):**
- `.env.example` - [New environment variables]
- `tsconfig.json` - [If paths or settings change]

### Call Sites and Dependencies

**For refactors, list ALL usage locations:**
- `utils/formatDate.ts` used in:
  - `components/EventCard.tsx:34`
  - `components/Timeline.tsx:67, 89`
  - `services/calendar.ts:123`
  - `pages/Dashboard.tsx:45`
  - [Total: 15 call sites across 8 files]

### Ripple Effects

**Changes that will cascade:**
- Updating `UserType` interface → 12 components need type updates
- Changing API response format → 5 API clients need updates
- Modifying database schema → 8 queries need adjustments

### Breaking Changes

**What will break:**
- [Change 1: What breaks + migration strategy]
- [Change 2: What breaks + migration strategy]

---

## Current System

### Relevant Files

**Backend:**
- `src/services/auth.ts` - [Current responsibility, discovered at line X]
- `src/routes/api.ts` - [Current endpoints, discovered at line Y]

**Frontend:**
- `components/Dashboard.tsx` - [Current functionality, discovered at line Z]
- `store/userSlice.ts` - [State management approach]

**Database:**
- `users` table - [Schema: columns discovered in migration file]
- `sessions` table - [Schema and relationships]

### Current Flow

User action → Component handler (Dashboard.tsx:45) →
API call (authClient.ts:67) → Backend endpoint (api.ts:123) →
Service (auth.ts:89) → Database query (repository.ts:34) →
Response processing → State update (userSlice.ts:56) → UI update

---

## New/Modified System Design

### New Files

- `src/services/notification.ts` - [Purpose and responsibilities]
- `components/NotificationCenter.tsx` - [UI component for notifications]
- `database/migrations/2024_add_notifications.sql` - [Schema changes]

### Modified Files

- `src/routes/api.ts:167` - Add notification endpoints (follows pattern at line 123-145)
- `components/Dashboard.tsx:89` - Integrate NotificationCenter (sidebar section)
- `store/rootReducer.ts:23` - Add notificationSlice (with other feature slices)

### Integration Points

1. **User service** (`services/user.ts:45`) - Notification recipients from user table
2. **WebSocket server** (`server.ts:234`) - Real-time delivery via existing WebSocket
3. **Email service** (`services/email.ts:45`) - Email notifications via SendGrid

### New/Modified Flow

Trigger event → Notification service creates entry →
Database insert → WebSocket broadcast to connected clients →
Client receives notification → Redux store update →
NotificationCenter re-renders → Toast appears

---

## Implementation Checklist

- [ ] All affected files identified (use code-finder to verify)
- [ ] All call sites mapped (especially for refactors)
- [ ] Breaking changes documented with migration strategy
- [ ] Test updates identified
- [ ] Configuration changes noted
- [ ] Integration points validated
```

### What to Include in Plans

**✅ DO Include:**
- **Complete impact analysis** - ALL files that will be affected (from code-finder investigation)
- **All call sites and dependencies** - Every usage location for refactors
- **Ripple effects** - What breaks when you change X
- **What to build/change** - Clear descriptions with specific file:line references
- **Integration points** - Dependencies, data flows, connections with file:line numbers
- **Patterns to follow** - References to existing code with file:line numbers
- **Breaking changes** - What breaks and how to migrate
- **Test impact** - Tests that need updates

**❌ DON'T Include:**
- Code snippets or implementation details
- Self-evident advice ("write clean code", "follow best practices")
- Vague descriptions without file references
- Step-by-step coding instructions
- Generic recommendations without specific file paths
- **Incomplete affected files list** - This causes implementation failures
- Assumptions not validated during investigation

---

## Example 1: Feature Planning Session

**User Request:** "Add real-time notifications to the app"

**Step 1: Assess Clarity** → Request is somewhat vague. Need to gather requirements.

**Discovery Questions:**
1. "What events should trigger notifications?"
2. "Where should notifications appear?"
3. "Should they persist?"
4. "Real-time delivery method preference?"

**User Responses:** WebSocket, both toast and notification center, permanent record

**Generate Inferences:** [INFER-HIGH] WebSocket delivery, database persistence...

→ Confirmed with user, proceed to investigation

**Step 2: Impact Analysis Investigation**

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Comprehensive impact analysis</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
Perform comprehensive impact analysis for notification feature:

**Investigation Goals:**
1. Find ALL files that will be affected by adding notifications
2. Identify integration points (WebSocket, database, frontend state)
3. Map patterns to follow
4. Identify potential conflicts or ripple effects

**Specific Areas:**
- Backend: Services, API, WebSocket setup
- Frontend: Components, state management, real-time connections
- Database: Schema patterns, migration conventions

**Deliverables:**
- Complete list of files to create/modify (file:line)
- Integration points with existing systems
- Patterns to follow
- Ripple effects
    </parameter>
  </invoke>
</function_calls>
```

**Step 3: Create Plan** → [Use template with findings, including complete impact analysis]

---

## Example 2: Refactor Planning Session

**User Request:** "Refactor the authentication service to use a new token strategy"

**Step 1: Assess Clarity** → Clear goal but need to understand current implementation

**Step 2: Critical Impact Analysis**

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Complete auth refactor impact analysis</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
Perform comprehensive impact analysis for auth service refactor:

**CRITICAL: This is a refactor - find EVERY usage**

**Investigation Goals:**
1. Find EVERY file that imports or uses the auth service
2. Identify ALL call sites of auth functions
3. Map complete dependency chain
4. Find all tests that reference auth
5. Identify integration points (middleware, guards, hooks, components)
6. Find configuration files that reference auth

**Specific Areas:**
- Backend: All auth service usages, middleware, guards, API routes
- Frontend: All auth hooks, components using auth, protected routes
- Tests: All test files that mock or use auth
- Config: Environment variables, app config, build config

**Deliverables:**
- Complete list of affected files (file:line for every usage)
- Full call site map (every function that calls auth methods)
- Dependency tree (what depends on what)
- Test files requiring updates
- Breaking change analysis
- Migration requirements for each affected file
    </parameter>
  </invoke>
</function_calls>
```

**Agent returns:** 47 files affected across backend (12), frontend (23), tests (10), config (2)

**Step 3: Create Plan** → [Use template with complete impact section showing all 47 files]

**Result:** Comprehensive refactor plan that accounts for ALL affected code, preventing broken implementations

---

## Key Takeaway

**The difference between good and failed plans:** Complete impact analysis using code-finder agents

- ✅ **Good plan:** Lists all 47 affected files from investigation
- ❌ **Failed plan:** Assumes "probably just a few services" without investigation

