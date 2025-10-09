# Code Review Protocol

Review code changes for quality, security, performance, and maintainability.

---

## Step 1: Determine Strategy

Choose approach based on scope:

**Single-Agent:** <5 files, single concern, simple fixes
**Parallel Multi-Agent:** >5 files, multiple concerns, architectural changes, critical deployments

For parallel reviews, launch specialized agents in one call:

```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Security review</parameter>
    <parameter name="prompt">Review security in [files]. Check: auth, input validation, secrets, SQL injection, XSS/CSRF. Report CRITICAL and IMPORTANT only.</parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Performance review</parameter>
    <parameter name="prompt">Review performance in [files]. Check: algorithms, re-renders, queries, memory, bundle size.</parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Accessibility review</parameter>
    <parameter name="prompt">Review accessibility in [files]. Check: ARIA, keyboard nav, contrast, screen readers. Verify WCAG 2.1 AA.</parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Impact analysis</parameter>
    <parameter name="prompt">Use code-finder-advanced to: 1) Find import sites of changed exports, 2) Identify breaking changes, 3) Check test coverage.</parameter>
  </invoke>
</function_calls>
```

---

## Step 2: Report Findings

Structure output by priority:

### 🔴 CRITICAL (Must fix)
- **Location:** [File:line]
- **Problem:** [Description]
- **Impact:** [Risk type]
- **Fix:** [Specific change]
```diff
- // Bad
+ // Good
```

### 🟡 IMPORTANT (Should fix)
- **Location:** [File:line]
- **Problem:** [Description]
- **Fix:** [How to correct]

### 🟢 NICE-TO-HAVE (Optional)
- **Location:** [File:line]
- **Suggestion:** [Improvement]

### ✅ GOOD PRACTICES
- ✓ [Positive aspect 1]
- ✓ [Positive aspect 2]

### 📊 SUMMARY
**Quality Score:** [X/100] (Security: X/25, Correctness: X/25, Performance: X/15, Maintainability: X/15, Accessibility: X/10, Testing: X/10)
**Issues:** Critical: [N], Important: [N], Nice-to-have: [N]
**Assessment:** [READY / NEEDS WORK / MAJOR REVISION]

---

## Step 3: Offer to Fix

After review, offer:
1. **Fix critical + important** (recommended) - Security, correctness, key improvements
2. **Fix only critical** - Minimum for safety
3. **Explain in detail** - Learning walkthrough
4. **Review only** - No code changes

---

## Step 4: Implement Fixes (if approved)

Document each fix:

### ✅ FIXED: [Issue name]
**File:** [File:line]
**Change:** [What changed]
```diff
- // Before
+ // After
```
**Verification:** [How to verify]
**Tests:** [Added/updated]

### SUMMARY
**Modified:** [N] files
**Quality:** [X/100] → [Y/100] (+[Z])
**Remaining:** [Nice-to-have issues for future]

---

## Step 5: Document Learnings

If patterns found, add to project.md:

### PL-XXX: [Pattern name]
**Issue:** [Problem description]
**Solution:** [Better approach]
**Prevention:** [Rule to follow]
**Category:** Security / Performance / Accessibility

---

## Quality Scoring

**Total: /100**
- Security: /25 (vulnerabilities, best practices)
- Correctness: /25 (logic, edge cases)
- Performance: /15 (algorithms, bottlenecks)
- Maintainability: /15 (structure, readability)
- Accessibility: /10 (WCAG compliance)
- Testing: /10 (coverage, edge cases)

---
