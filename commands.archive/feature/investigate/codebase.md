---
description: Investigate existing codebase patterns relevant to feature implementation
argument-hint: [feature ID]
---

# Investigate Codebase Patterns

**Feature:** $ARGUMENTS

## Deliverable

`docs/investigations/{feature-id}-pdocs-codebase-analysis.yaml`

## Steps

1. **Read template first**: `pdocs template investigation-topic`

2. **Read feature spec** to understand what we're building:
   - `docs/feature-specs/{feature-id}.yaml`

3. **Investigate codebase**:
   - Find similar existing implementations
   - Identify integration points (APIs, data models, utilities)
   - Document patterns (error handling, validation, naming conventions)
   - Note architectural decisions and constraints
   - Identify gotchas and edge cases from existing code

4. **Write investigation document** to `docs/investigations/{feature-id}-pdocs-codebase-analysis.yaml`

## Guidelines

- Focus on patterns directly relevant to the feature
- Document file paths and line numbers for key examples
- Keep concise—omit obvious patterns
- Highlight deviations from standard patterns
- Note missing infrastructure that needs to be built
