#!/usr/bin/env python3
"""
Hook that adds planning prompts based on trigger words in user messages.
"""
import json
import re
import sys

# Planning trigger patterns
PLANNING_PATTERNS = [
    r'\b(make|create|develop|write|build).*\bplan\b',
    r'\bplan\s+(out|for|the)\b',
    r'\bplanning\s+(out|for|the)\b',
    r'\b(implementation|feature|system)\s+plan\b'
]

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

# Check for planning triggers
if check_patterns(prompt, PLANNING_PATTERNS):
    print(PLANNING_PROMPT)
    sys.exit(0)

# No triggers matched, allow normal processing
sys.exit(0)