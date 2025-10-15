# Documentation Protocol

Keep project documentation current and consistent with init-project standards.

## Standards Reference
All documentation must follow `/file-templates/init-project/CLAUDE.md` conventions:
- ID systems (F-## features, US-### stories)
- File naming (`docs/feature-spec/F-##-slug.md`)
- Front-matter (`title`, `status`, `last_updated`)
- Cross-document traceability

## When to Use
- Updating existing docs after code changes
- Adding new docs for new features
- Reviewing doc completeness vs. implementation
- Fixing broken links or outdated information

## Core Steps

### 1. Check Current State
**Identify what needs updating:**
- Read `docs/product-requirements.md` for feature list
- Check `docs/feature-spec/` for existing feature docs
- Review `docs/api-contracts.yaml` for API coverage
- Scan for broken links or outdated examples

### 2. Update Documentation
**For feature changes:**
- Update `docs/feature-spec/F-##-*.md` with new requirements
- Add/update API endpoints in `docs/api-contracts.yaml`
- Update `docs/product-requirements.md` if scope changed
- Add code comments for complex logic

**For new features:**
- Create `docs/feature-spec/F-##-slug.md` following template
- Add F-## entry to PRD feature table
- Update API contracts if new endpoints
- Create user stories in `docs/user-stories/` if needed

### 3. Verify Standards Compliance
**Cross-check requirements:**
- [ ] All F-## IDs in PRD have corresponding feature specs
- [ ] All US-### stories link to valid F-## features
- [ ] API contracts match feature spec endpoints
- [ ] Code examples work and are current
- [ ] Links between docs are valid

### 4. Update README
**Keep main README current:**
- Update feature list to match PRD F-## features
- Refresh installation/setup if changed
- Update API reference links
- Add new usage examples as needed

## Quick Fixes
- **Broken links:** Update with correct paths
- **Outdated examples:** Test and fix code samples
- **Missing feature docs:** Create `F-##-slug.md` following template
- **API changes:** Update `api-contracts.yaml` and feature specs

