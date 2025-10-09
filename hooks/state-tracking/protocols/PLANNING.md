# Planning Protocol

## Overview

Planning transforms vague requirements into concrete implementation blueprints. Effective plans are built on thorough investigation, not assumptions.

**Before creating any plan, conduct thorough investigation—NOTHING can be left to assumptions. Specificity is critical for successful implementation.**

---

## Step 1: Investigation Phase

### Understand Before Planning

**Don't plan in a vacuum.** Plans fail when built on assumptions.

**Investigation checklist:**
- [ ] Read all relevant existing code files
- [ ] Understand current system architecture
- [ ] Identify dependencies and integration points
- [ ] Research external libraries and APIs if needed
- [ ] Understand edge cases and error conditions
- [ ] Identify existing patterns to follow

### Research-First Pattern (Optional)

For complex or unfamiliar systems, use parallel agents to gather information before planning:

**Parallelize research if:**
- [ ] Extending large existing system (codebase analysis needed)
- [ ] Multiple domains to understand (backend, frontend, database)
- [ ] Unfamiliar technology stack (research needed)

**Execution pattern:**
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Analyze existing codebase patterns</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Analyze the codebase at [paths]. Identify:
      - Current file structure and organization patterns
      - Existing similar features or components
      - Technology stack and frameworks used
      - Code patterns and conventions to follow
      - Integration points and dependencies

      Summarize findings in bullet points with file paths.
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
      - Shared utilities and helpers

      Document what the new feature needs to integrate with.
    </parameter>
  </invoke>
</function_calls>
```

After research agents complete, use findings to inform the plan.

---

## Step 2: Plan Structure

A well-structured plan should include:

### 1. Summary

**Purpose:** What are we building and why?

```markdown
## Summary

**Goal:** [One sentence describing what will be implemented]

**Problem:** [The core problem being solved or feature being added]

**Scope:** [What's included and what's explicitly excluded]
```

**Example:**
```markdown
## Summary

**Goal:** Add real-time notification system for user activity

**Problem:** Users don't get immediate feedback when important events occur (new messages, mentions, system alerts)

**Scope:**
- In-scope: WebSocket server, notification UI component, backend event triggers
- Out of scope: Email notifications, mobile push notifications (future phase)
```

---

### 2. Reasoning/Motivation

**Purpose:** Justify the approach and document key decisions

```markdown
## Reasoning

**Why this approach:**
- [Reason 1 with evidence]
- [Reason 2 with evidence]

**Trade-offs considered:**
| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Option A | ... | ... | Rejected: [reason] |
| Option B | ... | ... | **Chosen:** [reason] |

**Key decisions:**
1. [Decision 1] - [Reasoning]
2. [Decision 2] - [Reasoning]
```

**Example:**
```markdown
## Reasoning

**Why this approach:**
- WebSockets provide low-latency real-time communication (vs polling which adds server load)
- Socket.io chosen over raw WebSockets for automatic reconnection and fallback support
- Existing Redis instance can be used for pub/sub (no new infrastructure)

**Trade-offs considered:**
| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Long polling | Simple, HTTP-based | High server load, latency | Rejected: Doesn't scale |
| Server-Sent Events | Native browser support | One-way only | Rejected: Need bidirectional |
| WebSockets + Socket.io | Low latency, bidirectional | Requires WebSocket server | **Chosen:** Best UX |

**Key decisions:**
1. Use Socket.io (not raw WebSockets) - Provides automatic reconnection, fallback transports
2. Store notifications in PostgreSQL - Already using it, can leverage existing queries
3. Use Redis pub/sub - Enables horizontal scaling across multiple server instances
```

---

### 3. Current System Overview

**Purpose:** Document how the existing system works

```markdown
## Current System

### How it works now:
[Describe the current implementation or state]

### Key files and their responsibilities:

**Backend:**
- `src/services/auth.ts` - [What it does now]
- `src/controllers/user.ts` - [What it does now]

**Frontend:**
- `components/Dashboard.tsx` - [What it does now]
- `hooks/useUser.ts` - [What it does now]

**Database:**
- `users` table - [Schema and purpose]
- `sessions` table - [Schema and purpose]

### Dependencies and data flow:
```
[Current data flow diagram or description]
```
```

**Example:**
```markdown
## Current System

### How it works now:
Users receive no real-time updates. They must refresh the page to see new messages or activity.

### Key files and their responsibilities:

**Backend:**
- `src/server.ts` - Express app setup, currently HTTP only (no WebSocket server)
- `src/services/messageService.ts` - Handles message CRUD, stores in PostgreSQL
- `src/controllers/messageController.ts` - REST endpoints: POST /messages, GET /messages

