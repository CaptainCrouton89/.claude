# Init Project Templates

YAML-based project documentation workflow with CLI management tools.

## Quick Start

**Automated Setup (Recommended):**
```bash
cd <your-project-root>
bash ~/.claude/file-templates/init-project/setup-project-docs.sh
```

This will:
1. Create `docs/` directory structure
2. Copy TypeScript source files
3. Install dependencies (@types/node, typescript)
4. Compile TypeScript to JavaScript
5. Make scripts executable

**Manual Setup (Advanced):**
```bash
# Copy CLAUDE.template.md to your project's docs directory
cp ~/.claude/file-templates/init-project/CLAUDE.template.md <project>/docs/CLAUDE.md

# Copy templates you need
cp ~/.claude/file-templates/init-project/*.yaml <project>/docs/

# Copy all TypeScript scripts and build files
cp ~/.claude/file-templates/init-project/*.ts <project>/docs/
cp ~/.claude/file-templates/init-project/{package.json,tsconfig.json,.gitignore} <project>/docs/
cp -r ~/.claude/file-templates/init-project/{user-stories,user-flows,feature-specs} <project>/docs/

# Build
cd <project>/docs && pnpm install && pnpm build
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

**TypeScript-based** - Run with `node <script>.js` after setup. All scripts support `--help`.

### List/View Scripts
- `list-apis.js` - Query API endpoints (curl, markdown output)
- `user-stories/list-stories.js` - View/filter user stories
- `user-flows/list-flows.js` - View/filter user flows
- `feature-specs/list-features.js` - View/filter feature specs

### Utility Scripts
- `check-project.js` - Comprehensive documentation validation
- `generate-docs.js` - Generate human-readable markdown docs

### Manage-Project Templates
- `manage-project/plans/implement-requirements.md` - Requirements capture scaffold populated during `/manage-project/implement/investigate`
- `manage-project/plans/implement-plan.md` - Execution plan scaffold populated during `/manage-project/implement/plan`

All scripts support:
- `--help` for detailed usage
- Multiple output formats (summary, detailed, json, etc.)
- Filtering and sorting options
- Color-coded output
- Type-safe TypeScript implementation (compiled to JavaScript)

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
    │   └── list-flows.js
    ├── user-stories/
    │   ├── <story-slug>.yaml
    │   └── list-stories.js
    ├── feature-specs/
    │   ├── <feature-slug>.yaml
    │   └── list-features.js
    ├── list-apis.js
    ├── check-project.js
    ├── generate-docs.js
    └── run.sh
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
9. **Validation** - Run `./run.sh check-project`

## ID Conventions

- Features: `F-01`, `F-02`, ..., `F-n`
- Stories: `US-101`, `US-102`, ..., `US-n`
- Files: kebab-case slugs (e.g., `user-authentication.yaml`)

## Examples

**View incomplete stories:**
```bash
cd docs && node user-stories/list-stories.js
```

**Check all documentation:**
```bash
cd docs && node check-project.js -v
```

**Generate API documentation:**
```bash
cd docs && node list-apis.js --format markdown > API.md
```

**Get feature statistics:**
```bash
cd docs && node feature-specs/list-features.js --format stats
```

**Generate curl commands:**
```bash
cd docs && node list-apis.js --format curl --base-url https://api.example.com
```

## Documentation

- `CLAUDE.md` - Detailed conventions and best practices (for template developers)
- `CLAUDE.template.md` - Project guide to copy to new projects
- Each script has `--help` with full options

## Notes

- All templates use pure YAML (no markdown hybrid)
- **TypeScript implementation** - No bash/awk, type-safe parsing
- Scripts parse YAML directly (no external YAML libraries)
- Color-coded output for better readability
- Supports both `.yaml` and `.yml` extensions
- Validates cross-references between documents
- ESM modules (Node.js 18+)

## Migration from Bash

The original bash scripts (`.sh` files) have been replaced with TypeScript (`.ts` compiled to `.js`). All functionality is preserved:

- ✅ Same command-line arguments
- ✅ Identical output formats
- ✅ Better error handling
- ✅ Type safety and IDE support
- ✅ Easier to maintain and extend

Old: `./list-features.sh --format stats`
New: `node list-features.js --format stats`

---

*Part of the .claude project initialization workflow*
