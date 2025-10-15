# Testing Protocol

Systematic approach to writing automated tests, validating functionality, and ensuring code quality through comprehensive test coverage.

## Artifacts

**Inputs:**
- `docs/user-stories/US-###-*.md` - Acceptance criteria to test
- `docs/feature-spec/F-##-*.md` - Technical requirements
- `docs/api-contracts.yaml` - API specifications
- `docs/plans/<slug>/plan.md` - Implementation plan (if available)
- Existing test files for patterns

**Outputs:**
- Test files (unit, integration, component, E2E)
- Test fixtures and shared utilities
- Test pattern investigation (if needed)

**Handoffs:**
- No direct handoffs; tests validate implementations

## Naming Conventions
- Test files: `tests/<type>/<feature>.test.ts` or colocated `<file>.test.ts`
- Fixtures: `tests/fixtures/<domain>.ts`
- Investigation artifacts: `agent-responses/agent_<id>.md`

## Shared Dependency Setup
Before parallelizing test writing, create or reuse shared test fixtures, mock utilities, and setup/teardown helpers first. Then spawn parallel test agents with clear boundaries (mirroring main.md patterns).

## When to Use
- Writing test code for features
- Verifying functionality through automated tests
- Adding test coverage to existing code
- Creating test suites for acceptance criteria

## Core Steps

### 1. Determine Test Scope & Strategy
**Identify what needs testing:**

**Read project documentation:**
- `docs/user-stories/US-###-*.md` for acceptance criteria to test
- `docs/feature-spec/F-##-*.md` for technical requirements
- `docs/api-contracts.yaml` for API specifications
- Existing test files to understand patterns

**Classify test type:**
- **Unit tests:** Individual functions, pure logic, utilities
- **Integration tests:** Multiple components working together, API endpoints
- **Component tests:** UI components, user interactions
- **E2E tests:** Complete user flows, critical paths
- **Contract tests:** API request/response validation
- **Performance tests:** Load, stress, benchmark testing

**Determine coverage needs:**
- What acceptance criteria must be tested?
- What edge cases need coverage?
- What error scenarios to validate?
- What performance thresholds to verify?

### 2. Understand Existing Patterns
**Investigate current test approach:**

**Read existing test files:**
- Test framework used (Jest, Vitest, Pytest, etc.)
- Mocking patterns and utilities
- Test data fixtures
- Assertion styles
- Setup/teardown patterns

**Use async agents for test discovery (if needed):** Delegate `code-finder` to document testing patterns. Results saved to `agent-responses/agent_<id>.md`.

Wait for results: `./agent-responses/await {agent_id}`

### 3. Map Test Cases to Requirements
**From user story acceptance criteria to test cases:**

**Example mapping:**
```markdown
## User Story: US-101 User Login

### Acceptance Criteria
- [ ] Given valid credentials, when user logs in, then dashboard is shown
- [ ] Given invalid password, when user logs in, then error message appears
- [ ] Given account locked, when user logs in, then locked message appears

### Test Cases
1. **Unit: Authentication service**
   - `validateCredentials()` returns true for valid email/password
   - `validateCredentials()` returns false for invalid password
   - `checkAccountStatus()` detects locked accounts

2. **Integration: Login endpoint**
   - POST /api/login with valid creds returns 200 + token
   - POST /api/login with invalid creds returns 401 + error
   - POST /api/login with locked account returns 403 + message

3. **Component: Login form**
   - Submitting form calls login API
   - Error message displays on 401 response
   - Success redirects to /dashboard

4. **E2E: Complete login flow**
   - User enters credentials → submits → sees dashboard
   - User enters wrong password → sees error → retries successfully
```

### 4. Parallel Test Implementation
**When to parallelize test writing:**
- Multiple test files for different modules (unit tests)
- Independent test suites (frontend + backend)
- Different test types (unit + integration + e2e)
- 3+ test files with no shared setup

**Common parallelization patterns:**

**Pattern 1: Layer-based testing**
- Agent 1: Unit tests for services/utilities
- Agent 2: Integration tests for API endpoints
- Agent 3: Component tests for UI
- Agent 4: E2E tests for critical flows

**Pattern 2: Feature-based testing**
- Agent 1: All tests for Feature A (unit + integration + component)
- Agent 2: All tests for Feature B
- Agent 3: All tests for Feature C

**Pattern 3: Type-based testing**
- Agent 1: All unit tests across codebase
- Agent 2: All integration tests
- Agent 3: All E2E tests

**Delegate parallel test agents:** Pass `docs/plans/<slug>/plan.md`, `docs/user-stories/US-###-*.md`, and `agent-responses/agent_<id>.md` pattern findings to test agents.

Wait for completion: `./agent-responses/await {agent_id}` or continue other work

### 5. Write Test Implementation
**Structure tests following best practices:**

