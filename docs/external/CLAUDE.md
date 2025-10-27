# External Library Documentation

Auto-generated reference files created by the `library-docs-writer` agent during research phases.

## Purpose

Stores compressed, LLM-optimized documentation for external libraries. Agents reference these files to understand library APIs, patterns, constraints, and gotchas without re-fetching docs.

## File Naming

`{library-name}.md` — lowercase, hyphens for multi-word names (e.g., `react-query.md`, `next.js.md`).

## Content Structure

Each file contains:
- **Library name & version** (if specified)
- **Core APIs & signatures** (functions, classes, hooks)
- **Key constraints** (rate limits, auth requirements, browser support)
- **Non-obvious gotchas** (common mistakes, performance issues)
- **Code examples** (minimal, copy-paste ready)
- **Related docs link** (original source URL)

## Usage

Reference in agent prompts:
```
Read docs/external/react-query.md for API patterns before implementing data fetching.
```

Agents update these files asynchronously—no coordination needed. Files are safe to read/reference while being updated.

## Maintenance

- Auto-created by `library-docs-writer` agent
- Manual edits permitted if discoveries emerge during implementation
- Delete and re-fetch if docs become stale (>3 months old)
