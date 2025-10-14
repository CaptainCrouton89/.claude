# Create API Contracts

Your job is to collaborate with the user to draft the OpenAPI specification, then save it to `docs/api-contracts.yaml` using the template at @/file-templates/init-project/api-contracts.yaml.

---

## Pre-flight: re-initialize context
1. Read @/file-templates/init-project/api-contracts.yaml to understand the structure.
2. Read @/file-templates/init-project/CLAUDE.md for cross-document conventions.
3. Read `<project_root>/docs/feature-spec/*.md` to extract all API endpoints (POST/GET/PUT/DELETE), request/response schemas, and error codes.
4. Read `<project_root>/docs/system-design.md` to understand the tech stack and API Gateway design.
5. Check if `<project_root>/docs/api-contracts.yaml` already exists. If so, read it and ask whether to improve/replace/skip.

---

## Process
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

3. Make reasonable assumptions about request/response payloads; call them out and ask for confirmation.

4. Present a summary of endpoints and schemas; ask for sign-off.

5. On sign-off, write the file.

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

