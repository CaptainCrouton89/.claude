# Add API Endpoint

Add API endpoint to contracts and optionally update feature specs.

@~/.claude/file-templates/init-project/CLAUDE.md
@~/.claude/file-templates/init-project/api-contracts.yaml

## Process

### 1. Show Existing APIs
```bash
./list-apis.sh
```

### 2. Show Features
```bash
./list-features.sh
```

### 3. Gather Endpoint Details
Ask for:
- Method (GET/POST/PUT/DELETE/PATCH)
- Path (e.g., /api/share)
- Summary
- Feature ID this supports
- Request/response schemas
- Authentication

### 4. Present Draft & Confirm
Show OpenAPI entry preview.

### 5. Update API Contracts
Add to `api-contracts.yaml` under correct path.

### 6. Check Feature Spec Impact
If feature spec mentions this API, update with details.

### 7. Validation
```bash
./list-apis.sh | grep "/api/share"
./check-project.sh
```

### 8. Next Steps
- Add another API: run this command again
- Check alignment: run /manage-project/validate/check-api-alignment

## Edge Cases

### Path/method exists
Error - don't overwrite existing endpoints.

### Complex schemas
Use $ref to components/schemas for reusability.

### Missing security schemes
Add bearerAuth if API requires authentication.

## Output
Updated api-contracts.yaml and optionally feature specs.