# Security Audit Protocol (Basic)

Streamlined security analysis to identify vulnerabilities and provide remediation guidance with sequential review.

## Artifacts

**Inputs:**
- Codebase to audit
- `docs/system-design.md` - Architecture context
- `docs/api-contracts.yaml` - API specifications
- `docs/feature-spec/F-##-*.md` - Feature implementations

**Outputs:**
- Security audit findings with remediation steps

## When to Use
- Proactive security assessment
- Pre-deployment security review
- Vulnerability investigation
- Post-incident security review

## Core Steps

### 1. Scope Discovery
**Clarify audit scope (2-3 questions):**

**Q1: What should I audit?**
- Specific feature or component
- Known vulnerability investigation
- OWASP Top 10 check
- Authentication/authorization review

**Q2: What concerns you most?**
- Data breaches and leaks
- Authentication bypass
- Injection attacks (SQL, XSS, command)
- Access control failures
- API security

**Q3: What sensitive data exists?** (optional)
- Personal identifiable information (PII)
- Authentication credentials
- Financial data
- Health information
- Business secrets

### 2. Sequential Security Review
**Review one area at a time using direct tools:**

**Use grep and read_file to check for:**

**Injection Vulnerabilities:**
- SQL injection: String concatenation in queries
- XSS: `dangerouslySetInnerHTML`, unsanitized HTML
- Command injection: Shell command construction
- Look for: `db.query(`, `.innerHTML`, `exec(`, `eval(`

**Authentication/Authorization:**
- Endpoints without auth checks
- Weak password requirements
- Missing rate limiting
- Session management issues
- Broken access control
- Look for: route handlers, auth middleware, permission checks

**Sensitive Data Exposure:**
- Hardcoded secrets: API keys, passwords, tokens
- Excessive data in API responses
- Logging sensitive information
- Unencrypted transmission
- Look for: `apiKey`, `password`, `secret`, `token` in code

**Security Misconfiguration:**
- Missing security headers (CSP, HSTS, X-Frame-Options)
- CORS misconfiguration
- Verbose error messages
- Default credentials
- Look for: server config, error handlers, CORS setup

**Dependency Vulnerabilities:**
- Run `npm audit` or equivalent
- Check for outdated packages
- Known CVEs in dependencies

### 3. Document Findings
**Structure by severity:**

#### 🔴 CRITICAL (Fix immediately)
```markdown
### [CRITICAL] [Issue Name]
**Category:** [Injection / Auth / Data Exposure / Misconfig]
**Location:** `src/path/file.js:123`

**Vulnerable Code:**
[Code snippet]

**Exploit:** 
[How attacker can abuse this]

**Impact:**
[What attacker can achieve]

**Fix:**
[Secure replacement code]
```

#### 🟡 IMPORTANT (Fix soon)
```markdown
### [IMPORTANT] [Issue Name]
**Category:** [Category]
**Location:** `src/path/file.js:45`

**Problem:** [Description]
**Fix:** [Solution]
```

### 4. Remediation Summary
**Immediate Actions Required:**

1. [Most critical issue with fix]
2. [Second priority issue with fix]
3. [Third priority issue with fix]

**OWASP Check Results:**
- [ ] Injection: [PASS / ISSUES FOUND]
- [ ] Auth/AuthZ: [PASS / ISSUES FOUND]
- [ ] Data Exposure: [PASS / ISSUES FOUND]
- [ ] Misconfig: [PASS / ISSUES FOUND]
- [ ] Dependencies: [PASS / ISSUES FOUND]

### 5. Fix Implementation (if requested)
**For each vulnerability:**

```markdown
✅ FIXED: [Issue name]
File: [path:line]
Change: [what changed]
Verification: [how to test]
```

### 6. Verification
**After implementing fixes:**
- [ ] Re-check fixed code
- [ ] Verify vulnerability is closed
- [ ] Run dependency audit
- [ ] Test fixes don't break functionality

## Security Check Quick Reference

**Injection Checks:**
- [ ] SQL queries use parameterization
- [ ] HTML output is sanitized
- [ ] No dynamic command execution
- [ ] No eval() or similar

**Authentication:**
- [ ] Password requirements adequate
- [ ] All sensitive endpoints have auth
- [ ] Session management secure
- [ ] Rate limiting on auth endpoints

**Data Exposure:**
- [ ] No hardcoded secrets
- [ ] API responses don't leak data
- [ ] No sensitive data in logs
- [ ] HTTPS enforced

**Configuration:**
- [ ] Security headers present
- [ ] CORS properly configured
- [ ] Error messages not verbose
- [ ] No default credentials

**Dependencies:**
- [ ] No known vulnerabilities
- [ ] Packages up to date
- [ ] No unnecessary dependencies

## Search Patterns

**Finding vulnerabilities with grep:**

```bash
# SQL Injection
grep -r "db.query.*\${" --include="*.js"
grep -r "SELECT.*\+" --include="*.js"

# XSS
grep -r "dangerouslySetInnerHTML" --include="*.jsx"
grep -r "\.innerHTML" --include="*.js"

# Secrets
grep -r "apiKey.*=" --include="*.js"
grep -r "password.*=" --include="*.js"

# Auth
grep -r "app\.get\|app\.post" --include="*.js"
# Then check if auth middleware present
```

