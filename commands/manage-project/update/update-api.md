# Update API Endpoint

Modify existing API endpoint in contracts and update feature specs.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

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
- Check alignment: run /manage-project/validate/check-api-alignment

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