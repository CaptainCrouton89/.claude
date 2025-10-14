# Code Review Protocol (Basic)

Streamlined code evaluation for quality, security, and correctness with sequential review approach.

## Artifacts

**Inputs:**
- `docs/feature-spec/F-##-*.md` - Technical design and requirements
- `docs/user-stories/US-###-*.md` - Acceptance criteria
- `docs/api-contracts.yaml` - Expected API signatures
- `docs/data-plan.md` - Event tracking requirements
- `docs/design-spec.md` - UI/UX requirements

**Outputs:**
- Code review report with findings and recommendations

## When to Use
- Evaluating PR or code changes before merge
- Assessing code quality and best practices
- Identifying security vulnerabilities or bugs
- Ensuring implementation matches specifications

## Core Steps

### 1. Context Gathering
**Read relevant project documentation:**
- `docs/feature-spec/F-##-*.md` for technical design and requirements
- `docs/user-stories/US-###-*.md` for acceptance criteria
- `docs/api-contracts.yaml` for expected API signatures
- `docs/data-plan.md` for event tracking requirements (if applicable)
- `docs/design-spec.md` for UI/UX requirements (if applicable)

**Determine review scope:**
- Files changed
- Features affected (F-## IDs)
- Stories implemented (US-### IDs)
- API or database changes

### 2. Focus Areas
**Identify 1-2 most impacted areas:**
- Core functionality changes
- Security-sensitive modifications
- API contract changes
- Critical user flows

**Review sequentially through these areas**

### 3. Quality Assessment
**Evaluate across key dimensions:**

**Security:**
- Input validation and sanitization
- Authentication/authorization checks
- Sensitive data handling
- Injection vulnerabilities (SQL, XSS, etc.)

**Correctness:**
- Logic matches acceptance criteria
- Edge cases handled
- Error handling complete
- Null/undefined checks

**Spec Alignment:**
- APIs match `docs/api-contracts.yaml`
- Data events match `docs/data-plan.md` (if applicable)
- UI matches `docs/design-spec.md` (if applicable)
- Implementation follows feature spec

**Performance:**
- Algorithm efficiency
- Database query optimization
- Resource usage concerns

**Maintainability:**
- Code clarity and readability
- Consistent with codebase patterns
- Appropriate abstraction

### 4. Report Findings
**Structure by priority:**

#### 🔴 CRITICAL (Must fix before merge)
- Security vulnerabilities
- Broken functionality
- Spec violations (API contract breaks)
- Data corruption risks

**Format:**
```
Location: file.ts:123
Problem: [Description]
Impact: [Risk/consequence]
Fix: [Specific change needed]
```

#### 🟡 IMPORTANT (Should fix)
- Logic bugs in edge cases
- Missing error handling
- Performance issues
- Missing analytics events
- Accessibility violations

### 5. Summary & Recommendation
**Assessment:** [APPROVE / NEEDS REVISION / MAJOR REWORK]

**Issues:** Critical: [N], Important: [N]

**Spec compliance:**
- [ ] APIs match `docs/api-contracts.yaml`
- [ ] Events match `docs/data-plan.md` (if applicable)
- [ ] UI matches `docs/design-spec.md` (if applicable)
- [ ] Logic satisfies story AC

### 6. Fix Implementation (if requested)
**Offer options:**
1. Fix critical issues (minimum for safety)
2. Fix critical + important issues
3. Provide detailed explanation for learning
4. Review only (no changes)

**Document each fix:**
```
✅ FIXED: [Issue name]
File: [path:line]
Change: [what changed]
```

### 7. Documentation Updates (if needed)
**Check if docs need updates:**
- Feature spec if implementation differs
- Design spec if UI changed
- API contracts if endpoints modified (requires approval)
- Data plan if events changed

**Flag for user approval before modifying specs**

## Review Strategy

**Sequential review approach:**
- Focus on most impacted areas first
- Review critical paths and security concerns
- Verify against specifications
- Check for common pitfalls

**When to be thorough:**
- Security-sensitive code
- API contract changes
- Critical user flows
- Database schema changes

