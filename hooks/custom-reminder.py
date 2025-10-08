#!/usr/bin/env python3
"""
Hook that adds debugging or investigation prompts based on trigger words in user messages.
"""
import json
import re
import sys

# Debugging trigger patterns
DEBUG_PATTERNS = [
    r'\b(debug|debugging|bug)\b',
    r'\b(why.*not work|what.*wrong|not working)\b',
    r'\b(stack trace|error message|exception|\^\^\^)\b'
]

# Investigation trigger patterns
INVESTIGATION_PATTERNS = [
    r'\b(investigate|research|analyze|examine|explore|understand)\b',
    r'\b(how does.*work|figure out|explain|find out)\b',
    r'\b(code review|audit|inspect)\b'
]

# Planning trigger patterns
PLANNING_PATTERNS = [
    r'\b(make|create|develop|write|build).*\bplan\b',
    r'\bplan\s+(out|for|the)\b',
    r'\bplanning\s+(out|for|the)\b',
    r'\b(implementation|feature|system)\s+plan\b'
]

DEBUG_PROMPT = """
<system-reminder>The user has mentioned a key word or phrase that triggers this reminder. 

<debugging-workflow>
1. **Understand the codebase** - Read relevant files/tables/documents to understand the codebase, and look up documentation for external libraries.
2. **Identify 5-8 most likely root causes** - List potential reasons for the issue
3. **Choose the 3 most likely causes** - Prioritize based on probability and impact
4. **Decide whether to implement or debug** - If the cause is obvious, implement the fix and inform the user. If the cause is not obvious, continue this workflow.

Steps for Non-obvious Causes:
5. **For each of the 3 causes, validate by adding targeted logging/debugging**
6. **Let the user test** - Have them run the code with the new logging
7. **Fix when solution is found** - Implement the actual fix once root cause is confirmed
8. **Remove debugging logs** - Clean up temporary debugging code

Remember:
- Reading the entire file usually uncovers more information than just a snippet
- Without complete context, edgecases will be missed
- Making assumptions leads to poor analysis—stepping through code and logic sequentially is the best way to find the root cause

Include relevant debugging commands/tools and explain your reasoning for each step.
</debugging-workflow>

</system-reminder>
"""

INVESTIGATION_PROMPT = """
<system-reminder>The user has mentioned a key word or phrase that triggers this reminder.

<investigation-workflow>
1. **Assess scope**: Read provided files directly. Use code-finder or code-finder-advanced for unknown/large codebases, direct tools (Read/Grep/Glob) for simple searches.

2. **Use code-finder or code-finder-advanced when**: Complex investigations, no clear starting point, discovering patterns across many files, unclear functionality location.

3. **Use direct tools when**: Simple searches in known files, specific paths provided, trivial lookups.

4. **Flow**: Start with context → code-finder or code-finder-advanced for broad discovery → understand before suggesting → answer first, implement if asked.

5. **Multiple agents**: Split non-overlapping domains, launch parallel in single function_calls block. Example: backend/, frontend/, tests/ agents.

Example: "How does authentication integrate with each of our services, and how could we refactor it with middleware?" → Use a code-finder first, and then multiple parallel code-finder-advanced tasks
Example: "Investigate and make plan out Stripe integration" → Use parallel code-finder tasks
Example: "Where is combat implemented?" → Use code-finder task
Example: "Do we have a formatDate function" → Use grep/bash/etc tools directly
</investigation-workflow>

This workflow ensures efficient investigation based on task complexity.
"""

PLANNING_PROMPT = """
<system-reminder>The user has mentioned creating or making a plan. Here's some advice for making plans:

<planning-workflow>
**Effective Implementation Planning Guide**

Before creating any plan, conduct thorough investigation—NOTHING can be left to assumptions. Specificity is critical for successful implementation.

A well-structured plan should include:

1. **Summary**
   - Clear, concise description of what will be implemented
   - The core problem being solved or feature being added

2. **Reasoning/Motivation**
   - Why this approach was chosen
   - Trade-offs considered
   - Key decisions made during investigation

3. **Current System Overview**
   - How the existing system works (be specific)
   - Key files and their responsibilities:
     - List actual file paths (e.g., src/services/auth.ts, components/Dashboard.tsx)
     - Describe what each file does in the current implementation
   - Dependencies and data flow

4. **New System Design**
   - How the system will work after implementation
   - New or modified files required:
     - List exact file paths that will be created or changed
     - Describe the purpose of each change
   - Integration points with existing code

5. **Other Relevant Context**
   - Utility functions or helpers needed (with file paths)
   - Type definitions or interfaces (with file paths)
   - Configuration changes required
   - External dependencies or libraries
   - Testing considerations

**What NOT to include in plans:**
- Code snippets or implementation details
- Timelines or effort estimates
- Self-evident advice for LLMs
- Generic best practices
- Vague descriptions without file references

**Critical Requirements:**
- Every assertion must be based on actual investigation, not assumptions
- All file references must be exact paths discovered during research
- Dependencies between components must be explicitly mapped
- Edge cases and error conditions must be identified through code analysis

Remember: A plan fails when it makes assumptions. Investigate thoroughly, reference specifically, plan comprehensively.
</planning-workflow>

</system-reminder>
"""

def check_patterns(text, patterns):
    """Check if any pattern matches the text (case insensitive)."""
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError as e:
    print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
    sys.exit(1)

prompt = input_data.get("prompt", "")

# Check for debugging triggers
if check_patterns(prompt, DEBUG_PATTERNS):
    print(DEBUG_PROMPT)
    sys.exit(0)

# Check for investigation triggers
if check_patterns(prompt, INVESTIGATION_PATTERNS):
    print(INVESTIGATION_PROMPT)
    sys.exit(0)

# Check for planning triggers
if check_patterns(prompt, PLANNING_PATTERNS):
    print(PLANNING_PROMPT)
    sys.exit(0)

# No triggers matched, allow normal processing
sys.exit(0)