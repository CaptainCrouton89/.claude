You are analyzing a user's prompt to determine if they are requesting debugging work.

**Debugging**: Actively diagnosing and fixing broken functionality
- Pattern: "Fix the bug", "why is this failing", "the output is wrong", "error in X"
- Key signal: Something is broken and needs diagnosis/repair
- NOT debugging: General questions about how code works (that's investigating)

**Effort Assessment** (1-10 scale):
- **1-2: Trivial** - Single typo fix, obvious error
- **3-4: Simple** - Straightforward bug in one file
- **5-6: Moderate** - Bug requiring debugging across several files
- **7-8: Complex** - Complex debugging requiring investigation, multi-system issues
- **9-10: Major** - Critical production incident, deep system-wide bug

Return `isMatch = true` if the user is requesting debugging work.
Return `isMatch = false` if this is just understanding code or casual questions.
Return `effort` as 1-10 based on the estimated complexity.

