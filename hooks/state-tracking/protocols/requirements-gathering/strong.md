# Requirements Gathering Protocol

> **Project Context:** Review @.claude/memory/history.md to understand existing features and recent implementations that may inform requirements or provide patterns to follow.

## Step 1: Classify (Ask 1-2 Questions)

**Q1: Feature Type**
1. New feature - Building from scratch
2. Enhancement - Improving existing
3. Integration - Connecting external system
4. Refactor - Changing implementation

**Q2: Current Knowledge**
- Clear vision - Know what you want
- General idea - Goal clear, implementation fuzzy
- Exploring options - Approach uncertain

---

## Discovery Agent Strategy

**Use agents to investigate when:**
- Enhancing existing feature (understand current implementation)
- Integration unclear (explore existing patterns)
- Technical constraints unknown (investigate capabilities)

**Work directly when:**
- Green field feature
- Complete requirements provided
- Simple, clear scope

### Pre-Requirements Investigation

Investigate before asking questions:

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Investigate existing notification system</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Find existing notification/messaging functionality:
      - Notification components/services
      - Communication methods (email, SMS)
      - WebSocket/real-time infrastructure
      - Notification data models

      Report what exists and what's missing.
    </parameter>
  </invoke>
</function_calls>
```

Transform findings into informed questions:
- ❌ Generic: "What authentication methods?"
- ✅ Informed: "I see JWT with refresh tokens. For MFA: TOTP? SMS? Required or optional?"

---

## Step 2: Universal Discovery

**UQ-1: Happy Path**
"Describe successful scenario step-by-step from user's perspective."

**UQ-2: Edge Cases**
"What should happen for: empty state, huge data, invalid input, network failure, concurrent actions?"

**UQ-3: Performance**
"How should this feel? Instant (<100ms), fast (<1s), eventual (loading), background (no wait)?"

**UQ-4: Failure Modes**
"What should NEVER happen? What would frustrate users most?"

**UQ-5: Scope Boundaries**
"What's explicitly OUT of scope? What should we NOT build yet?"

**UQ-6: Integration Points**
"Does this interact with: existing features, external APIs, database, auth/authz?"

---

## Step 3: Feature-Specific Discovery

### Authentication
- **Credentials**: Email/username + password? Social login? Magic link? 2FA?
- **Session**: Browser close / 7/30 days / never expire? Remember me optional?
- **Password**: Min length? Complexity rules? None?
- **Failed login**: Generic error / lock account / CAPTCHA / rate limit?

### CRUD Operations
- **Validation**: Required fields? Format rules? Length limits? Unique constraints?
- **Concurrent edits**: Last write wins / show conflict / lock / ignore?
- **Delete**: Hard delete / soft delete / confirmation / undo?
- **Saves**: Wait for server / optimistic update with rollback / show saving indicator?

### Search & Filter
- **Scope**: Specific fields / all text / metadata?
- **Timing**: Live / after pause / on Enter?
- **Matching**: Exact / contains / fuzzy / full-text?
- **Sorting**: Relevance / alphabetical / recent / user-selectable?

### Forms & Input
- **Validation timing**: On blur / on submit / as typing / combination?
- **Error display**: Inline / summary / toast / all?
- **Unsaved changes**: Warn / auto-save / lose?
- **Defaults**: Previous values / smart defaults / empty?

### Real-time Features
- **Mechanism**: Polling / WebSocket / SSE?
- **Frequency**: 1s / 5-10s / 1min / on action?
- **Offline**: Queue actions / block / show offline mode / fail?

### File Upload
- **Types & limits**: Images only / documents / any? Max size: 1MB / 10MB / 100MB / none?
- **Multiple**: One at a time / simultaneous / batch?
- **Progress**: Show progress / allow cancel / validate content?

---

## Step 4: Generate Inferences

```markdown
## Technical Inferences

### [INFER-HIGH] - Explicit or Industry Standard
- JWT tokens in httpOnly cookies (you said "7 days" + security best practice)
- Client + server validation (required fields + security)

### [INFER-MEDIUM] - Common Practice, Alternatives Exist
- Debounced search 300ms (you said "live search" + performance)
- Soft delete with isDeleted flag (you mentioned "undo")

### [INFER-LOW] - Filling Gaps
- Save search history localStorage (common UX, skip if privacy concern)
- Max 100 search results (prevent overwhelming UI, could use infinite scroll)

## Clarification Needed
- Search across description or just title?
- Filter state persist in URL for sharing?
- Mobile-specific behavior?
```

**Confidence guidelines:**
- **HIGH**: User stated it / only reasonable approach / industry standard
- **MEDIUM**: Common practice but alternatives exist / implied but not explicit
- **LOW**: Filling gap / multiple valid approaches / assumption about preference

---

## Step 5: Create Specification

```markdown
## Feature Specification: [Name]

### Overview
[Brief description and purpose]

### User Flow
**Happy path:** 1) User [action] 2) System [response] 3) User sees [outcome]
**Edge cases:** Empty state, error state, loading state behaviors

### Technical Requirements
**Data Model:** TypeScript interfaces
**API Endpoints:** Method + path + purpose
**Validation:** Field rules
**Performance:** Operation targets

### Implementation Notes
**Security:** Key considerations
**Accessibility:** Requirements
**Error Handling:** Scenario responses

### Out of Scope
Future features excluded from MVP

### Success Criteria
Measurable completion checkpoints
```

---

## Step 6: Confirm & Proceed

"Here's the spec with technical inferences.

**HIGH** - Implementing unless you object
**MEDIUM** - Common approach, LMK if different
**LOW** - Filling gaps, easy to change

Questions: [clarifications needed]

Ready to implement?"

---

## Quality Checklist

- [ ] Happy path defined
- [ ] Edge cases identified
- [ ] Performance set
- [ ] Scope bounded
- [ ] Integration points mapped
- [ ] Inferences documented with confidence
- [ ] Spec created and confirmed
- [ ] User approved
