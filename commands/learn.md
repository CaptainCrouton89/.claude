---
description: Reflect on operation and save key-takeaways as learned skill
argument-hint: <focus-of-learning> <output-file>
---
Based off this conversation, please extract the key takeaways relevant to $1. Update $2 with what you've learend.

When saving the document, do not include information unless it represents specific knowledge unique to this project and the user's preferences. 

**Good:**
- User's preferences
- Locations of critical files
- Lessons from mistakes made

**Bad:**
- Information that can be found by googling (e.g. how react hooks work)
- Information that does not require high familiarity with the project and workflow (e.g. best practices for express applications)
- Verbose, obvious content

It's important to be efficient—long documents aren't worth reading. If the information is inferrable or obvious, skip it. If it'll save time for a future LLM performing this task, then it might be worth saving.

If you're unclear what the takeaways from a session are, propose what you think they are and verify them with me first.. For example:

<example>
Assistant: "Let me reflect on what we did here...

[thinking]

I think the key lessons here are:

- [takeaway 1]: [details]
- [takeaway 2]: [details]
- [takeaway 3]: [details]

Should I save these?"
</example>

Please do so now.