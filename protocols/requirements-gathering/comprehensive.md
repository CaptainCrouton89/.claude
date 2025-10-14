# Requirements Gathering Protocol

Systematic approach to clarifying user needs, preferences, and constraints before planning or implementation.

## Artifacts

**Inputs:**
- Canonical requirements template: `/Users/silasrhyneer/.claude/file-templates/requirements.template.md`
- `docs/product-requirements.md` - Existing features
- `docs/system-design.md` - Architecture context
- `agent-responses/agent_<id>.md` - Pre-investigation findings (if available)

**Outputs:**
- Requirements specification (inline or saved to project docs)
- Updated `docs/product-requirements.md` with new Feature ID (F-##)

**Handoffs:**
- Planning agents read requirements to create implementation plans
- Implementation agents read requirements for direct simple features
- Investigation agents may be spawned during requirements gathering

## Naming Conventions
- Requirements: inline or added to `docs/product-requirements.md`
- Investigation artifacts: `agent-responses/agent_<id>.md`

## When to Use
- User specifying HOW they want something done
- Clarifying preferences or constraints
- Understanding WHAT needs to be built
- Gathering specifications before work begins

## Core Steps

### 1. Classify Request Type
**Ask 1-2 questions to understand context:**

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
**Use async agents to understand existing system BEFORE asking questions**

**When to investigate first:**
- Enhancing existing feature (understand current implementation)
- Integration unclear (explore existing patterns)
- Technical constraints unknown (investigate capabilities)
- Building on existing architecture

**When to skip investigation:**
- Green field feature (nothing exists yet)
- Complete requirements already provided
- Simple, clear scope with no dependencies

**Delegate investigation agents** to understand existing system. Results saved to `agent-responses/agent_<id>.md`.

Wait for results: `./agent-responses/await {agent_id}`

**Transform findings into informed questions:**
- ❌ Generic: "What authentication methods do you want?"
- ✅ Informed: "I see JWT with refresh tokens. For MFA: TOTP app? SMS codes? Required for all users or optional?"

### 3. Universal Discovery Questions
**Ask core questions for any feature (adapt to context):**

**UQ-1: Happy Path**
"Describe the successful scenario step-by-step from the user's perspective."
- What triggers the feature?
- What actions does user take?
- What's the desired outcome?

**UQ-2: Edge Cases**
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
**Tailor questions based on feature type:**

**Authentication/Authorization:**
- Credentials: Email/password? Social login? Magic link? 2FA/MFA?
- Session: Duration (browser close / 7/30 days / never)? Remember me?
- Password: Length requirement? Complexity rules? None?
- Failed login: Generic error / account lock / CAPTCHA / rate limit?
- MFA: TOTP app? SMS? Email? Required or optional? Which users?

**CRUD Operations:**
- Validation: Required fields? Format rules? Length limits? Unique constraints?
- Concurrent edits: Last write wins / show conflict / lock / ignore?
- Delete: Hard delete / soft delete / confirmation modal / undo capability?
- Saves: Wait for server / optimistic update with rollback / show saving?

**Search & Filter:**
- Scope: Search specific fields / all text / metadata?
- Timing: Live as typing / after pause / on Enter key?
- Matching: Exact / contains / fuzzy matching / full-text search?
- Sorting: Relevance / alphabetical / recent / user-selectable?
- Empty results: Show message / suggestions / clear filters?

**Forms & Input:**
- Validation timing: On blur / on submit / as typing / combination?
- Error display: Inline next to field / summary at top / toast / all?
- Unsaved changes: Warning prompt / auto-save / allow losing data?
- Defaults: Previous values / smart defaults / empty / pre-populated?

**Real-time Features:**
- Mechanism: Polling / WebSocket / Server-Sent Events?
- Frequency: 1 second / 5-10 seconds / 1 minute / event-driven?
- Offline: Queue actions / block usage / show offline mode / fail gracefully?
- Conflict: Show notification / auto-merge / manual resolution?

**File Upload:**
- Types & limits: Images only / docs / any file? Max 1MB / 10MB / 100MB / unlimited?
- Multiple files: One at a time / simultaneous upload / batch processing?
- Progress: Show progress bar / allow cancel / validate content before upload?
- Storage: Where stored? CDN? S3? Local server?

**Data Visualization:**
- Chart type: Bar / line / pie / scatter / custom?
- Interactivity: Hover tooltips / click drill-down / zoom / pan?
- Responsive: Mobile behavior? Simplified view?
- Export: Download as image / CSV / PDF?

### 5. Resolve All Unknowns
**Identify and clarify assumptions before creating requirements:**

**Step 5a: Generate Technical Inferences Internally**
Document assumptions with confidence levels (for your own planning):

**Confidence guidelines:**
- **HIGH:** User explicitly stated / only reasonable approach / industry standard / security requirement
- **MEDIUM:** Common practice but alternatives exist / implied by requirements / standard pattern
- **LOW:** Filling implementation gap / multiple valid approaches / assumption about preference

**Examples of inferences:**
- JWT tokens in httpOnly cookies (HIGH: user said "7-day sessions" + security best practice)
- Debounced search 300ms (MEDIUM: user said "live search" + performance balance)
- Max 100 search results per page (LOW: prevent UI overload, could use infinite scroll)

**Step 5b: Present Inferences for Confirmation**
"Based on our discussion, here are my technical assumptions:

**High Confidence (will implement unless you object):**
- [Assumption 1 with reasoning]
- [Assumption 2 with reasoning]

**Medium Confidence (common approach, alternatives exist):**
- [Assumption 1 - alternative: X]
- [Assumption 2 - alternative: Y]

**Low Confidence (need your input):**
- [Question 1 with proposed approach]
- [Question 2 with proposed approach]

Any objections or preferences?"

**Step 5c: Resolve All Clarifications**
Ask follow-up questions for any remaining unknowns:
- Search across description field or title only?
- Should filter state persist in URL for sharing?
- Mobile-specific behavior different from desktop?
- Accessibility: Screen reader announcements for real-time updates?

**CRITICAL: Do not proceed to Step 6 until ALL inferences are confirmed and ALL clarifications are resolved.**

### 6. Create Requirements Specification
**After ALL unknowns are resolved:**

Use the canonical template at `/Users/silasrhyneer/.claude/file-templates/requirements.template.md`.

Instructions:
- The template does NOT include "Technical Inferences" or "Clarification Needed" sections
- Those are RESOLVED in Step 5 before creating the artifact
- Fill out every section with CONFIRMED information only
- Document decisions in "Implementation Notes" with reasoning
- Cross-reference and link relevant docs in `docs/` listed above; create stubs if missing
- Ensure "Relevant Files" section is comprehensive

### 7. Present & Confirm Final Specification
**Share completed requirements:**

"Here's the requirements specification based on our confirmed decisions:

[Show or link to requirements file]

All technical decisions and clarifications have been incorporated. Ready to proceed to planning/implementation?"

**Wait for user approval before planning or implementation**

### 8. Pass Requirements to Next Phase
**After approval, requirements flow to next agents:**

**To Planning Agent:** Pass requirements + `agent-responses/agent_<id>.md` investigation findings.

**To Direct Implementation (simple features):** Pass requirements specification.

**Critical:** Requirements + investigation findings together provide complete context for downstream agents.

### 8. Update Project Documentation (if applicable)
**If project has docs structure:**

**Update `docs/product-requirements.md`:**
- Add feature with next Feature ID (F-##)
- Include requirements summary
- Add success metrics

**Create user flow if needed:**
- `docs/user-flows/[feature-slug].md`
- Document step-by-step user journey

**Link to existing features:**
- Reference related F-## IDs
- Note integration points

## Investigation Agent Strategy

**Pre-requirements investigation:**
- 1-2 `code-finder` agents to understand existing system
- Focus on patterns, constraints, integration points

**Research phase (if needed):**
- `general-purpose` agents for technology research
- External API documentation review
- Library/framework capability exploration


