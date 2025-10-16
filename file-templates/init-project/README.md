# Init Project Templates

YAML-based project documentation workflow with CLI management tools.

## Quick Start

**Copy template to new project:**
```bash
# Copy CLAUDE.template.md to your project's docs directory
cp file-templates/init-project/CLAUDE.template.md <project>/docs/CLAUDE.md

# Copy templates you need
cp file-templates/init-project/product-requirements.yaml <project>/docs/
cp file-templates/init-project/system-design.yaml <project>/docs/
# ... etc

# Copy management scripts
cp file-templates/init-project/*.sh <project>/docs/
cp -r file-templates/init-project/user-stories <project>/docs/
cp -r file-templates/init-project/user-flows <project>/docs/
cp -r file-templates/init-project/feature-specs <project>/docs/
```

## Available Templates

### Core Documents (Single File)
- `product-requirements.yaml` - Project goals, features, scope
- `system-design.yaml` - Architecture, tech stack, components
- `design-spec.yaml` - UI/UX specifications
- `api-contracts.yaml` - OpenAPI 3.0 API definitions
- `data-plan.yaml` - Data sources, events, metrics

### Multi-File Documents (Directories)
- `user-flows/user-flow-title.yaml` - User journey templates
- `user-stories/story-title.yaml` - User story templates
- `feature-specs/feature-title.yaml` - Feature specification templates

## Management Scripts

### List/View Scripts
- `list-apis.sh` - Query API endpoints (curl, markdown, postman output)
- `user-stories/list-stories.sh` - View/filter user stories
- `user-flows/list-flows.sh` - View/filter user flows
- `feature-specs/list-features.sh` - View/filter feature specs

### Utility Scripts
- `check-project.sh` - Comprehensive documentation validation
- `generate-docs.sh` - Generate human-readable markdown docs

### Manage-Project Templates
- `manage-project/plans/implement-requirements.md` - Requirements capture scaffold populated during `/manage-project/implement/investigate`
- `manage-project/plans/implement-plan.md` - Execution plan scaffold populated during `/manage-project/implement/plan`

All scripts support:
- `--help` for detailed usage
- Multiple output formats (summary, detailed, json, etc.)
- Filtering and sorting options
- Color-coded output

## File Structure

```
<project>/
└── docs/
    ├── CLAUDE.md                    # Project-specific guide (copy from CLAUDE.template.md)
    ├── product-requirements.yaml
    ├── system-design.yaml
    ├── design-spec.yaml
    ├── api-contracts.yaml
    ├── data-plan.yaml
    ├── user-flows/
    │   ├── <flow-name>.yaml
    │   └── list-flows.sh
    ├── user-stories/
    │   ├── <story-slug>.yaml
    │   └── list-stories.sh
    ├── feature-specs/
    │   ├── <feature-slug>.yaml
    │   └── list-features.sh
    ├── list-apis.sh
    ├── check-project.sh
    └── generate-docs.sh
```

## Workflow

1. **PRD** - Define project goals and features
2. **User Flows** - Map user journeys
3. **User Stories** - Break down requirements
4. **Feature Specs** - Technical specifications
5. **System Design** - Architecture details
6. **API Contracts** - Endpoint definitions
7. **Data Plan** - Analytics and storage
8. **Design Spec** - UI/UX details
9. **Validation** - Run `check-project.sh`

## ID Conventions

- Features: `F-01`, `F-02`, ..., `F-n`
- Stories: `US-101`, `US-102`, ..., `US-n`
- Files: kebab-case slugs (e.g., `user-authentication.yaml`)

## Examples

**View incomplete stories:**
```bash
./docs/user-stories/list-stories.sh
```

**Check all documentation:**
```bash
./docs/check-project.sh -v
```

**Generate API documentation:**
```bash
./docs/list-apis.sh --format markdown > API.md
```

**Get feature statistics:**
```bash
./docs/feature-specs/list-features.sh --format stats
```

**Generate curl commands:**
```bash
./docs/list-apis.sh --format curl --base-url https://api.example.com
```

## Documentation

- `CLAUDE.md` - Detailed conventions and best practices (for template developers)
- `CLAUDE.template.md` - Project guide to copy to new projects
- Each script has `--help` with full options

## Notes

- All templates use pure YAML (no markdown hybrid)
- Scripts parse YAML directly (no external dependencies)
- Color-coded output for better readability
- Supports both `.yaml` and `.yml` extensions
- Validates cross-references between documents

---

*Part of the .claude project initialization workflow*
