---
name: Auditing Security
description: Identify and remediate vulnerabilities through systematic code analysis. Use when performing security assessments, pre-deployment reviews, compliance validation (OWASP, PCI-DSS, GDPR), investigating known vulnerabilities, or post-incident analysis.
---

# Auditing Security

## Overview

Comprehensive security analysis to identify vulnerabilities, assess risk, and provide remediation guidance aligned with industry standards (OWASP Top 10, CVSS scoring).

**Inputs:**
- Codebase to audit
- `docs/system-design.md` - Architecture context
- `docs/api-contracts.yaml` - API specifications
- `docs/feature-spec/F-##-*.md` - Feature implementations

**Outputs:**
- Security findings organized by severity (CRITICAL, HIGH, MEDIUM, LOW)
- CVSS scores and OWASP Top 10 mapping
- Exploit scenarios and remediation code
- Risk-prioritized remediation plan

## Quick Start

Ask for security audit with context:
- **What to audit?** Feature, component, or full application
- **Concerns?** Injection, auth bypass, data leaks, access control, API security
- **Sensitive data?** PII, credentials, financial data, health info, business secrets
- **Existing security?** JWT/sessions, RBAC/ABAC, TLS, input validation, headers, rate limiting

## Scope Discovery

**Q1: Audit Scope**
- Specific feature or component
- Entire application (full security audit)
- Known vulnerability investigation
- Compliance check (OWASP Top 10, PCI-DSS, GDPR)
- Code review for security issues
- Infrastructure and configuration

**Q2: Threat Model**
- Data breaches and leaks
- Authentication bypass
- Injection attacks (SQL, XSS, command)
- Access control failures
- API security
- Infrastructure vulnerabilities
- Dependency vulnerabilities

**Q3: Sensitivity Level**
- Personal identifiable information (PII)
- Authentication credentials
- Financial data (payment info, transactions)
- Health information (HIPAA)
- Business secrets or proprietary data
- User-generated content

**Q4: Existing Security** (optional)
- Authentication method (JWT, sessions, OAuth)
- Authorization model (RBAC, ABAC)
- Encryption (TLS, at-rest encryption)
- Input validation and sanitization
- Security headers (CSP, HSTS, etc.)
- Rate limiting and throttling
- Logging and monitoring

## Security Review Strategy

### Sequential Review (Targeted audits)
**When to use:** Small codebase, single vulnerability investigation, specific attack vector, <5 files

Review vulnerabilities one area at a time using direct tools:

**Injection Vulnerabilities:**
- SQL injection: String concatenation in queries (`db.query("SELECT * FROM users WHERE id = '" + id + "'")`)
- XSS: `dangerouslySetInnerHTML`, unsanitized HTML (`.innerHTML = userInput`)
- Command injection: Shell command construction (`exec('rm ' + filename)`)
- NoSQL injection, LDAP injection
- Search for: `db.query(`, `eval(`, `exec(`, `.innerHTML`

**Authentication/Authorization:**
- Endpoints without auth checks
- Weak password requirements
- Missing rate limiting on auth endpoints
- Session management issues
- Broken access control, privilege escalation
- Search for: route handlers, auth middleware, permission checks

**Sensitive Data Exposure:**
- Hardcoded secrets: API keys, passwords, tokens
- Excessive data in API responses
- Logging sensitive information
- Unencrypted transmission
- Insecure storage
- Search for: `apiKey`, `password`, `secret`, `token` assignments

**Security Misconfiguration:**
- Missing security headers (CSP, HSTS, X-Frame-Options)
- CORS misconfiguration
- Verbose error messages exposing internals
- Default credentials
- Debug mode in production
- Search for: server config, error handlers, CORS setup

**Dependency Vulnerabilities:**
- Run `npm audit` or equivalent
- Check for outdated packages with CVEs
- Unnecessary dependencies, supply chain risks

### Parallel Scanning (Comprehensive audits)
**When to use:** Entire application, multiple OWASP categories, >1000 lines, multiple attack surfaces

**Agent 1: Injection (OWASP A03)**
SQL, XSS, command, NoSQL, LDAP injection vulnerabilities

**Agent 2: Authentication/Authorization (OWASP A01, A07)**
Missing auth, weak passwords, broken sessions, access control failures, privilege escalation

**Agent 3: Data Exposure (OWASP A02)**
Hardcoded secrets, excessive API responses, logging sensitive data, unencrypted transmission, insecure storage

**Agent 4: Configuration (OWASP A05)**
Missing security headers, CORS misconfiguration, verbose errors, default credentials, unnecessary services

**Agent 5: Dependencies (OWASP A06)**
Vulnerable packages, outdated versions, supply chain risks

## Finding Documentation Format

**For each vulnerability:**

```markdown
### [SEVERITY] Issue Name
**CVSS Score:** X.X | **Category:** OWASP A##:YEAR | **Location:** `src/path/file.js:123`

**Vulnerable Code:**
[Code snippet]

**Exploit Scenario:**
[Concrete example of how to abuse this]

**Impact:**
[What attacker can achieve: data access, auth bypass, system compromise, etc.]

**Fix:**
[Secure replacement code]

**References:**
- OWASP: [link]
- CWE-##: [link]
```

