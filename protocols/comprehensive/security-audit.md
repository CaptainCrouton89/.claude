# Security Audit Protocol

Systematic security analysis to identify vulnerabilities, assess risks, and provide remediation guidance aligned with industry standards.

## Artifacts

**Inputs:**
- Codebase to audit
- `docs/system-design.md` - Architecture context
- `docs/api-contracts.yaml` - API specifications
- `docs/feature-spec/F-##-*.md` - Feature implementations

**Outputs:**
- Security audit report with findings and recommendations
- Specialized scan results (injection, auth, data exposure, etc.)

**Handoffs:**
- Fix agents read audit report and findings to remediate vulnerabilities
- Documentation agents update security documentation

## Naming Conventions
- Audit reports: `docs/security/audit-<date>.md` or inline
- Investigation artifacts: `agent-responses/agent_<id>.md`

## When to Use
- Proactive security assessment
- Pre-deployment security review
- Compliance validation (OWASP, PCI-DSS, GDPR)
- Vulnerability investigation
- Post-incident security review

## Core Steps

### 1. Scope Discovery
**Clarify audit scope and priorities (3-4 questions):**

**Q1: Audit Scope**
"What should I audit?"
- Specific feature or component
- Entire application (full security audit)
- Known vulnerability investigation
- Compliance check (OWASP Top 10, PCI-DSS, GDPR)
- Code review for security issues
- Infrastructure and configuration

**Q2: Threat Model**
"What concerns you most?"
- Data breaches and leaks
- Authentication bypass
- Injection attacks (SQL, XSS, command)
- Access control failures
- API security
- Infrastructure vulnerabilities
- Dependency vulnerabilities

**Q3: Sensitivity Level**
"What sensitive data does the system handle?"
- Personal identifiable information (PII)
- Authentication credentials
- Financial data (payment info, transactions)
- Health information (HIPAA)
- Business secrets or proprietary data
- User-generated content

**Q4: Existing Security (optional)**
"What security measures are already in place?"
- Authentication method (JWT, sessions, OAuth)
- Authorization model (RBAC, ABAC)
- Encryption (TLS, at-rest encryption)
- Input validation and sanitization
- Security headers (CSP, HSTS, etc.)
- Rate limiting and throttling
- Logging and monitoring

### 2. Parallel Security Scanning (Use Async Agents)
**When to parallelize:**
- Comprehensive audit (entire app)
- Multiple OWASP categories to assess
- Large codebase (>10 files or >1000 lines)
- Multiple attack surfaces (frontend + backend + API)

**When to work sequentially:**
- Targeted vulnerability investigation
- Small codebase (<5 files)
- Following up on specific reported issue
- Single attack vector analysis

**Parallel scanning strategy by OWASP Top 10:**

**Agent 1: Injection Vulnerabilities (A03)**
- SQL injection (string concatenation in queries)
- XSS (dangerouslySetInnerHTML, unsanitized HTML)
- Command injection (shell command construction)
- NoSQL injection
- LDAP injection

**Agent 2: Authentication/Authorization (A01, A07)**
- Endpoints without auth checks
- Weak password requirements
- Missing rate limiting on auth endpoints
- Session management issues
- Broken access control
- Privilege escalation paths

**Agent 3: Sensitive Data Exposure (A02)**
- Hardcoded secrets (API keys, passwords, tokens)
- Excessive data in API responses
- Unencrypted sensitive data transmission
- Insecure storage
- Logging sensitive information

**Agent 4: Security Misconfiguration (A05)**
- Missing security headers (CSP, HSTS, X-Frame-Options)
- CORS misconfiguration
- Verbose error messages exposing internals
- Default credentials
- Unnecessary services enabled

**Agent 5: Dependency Vulnerabilities (A06)**
- Run `npm audit` or equivalent
- Check for outdated packages
- Known CVEs in dependencies
- Supply chain risks

**Delegate parallel scan agents** for OWASP categories. Results saved to `agent-responses/agent_<id>.md`.

