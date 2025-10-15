# Documentation Maintenance

Keep project documentation synchronized with code and compliant with init-project standards.

## Standards Compliance
Reference `/file-templates/init-project/CLAUDE.md` for all conventions:
- **IDs:** F-## (features), US-### (stories) - must be unique and traceable
- **Files:** `docs/feature-specs/F-##-slug.yaml`, `docs/user-stories/US-###-slug.yaml`
- **Front-matter:** Required `title`, `status`, `last_updated` fields
- **Traceability:** Every F-## must link to PRD, every US-### must link to F-##

## Documentation Inventory
**Required docs (from init-project template):**
- `docs/product-requirements.yaml` - Project goals, scope, features (F-##), success metrics
- `docs/feature-specs/F-##-*.yaml` - One per F-## feature
- `docs/user-stories/US-###-*.yaml` - One per user story
- `docs/user-flows/*.yaml` - Primary user flows
- `docs/api-contracts.yaml` - API endpoints
- `docs/system-design.yaml` - Architecture
- `docs/data-plan.yaml` - Metrics and data storage
- `docs/design-spec.yaml` - UI/UX specifications

## Maintenance Tasks

### After Code Changes
- Run `/manage-project/update/update-feature` to update feature specs for requirement changes
- Run `/manage-project/add/add-api` to add new API endpoints to `api-contracts.yaml`
- Run `/manage-project/update/update-design` to update system design for architecture changes
- Add JSDoc comments for new complex functions

### After Feature Completion
- Run `/manage-project/update/update-feature` to mark feature spec `status: completed`
- Update README with new feature
- Add usage examples to feature docs
- Run `/manage-project/update/update-requirements` to update success metrics if achieved

## Compliance Checklist

**Run validation commands:**
- `/manage-project/validate/check-consistency` to verify:
  - All F-## in PRD have feature specs
  - All US-### stories have valid feature_id
  - All IDs are properly linked across documents
  - All front-matter includes required fields
  
- `/manage-project/validate/check-coverage` to verify:
  - All features have specs and stories
  - No orphaned or missing documentation
  
- `/manage-project/validate/check-api-alignment` to verify:
  - All API endpoints documented in api-contracts.yaml
  - APIs in feature specs match API contracts

## Quick Commands

**Bash utilities for querying project state:**
```bash
cd <project_root>/docs
./check-project.sh          # Full validation
./list-features.sh          # Show all features
./list-stories.sh           # Show all stories
./list-apis.sh              # Show all API endpoints
```

## When to Escalate
- Missing required docs from template
- Broken traceability (orphaned IDs)
- Documentation conflicts with implementation
- User complaints about outdated docs


