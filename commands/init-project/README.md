# Project Initialization Commands

This directory contains a structured workflow for initializing project documentation from scratch. Each command is designed to run independently (after chat resets) and guides an AI agent through creating production-ready docs.

## Quick Start

1. **Run orchestrator:** `@/commands/init-project/00-orchestrate.md`
   - Or run individual steps in order (01-10)
2. **Agent will:**
   - Re-read templates and prior docs after each reset
   - Ask for confirmation on assumptions
   - Check for existing files (idempotent)
   - Save to `<project_root>/docs/` with proper structure

## Workflow Steps

| Step | Command | Output | Dependencies |
|------|---------|--------|--------------|
| 00 | `00-orchestrate.md` | (meta) runs all steps | — |
| 01 | `01-prd.md` | `docs/product-requirements.md` | — |
| 02 | `02-user-flows.md` | `docs/user-flows/*.md` | PRD |
| 03 | `03-user-stories.md` | `docs/user-stories/US-*.md` | PRD, flows |
| 04 | `04-feature-specs.md` | `docs/feature-spec/F-*.md` | PRD, stories |
| 05 | `05-system-design.md` | `docs/system-design.md` | PRD, specs |
| 06 | `06-api-contracts.md` | `docs/api-contracts.yaml` | specs, system design |
| 07 | `07-data-plan.md` | `docs/data-plan.md` | PRD, specs, API |
| 08 | `08-design-spec.md` | `docs/design-spec.md` | flows, stories, specs |
| 09 | `09-traceability-pass.md` | (updates all) | all docs |

## Templates

All commands reference templates in:
- `@/file-templates/init-project/`

Agents must read:
- `@/file-templates/init-project/CLAUDE.md` (cross-doc conventions)
- Specific template for the step (e.g., `product-requirements.md`, `user-stories/story-title.md`)

## Key Conventions

**IDs:**
- Features: `F-01`, `F-02`, ... (from PRD)
- Stories: `US-101`, `US-102`, ... (link to features via `feature_id`)

**Filenames:**
- `docs/product-requirements.md`, etc.
- `docs/user-flows/<slug>.md`
- `docs/user-stories/US-<###>-<slug>.md`
- `docs/feature-spec/F-<##>-<slug>.md`

**Front-matter:**
- `status: draft` → `approved` (on sign-off)
- `last_updated: YYYY-MM-DD`

**Idempotency:**
- Every command checks if files exist before writing
- Agents ask: improve/replace/skip
- Never overwrite without user approval

## Usage Notes

1. **Chat resets:** Each step re-reads templates and prior docs. No persistent context assumed.
2. **Assumptions:** Agents make reasonable assumptions, state them explicitly, and ask for confirmation.
3. **Sign-off gates:** Agents present summaries and wait for approval before persisting files.
4. **Traceability:** Step 10 validates all cross-references (Feature IDs, Story IDs, APIs, metrics).

## Example

```bash

After chat reset:

```bash
# User runs:
@/commands/init-project/01-prd.md

# Agent will:
# 1. Read @/file-templates/init-project/product-requirements.md
# 2. Read @/file-templates/init-project/CLAUDE.md
# 3. Check if docs/product-requirements.md exists
# 4. Ask for project details (name, goals, scope, users, features, etc.)
# 5. Present draft and ask for sign-off
# 6. Write docs/product-requirements.md with status: draft
```

## Troubleshooting

**Missing context after reset:**
- Each command has "Pre-flight: re-initialize context" section
- Agent reads all upstream docs explicitly

**Inconsistent IDs:**
- Run `10-traceability-pass.md` to fix cross-references

**Files already exist:**
- Agent will ask: improve/replace/skip
- Choose "improve" to iterate on existing docs