Wait for results: `./agent-responses/await {agent_id}` or continue other work

### 3. Consolidate Findings
**Aggregate results from parallel scans:**
- Combine all vulnerabilities found
- Remove duplicates
- Map to OWASP Top 10 categories
- Assign CVSS severity scores
- Prioritize by risk (severity × likelihood)

### 4. Generate Security Report
**Structure comprehensive security report:**

```markdown
# Security Audit Report: [System/Feature Name]

## Executive Summary

**Overall Security Posture:** [CRITICAL / POOR / FAIR / GOOD / EXCELLENT]

**Vulnerability Summary:**
- CRITICAL: [X] (CVSS 9.0-10.0)
- HIGH: [Y] (CVSS 7.0-8.9)
- MEDIUM: [Z] (CVSS 4.0-6.9)
- LOW: [N] (CVSS 0.1-3.9)

**Immediate Actions Required:**
1. [Most critical issue requiring immediate fix]
2. [Second priority issue]

**Compliance Status:**
- OWASP Top 10: [X/10 categories PASS]
- [Other standards if applicable]

---

## Critical Vulnerabilities

### [CRITICAL] SQL Injection in User Login
**Severity:** CVSS 9.8 | **Category:** A03:2021 Injection
**Location:** `src/auth/login.js:45`

**Vulnerable Code:**
```javascript
const query = `SELECT * FROM users WHERE email = '${email}'`;
const user = await db.query(query);
```

**Exploit Scenario:**
Attacker sends: `email = "admin' OR '1'='1"`
→ Bypasses authentication, gains admin access, can extract entire database

**Impact:**
- Complete authentication bypass
- Full database access
- Data exfiltration
- Potential for data manipulation/deletion

**Fix:**
```javascript
const query = 'SELECT * FROM users WHERE email = ?';
const user = await db.query(query, [email]);
// OR use ORM: const user = await User.findOne({ where: { email } });
```

**References:**
- OWASP: https://owasp.org/www-community/attacks/SQL_Injection
- CWE-89: Improper Neutralization of Special Elements

---

## High Severity Vulnerabilities

### [HIGH] XSS in Comment Display
**Severity:** CVSS 7.4 | **Category:** A03:2021 Injection
**Location:** `components/Comment.tsx:23`

[Same structure as above]

---

## Medium Severity Vulnerabilities

[Continue for each finding...]

---

## OWASP Top 10 Assessment

| Category | Status | Findings | Priority |
|----------|--------|----------|----------|
| A01: Broken Access Control | ❌ FAIL | 3 HIGH | Immediate |
| A02: Cryptographic Failures | ⚠️ PARTIAL | 2 MEDIUM | Short-term |
| A03: Injection | ❌ FAIL | 1 CRITICAL, 2 HIGH | Immediate |
| A04: Insecure Design | ✅ PASS | 0 | - |
| A05: Security Misconfiguration | ⚠️ PARTIAL | 3 MEDIUM | Medium-term |
| A06: Vulnerable Components | ❌ FAIL | 5 HIGH | Immediate |
| A07: ID & Auth Failures | ❌ FAIL | 2 HIGH | Immediate |
| A08: Software/Data Integrity | ✅ PASS | 0 | - |
| A09: Logging Failures | ⚠️ PARTIAL | 1 LOW | Medium-term |
| A10: SSRF | ✅ PASS | 0 | - |

---

## Remediation Plan

### Immediate (Fix within 24 hours)
1. **SQL Injection in login** (src/auth/login.js:45) - CRITICAL
   - Use parameterized queries
   - Deploy to production ASAP

2. **Hardcoded API keys** (src/config.js:12) - CRITICAL
   - Move to environment variables
   - Rotate compromised keys

### Short-term (Fix within 1 week)
1. **Missing authentication on admin endpoints** - HIGH
   - Add auth middleware to /admin/* routes
   - Implement RBAC checks

2. **Dependency vulnerabilities** - HIGH
   - Update vulnerable packages
   - Run `npm audit fix`

### Medium-term (Fix within 1 month)
1. **Missing security headers** - MEDIUM
   - Implement CSP, HSTS, X-Frame-Options
   - Configure in web server/middleware

2. **Insufficient logging** - LOW
   - Add security event logging
   - Implement monitoring alerts

---

## Security Recommendations

### Authentication & Authorization
- Implement MFA for admin accounts
- Add rate limiting to auth endpoints (max 5 attempts/minute)
- Use bcrypt/argon2 for password hashing (increase cost factor)

### Data Protection
- Encrypt sensitive data at rest (AES-256)
- Enforce HTTPS everywhere (HSTS with max-age=31536000)
- Implement field-level encryption for PII

### Input Validation
- Validate and sanitize ALL user input
- Use allowlists instead of denylists
- Implement Content Security Policy

### Monitoring & Response
- Log all security-relevant events
- Set up alerts for suspicious activity
- Implement incident response plan

---

## Testing Performed
- [X] Static code analysis
- [X] Dependency vulnerability scan
- [ ] Dynamic application security testing (DAST)
- [ ] Penetration testing
- [ ] Security regression tests

---

## Next Steps
1. Fix all CRITICAL vulnerabilities immediately
2. Deploy fixes to production with verification
3. Fix HIGH severity issues within 1 week
4. Schedule follow-up audit in [timeframe]
5. Implement security testing in CI/CD
```

