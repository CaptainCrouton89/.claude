# Requirements Gathering Protocol

## Step 1: Understand Intent (Ask 1-2 Questions)

### Q1: Feature Type
```
"What type of feature are we defining?

1. **New feature** - Building something from scratch
2. **Enhancement** - Improving existing functionality
3. **Integration** - Connecting with external system
4. **Refactor** - Changing how existing code works

This helps me ask the right questions."
```

### Q2: Current Knowledge
```
"How well-defined is this already?

- **Clear vision** - You know what you want, need details filled in
- **General idea** - Know the goal, fuzzy on implementation
- **Exploring options** - Not sure best approach yet

This determines how much discovery we need."
```

---

## Step 2: Universal Discovery (Always Ask)

### UQ-1: Happy Path Narrative
```
"Describe the successful scenario step-by-step from the user's perspective.
What do they see, do, and experience?"
```

**Extracts:** User mental model, interaction flow, success criteria

---

### UQ-2: Edge Cases
```
"What should happen in these scenarios?
- Empty state (no data)
- Maximum state (huge data)
- Invalid input
- Network failure
- Concurrent actions"
```

**Extracts:** Error handling needs, boundary conditions

---

### UQ-3: Performance Expectations
```
"How should this feel to the user?
- Instant (<100ms)
- Fast (<1s)
- Eventual (loading state okay)
- Background (no wait)"
```

**Extracts:** Performance requirements, loading state needs

---

### UQ-4: Failure Modes
```
"What should NEVER happen?
What would frustrate users most?"
```

**Extracts:** Constraints, critical paths, error prevention needs

---

### UQ-5: Scope Boundaries
```
"For this feature, what's explicitly OUT of scope?
What should we NOT build yet?"
```

**Extracts:** MVP boundaries, future enhancements, focus

---

### UQ-6: Integration Points
```
"Does this interact with:
- Existing features?
- External APIs/services?
- Database?
- Authentication/authorization?"
```

**Extracts:** Dependencies, integration requirements, data flow

---

## Step 3: Feature-Specific Discovery

### Authentication Features

**AUTH-1: Credential Handling**
```
"What credentials do users provide?
- Email + password?
- Username + password?
- Social login (Google, GitHub)?
- Magic link?
- 2FA required?"
```

**AUTH-2: Session Management**
```
"How long should users stay logged in?
- Until browser close?
- 7/30 days?
- Never expire?
Should 'remember me' be optional?"
```

**AUTH-3: Password Requirements**
```
"Any password requirements?
- Minimum length?
- Complexity rules?
- No requirements okay?"
```

**AUTH-4: Failed Login**
```
"What happens after wrong password?
- Generic error?
- Lock account after X tries?
- CAPTCHA?
- Rate limiting?"
```

---

### CRUD Operations

**CRUD-1: Data Validation**
```
"What makes data valid?
- Required fields?
- Format requirements (email, phone)?
- Length limits?
- Unique constraints?"
```

**CRUD-2: Concurrent Edits**
```
"What if two people edit the same record?
- Last write wins?
- Show conflict?
- Lock during edit?
- Don't worry about it?"
```

**CRUD-3: Delete Behavior**
```
"When user deletes:
- Remove from database (hard delete)?
- Hide but keep (soft delete)?
- Ask confirmation first?
- Allow undo?"
```

**CRUD-4: Optimistic Updates**
```
"When user saves:
- Wait for server confirmation?
- Update UI immediately, rollback if fails?
- Show saving indicator?"
```

---

### Search & Filter

**SEARCH-1: Search Scope**
```
"What should be searchable?
- Specific fields (title, description)?
- All text?
- Metadata (tags, categories)?"
```

**SEARCH-2: Search Timing**
```
"When should search execute?
- As user types (live)?
- After pause in typing?
- When user presses Enter?"
```

**SEARCH-3: Matching Strategy**
```
"How should matching work?
- Exact match?
- Contains anywhere?
- Fuzzy (typo-tolerant)?
- Full-text search?"
```

**SEARCH-4: Result Sorting**
```
"How should results be ordered?
- Relevance score?
- Alphabetical?
- Most recent?
- User-selectable?"
```

---

### Forms & Input

**FORM-1: Validation Timing**
```
"When should validation happen?
- On blur (leaving field)?
- On submit?
- As user types?
- Combination?"
```

**FORM-2: Error Presentation**
```
"How should validation errors appear?
- Inline under field?
- Summary at top?
- Toast notification?
- All of above?"
```

**FORM-3: Unsaved Changes**
```
"If user navigates away with unsaved data:
- Warn before leaving?
- Auto-save?
- Just lose it?"
```

**FORM-4: Default Values**
```
"Any fields pre-filled?
- User's previous values?
- Smart defaults?
- Always empty?"
```

---

### Real-time Features

**REALTIME-1: Update Mechanism**
```
"How should updates arrive?
- Polling (check every X seconds)?
- WebSocket (push)?
- Server-sent events?"
```

**REALTIME-2: Update Frequency**
```
"How often should data refresh?
- Every second?
- Every 5-10 seconds?
- Every minute?
- On user action?"
```

**REALTIME-3: Offline Support**
```
"If connection lost:
- Queue actions?
- Block interactions?
- Show offline mode?
- Just fail?"
```

---

### File Upload

**UPLOAD-1: File Types & Limits**
```
"What files are allowed?
- Images only (jpg, png)?
- Documents (pdf, docx)?
- Any file?

Maximum file size?
- 1MB / 10MB / 100MB / No limit?"
```

