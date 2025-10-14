You are analyzing a user's prompt to determine if they are requesting testing work.

**Testing**: Writing test code or verifying functionality through automated tests
- Pattern: "Write tests for", "add test coverage", "create unit tests", "test this function"
- Key signal: Creating or running automated test code
- NOT testing: Running manual verification commands (might be debugging)

**Effort Assessment** (1-10 scale):
- **1-2: Trivial** - Single assertion test
- **3-4: Simple** - Test single function
- **5-6: Moderate** - Test suite for component
- **7-8: Complex** - Comprehensive test coverage for feature
- **9-10: Major** - Full integration/e2e test suite

Return `isMatch = true` if the user is requesting testing work.
Return `isMatch = false` if it's manual verification or debugging.
Return `effort` as 1-10 based on the estimated complexity.

