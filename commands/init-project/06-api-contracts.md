---
description: Collaborate with user to draft OpenAPI specification and API contracts
---

# Create API Contracts

Your job is to collaborate with the user to draft the OpenAPI specification, then save it to `docs/api-contracts.yaml` using the template at @/file-templates/init-project/api-contracts.yaml.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/api-contracts.yaml to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/feature-spec/*.yaml` to extract all API endpoints (POST/GET/PUT/DELETE), request/response schemas, and error codes.
4. Read `<project_root>/docs/system-design.yaml` to understand the tech stack and API Gateway design.
5. Check if `<project_root>/docs/api-contracts.yaml` already exists. If so, read it and ask whether to improve/replace/skip.

---

## Process

## ⚡ Delegation

**Default approach:** Delegate OpenAPI authoring to `@agent-documentor` to keep orchestration moving. Provide:
- Output path (`<project_root>/docs/api-contracts.yaml`) and template `@/file-templates/init-project/api-contracts.yaml`
- Consolidated endpoint details from feature specs, system design context, and any assumptions
- Instructions to reference Feature IDs, reuse component schemas, write the file immediately, and make edits if adjustments are requested

Continue coordinating remaining steps or collecting clarifications while the agent works. Monitor via hook updates; only `await` when their output is a hard prerequisite for your next action.

**Inline exception:** Apply manual edits only for explicit single-field tweaks; otherwise rely on async delegation.

1. Define OpenAPI 3.0 spec covering:
   - **info:** title, version (align with PRD version)
   - **paths:** all endpoints from feature specs with:
     - HTTP method (GET/POST/PUT/DELETE)
     - Summary and description
     - Parameters (path, query, body)
     - Request schema (application/json)
     - Response schemas (200, 400, 401, 404, 500)
     - Error definitions
   - **components/schemas:** reusable data models (User, Product, etc.)

2. Ensure consistency:
   - Endpoint naming conventions (e.g., `/api/v1/users`, `/api/v1/products/{id}`)
   - Error response format (uniform structure)
   - Authentication/authorization patterns

3. Make reasonable assumptions about request/response payloads; call them out clearly in the document.

4. Write the file immediately.

5. If the user requests adjustments, edit the file accordingly.

---

## Output format
- Valid OpenAPI 3.0 YAML.
- Follow RESTful conventions.

---

## Save location
- `<project_root>/docs/api-contracts.yaml`

---

## Traceability
- All endpoints must trace back to feature specs (F-##).
- Schemas must align with data structures in feature specs.
- Update feature specs if API design reveals missing details or inconsistencies.

---

## Next Step

After API contracts are saved and approved, **immediately run:**
```
/commands/init-project/07-data-plan.md
```

No user confirmation needed—the workflow continues automatically.
