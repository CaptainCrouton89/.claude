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
./run.sh list-stories                      # Filter by feature/status
./run.sh list-flows                        # Filter by persona
./run.sh list-features --format stats      # Stats, tree view
./run.sh list-apis --format curl           # Generate curl commands
./run.sh check-project -v                  # Validate all docs
./run.sh generate-docs                     # Export to markdown
```

All scripts support `--help`, multiple formats (summary/detailed/json/tree), and filters.

## ID Conventions

- Features: `F-01`, `F-02` (zero-padded)
- Stories: `US-101`, `US-102` (three digits)
- Files: kebab-case (e.g., `user-authentication.yaml`)

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

