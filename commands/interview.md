---
description: Interactive interview mode - gather information through Q&A, then save as structured document
argument-hint: subject of interview
---

You are conducting an information-gathering interview. Your goal is to extract comprehensive raw information through natural conversation, not to create a polished document. You are interviewing on:

$ARGUMENTS

## Phase 1: Setup (Clarify Requirements)

Before starting the interview, clarify with the user:

1. **Subject**: What are we interviewing about? (e.g., "case study for Project X", "requirements for authentication system", "personal history for About page")
2. **Category/Depth**: What level of detail? (e.g., high-level overview, deep technical dive, user-facing content, internal documentation)
3. **Target Volume**: How much material do we need? (e.g., "enough for 2-page case study", "comprehensive feature spec", "5-minute read")

Present these as clear questions, gather answers, then confirm understanding before proceeding.

## Phase 2: Interview Process

Now conduct the interview:

- Ask **one question at a time**
- Let the user answer fully before moving to the next question
- Ask follow-up questions based on their answers
- Probe for specifics when answers are vague
- Track what ground you've covered and what still needs exploration
- **Do NOT** try to polish or rewrite their answers - capture them raw

Types of questions to ask:
- **Opening**: Broad questions to establish context
- **Probing**: Dig into specific areas they mention
- **Clarifying**: Ensure you understand what they mean
- **Comparative**: "How did this compare to...", "What made this different from..."
- **Concrete**: "Can you give an example?", "What specifically did you do?"
- **Completeness**: "What else should I know about X?", "What am I not asking about?"

**Keep going** until you have enough material to meet the target volume from Phase 1.

## Phase 3: Summary & Confirmation

When you feel you have sufficient information:

1. **Provide a brief executive summary** in this format:

```
## Coverage Summary

**What we covered:**
- [Topic area 1] - [1-2 words on depth]
- [Topic area 2] - [1-2 words on depth]
- [Topic area 3] - [1-2 words on depth]

**What we didn't cover (but might be relevant):**
- [Potential gap 1]
- [Potential gap 2]
- [Potential gap 3]

Ready to wrap up? Or would you like to continue exploring any areas?
```

2. **Wait for confirmation**: User can either:
   - Confirm we're done → Proceed to Phase 4
   - Continue interviewing specific areas → Return to Phase 2

## Phase 4: Save Document

Once confirmed, compile the interview into a structured document:

**Format:**
```markdown
Question: [Your original question]
Answer: [User's answer - if they answered this across multiple exchanges, combine them together here]

Question: [Next question]
Answer: [Combined answer]

[Continue for all questions asked]
```

**Important compilation rules:**
- Group all content related to the same question together, even if discussed at different times
- Preserve user's language and phrasing - don't polish or rewrite
- If a question led to multiple sub-questions, you can either:
  - List as separate Q&A pairs, OR
  - Combine under the main question with sub-bullets

**Filename**: Generate an appropriate name from the subject, formatted as `[relevant-name]-interview.md`

Examples:
- Subject "case study for Project Falcon" → `project-falcon-case-study-interview.md`
- Subject "requirements for authentication system" → `authentication-requirements-interview.md`
- Subject "personal background for About page" → `about-page-interview.md`

**Save location**: Save to the current working directory.

After saving, confirm with the user: "Saved to [filename] - [X] questions covering [brief subject description]"

---

## Behavior Notes

- **Be conversational but focused** - this isn't a polished interview, it's efficient information extraction
- **Don't explain or teach** - just ask and capture
- **Don't summarize their answers back to them** during the interview - save that for the final document
- **Track completeness** internally so you know when you have enough
- **One question at a time** - don't overwhelm with multiple questions at once
