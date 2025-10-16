---
description: Verify API contract alignment between feature specs and OpenAPI definitions
---

# Check API Alignment

Verify feature specs and API contracts match for all endpoints.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

### 1. Extract APIs from Specs
```bash
cd feature-specs
grep -A 2 "apis:" *.yaml
```

### 2. Extract APIs from Contracts
```bash
./list-apis.sh --format detailed
```

### 3. Compare & Identify Discrepancies

**Missing in contracts:**
- APIs in specs but not in api-contracts.yaml

**Missing in specs:**
- APIs in contracts but not in feature specs

**Schema mismatches:**
- Request/response differences between spec and contract

**Tag issues:**
- APIs tagged with non-existent features

### 4. Check Schema Consistency
For matching APIs, verify request/response schemas align.

### 5. Generate Alignment Matrix

```
API Alignment Matrix:
=====================================================================================
Endpoint                          | In Specs | In Contracts | Schema Match | Tags OK
=====================================================================================
POST /api/auth/login              | ✓ F-01   | ✓ F-01       | ✓           | ✓
POST /api/share                   | ✓ F-06   | ✓ F-06       | ⚠           | ✓
GET /api/reports                  | ✗        | ✓ F-03       | N/A         | ⚠
=====================================================================================
```

### 6. Explain Issues
For each discrepancy: problem, impact, fix suggestion.

### 7. Offer Fixes
Update api-contracts.yaml or feature specs to align.

### 8. Apply Fixes
Maintain OpenAPI schema compliance.

### 9. Re-validate
Run alignment check again.

### 10. Generate Report
Alignment score, fixes applied, remaining issues.

## Output
Alignment matrix, issue analysis, fix recommendations.