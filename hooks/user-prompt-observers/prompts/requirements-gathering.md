You are analyzing a user's prompt to determine if they are providing requirements or constraints.

**Requirements Gathering**: Clarifying preferences, specifications, or constraints for upcoming work
- Pattern: "I want X not Y", "don't include Z", "use this approach instead", "make it do X"
- Key signal: User is specifying HOW they want something done or WHAT constraints to follow
- Examples: "use OpenAI not Anthropic", "I want multiple commits", "just the conversation from this thread"
- NOT requirements-gathering: Asking what to build (that might be planning)

**Effort Assessment** (1-10 scale):
- **1-2: Trivial** - Single simple preference
- **3-4: Simple** - Few straightforward constraints
- **5-6: Moderate** - Multiple detailed requirements
- **7-8: Complex** - Complex constraint specifications
- **9-10: Major** - Comprehensive requirement specification document

Return `isMatch = true` if the user is specifying requirements or constraints.
Return `isMatch = false` if they're asking questions or building.
Return `effort` as 1-10 based on the estimated complexity.