**Unit Test Structure:**
```javascript
// tests/services/auth.test.ts
describe('AuthService', () => {
  describe('validateCredentials', () => {
    it('returns true for valid email and password', async () => {
      const result = await authService.validateCredentials(
        'user@example.com',
        'ValidPass123'
      );
      expect(result).toBe(true);
    });

    it('returns false for invalid password', async () => {
      const result = await authService.validateCredentials(
        'user@example.com',
        'WrongPassword'
      );
      expect(result).toBe(false);
    });

    it('throws error for malformed email', async () => {
      await expect(
        authService.validateCredentials('invalid-email', 'pass')
      ).rejects.toThrow('Invalid email format');
    });
  });
});
```

**Integration Test Structure:**
```javascript
// tests/api/auth.test.ts
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await resetTestDatabase();
    await createTestUser({
      email: 'test@example.com',
      password: 'Test123!'
    });
  });

  it('returns 200 and token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.token).toMatch(/^eyJ/); // JWT format
  });

  it('returns 401 for invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });
});
```

**Component Test Structure:**
```javascript
// tests/components/LoginForm.test.tsx
describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ success: true });
    render(<LoginForm onLogin={mockLogin} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password123'
    });
  });

  it('displays error message on API failure', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginForm onLogin={mockLogin} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
```

**E2E Test Structure:**
```javascript
// tests/e2e/login.spec.ts
test('user can log in successfully', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Test123!');
  await page.click('button:has-text("Log In")');

  await page.waitForURL('/dashboard');
  expect(page.url()).toContain('/dashboard');
  
  const welcomeMessage = await page.textContent('h1');
  expect(welcomeMessage).toContain('Welcome');
});
```

### 6. Edge Cases & Error Scenarios
**Comprehensive test coverage includes:**

**Boundary conditions:**
- Empty inputs
- Minimum/maximum values
- Just below/above thresholds
- Null/undefined values

**Error scenarios:**
- Network failures
- API errors (4xx, 5xx)
- Validation failures
- Timeout conditions
- Concurrent operations

**Example edge case tests:**
```javascript
describe('Edge cases', () => {
  it('handles empty email gracefully', async () => {
    await expect(
      authService.validateCredentials('', 'password')
    ).rejects.toThrow('Email is required');
  });

  it('handles extremely long password', async () => {
    const longPassword = 'a'.repeat(10000);
    await expect(
      authService.validateCredentials('user@example.com', longPassword)
    ).rejects.toThrow('Password too long');
  });

  it('handles network timeout', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 10000))
    );

    await expect(
      authService.login('user@example.com', 'pass')
    ).rejects.toThrow('Request timeout');
  });
});
```

### 7. Test Data Management
**Create reusable test fixtures:**

```javascript
// tests/fixtures/users.ts
export const validUser = {
  email: 'test@example.com',
  password: 'Test123!',
  name: 'Test User'
};

export const invalidUsers = {
  noEmail: { password: 'Test123!' },
  noPassword: { email: 'test@example.com' },
  invalidEmail: { email: 'not-an-email', password: 'Test123!' },
  weakPassword: { email: 'test@example.com', password: '123' }
};

// Use in tests
import { validUser, invalidUsers } from './fixtures/users';

it('validates user data', () => {
  expect(validate(validUser)).toBe(true);
  expect(validate(invalidUsers.noEmail)).toBe(false);
});
```

### 8. Consolidate & Review
**After parallel test implementation:**
- Review all test files for consistency
- Ensure no duplicate test coverage
- Verify all acceptance criteria covered
- Check for test data conflicts
- Validate mock usage is consistent

### 9. Run & Verify Tests
**Execute test suite:**
```bash
# Unit tests
npm test -- --coverage

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

**Verify coverage:**
- Aim for >80% code coverage
- 100% coverage of critical paths
- All acceptance criteria have tests
- All error scenarios tested

### 10. Update Documentation
**Document test approach:**
- Update `docs/feature-spec/F-##-*.md` with testing notes
- Add test coverage badge/report
- Document test data setup requirements
- Note any test-specific configuration

## Test Quality Checklist

**Coverage:**
- [ ] All acceptance criteria from user stories tested
- [ ] Happy path covered
- [ ] Edge cases included
- [ ] Error scenarios tested
- [ ] Boundary conditions validated

**Structure:**
- [ ] Tests follow existing patterns
- [ ] Clear test descriptions (it/test statements)
- [ ] Proper setup/teardown
- [ ] No flaky tests (consistent results)
- [ ] Tests are isolated (no interdependencies)

**Data:**
- [ ] Test fixtures reusable
- [ ] Database properly seeded/reset
- [ ] Mocks used appropriately
- [ ] No hardcoded test data in production code

**Integration:**
- [ ] Tests run in CI/CD
- [ ] Coverage thresholds enforced
- [ ] Fast feedback (quick tests)
- [ ] Clear failure messages

## Agent Strategy

**Test writing phase:**
- 2-4 agents for parallel test implementation
- Each handles different test type or module
- Follow existing test patterns

**Review phase:**
- Consolidate yourself or use `general-purpose` for review
- Verify consistency and coverage


