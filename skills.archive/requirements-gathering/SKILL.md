---
name: Gathering Requirements
description: Systematically clarify user needs, preferences, and constraints before planning or implementation. Classifies work type, investigates existing systems, discovers edge cases and integration points, resolves assumptions, and creates detailed specifications. Use when building features, enhancements, or integrations where requirements need clarification.
---

# Gathering Requirements

## When to Use

- User specifying HOW they want something done
- Clarifying preferences or constraints
- Understanding WHAT needs to be built
- Gathering specifications before work begins
- Building on existing systems (enhancement, integration)

## Core Workflow

### 1. Classify Request Type

Ask 1-2 quick questions to understand context:

**Q1: What type of work?**
1. New feature - Building from scratch
2. Enhancement - Improving existing functionality
3. Integration - Connecting external system
4. Refactor - Changing implementation without behavior change

**Q2: Current knowledge level?**
- Clear vision - User knows exactly what they want
- General idea - Goal clear, implementation details fuzzy
- Exploring options - Uncertain about approach

### 2. Pre-Investigation (If Needed)

**When to investigate first:**
- Enhancing existing feature (understand current implementation)
- Integration unclear (explore existing patterns)
- Technical constraints unknown (investigate capabilities)
- Building on existing architecture

**When to skip investigation:**
- Green field feature (nothing exists yet)
- Complete requirements already provided
- Simple, clear scope with no dependencies

Delegate async investigation agents to understand existing system. Results saved in `agent-responses/`.

Transform findings into informed questions:
- ❌ Generic: "What authentication methods do you want?"
- ✅ Informed: "I see JWT with refresh tokens. For MFA: TOTP app? SMS codes? Required for all users or optional?"

### 3. Universal Discovery Questions

Ask these core questions for any feature (adapt to context):

**UQ-1: Happy Path**
"Describe the successful scenario step-by-step from the user's perspective."
- What triggers the feature?
- What actions does user take?
- What's the desired outcome?

**UQ-2: Edge Cases & Constraints**
"What should happen for these scenarios?"
- Empty state (no data)
- Huge dataset (performance)
- Invalid input (validation)
- Network failure (offline)
- Concurrent actions (conflicts)

**UQ-3: Performance Expectations**
"How should this feel to the user?"
- Instant (<100ms) - UI updates, simple operations
- Fast (<1s) - API calls, data fetching
- Eventual (loading indicator) - Heavy processing
- Background (no waiting) - Async operations

**UQ-4: Failure Modes**
"What should NEVER happen? What would frustrate users most?"
- Data loss scenarios
- Breaking existing workflows
- Confusing error states

**UQ-5: Scope Boundaries**
"What's explicitly OUT of scope for this iteration?"
- Future enhancements
- Advanced features
- Edge cases to defer

**UQ-6: Integration Points**
"How does this interact with:"
- Existing features
- External APIs or services
- Database or storage
- Authentication/authorization
- Third-party libraries

### 4. Feature-Specific Discovery

Tailor questions based on feature type (select relevant):

**Authentication/Authorization:**
- Credentials: Email/password? Social login? Magic link? 2FA/MFA?
- Session: Duration? Remember me?
- Password: Length/complexity requirements?
- Failed login: Generic error / account lock / CAPTCHA / rate limit?
- MFA: TOTP app? SMS? Email? Required or optional?

**CRUD Operations:**
- Validation: Required fields? Format rules? Length limits? Unique constraints?
- Concurrent edits: Last write wins / show conflict / lock?
- Delete: Hard delete / soft delete / confirmation / undo?
- Saves: Wait for server / optimistic update / show saving?

**Search & Filter:**
- Scope: Search specific fields / all text / metadata?
- Timing: Live as typing / after pause / on Enter?
- Matching: Exact / contains / fuzzy / full-text?
- Sorting: Relevance / alphabetical / recent / user-selectable?

**Forms & Input:**
- Validation timing: On blur / on submit / as typing?
- Error display: Inline / summary / toast?
- Unsaved changes: Warning / auto-save / allow losing data?
- Defaults: Previous values / smart defaults / empty / pre-populated?

**Real-time Features:**
- Mechanism: Polling / WebSocket / Server-Sent Events?
- Frequency: 1 second / 5-10 seconds / 1 minute / event-driven?
- Offline: Queue actions / block usage / show offline mode?
- Conflict: Show notification / auto-merge / manual resolution?

**File Upload:**
- Types & limits: Images only / docs / any file? Max size?
- Multiple files: One at a time / simultaneous / batch?
- Progress: Show progress bar / allow cancel?
- Storage: Where stored? CDN? S3? Local?

**Data Visualization:**
- Chart type: Bar / line / pie / scatter / custom?
- Interactivity: Hover tooltips / click drill-down / zoom / pan?
- Responsive: Mobile behavior? Simplified view?
- Export: Download as image / CSV / PDF?

### 5. Resolve All Unknowns

**Step 5a: Generate Technical Inferences Internally**

Document assumptions with confidence levels:

- **HIGH:** User explicitly stated / only reasonable approach / industry standard / security requirement
- **MEDIUM:** Common practice but alternatives exist / implied by requirements / standard pattern
- **LOW:** Filling implementation gap / multiple valid approaches / assumption about preference

**Step 5b: Present Inferences for Confirmation**

"Based on our discussion, here are my technical assumptions:

**High Confidence (will implement unless you object):**
- [Assumption with reasoning]

**Medium Confidence (common approach, alternatives exist):**
- [Assumption - alternative: X]

**Low Confidence (need your input):**
- [Question with proposed approach]

Any objections or preferences?"

**Step 5c: Resolve All Clarifications**

Ask follow-up questions for remaining unknowns. **Do not proceed to Step 6 until ALL inferences are confirmed and ALL clarifications are resolved.**

### 6. Create Requirements Specification

Use the canonical template at `~/.claude/file-templates/requirements.template.md`.

Instructions:
- Fill out every section with **CONFIRMED information only**
- Document decisions in "Implementation Notes" with reasoning
- Cross-reference relevant docs in `docs/`; create stubs if missing
- Ensure "Relevant Files" section is comprehensive
- Include "Artifacts" section referencing existing system findings

### 7. Present & Confirm Final Specification

"Here's the requirements specification based on our confirmed decisions:

[Show or link to requirements file]

All technical decisions and clarifications have been incorporated. Ready to proceed to planning/implementation?"

**Wait for user approval before next phase.**

### 8. Update Project Documentation

**If project has docs structure:**

Update `docs/product-requirements.md`:
- Add feature with next Feature ID (F-##)
- Include requirements summary
- Add acceptance criteria
- Link to related features and integration points

**Reference:**
- `docs/system-design.md` - Architecture context
- Investigation findings from `agent-responses/agent_<id>.md`

## Quick Reference

**Essential Questions:**
1. Happy path scenario
2. Key edge cases & performance expectations
3. Failure modes
4. Out of scope items
5. Integration points

**Investigation Artifacts:**
- Input: `docs/product-requirements.md`, `docs/system-design.md`
- Output: Requirements specification + updated project docs

**Confidence Levels:**
- HIGH: Explicit requirement or best practice
- MEDIUM: Standard practice with alternatives
- LOW: Turn into question for user

## Common Pitfalls

- ❌ Asking questions without understanding existing system
- ❌ Proceeding to implementation with unresolved ambiguities
- ❌ Mixing assumptions with confirmed requirements
- ❌ Skipping edge case discovery
- ✅ Investigate first → ask informed questions → resolve all unknowns → document → confirm
