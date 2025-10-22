# Project Documentation Guide

YAML-based specs in `docs/`. Six management scripts validate and query documentation.

## Structure

```
docs/
├── product-requirements.yaml  ├── system-design.yaml  ├── design-spec.yaml
├── api-contracts.yaml         ├── data-plan.yaml
├── user-flows/*.yaml          ├── user-stories/*.yaml  ├── feature-specs/*.yaml
├── list-apis.js (TypeScript)  ├── check-project.js     ├── generate-docs.js
├── run.sh (convenience wrapper) └── */list-*.js (in subdirs, TypeScript)
```

## Management Scripts

```bash
cd docs

# List stories with common filters
./run.sh list-stories                      # All stories
./run.sh list-stories --feature F-01       # Stories for specific feature
./run.sh list-stories --status complete    # Filter by status (incomplete/in-progress/complete)
./run.sh list-stories --format detailed    # Show full details

# List user flows
./run.sh list-flows                        # All flows
./run.sh list-flows --persona "Admin"      # Flows for specific persona
./run.sh list-flows --format json          # JSON output

# List features
./run.sh list-features                     # Summary view
./run.sh list-features --format stats      # Statistics overview
./run.sh list-features --format tree       # Hierarchical tree view
./run.sh list-features --status complete   # Filter by status

# List API endpoints
./run.sh list-apis                         # All endpoints
./run.sh list-apis --format curl           # Generate curl commands
./run.sh list-apis --method POST           # Filter by HTTP method
./run.sh list-apis --path /api/users       # Filter by path pattern

# Validate project
./run.sh check-project                     # Basic validation
./run.sh check-project -v                  # Verbose output
./run.sh check-project --fix               # Auto-fix common issues

# Generate documentation
./run.sh generate-docs                     # Export all to markdown
./run.sh generate-docs --output ./export   # Custom output directory
```

All scripts support `--help`, multiple formats (summary/detailed/json/tree), and filters.

## ID Conventions

- Features: `F-01`, `F-02`
- Stories: `US-101`, `US-102`
- Files: kebab-case

**Linking:** Stories/specs must set `feature_id: F-##` matching PRD. APIs note feature IDs in descriptions.

## Workflow Order

PRD → User Flows → User Stories → Feature Specs → System Design → API Contracts → Data Plan → Design Spec → Traceability Pass

Check existing files first (`./run.sh list-*`) before creating. Re-read upstream docs at each step.

## YAML Requirements

- Required top-level: `title`, `template` path
- Stories: `story_id`, `feature_id`, `status`
- Features: `feature_id`, `status`
- Status values: `incomplete` | `in-progress` | `complete`
- 2-space indent, quote special chars, no blank fields (use `""`)

## Traceability

- User Flows → PRD features
- User Stories → `feature_id`, flows
- Feature Specs → story IDs, PRD
- API Contracts → feature IDs
- Data Plan → PRD metrics

Run `cd docs && ./run.sh check-project` regularly. Fix errors before next step.

## Pitfalls

1. Orphaned IDs (every PRD F-## needs spec file)
2. Empty fields (investigate, don't leave blank)
3. Inconsistent naming across files
4. Missing metric tracking events
5. Vague ACs (use Given/When/Then)
6. API endpoint mismatches

---

*All templates in `file-templates/init-project/`. Scripts have `--help`.*

