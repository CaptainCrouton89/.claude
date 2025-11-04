---
description: Update API contracts and reconcile affected feature specifications
---

# Update API Endpoint

Modify existing API endpoint in contracts and update feature specs.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

## ⚡ Delegation

**Default approach:** Delegate contract and spec updates to `@agent-documentor` (or `@agent-programmer` for heavy schema refactors) so you can coordinate approvals. Provide:
- Target file: `api-contracts.yaml` and related feature-spec files
- Change details: requested changes, downstream impacts, and validations that must remain aligned
- Context: feature specs via `./list-features.sh`, system design for alignment validation

Continue managing stakeholder input or dependencies while they work. Monitor via hook updates and only `await` if their edits block further actions.

**Inline exception:** Manual edits are acceptable only for explicit, narrow adjustments requested by the user. Otherwise adhere to the async delegation default.

### 1. Show All APIs
```bash
./list-apis.sh
```

### 2. Select Endpoint
Enter as: METHOD /path (e.g., POST /api/share).

### 3. Show Current State
Display current API definition.

### 4. Ask What to Update
- Summary/description
- Request parameters
- Response schemas
- Authentication
- Status codes
- Tags/feature references

### 5. Check Feature Impact
```bash
./list-features.sh | grep -i share
```

### 6. Present Changes & Confirm
Show proposed OpenAPI updates.

### 7. Apply Updates
Update `api-contracts.yaml` maintaining OpenAPI schema.

### 8. Update Feature Specs
Update related feature specs if API contract changed.

### 9. Validation
```bash
./list-apis.sh | grep "/api/share"
./check-project.sh
```

### 10. Next Steps

Present options to user:

```markdown
✓ API endpoint updated: [METHOD] [path]
✓ Feature specifications synchronized

**Next Steps:**

**Option 1: Validate Changes**
- Check API alignment: `/manage-project/validate/check-api-alignment`
- Update another API: `/manage-project/update/update-api`

**Option 2: Re-implement Based on Changes**
- If contract changed: `/manage-project/implement/00-orchestrate API-[METHOD]-[path]`
  - Updates backend endpoint implementation
  - Updates frontend integration code
  - Ensures contract compliance
  - Tests new request/response schemas

Which path would you like to take?
```

## Edge Cases

### Endpoint not found
Available endpoints shown in step 1.

### Breaking changes
Warn if removing required fields or changing types.

### Schema complexity
Use $ref to components/schemas for large schemas.

### Multiple features affected
Update all impacted feature specs.

## Output
Updated api-contracts.yaml and feature specs with new API details.