**Frontend:**
- `components/MessageList.tsx` - Displays messages, polls every 30s via setInterval
- `hooks/useMessages.ts` - Fetches messages from REST API using React Query
- `components/Header.tsx` - Navigation bar (no notification indicator)

**Database:**
- `messages` table - id, sender_id, receiver_id, content, created_at, read_at
- `users` table - id, username, email, last_seen

### Dependencies and data flow:
```
User action → POST /messages → MessageController → MessageService → PostgreSQL
MessageList polls → GET /messages → MessageController → MessageService → PostgreSQL
```
```

---

### 4. New System Design

**Purpose:** Document how the system will work after implementation

```markdown
## New System Design

### How it will work:
[Describe the new implementation]

### New or modified files:

**New files:**
- `src/websocket/server.ts` - [Purpose: WebSocket server setup with Socket.io]
- `src/websocket/handlers/notification.ts` - [Purpose: Handle notification events]
- `components/NotificationBell.tsx` - [Purpose: UI component for notifications]

**Modified files:**
- `src/server.ts` - [Change: Add WebSocket server initialization]
- `components/Header.tsx` - [Change: Add notification bell component]
- `src/services/messageService.ts` - [Change: Emit WebSocket event on new message]

### Integration points:
- WebSocket server will run on same Express app (upgrade HTTP connection)
- Redis pub/sub will distribute events across server instances
- Frontend will connect to WebSocket on mount, subscribe to user-specific channel
```

**Example:**
```markdown
## New System Design

### How it will work:
When a message is created, the backend will emit a WebSocket event to the recipient. The frontend will display a real-time notification bell with unread count. Clicking opens a dropdown with recent notifications.

### New or modified files:

**New files:**
- `src/websocket/server.ts` - Initialize Socket.io server, attach to Express app
- `src/websocket/handlers/notificationHandler.ts` - Handle client connections, emit notification events
- `src/websocket/middleware/auth.ts` - Authenticate WebSocket connections via JWT
- `src/services/notificationService.ts` - Business logic: create, mark read, get unread count
- `components/NotificationBell.tsx` - UI: bell icon with badge, dropdown list
- `hooks/useNotifications.ts` - Custom hook: connect to WebSocket, manage notification state
- `types/notification.ts` - TypeScript types for notification objects

**Modified files:**
- `src/server.ts` - Add WebSocket server initialization after Express setup (line ~15)
- `src/services/messageService.ts` - Add `notificationService.create()` call after message insert (line ~47)
- `components/Header.tsx` - Add `<NotificationBell />` component before user menu (line ~23)
- `package.json` - Add dependencies: socket.io, socket.io-client

### Integration points:
1. WebSocket server shares Express HTTP server (no new port needed)
2. JWT from HTTP auth reused for WebSocket authentication
3. Redis pub/sub distributes events if multiple server instances run
4. PostgreSQL stores notification records for persistence across sessions
5. React Query cache invalidation triggers on WebSocket events
```

---

### 5. Other Relevant Context

**Purpose:** Document supporting details

```markdown
## Additional Context

### Utility functions or helpers:
- `src/utils/jwt.ts` - JWT verification (already exists, will reuse for WebSocket auth)
- `src/utils/validation.ts` - Input validation schemas (will add notification schema)

### Type definitions or interfaces:
- `types/notification.ts` - New file for notification types
- `types/websocket.ts` - New file for WebSocket event types

### Configuration changes:
- Add `WEBSOCKET_PATH=/socket.io` to `.env`
- Add CORS origin whitelist for WebSocket connections

### External dependencies:
- `socket.io` (4.7.0) - WebSocket server
- `socket.io-client` (4.7.0) - WebSocket client for React

