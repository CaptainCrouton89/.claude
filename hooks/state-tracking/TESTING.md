# Testing Protocol

## Step 1: Test Discovery (Ask 3-4 Questions)

**Don't write tests blindly.** Discover what to test:

### Q1: Testing Target
```
"What are we testing?

Options:
- New feature that needs tests?
- Existing code missing tests?
- Bug fix regression test?
- Refactored code (ensure behavior preserved)?

Please specify the code to test."
```

### Q2: Test Type
```
"What type of tests do you need?

- Unit tests (functions in isolation)?
- Integration tests (components working together)?
- E2E tests (full user flows)?
- API tests (endpoint testing)?
- Visual regression tests?

Or a mix? Let me know priority."
```

### Q3: Test Framework
```
"Test framework already set up?

- Jest / Vitest / Mocha / Jasmine?
- PyTest / unittest?
- RSpec / Minitest?
- PHPUnit?

If not set up: Should I configure it?"
```

### Q4: Coverage Expectations
```
"What coverage level do you need?

- Critical paths only (happy path + main errors)?
- Full coverage (aim for 80%+)?
- Edge cases focus (unusual inputs)?
- Regression prevention (test known bugs)?

This helps me prioritize test cases."
```

---

## Step 2: Test Plan

Present test plan BEFORE writing:

```markdown
## Test Plan: [Feature/Component/Module]

**Target:** [File or component being tested]
**Test type:** [Unit / Integration / E2E]
**Framework:** [Jest, PyTest, etc.]

---

### 🔴 Critical Paths (Must test)

#### Test 1: Happy path - [Description]
**Scenario:** User successfully [action]
**Given:** [Preconditions]
**When:** [Action performed]
**Then:** [Expected outcome]
**Assertions:**
- [Specific assertion 1]
- [Specific assertion 2]

#### Test 2: Authentication required
**Scenario:** Unauthenticated user blocked
**Given:** No auth token
**When:** User tries protected action
**Then:** 401 Unauthorized response
**Assertions:**
- Status code is 401
- Error message is clear

---

### 🟡 Edge Cases (Should test)

#### Test 3: Empty input
**Scenario:** Submit with no data
**Given:** Form with empty fields
**When:** Submit button clicked
**Then:** Validation error shown
**Assertions:**
- Error message displayed
- Form not submitted
- Helpful error text

#### Test 4: Network failure
**Scenario:** API timeout or network error
**Given:** API request times out
**When:** Request exceeds timeout
**Then:** User sees error + retry option
**Assertions:**
- Error handler called
- Retry button available
- Loading state cleared

---

### 🔵 Error Scenarios (Must test)

#### Test 5: Invalid data format
**Scenario:** Malformed input provided
**Given:** Invalid email format
**When:** Validation runs
**Then:** Specific error message
**Assertions:**
- Validation fails
- Error message matches pattern
- Invalid state highlighted

#### Test 6: Boundary conditions
**Scenario:** Input at limits (empty, max length, etc.)
**Given:** [Boundary condition]
**When:** [Processing]
**Then:** [Correct handling]

---

### ⚪ Out of Scope (Not testing)

The following are explicitly NOT included in this test suite:
- UI styling (visual regression tests separate)
- Performance benchmarks (separate performance suite)
- Browser compatibility (E2E suite handles this)
- [Other exclusions]

---

### 📋 Test Structure

```
describe('[Feature/Component]')
  describe('when [scenario/context]')
    it('should [specific expected behavior]')
      // Arrange: Setup
      // Act: Execute
      // Assert: Verify
```

---

### 🎭 Mocking Strategy

**What to mock:**
- API calls → Mock with msw / nock
- Database → In-memory SQLite / test DB
- External services → Mock implementations
- Time/dates → jest.useFakeTimers() / freezegun
- File system → Mock fs module

**What NOT to mock:**
- Code under test (actual implementation)
- Simple utilities (test real implementations)
- Pure functions (no side effects to mock)

---

### 📊 Expected Coverage

**Target coverage:**
- Statements: [X%] (aim for 80%+)
- Branches: [X%] (all if/else paths)
- Functions: [X%] (all public functions)
- Lines: [X%]

**Acceptable gaps:**
- [Specific uncovered code with justification]

---

**Proceed with this test plan?** (yes/modify)
```