**Severity Mapping:**
- 🔴 CRITICAL (CVSS 9.0-10.0): Fix immediately, authentication bypass, full database access, RCE
- 🔴 HIGH (CVSS 7.0-8.9): Fix within days, data exfiltration, significant privilege escalation
- 🟡 MEDIUM (CVSS 4.0-6.9): Fix within weeks, partial data access, limited auth bypass
- 🟢 LOW (CVSS 0.1-3.9): Fix within months, information disclosure, minor config issues

## Security Audit Report

Generate comprehensive report with:

```markdown
# Security Audit Report: [System Name]

## Executive Summary
**Overall Security Posture:** [CRITICAL / POOR / FAIR / GOOD / EXCELLENT]

**Vulnerability Summary:**
- CRITICAL: [X] (CVSS 9.0-10.0)
- HIGH: [Y] (CVSS 7.0-8.9)
- MEDIUM: [Z] (CVSS 4.0-6.9)
- LOW: [N] (CVSS 0.1-3.9)

**Immediate Actions Required:**
1. [Most critical issue]
2. [Second priority]

## OWASP Top 10 Assessment
| Category | Status | Findings | Priority |
|----------|--------|----------|----------|
| A01: Broken Access Control | ✅/⚠️/❌ | [count] | - |
| A02: Cryptographic Failures | ✅/⚠️/❌ | [count] | - |
| A03: Injection | ✅/⚠️/❌ | [count] | - |
| [Continue for all 10] | | | |

## Findings by Severity
[CRITICAL vulnerabilities]
[HIGH vulnerabilities]
[MEDIUM vulnerabilities]
[LOW vulnerabilities]

## Remediation Plan
### Immediate (24 hours)
[Critical and high-severity fixes]

### Short-term (1 week)
[Medium-severity fixes]

### Medium-term (1 month)
[Low-severity fixes, hardening]

## Verification Checklist
- [ ] Re-run security scans on fixed code
- [ ] Verify each vulnerability is closed
- [ ] Run `npm audit` on dependencies
- [ ] Test fixes don't break functionality
- [ ] Add security regression tests
```

## Security Check Reference

**Injection:**
- SQL queries use parameterization (prepared statements, ORM)
- HTML output is sanitized (DOMPurify, escaped)
- No dynamic command execution (`exec`, `spawn` with user input)
- No `eval()` or similar code execution

**Authentication:**
- Password requirements adequate (12+ chars, complexity)
- All sensitive endpoints have auth checks
- Session management secure (httpOnly, secure cookies)
- Rate limiting on auth endpoints (5 attempts/min max)
- Credentials hashed with bcrypt/argon2, not plaintext

**Data Exposure:**
- No hardcoded secrets (use environment variables)
- API responses don't leak unnecessary data
- Sensitive data not in logs
- HTTPS/TLS enforced everywhere
- Sensitive data encrypted at rest (AES-256)

**Configuration:**
- Security headers present (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- CORS properly configured (not `*`, validate origins)
- Error messages don't expose internals
- No default credentials
- Debug mode disabled in production

**Dependencies:**
- No known vulnerabilities (run `npm audit`)
- Packages up to date
- No unnecessary dependencies

## Remediation Workflow

1. **Fix each vulnerability** following documented code examples
2. **Verify immediately** - re-run security scans, test functionality
3. **Document resolution** - mark findings as fixed with verification method
4. **Run dependency audit** - `npm audit`, update packages
5. **Test regression** - ensure fixes don't break features
6. **Update docs** - document security measures implemented

## Examples

**Example 1: SQL Injection Finding**
```markdown
### [CRITICAL] SQL Injection in User Login
**CVSS Score:** 9.8 | **Category:** OWASP A03:2021 | **Location:** `src/auth/login.js:45`

**Vulnerable Code:**
const query = `SELECT * FROM users WHERE email = '${email}'`;
const user = await db.query(query);

**Exploit Scenario:**
Attacker sends: email = "admin' OR '1'='1"
→ Returns all users, bypasses authentication, gains admin access

**Impact:**
- Complete authentication bypass
- Full database access
- Data exfiltration and manipulation

**Fix:**
const query = 'SELECT * FROM users WHERE email = ?';
const user = await db.query(query, [email]);
```

**Example 2: Hardcoded Secrets Finding**
```markdown
### [CRITICAL] Hardcoded API Key
**CVSS Score:** 9.6 | **Category:** OWASP A02:2021 | **Location:** `src/config.js:12`

**Vulnerable Code:**
const apiKey = "sk-1234567890abcdef";

**Impact:**
- Unauthorized API access
- Billing liability
- Data access under victim's account

**Fix:**
const apiKey = process.env.API_KEY;
// Store in .env: API_KEY=sk-1234567890abcdef
```