### Testing considerations:
- Unit tests: NotificationService business logic
- Integration tests: WebSocket connection flow, event emission
- E2E tests: User receives notification when message sent
```

---

## Step 3: Plan Validation

Before presenting the plan, verify:

### Quality Checklist

- [ ] **All file paths are exact** (discovered during investigation, not guessed)
- [ ] **Current system is accurately described** (based on actual code reads)
- [ ] **Dependencies are explicitly mapped** (no missing integration points)
- [ ] **Edge cases identified** (error conditions, race conditions, failure modes)
- [ ] **No assumptions** (every assertion backed by investigation)
- [ ] **Technology choices justified** (with reasoning, not arbitrary)
- [ ] **Implementation scope is clear** (what's included, what's not)

### Anti-Patterns to Avoid

**❌ Vague file references:**
```markdown
- Update the authentication file
- Modify some components
```

**✅ Specific file paths:**
```markdown
- `src/middleware/auth.ts` - Add WebSocket token validation (line ~34)
- `components/Header.tsx` - Add notification bell (line ~23)
```

---

**❌ Generic guidance:**
```markdown
- Follow best practices
- Make sure to handle errors
- Write clean code
```

**✅ Specific requirements:**
```markdown
- Use existing error classes from `src/errors/AppError.ts`
- Follow component pattern from `components/MessageList.tsx` (lines 15-45)
- Match TypeScript strict mode settings in `tsconfig.json`
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
- Attach to Express app instance from `src/server.ts`
- Follow initialization pattern from existing `src/database/connection.ts` (lines 10-25)
```

---

## What NOT to Include in Plans

Plans are architectural blueprints, not implementation guides:

**Exclude:**
- ❌ Code snippets or implementation details
- ❌ Timelines or effort estimates (LLM doesn't estimate time)
- ❌ Self-evident advice for LLMs ("write clean code", "follow best practices")
- ❌ Generic best practices without context
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

**Goal:** [One sentence describing what will be implemented]

**Problem:** [The core problem being solved]

**Scope:**
- In-scope: [What's included]
- Out of scope: [What's excluded]

---

## Reasoning

**Why this approach:**
- [Reason 1 with evidence from investigation]
- [Reason 2 with evidence from investigation]

**Trade-offs considered:**
| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Option A | ... | ... | Rejected: [reason] |
| Option B | ... | ... | **Chosen:** [reason] |

**Key decisions:**
1. [Decision 1] - [Reasoning based on investigation]
2. [Decision 2] - [Reasoning based on investigation]

---

## Current System

### How it works now:
[Describe current implementation based on code reads]

### Key files and their responsibilities:

**Backend:**
- `path/to/file.ts` - [Current purpose, discovered from investigation]

**Frontend:**
- `path/to/component.tsx` - [Current purpose, discovered from investigation]

**Database:**
- `table_name` - [Schema and purpose]

### Dependencies and data flow:
```
[Current flow based on investigation]
```

---

## New System Design

### How it will work:
[Describe new implementation]

### New or modified files:

**New files:**
- `path/to/new/file.ts` - [Purpose and responsibility]
- `path/to/new/component.tsx` - [Purpose and responsibility]

**Modified files:**
- `path/to/existing.ts` - [What will change and why]
- `path/to/existing.tsx` - [What will change and why]

### Integration points:
1. [Integration point 1 with existing system]
2. [Integration point 2 with existing system]

### Data flow:
```
[New data flow diagram or description]
```

---

## Additional Context

### Utility functions or helpers:
- `path/to/util.ts` - [Purpose, whether existing or new]

### Type definitions:
- `path/to/types.ts` - [New types needed]

### Configuration changes:
- [Environment variables, config files, etc.]

### External dependencies:
- `package-name` (version) - [Purpose]

### Testing considerations:
- [What types of tests are needed and why]

### Error handling:
- [Error cases to handle, existing error patterns to follow]

### Performance considerations:
- [Scaling, caching, optimization strategies]

---

## Implementation Notes

### Patterns to follow:
- Follow [pattern] from `path/to/example.ts` (lines X-Y)
- Match [convention] from existing [component/service]

### Edge cases to handle:
1. [Edge case 1] - [How to handle]
2. [Edge case 2] - [How to handle]

### Risks and mitigations:
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk 1] | [Impact] | [How to mitigate] |
| [Risk 2] | [Impact] | [How to mitigate] |

---
```

---

## Critical Requirements

**Every assertion must be based on actual investigation:**
- ✅ "The auth system uses JWT tokens stored in `src/middleware/auth.ts`" (verified by reading file)
- ❌ "The auth system probably uses JWT tokens" (assumption)

**All file references must be exact paths:**
- ✅ `components/features/messaging/MessageList.tsx`
- ❌ `somewhere in the components folder`

**Dependencies must be explicitly mapped:**
- ✅ "WebSocket server depends on Express app instance from `src/server.ts` (line 15), JWT validation from `src/utils/jwt.ts` (line 23), and Redis client from `src/services/redis.ts` (line 8)"
- ❌ "WebSocket server needs Express and JWT"

**Edge cases and error conditions identified:**
- ✅ "Handle WebSocket disconnect during message send: queue event in Redis, retry on reconnect"
- ❌ "Handle errors properly"

---

## Remember

> **A plan fails when it makes assumptions. Investigate thoroughly, reference specifically, plan comprehensively.**

Good plans enable fast, confident implementation. Bad plans create confusion and rework.

Invest time in investigation. The plan quality directly correlates with investigation depth.

---
