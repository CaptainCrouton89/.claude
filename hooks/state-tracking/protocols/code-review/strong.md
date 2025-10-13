# Code Review Protocol

## Step 1: Determine Strategy

Choose approach based on scope:

**Single-Agent:** <5 files, single concern, simple fixes
**Parallel Multi-Agent:** >5 files, multiple concerns, architectural changes, critical deployments

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