**UPLOAD-2: Multiple Files**
```
"Can users upload multiple files?
- One at a time only?
- Multiple simultaneously?
- Batch upload?"
```

**UPLOAD-3: Progress & Validation**
```
"For large files:
- Show upload progress?
- Allow cancel?
- Validate content (dimensions, virus scan)?"
```

---

## Step 4: Generate Inferences

After discovery, generate technical inferences with confidence levels:

```markdown
## Technical Inferences

### High Confidence (Explicit or Industry Standard)

[INFER-HIGH]: JWT tokens in httpOnly cookies
Reasoning: You said "stay logged in for 7 days" + security best practice
Implementation: Set maxAge: 7 days on cookie

[INFER-HIGH]: Client + server validation
Reasoning: Required fields mentioned + security requirement
Client: Immediate UX feedback
Server: Security enforcement

### Medium Confidence (Common Practice, Alternatives Exist)

[INFER-MEDIUM]: Debounced search (300ms delay)
Reasoning: You said "search while typing" + performance concern
Alternative: Could wait for Enter key if prefer

[INFER-MEDIUM]: Soft delete with isDeleted flag
Reasoning: You mentioned "allow undo" for deletes
Alternative: Archive table if need hard separation

### Low Confidence (Filling Gaps)

[INFER-LOW]: Save search history in localStorage
Reasoning: Common UX pattern for search features
Alternative: Skip if privacy concern

[INFER-LOW]: Maximum 100 search results shown
Reasoning: Prevent overwhelming UI
Alternative: Infinite scroll or pagination

## Clarification Needed

Q: Should search work across description or just title?
Q: Filter state persist in URL for sharing?
Q: Mobile-specific behavior different from desktop?
```

---

## Confidence Level Guidelines

**[INFER-HIGH]:** Use when:
- User explicitly stated this
- Only one reasonable technical approach
- Industry standard for exact scenario

**[INFER-MEDIUM]:** Use when:
- Common practice but alternatives exist
- Implied by requirements but not explicit
- Best practice for typical use case

**[INFER-LOW]:** Use when:
- Filling gap in requirements
- Multiple valid approaches
- Assumption about user preference

---

## Step 5: Create Specification

Format as clear, implementable spec:

```markdown
## Feature Specification: [Feature Name]

### Overview
[Brief description of feature and purpose]

---

### User Flow

**Happy path:**
1. User [action]
2. System [response]
3. User sees [outcome]

**Edge cases:**
- Empty state: [behavior]
- Error state: [behavior]
- Loading state: [behavior]

---

### Technical Requirements

**Data Model:**
```typescript
interface [ModelName] {
  // Fields with types
}
```

**API Endpoints:**
- `POST /api/[resource]` - [Purpose]
- `GET /api/[resource]/:id` - [Purpose]

**Validation Rules:**
- [Field]: [Rule]
- [Field]: [Rule]

**Performance Targets:**
- [Operation]: < [time]ms
- [Operation]: < [time]s

---

### Implementation Notes

**Security:**
- [Consideration]
- [Consideration]

**Accessibility:**
- [Requirement]
- [Requirement]

**Error Handling:**
- [Scenario]: [Response]
- [Scenario]: [Response]

---

### Out of Scope (Future)
- [Feature]
- [Feature]

---

### Success Criteria
- [ ] [Measurable criterion]
- [ ] [Measurable criterion]
- [ ] [Measurable criterion]
```

---

## Step 6: Confirm & Proceed

```
"Here's the complete specification with my technical inferences.

**High confidence items** - I'm implementing these unless you object
**Medium confidence items** - Common approach, let me know if different
**Low confidence items** - Filling gaps, easy to change

**Questions for you:** [List any clarifications needed]

Ready to implement? Or want to adjust anything first?"
```

---

## Quality Criteria

Requirements gathering complete when:
- [ ] Happy path clearly defined
- [ ] Edge cases identified
- [ ] Performance expectations set
- [ ] Scope boundaries clear
- [ ] Integration points mapped
- [ ] Technical inferences documented with confidence levels
- [ ] Specification created and confirmed
- [ ] User approved to proceed

---

## Example Session

```
Human: "I want to add user registration"

LLM: What type of feature are we defining?
1. New feature
2. Enhancement
3. Integration
4. Refactor

[Human: #1 - new feature]

LLM: How well-defined is this?
- Clear vision
- General idea
- Exploring options

[Human: General idea - know we need registration but details fuzzy]

LLM: Let me ask 6 core questions to understand requirements:

**Q1: Describe successful registration from user's perspective.**

[Human: User enters email/password, gets confirmation email, clicks link, they're registered]

LLM: **Q2: What should happen in these edge cases?**
- Invalid email format
- Password too weak
- Email already registered
- Confirmation link expired

[Human provides answers...]

LLM: **Q3: Performance expectations for registration?**
- Instant / Fast / Eventual / Background

[Continues through Q4-Q6, then AUTH-specific questions...]

LLM:
## Technical Inferences

[INFER-HIGH]: Email confirmation required
Reasoning: You explicitly mentioned confirmation email flow

[INFER-HIGH]: Password hashing with bcrypt/argon2
Reasoning: Industry standard security practice

[INFER-MEDIUM]: Confirmation link expires in 24 hours
Reasoning: Common practice, balances security and UX
Alternative: Could use different duration

[INFER-LOW]: Send welcome email after confirmation
Reasoning: Common UX pattern
Alternative: Skip if prefer minimal emails

## Questions for you:
- Social login (Google/GitHub) needed now or future?
- Password requirements: min 8 chars or specific rules?

Ready to implement?
```

---
