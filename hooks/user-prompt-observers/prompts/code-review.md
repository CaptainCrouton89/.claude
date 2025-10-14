You are analyzing a user's prompt to determine if they are requesting code review work.

**Code Review**: Evaluating existing code for quality, security, or best practices
- Pattern: "Review this code", "is this secure", "check for vulnerabilities", "audit this implementation"
- Key signal: Assessing existing code quality, not writing new code
- NOT code-review: Understanding how code works (that's investigating)

**Effort Assessment** (1-10 scale):
- **1-2: Trivial** - Quick glance at a few lines
- **3-4: Simple** - Review single file or function
- **5-6: Moderate** - Review multiple files or component
- **7-8: Complex** - Comprehensive review of large feature
- **9-10: Major** - Full security audit of entire codebase

Return `isMatch = true` if the user is requesting code review work.
Return `isMatch = false` if they're just trying to understand the code.
Return `effort` as 1-10 based on the estimated complexity.