---

## Step 3: Write Tests

After approval, write tests following the plan:

### Test Structure Template

```javascript
describe('[Feature/Component Name]', () => {
  // Setup/teardown
  beforeEach(() => {
    // Reset state, mocks
  });

  afterEach(() => {
    // Cleanup
  });

  describe('when [specific scenario/context]', () => {
    it('should [expected behavior]', async () => {
      // Arrange (Given)
      const input = { /* test data */ };
      const expected = { /* expected output */ };

      // Act (When)
      const result = await functionUnderTest(input);

      // Assert (Then)
      expect(result).toEqual(expected);
      expect(result.status).toBe('success');
    });

    it('should handle [edge case]', () => {
      // Test edge case
    });
  });

  describe('when [error scenario]', () => {
    it('should throw [specific error]', async () => {
      // Arrange
      const invalidInput = { /* bad data */ };

      // Act & Assert
      await expect(functionUnderTest(invalidInput))
        .rejects.toThrow('Expected error message');
    });
  });
});
```

### Test Writing Best Practices

1. **Arrange-Act-Assert pattern**
   ```javascript
   // Arrange: Set up test data
   const user = { name: 'Test', email: 'test@example.com' };

   // Act: Execute the code
   const result = await createUser(user);

   // Assert: Verify expectations
   expect(result.id).toBeDefined();
   ```

2. **Descriptive test names**
   ```javascript
   // ✓ Good: Describes behavior
   it('should return 404 when user does not exist')

   // ✗ Bad: Vague
   it('test user function')
   ```

3. **One assertion per test (guideline)**
   ```javascript
   // ✓ Good: Focused test
   it('should set user email correctly', () => {
     expect(user.email).toBe('test@example.com');
   });

   // ⚠ Acceptable: Related assertions
   it('should create valid user object', () => {
     expect(user.id).toBeDefined();
     expect(user.email).toBe('test@example.com');
     expect(user.createdAt).toBeInstanceOf(Date);
   });
   ```

4. **Test independence**
   ```javascript
   // Each test should run independently
   // Don't rely on test execution order
   ```

---

## Step 4: Test Coverage Report

After writing tests, provide coverage analysis:

