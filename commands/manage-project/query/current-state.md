---
description: Query and explore project documentation state using available utilities
argument-hint: [query description]
---

# Query Current State

Use bash utilities to explore and understand project documentation state.

@~/.claude/file-templates/init-project/CLAUDE.md

## Available Utilities

Commands in project's `docs/` directory:
- `./list-apis.sh` - Query API endpoints
- `./list-features.sh` - List features
- `./list-stories.sh` - Query user stories
- `./check-project.sh` - Validate docs
- `./generate-docs.sh` - Create readable docs

## Common Queries

### Project Overview
```bash
./check-project.sh --format summary
```

### Features
```bash
./list-features.sh  # All features
./list-features.sh --format ids  # Just IDs
```

### User Stories
```bash
./list-stories.sh  # All stories
./list-stories.sh -s incomplete  # Incomplete only
./list-stories.sh -f F-01  # Stories for feature F-01
./list-stories.sh --format ids  # Just IDs
```

### APIs
```bash
./list-apis.sh  # All endpoints
./list-apis.sh -m GET  # GET endpoints only
./list-apis.sh -p auth  # Endpoints containing "auth"
```

### Validation
```bash
./check-project.sh  # Full validation
./check-project.sh -v  # Verbose output
./check-project.sh --no-links  # Skip cross-references
```

## Interactive Query Session

Run queries based on user questions:
- "How many features do we have?" → `./list-features.sh | wc -l`
- "Which stories are incomplete?" → `./list-stories.sh -s incomplete`
- "Do we have APIs for feature F-02?" → `./list-apis.sh | grep F-02`
- "What's the validation status?" → `./check-project.sh`

## Missing Utilities

If scripts not found in `docs/`:
- Copy from `@~/.claude/file-templates/init-project/` to project
- Make executable: `chmod +x docs/*.sh`

## Output
Query results, summaries, and recommendations for next actions.
