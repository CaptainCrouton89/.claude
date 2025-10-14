# Documentation Maintenance

Keep project documentation synchronized with code and compliant with init-project standards.

## Standards Compliance
Reference `/file-templates/init-project/CLAUDE.md` for all conventions:
- **IDs:** F-## (features), US-### (stories) - must be unique and traceable
- **Files:** `docs/feature-spec/F-##-slug.md`, `docs/user-stories/US-###-slug.md`
- **Front-matter:** Required `title`, `status`, `last_updated` fields
- **Traceability:** Every F-## must link to PRD, every US-### must link to F-##

## Documentation Inventory
**Required docs (from init-project template):**
- `docs/charter.md` - Project goals and scope
- `docs/product-requirements.md` - Features (F-##), stories, success metrics
- `docs/feature-spec/F-##-*.md` - One per F-## feature
- `docs/user-stories/US-###-*.md` - One per user story
- `docs/user-flows/*.md` - Primary user flows
- `docs/api-contracts.yaml` - API endpoints
- `docs/system-design.md` - Architecture
- `docs/data-plan.md` - Metrics and data storage
- `docs/design-spec.md` - UI/UX specifications

## Maintenance Tasks

### After Code Changes
- [ ] Update feature specs for requirement changes
- [ ] Add new API endpoints to `api-contracts.yaml`
- [ ] Update system design for architecture changes
- [ ] Add JSDoc comments for new complex functions

### After Feature Completion
- [ ] Mark feature spec `status: completed`
- [ ] Update README with new feature
- [ ] Add usage examples to feature docs
- [ ] Update success metrics if achieved

## Compliance Checklist
- [ ] All F-## in PRD have feature specs
- [ ] All US-### stories have valid feature_id
- [ ] All API endpoints documented in api-contracts.yaml
- [ ] All success metrics have tracking events in data-plan
- [ ] All front-matter includes required fields
- [ ] All docs use consistent terminology

## Quick Commands
```bash
# Check for missing feature specs
grep "F-.." docs/product-requirements.md | while read -r line; do
  id=$(echo "$line" | grep -o "F-[0-9][0-9]")
  if [ ! -f "docs/feature-spec/$id-*.md" ]; then
    echo "Missing spec for $id"
  fi
done

# Find docs needing updates (older than 30 days)
find docs/ -name "*.md" -mtime +30 -exec echo "Old: {}" \;
```

## When to Escalate
- Missing required docs from template
- Broken traceability (orphaned IDs)
- Documentation conflicts with implementation
- User complaints about outdated docs


