# Requirements Gathering Protocol (Basic)

Streamlined approach to clarifying user needs and preferences before planning or implementation.

## Artifacts

**Inputs:**
- Canonical requirements template: `~/.claude/file-templates/requirements.template.md`
- `docs/product-requirements.md` - Existing features
- `docs/system-design.md` - Architecture context

**Outputs:**
- Requirements specification (inline or saved to project docs)
- Updated `docs/product-requirements.md` with new Feature ID (F-##) if applicable

## When to Use
- User specifying HOW they want something done
- Clarifying preferences or constraints
- Understanding WHAT needs to be built
- Gathering specifications before work begins

## Core Steps

### 1. Classify Request Type
**Quick context questions (1-2):**

**Q1: What type of work?**
1. New feature - Building from scratch
2. Enhancement - Improving existing functionality
3. Integration - Connecting external system
4. Refactor - Changing implementation without behavior change

**Q2: Current knowledge level?**
- Clear vision - User knows exactly what they want
- General idea - Goal clear, implementation details fuzzy
- Exploring options - Uncertain about approach

### 2. Investigation (If Building on Existing System)
**Use direct tools to understand current implementation:**

**When to investigate:**
- Enhancing existing feature
- Integration with existing patterns
- Technical constraints need understanding
- Building on existing architecture

**Investigation approach:**
- Use `read_file` to examine relevant docs and code
- Use `grep` to find existing patterns
- Use `codebase_search` for semantic understanding

**Transform findings into informed questions:**
- ❌ Generic: "What authentication methods do you want?"
- ✅ Informed: "I see JWT with refresh tokens. For MFA: TOTP app? SMS codes? Required for all users or optional?"

### 3. Core Discovery Questions
**Ask 3-4 essential questions:**

**Q1: Happy Path**
"Describe the successful scenario step-by-step from the user's perspective."
- What triggers the feature?
- What actions does user take?
- What's the desired outcome?

**Q2: Edge Cases**
"What should happen for these scenarios?"
- Empty state (no data)
- Invalid input (validation)
- Network failure (offline)
- Error conditions

**Q3: Scope Boundaries**
"What's explicitly OUT of scope for this iteration?"
- Future enhancements to defer
- Advanced features for later
- Edge cases to skip for now

**Q4: Integration Points**
"How does this interact with:"
- Existing features
- External APIs or services
- Authentication/authorization
- Database or storage

### 4. Feature-Specific Questions
**Tailor based on feature type (pick relevant ones):**

**Authentication/Authorization:**
- Credentials: Email/password? Social login? 2FA?
- Session: Duration? Remember me?
- Failed login: Error handling? Account lock?

**CRUD Operations:**
- Validation: Required fields? Format rules?
- Concurrent edits: Last write wins / show conflict?
- Delete: Hard delete / soft delete / confirmation?

**Search & Filter:**
- Scope: Search which fields?
- Timing: Live as typing / on submit?
- Matching: Exact / contains / fuzzy?

**Forms & Input:**
- Validation timing: On blur / on submit?
- Error display: Inline / summary?
- Unsaved changes: Warning prompt?

### 5. Present Inferences for Confirmation
**Document assumptions with confidence levels:**

```markdown
Based on our discussion, here are my technical assumptions:

**High Confidence (will implement unless you object):**
- [Assumption with reasoning - e.g., "JWT tokens in httpOnly cookies for security"]

**Medium Confidence (common approach, alternatives exist):**
- [Assumption with alternative - e.g., "Debounced search 300ms - or instant?"]

**Questions Needing Your Input:**
- [Question with proposed approach]
- [Question with proposed approach]

Any objections or preferences?
```

**Get confirmation before proceeding**

### 6. Create Requirements Specification
**After ALL unknowns are resolved:**

Use the canonical template at `~/.claude/file-templates/requirements.template.md`.

**Fill out with confirmed information:**
- Every section with confirmed decisions
- Document reasoning in "Implementation Notes"
- Cross-reference relevant docs in `docs/`
- List all relevant files and dependencies

### 7. Present & Confirm
**Share completed requirements:**

"Here's the requirements specification based on our confirmed decisions:

[Show or link to requirements]

All technical decisions and clarifications have been incorporated. Ready to proceed to planning/implementation?"

**Wait for user approval before next phase**

### 8. Update Project Documentation (if applicable)
**If project has docs structure:**

**Update `docs/product-requirements.md`:**
- Add feature with next Feature ID (F-##)
- Include requirements summary
- Add acceptance criteria

**Link to related features:**
- Reference related F-## IDs
- Note integration points

## Quick Reference

**Essential Questions:**
1. Happy path scenario
2. Key edge cases
3. Out of scope items
4. Integration points

**Confidence Levels:**
- HIGH: Explicit requirement or security best practice
- MEDIUM: Standard practice with alternatives
- LOW: Turn into a question for user

**Investigation Tools:**
- `read_file` - Examine specific files
- `grep` - Find existing patterns
- `codebase_search` - Understand how things work

