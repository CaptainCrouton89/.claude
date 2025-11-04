---
description: Add API endpoint to contracts and update related feature specifications
---

# Add API Endpoint

Add API endpoint to contracts and optionally update feature specs.

Template: `pdocs template api-contracts`

## Process

## ⚡ Delegation

**Default approach:** Spawn `@agent-documentor` (or a backend specialist if schemas are complex) to update `api-contracts.yaml` asynchronously. Provide:
- Target file: `docs/api-contracts.yaml`
- Template reference: "Run `pdocs template api-contracts` to view the structure"
- Endpoint details: collected from the user plus related feature/spec context
- Context: existing API contracts via `./list-apis.sh` for schema alignment

Keep interviewing the user or coordinating downstream updates while the agent works. Monitor via hook updates; use `./agent-responses/await {agent_id}` only when the contract changes block further routing.

**Inline exception:** Make direct edits yourself only for explicit single-field tweaks. Otherwise defer to the async path.

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

Present options to user:

```markdown
✓ API endpoint added to contracts: [METHOD] [path]
✓ Feature specification updated (if applicable)

**Next Steps:**

**Option 1: Add More APIs**
- Add another API: `/manage-project/add/add-api`
- Check API alignment: `/manage-project/validate/check-api-alignment`

**Option 2: Implement This API**
- Start implementation: `/manage-project/implement/00-orchestrate API-[METHOD]-[path]`
  - Runs investigation → planning → execution → validation
  - Implements backend + frontend integration for this endpoint

**Option 3: Implement Related Feature**
- If this API belongs to feature F-##: `/manage-project/implement/00-orchestrate F-##`
  - Implements entire feature including all APIs

Which path would you like to take?
```

## Edge Cases

### Path/method exists
Error - don't overwrite existing endpoints.

### Complex schemas
Use $ref to components/schemas for reusability.

### Missing security schemes
Add bearerAuth if API requires authentication.

## Output
Updated api-contracts.yaml and optionally feature specs.
