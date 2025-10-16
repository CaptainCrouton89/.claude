# Project Initialization Commands

This directory contains a structured workflow for initializing or completing project documentation. The workflow **automatically detects greenfield (new) vs brownfield (existing) scenarios** and routes appropriately—no user intervention needed.

## Quick Start

**Just run:** `@/commands/init-project/00-orchestrate.md`

The agent will:
1. Automatically assess whether docs exist and their state
2. Route to greenfield (full generation) or brownfield (migration/updates) path
3. Daisy-chain through all necessary steps without asking for routing decisions
4. Write documents directly and make edits if adjustments are requested

**You don't need to know if your project is greenfield or brownfield.** The workflow handles it.

## Workflow Paths (Automatic)

**Path A: Greenfield** (no docs exist)
```
00-orchestrate → 00a-assess → 01-prd → 02-user-flows → 03-user-stories 
→ 04-feature-specs → 05-system-design → 06-api-contracts → 07-data-plan 
→ 08-design-spec → 09-traceability-pass → Complete
```

**Path B: Brownfield-Compliant** (docs exist, follow conventions)
```
00-orchestrate → 00a-assess → 00b-selective-update → [targeted updates 
via manage-project workflows] → 09-traceability-pass → Complete
```

**Path C: Brownfield-Legacy** (docs exist, non-standard format)
```
00-orchestrate → 00a-assess → 00c-normalize-legacy → 00b-selective-update 
→ 09-traceability-pass → Complete
```

## Command Reference

| Command | Purpose | When Used |
|---------|---------|-----------|
| `00-orchestrate.md` | Entry point - starts assessment | Always run this first |
| `00a-assess-existing.md` | Detects greenfield/brownfield, validates structure | Auto-run by orchestrator |
| `00b-selective-update.md` | Identifies gaps in compliant docs, routes updates | Brownfield-compliant path |
| `00c-normalize-legacy.md` | Migrates non-standard docs to template format | Brownfield-legacy path |
| `01-prd.md` | Creates `docs/product-requirements.yaml` | Greenfield or missing PRD |
| `02-user-flows.md` | Creates `docs/user-flows/*.yaml` | Greenfield or missing flows |
| `03-user-stories.md` | Creates `docs/user-stories/US-*.yaml` | Greenfield or missing stories |
| `04-feature-specs.md` | Creates `docs/feature-spec/F-*.yaml` | Greenfield or missing specs |
| `05-system-design.md` | Creates `docs/system-design.yaml` | Greenfield or missing design |
| `06-api-contracts.md` | Creates `docs/api-contracts.yaml` | Greenfield or missing APIs |
| `07-data-plan.md` | Creates `docs/data-plan.yaml` | Greenfield or missing data plan |
| `08-design-spec.md` | Creates `docs/design-spec.yaml` | Greenfield or missing design spec |
| `09-traceability-pass.md` | Validates cross-references, fixes inconsistencies | Final step in all paths |

## Templates

All commands reference templates in:
- `@/file-templates/init-project/`

Agents must read:
- `@/file-templates/init-project/CLAUDE.md` (cross-doc conventions)
- Specific template for the step (e.g., `product-requirements.yaml`, `user-stories/story-title.yaml`)

## Key Conventions

**IDs:**
- Features: `F-01`, `F-02`, ... (from PRD)
- Stories: `US-101`, `US-102`, ... (link to features via `feature_id`)

**Filenames:**
- `docs/product-requirements.yaml`, etc.
- `docs/user-flows/<slug>.yaml`
- `docs/user-stories/US-<###>-<slug>.yaml`
- `docs/feature-spec/F-<##>-<slug>.yaml`

**Front-matter:**
- `status: draft` → `approved` (on sign-off)
- `last_updated: YYYY-MM-DD`

**Idempotency:**
- Every command checks if files exist before writing
- Existing content is read and incorporated into improved versions
- Files are written directly; adjustments are made through edits if requested

## How It Works

**Assessment (00a):**
- Checks for `docs/` directory and existing files
- Classifies as greenfield, brownfield-compliant, or brownfield-legacy
- Automatically routes to appropriate workflow path

**Daisy-Chaining:**
- Each command ends with "Next Step" instruction
- Agent writes documents and runs the next command automatically
- No manual workflow navigation required

**Idempotency:**
- All commands check for existing files before writing
- Brownfield paths preserve existing docs and migrate/update rather than overwrite
- Legacy docs are backed up to `docs/.legacy-backup/` before normalization

## Usage Notes

1. **Always start with orchestrator:** Just run `00-orchestrate.md` - it handles everything
2. **Manual step execution:** You can run individual steps (e.g., `01-prd.md`) if you need to regenerate a specific doc
3. **Write-first approach:** Agent writes documents directly, then makes edits if adjustments are requested
4. **Chat resets:** Each step re-reads templates and prior docs - no persistent context assumed
5. **Delegation:** Orchestrator recommends delegating to `documentor` agent for heavy multi-doc workflows

## Example Flow

**Greenfield project:**
```
User: @/commands/init-project/00-orchestrate.md

Agent: [runs 00a-assess-existing.md]
       Status: GREENFIELD
       Recommendation: /commands/init-project/01-prd.md
       
       [automatically runs 01-prd.md]
       [gathers requirements, writes PRD immediately]
       
       Next: /commands/init-project/02-user-flows.md
       [automatically runs 02-user-flows.md]
       [writes user flows immediately]
       ...continues through 09...
       
       ✅ Init-project workflow complete.
```

**Brownfield project with legacy markdown docs:**
```
User: @/commands/init-project/00-orchestrate.md

Agent: [runs 00a-assess-existing.md]
       Status: BROWNFIELD-LEGACY
       Found: README.md, old-requirements.md, api-spec.json
       Issues: Non-YAML format, missing IDs, no conventions
       Recommendation: /commands/init-project/00c-normalize-legacy.md
       
       [automatically runs 00c-normalize-legacy.md]
       [backs up originals, migrates to YAML, assigns IDs, writes immediately]
       
       Next: /commands/init-project/00b-selective-update.md
       [identifies remaining gaps, runs targeted updates]
       
       Next: /commands/init-project/09-traceability-pass.md
       [validates cross-references, updates files immediately]
       
       ✅ Init-project workflow complete.
```

## Troubleshooting

**Want to skip assessment and force a specific path?**
- Run the specific command directly (e.g., `01-prd.md` for greenfield, `00c-normalize-legacy.md` for migration)

**Migration mapping unclear?**
- Check `docs/migration-mapping.yaml` generated by normalization step
- Review backups in `docs/.legacy-backup/YYYYMMDD-HHMMSS/`

**Inconsistent IDs after manual edits?**
- Run `09-traceability-pass.md` standalone to fix cross-references