### 5. Vulnerability Documentation Format
**For each finding, include:**

- **Severity + Category:** CVSS score (0.0-10.0), OWASP category
- **Location:** File path and specific line numbers
- **Vulnerable Code:** Exact code snippet causing issue
- **Exploit Scenario:** Concrete example of how to abuse it
- **Impact:** What attacker can achieve (data loss, access, etc.)
- **Fix:** Secure replacement code with explanation
- **References:** OWASP, CWE, CVE links

### 6. Parallel Remediation (If Implementing Fixes)
**When to parallelize fixes:**
- 3+ vulnerabilities in different files
- Fixes are independent (no shared dependencies)
- Different types of issues (injection, config, dependencies)

**Delegate to agents:** Pass audit report and `agent-responses/agent_<id>.md` scan findings to fix agents for remediation.

### 7. Verification & Testing
**After implementing fixes:**
- [ ] Re-run security scans on fixed code
- [ ] Verify vulnerability is closed
- [ ] Run `npm audit` to check dependencies
- [ ] Test fixes don't break functionality
- [ ] Add security regression tests
- [ ] Update security documentation

## Security Audit Checklist

**Injection (A03):**
- [ ] SQL injection in database queries
- [ ] XSS in user-generated content rendering
- [ ] Command injection in shell execution
- [ ] Path traversal in file operations
- [ ] LDAP/NoSQL injection

**Authentication (A01, A07):**
- [ ] Weak password policies
- [ ] Missing authentication on sensitive endpoints
- [ ] Broken session management
- [ ] Missing rate limiting
- [ ] Credential storage security

**Data Exposure (A02):**
- [ ] Hardcoded secrets in code
- [ ] Excessive data in API responses
- [ ] Sensitive data in logs
- [ ] Unencrypted transmission
- [ ] Insecure storage

**Configuration (A05):**
- [ ] Missing security headers
- [ ] CORS misconfiguration
- [ ] Verbose error messages
- [ ] Default credentials
- [ ] Debug mode in production

**Dependencies (A06):**
- [ ] Outdated packages with CVEs
- [ ] Unnecessary dependencies
- [ ] Supply chain risks

**Access Control (A01):**
- [ ] Missing authorization checks
- [ ] Privilege escalation paths
- [ ] Insecure direct object references

## Agent Strategy

**Scanning phase:**
- 3-5 agents for parallel security scans
- Each focuses on OWASP category or attack surface
- Comprehensive coverage across codebase

**Analysis phase:**
- Consolidate findings yourself
- Assign severity and prioritize

**Remediation phase:**
- 2-4 agents for parallel fixes
- Each handles independent vulnerability type
- Coordinate on shared files


