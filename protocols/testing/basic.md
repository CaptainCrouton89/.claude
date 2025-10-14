# Testing Protocol (Basic)

Streamlined approach to writing tests that validate functionality against acceptance criteria.

## Artifacts

**Inputs:**
- `docs/user-stories/US-###-*.md` - Acceptance criteria to test
- `docs/feature-spec/F-##-*.md` - Technical requirements
- `docs/api-contracts.yaml` - API specifications
- Existing test files for patterns

**Outputs:**
- Test files (unit, integration, component, or E2E)
- Test fixtures (if needed)

## When to Use
- Writing test code for features
- Verifying functionality through automated tests
- Adding test coverage to existing code

## Core Steps

### 1. Determine Test Scope
**Identify what needs testing:**

**Read project documentation:**
- `docs/user-stories/US-###-*.md` for acceptance criteria to test
- `docs/feature-spec/F-##-*.md` for technical requirements
- `docs/api-contracts.yaml` for API specifications
- Existing test files to understand patterns

**Choose 1-2 test types:**
- **Unit tests:** Individual functions, pure logic
- **Integration tests:** API endpoints, database operations
- **Component tests:** UI components, user interactions
- **E2E tests:** Complete user flows

### 2. Understand Existing Patterns
**Review current test approach:**

- Test framework (Jest, Vitest, Pytest, etc.)
- Mocking patterns
- Test data fixtures
- Setup/teardown patterns

**Use grep or read_file to examine existing tests**

### 3. Map Tests to Acceptance Criteria
**Convert 3-5 AC to test cases:**

**Example:**
```markdown
## User Story: US-101 User Login

### Acceptance Criteria
- [ ] Valid credentials → dashboard shown
- [ ] Invalid password → error message
- [ ] Account locked → locked message

### Test Cases
**Integration: Login endpoint**
- POST /api/login with valid creds returns 200 + token
- POST /api/login with invalid creds returns 401 + error
- POST /api/login with locked account returns 403
```

### 4. Write Tests
**Follow existing patterns:**

**Unit Test Example:**
```javascript
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
  });
});
```

**Integration Test Example:**
```javascript
describe('POST /api/auth/login', () => {
  it('returns 200 and token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Test123!' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('returns 401 for invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Wrong' });

    expect(response.status).toBe(401);
  });
});
```

**Component Test Example:**
```javascript
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
});
```

### 5. Key Edge Cases
**Include 1-2 important edge cases:**

- Empty inputs
- Invalid formats
- Error conditions
- Network failures

**Example:**
```javascript
it('handles empty email gracefully', async () => {
  await expect(
    authService.validateCredentials('', 'password')
  ).rejects.toThrow('Email is required');
});

it('handles network timeout', async () => {
  jest.spyOn(global, 'fetch').mockImplementation(
    () => new Promise((resolve) => setTimeout(resolve, 10000))
  );

  await expect(
    authService.login('user@example.com', 'pass')
  ).rejects.toThrow('Request timeout');
});
```

### 6. Test Data (if needed)
**Create simple fixtures for reuse:**

```javascript
// tests/fixtures/users.ts
export const validUser = {
  email: 'test@example.com',
  password: 'Test123!',
  name: 'Test User'
};

export const invalidUsers = {
  noEmail: { password: 'Test123!' },
  noPassword: { email: 'test@example.com' }
};
```

### 7. Run Tests
**Execute and verify:**

```bash
# Run tests
npm test

# Or specific test file
npm test -- auth.test.ts
```

**Verify:**
- [ ] All acceptance criteria tested
- [ ] Happy path covered
- [ ] Key error scenarios tested
- [ ] Tests pass consistently

### 8. Document (optional)
**If tests reveal important decisions:**
- Brief note in `docs/feature-spec/F-##-*.md`
- Document any test-specific setup

## Test Quality Checklist

**Coverage:**
- [ ] Primary acceptance criteria tested
- [ ] Happy path covered
- [ ] 1-2 key edge cases included
- [ ] Error scenarios tested

**Structure:**
- [ ] Tests follow existing patterns
- [ ] Clear test descriptions
- [ ] Proper setup/teardown
- [ ] Tests are isolated

**Execution:**
- [ ] Tests run successfully
- [ ] No flaky tests
- [ ] Fast feedback (<30s for unit tests)

