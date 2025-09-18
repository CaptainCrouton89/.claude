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

# Prompt improvement trigger patterns
PROMPT_IMPROVEMENT_PATTERNS = [
    r'\b(improv|enhanc).*\b(prompt|prompting)\b',
    r'\b(prompt|prompting).*\b(improv|enhanc)\b',
    r'\b(better|optimize|refine).*\b(prompt|prompting)\b',
    r'\b(prompt|prompting).*\b(better|optimize|refine)\b'
]

# Parallelization trigger patterns
PARALLEL_PATTERNS = [
    r'\b(parallel|parallelize|parallelization|concurrently|simultaneously)\b',
    r'\bin parallel\b',
    r'\bat the same time\b',
    r'\bconcurrent execution\b'
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
1. **Assess scope**: Read provided files directly. Use code-finder for unknown/large codebases, direct tools (Read/Grep/Glob) for simple searches.

2. **Use code-finder when**: Complex investigations, no clear starting point, discovering patterns across many files, unclear functionality location.

3. **Use direct tools when**: Simple searches in known files, specific paths provided, trivial lookups.

4. **Flow**: Start with context → code-finder for broad discovery → understand before suggesting → answer first, implement if asked.

5. **Multiple agents**: Split non-overlapping domains, launch parallel in single function_calls block. Example: backend/, frontend/, tests/ agents.

Example: "Investigate and make plan out Stripe integration" → Use multiple code-finder tasks
Example: "Where is combat implemented?" → Use code-finder task
Example: "Do we have a formatDate function" → Use grep/bash/etc tools directly
</investigation-workflow>

This workflow ensures efficient investigation based on task complexity.
"""

PROMPT_IMPROVEMENT_PROMPT = """
<system-reminder>The user has mentioned improving or enhancing prompts/prompting.

CRITICAL: You MUST first read ~/.claude/guides/prompting-guide.md for comprehensive guidance on writing effective prompts. If you haven't read this guide yet in this conversation, read it immediately before proceeding with any prompt-related suggestions.

Only after reading and understanding this guide should you provide prompt improvement recommendations.

If the user is not looking to improve a prompt, or you have already read the guide, ignore this reminder.
</system-reminder>
"""

PARALLEL_PROMPT = """
<system-reminder>The user has mentioned parallel execution or parallelization.

<parallelization-guide>
**How and When to Parallelize Tasks:**

Parallelizing tasks means delegating implementations and changes to multiple agents at the same time. Agents have their own context, meaning they are more likely to succeed and won't clog up context windows.

In order to parallelize, you should break it into groups of tasks that don't depend on each other's outputs. Then, think some more, and then delegate the next batch of one or more agents.

1. **Identify Independent Tasks**: Look for tasks that don't depend on each other's outputs
2. **Use Single function_calls Block**: Place multiple tool invocations in ONE block:
   <function_calls>
     <invoke name="Task">...</invoke>
     <invoke name="Task">...</invoke>
     <invoke name="Bash">...</invoke>
   </function_calls>
3. Use the right agent for each task.
4. After each batch of agents, ultrathink about which tasks can be done next, based on the dependencies. 

General Advice:
- Agents you create do not have the same knowledge that you do. Either give them that knowledge, or tell them which files to read in order to get them up to speed.
- Dependencies are critical. If a task depends on another task (types, interfaces, core utilities), it must be run _after_ the dependent task.
- Agents cannot handle many instructions—be judicious in how much each agent is given, and prefer using multiple agents over giving them many instructions when possible.


Remember: EVERYTHING needs to get done, and all tasks should be given to agents. The dependency order is critical, so don't put tasks that depend on each other (such as db and type updates combining with tasks that rely on them) in the same batch.

</parallelization-guide>

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

# Check for parallelization triggers
if check_patterns(prompt, PARALLEL_PATTERNS):
    print(PARALLEL_PROMPT)
    sys.exit(0)

# No triggers matched, allow normal processing
sys.exit(0)