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
| 01 | `01-charter.md` | `docs/charter.md` | — |
| 02 | `02-prd.md` | `docs/product-requirements.md` | charter |
| 03 | `03-user-flows.md` | `docs/user-flows/*.md` | charter, PRD |
| 04 | `04-user-stories.md` | `docs/user-stories/US-*.md` | PRD, flows |
| 05 | `05-feature-specs.md` | `docs/feature-spec/F-*.md` | PRD, stories |
| 06 | `06-system-design.md` | `docs/system-design.md` | charter, PRD, specs |
| 07 | `07-api-contracts.md` | `docs/api-contracts.yaml` | specs, system design |
| 08 | `08-data-plan.md` | `docs/data-plan.md` | charter, PRD, specs, API |
| 09 | `09-design-spec.md` | `docs/design-spec.md` | flows, stories, specs |
| 10 | `10-traceability-pass.md` | (updates all) | all docs |

## Templates

All commands reference templates in:
- `@/file-templates/init-project/`

Agents must read:
- `@/file-templates/init-project/CLAUDE.md` (cross-doc conventions)
- Specific template for the step (e.g., `charter.md`, `user-stories/story-title.md`)

## Key Conventions

**IDs:**
- Features: `F-01`, `F-02`, ... (from PRD)
- Stories: `US-101`, `US-102`, ... (link to features via `feature_id`)

**Filenames:**
- `docs/charter.md`, `docs/product-requirements.md`, etc.
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
# User runs:
@/commands/init-project/01-charter.md

# Agent will:
# 1. Read @/file-templates/init-project/charter.md
# 2. Read @/file-templates/init-project/CLAUDE.md
# 3. Check if docs/charter.md exists
# 4. Ask for project details (name, goals, scope, etc.)
# 5. Present draft and ask for sign-off
# 6. Write docs/charter.md with status: draft
```

After chat reset:

```bash
# User runs:
@/commands/init-project/02-prd.md

# Agent will:
# 1. Read template and CLAUDE.md
# 2. Read docs/charter.md (re-initialize context)
# 3. Check if docs/product-requirements.md exists
# 4. Draft PRD based on charter
# 5. Ask for sign-off
# 6. Write docs/product-requirements.md
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

