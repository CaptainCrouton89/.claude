#!/usr/bin/env python3
"""
Hook that adds debugging or investigation prompts based on trigger words in user messages.
"""
import json
import re
import sys

# Debugging trigger patterns
DEBUG_PATTERNS = [
    r'\b(debug|debugging|bug|error|issue|problem|fix|broken|crash|fail)\b',
    r'\b(why.*not work|what.*wrong|not working)\b',
    r'\b(stack trace|error message|exception|\^\^\^)\b'
]

# Investigation trigger patterns  
INVESTIGATION_PATTERNS = [
    r'\b(investigate|research|analyze|examine|explore|understand)\b',
    r'\b(how does.*work|figure out|explain|find out)\b',
    r'\b(code review|audit|inspect)\b'
]

# Prompt improvement trigger patterns
PROMPT_IMPROVEMENT_PATTERNS = [
    r'\b(improv|enhanc).*\b(prompt|prompting)\b',
    r'\b(prompt|prompting).*\b(improv|enhanc)\b',
    r'\b(better|optimize|refine).*\b(prompt|prompting)\b',
    r'\b(prompt|prompting).*\b(better|optimize|refine)\b'
]

DEBUG_PROMPT = """
<system-reminder>The user has mentioned a key word or phrase that triggers this reminder. 

<debugging-workflow>
1. **Identify 5-8 most likely root causes** - List potential reasons for the issue
2. **Choose the 3 most likely causes** - Prioritize based on probability and impact
3. **For each of the 3 causes, validate by adding targeted logging/debugging**
4. **Let the user test** - Have them run the code with the new logging
5. **Fix when solution is found** - Implement the actual fix once root cause is confirmed
6. **Remove debugging logs** - Clean up temporary debugging code

Include relevant debugging commands/tools and explain your reasoning for each step.
</debugging-workflow>

This workflow ensures optimal debugging and problem-solving.

</system-reminder>
"""

INVESTIGATION_PROMPT = """
<system-reminder>The user has mentioned a key word or phrase that triggers this reminder.

<investigation-workflow>
1. **Assess scope and context**
   - If files/context provided: Read them directly to understand the code
   - If large codebase with unclear starting point: Use code-finder agent
   - If simple/obvious location: Use direct tools (Read, Grep, Glob)

2. **When to use code-finder agent**:
   - Complex investigations across unknown codebase sections
   - No clear starting point or files provided
   - Need to discover patterns/implementations across many files
   - Looking for specific functionality with unclear location
   
3. **When NOT to use code-finder**:
   - Simple searches in known files (use Read/Grep directly)
   - When specific file paths are provided
   - For trivial lookups that can be done with single Grep/Glob

4. **Investigation flow**:
   - Start with provided context/files if any
   - Use code-finder for broad discovery only when needed
   - Focus on understanding before suggesting changes
   - Answer the question first, implement only if asked

5. **Using multiple agents for complex tasks**:
   - Split complex investigations into non-overlapping domains
   - Each agent gets distinct search areas to avoid duplication
   - Launch parallel agents in single function_calls block with multiple Task invocations
   - Example: One agent searches backend/, another frontend/, third checks tests/

Example: "Investigate and make plan out Stripe integration" → Use multiple code-finder tasks
Example: "Where is combat implemented?" → Use code-finder task
Example: "Do we have a formatDate function" → Use grep/bash/etc tools directly
</investigation-workflow>

This workflow ensures efficient investigation based on task complexity.
"""

PROMPT_IMPROVEMENT_PROMPT = """
<system-reminder>The user has mentioned improving or enhancing prompts/prompting.

CRITICAL: You MUST first read ~/.claude/guides/prompting-guide.md for comprehensive guidance on writing effective prompts. This guide contains essential best practices, patterns, and examples that you must understand before providing any prompt improvement advice.

If you haven't read this guide yet in this conversation, read it immediately before proceeding with any prompt-related suggestions.

The prompting guide contains:
- Core principles of effective prompting
- Common mistakes to avoid  
- Proven patterns and templates
- Context management strategies
- Advanced techniques for complex tasks

Only after reading and understanding this guide should you provide prompt improvement recommendations.
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

# Check for prompt improvement triggers
if check_patterns(prompt, PROMPT_IMPROVEMENT_PATTERNS):
    print(PROMPT_IMPROVEMENT_PROMPT)
    sys.exit(0)

# No triggers matched, allow normal processing
sys.exit(0)