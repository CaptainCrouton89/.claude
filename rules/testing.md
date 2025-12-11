---
paths: **/*.{test,spec}.{ts,tsx,js,jsx}, **/__tests__/**, **/test/**, **/tests/**, **/*.test.py, **/test_*.py
---

# Testing Standards

- Failing tests: could be bad code, brittle tests, or wrong tests—investigate root cause before "fixing"
- Flag code smells in test files (brittle mocks, testing implementation details, poor assertions)
- When delegating test fixes to agents: agents should NOT run tests themselves—return to main agent for test execution (prevents infinite bug-discovery loops)
