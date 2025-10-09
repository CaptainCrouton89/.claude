# Security Audit Protocol

> **Project Context:** Review @.claude/memory/history.md to understand recent changes, new features, and modifications that may have introduced security concerns.

## Step 1: Scope Discovery

Ask 3-4 questions to understand the audit scope:

**Q1: Audit Scope**
"What should I audit? Specific feature/component, entire application, known vulnerability, compliance check (OWASP, PCI-DSS, GDPR), or code review?"

**Q2: Threat Model**
"What concerns you most? Data breaches, authentication bypass, injection attacks, access control, API security, infrastructure, or dependencies?"

**Q3: Sensitivity Level**
"What sensitive data does the system handle? Personal data, credentials, financial data, health information, or business secrets?"

**Q4: Existing Security (optional)**
"What security measures are already in place? Authentication, authorization, encryption, input validation, security headers, rate limiting, logging/monitoring?"

---

## Step 2: Parallel Execution

**Parallelize if:**
- Comprehensive audit (entire app, not single feature)
- Multiple OWASP categories
- Large codebase (>10 files or >1000 lines)

**Do NOT parallelize if:**
- Targeted vulnerability investigation
- Small codebase (<5 files)
- Following up on specific issue

### Parallel Domain Scanning Example

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Scan for injection vulnerabilities (A03)</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Scan [paths] for injection vulnerabilities:
      - SQL injection (string concatenation in queries)
      - XSS (dangerouslySetInnerHTML, unsanitized HTML)
      - Command injection (shell command construction)

      For each finding: file path, line number, vulnerable code, exploit scenario, fix with code example.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Scan for auth issues (A01, A07)</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Scan [paths] for authentication/authorization issues:
      - Endpoints without auth checks
      - Weak password requirements
      - Missing rate limiting
      - Session management issues
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Scan for sensitive data exposure (A02)</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Scan [paths] for sensitive data exposure:
      - Hardcoded secrets (API keys, passwords, tokens)
      - Excessive data in API responses
      - Unencrypted sensitive data
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Scan for misconfiguration (A05)</parameter>
    <parameter name="subagent_type">security</parameter>
    <parameter name="prompt">
      Scan [paths] for security misconfiguration:
      - Missing security headers (CSP, HSTS, X-Frame-Options)
      - CORS misconfiguration
      - Verbose error messages
    </parameter>
  </invoke>
  <invoke name="Bash">
    <parameter name="command">npm audit --json</parameter>
    <parameter name="description">Check dependency vulnerabilities (A06)</parameter>
  </invoke>
</function_calls>
```

After completion: Consolidate findings, map to OWASP categories, prioritize by severity.

---

## Step 3: Security Analysis Template

Generate report with:
- **Executive Summary**: Overall posture (CRITICAL/POOR/FAIR/GOOD/EXCELLENT), vulnerability counts, immediate actions
- **Vulnerabilities by Severity**: CRITICAL (CVSS 9.0+), HIGH (7.0-8.9), MEDIUM (4.0-6.9), LOW (<4.0)
- **OWASP Top 10 Assessment**: Score each category (PASS/PARTIAL/FAIL)
- **Remediation Plan**: Immediate (24h), short-term (1 week), medium-term (1 month)

### Vulnerability Format

For each finding include:
- **Severity + Category**: CVSS score, OWASP category
- **Location**: File path and line number
- **Vulnerable code**: Code snippet
- **Exploit scenario**: Concrete attack example
- **Impact**: What attacker can achieve
- **Fix**: Secure code replacement
- **References**: OWASP/CWE links

### Example Critical Vulnerability

```
### SQL Injection in User Login

**Severity:** CRITICAL (CVSS 9.8)
**Location:** `src/auth/login.js:45`

**Vulnerable:**
const query = `SELECT * FROM users WHERE email = '${email}'`;

**Exploit:**
email = "admin' OR '1'='1"
→ Authentication bypass, full database access

**Fix:**
const query = 'SELECT * FROM users WHERE email = ?';
const user = await db.query(query, [email]);
```

---

## Step 4: Parallel Remediation (if implementing fixes)

**Parallelize if:**
- 3+ vulnerabilities in different files
- Fixes are independent (no shared dependencies)

Delegate fixes to agents with specific file paths, vulnerable code, and fix requirements. After completion: verify with tests, run npm audit, confirm no new issues.

---

## Completion Checklist

- [ ] Full scope reviewed
- [ ] All OWASP Top 10 categories assessed
- [ ] Vulnerabilities categorized by severity with CVSS scores
- [ ] Specific fixes provided with code examples
- [ ] Remediation plan created
- [ ] Critical issues fixed (if implementing)
- [ ] Security testing performed
