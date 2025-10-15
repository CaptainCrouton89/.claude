# Project Documentation Guide

YAML-based specs in `docs/`. Six management scripts validate and query documentation.

## Structure

```
docs/
├── product-requirements.yaml  ├── system-design.yaml  ├── design-spec.yaml
├── api-contracts.yaml         ├── data-plan.yaml
├── user-flows/*.yaml          ├── user-stories/*.yaml  ├── feature-specs/*.yaml
├── list-apis.sh               ├── check-project.sh     ├── generate-docs.sh
└── */list-*.sh (in subdirs)
```

## Management Scripts

```bash
./docs/user-stories/list-stories.sh        # Filter by feature/status
./docs/user-flows/list-flows.sh            # Filter by persona
./docs/feature-specs/list-features.sh      # Stats, tree view
./docs/list-apis.sh --format curl          # Generate curl/postman
./docs/check-project.sh -v                 # Validate all docs
./docs/generate-docs.sh                    # Export to markdown
```

All scripts support `--help`, multiple formats (summary/detailed/json/tree), and filters.

## ID Conventions

- Features: `F-01`, `F-02` (zero-padded)
- Stories: `US-101`, `US-102` (three digits)
- Files: kebab-case (e.g., `user-authentication.yaml`)

**Linking:** Stories/specs must set `feature_id: F-##` matching PRD. APIs note feature IDs in descriptions.

## Workflow Order

PRD → User Flows → User Stories → Feature Specs → System Design → API Contracts → Data Plan → Design Spec → Traceability Pass

Check existing files first (`list-*.sh`) before creating. Re-read upstream docs at each step.

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

Run `./docs/check-project.sh` regularly. Fix errors before next step.

## Pitfalls

1. Orphaned IDs (every PRD F-## needs spec file)
2. Empty fields (investigate, don't leave blank)
3. Inconsistent naming across files
4. Missing metric tracking events
5. Vague ACs (use Given/When/Then)
6. API endpoint mismatches

---

*All templates in `file-templates/init-project/`. Scripts have `--help`.*

