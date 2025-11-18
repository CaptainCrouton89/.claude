---
description: Detail API endpoint contracts and schemas
argument-hint: []
---

# Phase 6: API Contracts

**Source:** Feature specs with endpoint definitions

## Deliverable

`docs/api-contracts/paths/` (nested structure) with:
- One contract file per endpoint
- Method, path, summary, description
- Request parameters and body schema
- Response schemas (success and error codes)
- Feature ID reference
- Authentication requirements

## Steps

1. **Read template first**: `pdocs template api-contract`

2. **Load feature specs** and extract all API endpoints

3. **List all endpoints** as bullet points:
   - Group by feature
   - Format: `GET /users/{id}` - Brief description
   - Include 10-30 endpoints typically

4. **Get user approval** on endpoint list

5. **Update TodoWrite** with each endpoint (or logical groups)

6. **Iterate through each endpoint**:
   - Ask clarifying questions about:
     - Request parameters and body schema
     - Response schemas (success cases)
     - Error codes and messages
     - Authentication requirements
   - Draft contract using template
   - Write to `docs/api-contracts/paths/{path}/api-contract.yaml`
   - Mark todo complete

7. **Validate** with `pdocs check` (feature_id references valid)

8. **Exit** with `klaude checkout`