```markdown
## Test Results & Coverage

### ✅ Test Execution

**Tests written:** [N] test cases
**Test suites:** [N] files
**Total assertions:** [N]

**Results:**
```
PASS src/auth/login.test.js
  User Authentication
    when logging in with valid credentials
      ✓ should return JWT token (45ms)
      ✓ should set user session (23ms)
    when logging in with invalid credentials
      ✓ should throw authentication error (12ms)
      ✓ should not create session (8ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Time:        2.451s
```

---

### 📊 Coverage Report

**Overall coverage:**
```
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
--------------------|---------|----------|---------|---------|----------------
All files           |   92.5  |   85.3   |   95.0  |   90.8  |
 auth/              |   95.0  |   88.2   |  100.0  |   94.5  |
  login.js          |   95.0  |   88.2   |  100.0  |   94.5  | 45, 67
 utils/             |   88.0  |   80.0   |   87.5  |   85.0  |
  validation.js     |   88.0  |   80.0   |   87.5  |   85.0  | 23-25, 89
```

---

### 🎯 Coverage Analysis

**Well-covered areas:**
- ✓ Happy paths: 100% coverage
- ✓ Authentication flows: 95% coverage
- ✓ Error handling: 90% coverage

**Missing coverage:**

1. **auth/login.js:45, 67**
   - Uncovered: Rare database connection error scenario
   - Impact: Low (edge case)
   - Recommendation: Add test or document as acceptable gap
   - Priority: Low

2. **utils/validation.js:23-25**
   - Uncovered: Regex fallback for old browser
   - Impact: Medium
   - Recommendation: Add test for legacy browser path
   - Priority: Medium

**Overall assessment:** Coverage meets [80%+] target. Missing areas are low-priority edge cases.

---

### 🔄 Next Steps

Should I:
1. Add tests for missing coverage areas?
2. Add more edge case tests?
3. Set up CI integration for automated testing?
4. Tests complete as-is?

---

### 🏃 Running Tests

**Run all tests:**
```bash
npm test
```

**Run with coverage:**
```bash
npm test -- --coverage
```

**Run specific file:**
```bash
npm test auth/login.test.js
```

**Watch mode:**
```bash
npm test -- --watch
```
```

---

## Step 5: Document Testing Patterns

If tests reveal useful patterns or approaches:

```markdown
### PL-XXX: [Testing pattern learned]

**Discovered:** Testing session, [date]

**Challenge:**
[What was difficult to test]
Example: "Testing async operations with multiple API calls and race conditions"

**Solution:**
[How we solved it]
Example: "Used jest.useFakeTimers() to control timing, mock API responses in sequence"

**Code Example:**
```javascript
test('should handle concurrent requests', async () => {
  jest.useFakeTimers();

  const promise1 = fetchUser(1);
  const promise2 = fetchUser(2);

  jest.runAllTimers();

  const results = await Promise.all([promise1, promise2]);
  expect(results).toHaveLength(2);
});
```

**Prevention:**
Rule: [Testing practice to follow]
Example: "For async code with timing dependencies, use fake timers to make tests deterministic"

**Category:** Testing
```

Add to project.md under "Project Learnings".

---

## Common Testing Patterns

### Testing Async Code
```javascript
it('should fetch user data', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('John');
});
```

### Testing Promises
```javascript
it('should reject with error', () => {
  return expect(fetchUser(999)).rejects.toThrow('User not found');
});
```

### Testing Callbacks
```javascript
it('should call callback with result', (done) => {
  fetchUser(1, (err, user) => {
    expect(err).toBeNull();
    expect(user.name).toBe('John');
    done();
  });
});
```

### Testing Exceptions
```javascript
it('should throw validation error', () => {
  expect(() => {
    validateEmail('invalid');
  }).toThrow('Invalid email format');
});
```

### Mocking Functions
```javascript
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue('async result');
mockFn.mockRejectedValue(new Error('async error'));
```

### Mocking Modules
```javascript
jest.mock('./api', () => ({
  fetchUser: jest.fn(() => Promise.resolve({ id: 1, name: 'Test' }))
}));
```

### Testing React Components
```javascript
import { render, screen, fireEvent } from '@testing-library/react';

it('should handle button click', () => {
  render(<LoginForm />);

  const button = screen.getByRole('button', { name: /login/i });
  fireEvent.click(button);

  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

---

## Test Types Comparison

| Type | Scope | Speed | When to Use |
|------|-------|-------|-------------|
| **Unit** | Single function/class | Fast | Logic, calculations, pure functions |
| **Integration** | Multiple components | Medium | API endpoints, database operations |
| **E2E** | Full user flow | Slow | Critical user journeys |
| **Snapshot** | Component output | Fast | React/Vue component testing |
| **Visual** | UI appearance | Slow | Styling, layout verification |

---

## Quality Criteria

Testing complete when:
- [ ] Test plan approved and executed
- [ ] All critical paths tested
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Coverage meets target (typically 80%+)
- [ ] All tests passing
- [ ] Tests are maintainable (clear, not brittle)
- [ ] Mocking strategy appropriate
- [ ] CI integration configured (if applicable)

---

## Example Session

```
Human: "Write tests for the user registration feature"

LLM: Let me understand what needs testing:

1. What are we testing?
   - The new registration feature?
   - Specific parts?

2. What type of tests?
   - Unit tests for validation?
   - Integration tests for full registration flow?
   - Both?

3. Test framework already set up?
   - I see package.json has Jest

4. Coverage expectations?
   - Full coverage or critical paths only?

[Human answers: Integration tests, full registration flow, aim for 90% coverage]

LLM:
## Test Plan: User Registration

### Critical Paths (Must test)

1. **Happy path:** User successfully registers
   - Valid email, password, terms accepted
   - Assert: User created in DB, confirmation email sent

2. **Duplicate email:** User tries existing email
   - Assert: 409 Conflict, helpful error message

### Edge Cases

3. **Weak password:** Password too short
   - Assert: Validation error

4. **Email verification:** Verify email token
   - Assert: Account activated

### Error Scenarios

5. **Database error:** DB unavailable during registration
   - Assert: 500 error, user-friendly message

Proceed? (yes/modify)

[Human: yes]

LLM: [Writes comprehensive test suite...]

## Test Results

✓ Tests written: 5 scenarios
✓ Coverage: 94% (exceeds 90% target)

Run: npm test
```

---
