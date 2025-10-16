---
name: Documenting Code
description: Maintain project documentation synchronized with code. Keep feature specs, API contracts, and README current with init-project standards. Use when updating docs after code changes, adding new features, or ensuring documentation completeness.
---

# Documenting Code

## Standards Reference

All documentation follows init-project conventions:
- **IDs:** F-## (features), US-### (user stories) - unique and traceable across docs
- **Files:** `docs/feature-specs/F-##-slug.yaml`, `docs/user-stories/US-###-slug.yaml`
- **Front-matter:** Required `title`, `status`, `last_updated` fields
- **Traceability:** Every F-## links to PRD, every US-### links to F-##

Reference `/file-templates/init-project/CLAUDE.md` for full conventions.

## Documentation Inventory

**Required docs** (from init-project template):
- `docs/product-requirements.yaml` - Project goals, scope, features, success metrics
- `docs/feature-specs/F-##-*.yaml` - One per F-## feature
- `docs/user-stories/US-###-*.yaml` - One per user story
- `docs/user-flows/*.yaml` - Primary user flows
- `docs/api-contracts.yaml` - API endpoints
- `docs/system-design.yaml` - Architecture
- `docs/data-plan.yaml` - Metrics and data storage
- `docs/design-spec.yaml` - UI/UX specifications

## Workflow

### 1. Check Current State

**Before making changes, understand what exists:**
- Read `docs/product-requirements.yaml` for feature list and current status
- Check `docs/feature-specs/` for existing feature documentation
- Review `docs/api-contracts.yaml` for API coverage
- Scan for broken links, outdated examples, or missing documentation

### 2. Update Documentation

**For feature changes:**
- Update corresponding `docs/feature-specs/F-##-*.yaml` with new requirements
- Add/update API endpoints in `docs/api-contracts.yaml`
- Update `docs/product-requirements.yaml` if scope changed
- Add JSDoc comments in code for complex logic

**For new features:**
- Create `docs/feature-specs/F-##-slug.yaml` following init-project template
- Add F-## entry to PRD feature table
- Create API endpoint entries in `docs/api-contracts.yaml` if applicable
- Create user stories in `docs/user-stories/US-###-slug.yaml` if needed

### 3. Verify Standards Compliance

**Checklist before finalizing:**
- [ ] All F-## IDs in PRD have corresponding feature specs
- [ ] All US-### stories link to valid F-## features
- [ ] API contracts match feature spec endpoints
- [ ] Code examples work and are current
- [ ] Links between docs are valid
- [ ] Front-matter includes required fields (`title`, `status`, `last_updated`)
- [ ] IDs are properly linked across documents

### 4. Update README

**Keep main README current:**
- Update feature list to match PRD F-## features
- Refresh installation/setup instructions if changed
- Update API reference links
- Add new usage examples as needed
- Verify all links work

## Project Management Commands

**Update specific documentation:**
```bash
/manage-project/update/update-feature      # Update feature specs
/manage-project/add/add-api                # Add API endpoints
/manage-project/update/update-design       # Update system design
/manage-project/update/update-requirements # Update success metrics
```

**Validation commands:**
```bash
/manage-project/validate/check-consistency # Verify all IDs linked correctly
/manage-project/validate/check-coverage    # Verify no orphaned docs
/manage-project/validate/check-api-alignment # Verify API alignment
```

**Bash utilities** (from `docs/` directory):
```bash
./check-project.sh    # Full validation
./list-features.sh    # Show all features
./list-stories.sh     # Show all stories
./list-apis.sh        # Show all API endpoints
```

## Quick Fixes

- **Broken links:** Update with correct paths and verify
- **Outdated examples:** Test code samples and update
- **Missing feature docs:** Create `F-##-slug.yaml` following template
- **API changes:** Update `api-contracts.yaml` and corresponding feature specs
- **Status updates:** Mark features as completed after implementation

## When to Escalate

- Missing required docs from init-project template
- Broken traceability (orphaned IDs)
- Documentation conflicts with implementation
- User complaints about outdated docs
