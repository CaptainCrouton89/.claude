# Initialize Project Docs — Orchestrated Workflow

Your job is to create or complete a minimal-but-complete project documentation set, automatically handling both greenfield (new) and brownfield (existing) scenarios.

**The workflow is fully automatic:** Assessment determines the path, then commands daisy-chain. Users don't need to know which scenario applies.

---

## ⚡ Delegation Decision

**This workflow generates 8+ structured documents** — a substantial multi-phase task.

**Recommended approach:**
- **DELEGATE** to a `documentor` agent for the complete workflow (assessment through completion)
- **HANDLE DIRECTLY** only if user explicitly requests inline execution OR for quick single-document updates

**When delegating, provide:**
- Project root path and collected inputs (personas, features, timeline)
- Reference to this orchestration file and all templates in `@/file-templates/init-project/`
- Instruction to follow gates, idempotency rules, and traceability conventions
- Clear expectation to seek user approval at each gate before persisting (except for automatic routing)

**Quick reference:** See `@CLAUDE.md` for full delegation heuristics.

---

## Entry Point: Automatic Assessment

**Immediately run:** `/commands/init-project/00a-assess-existing.md`

This command:
1. Detects greenfield vs brownfield scenarios
2. Validates existing documentation if present
3. Automatically routes to the appropriate workflow path
4. Executes the next command without user intervention

**Do not collect inputs manually.** The assessment and subsequent commands will gather what's needed.

---

## Workflow Paths (handled automatically)

**Path A: Greenfield** (no existing docs)
- Assessment → 01-prd → 02-user-flows → 03-user-stories → 04-feature-specs → 05-system-design → 06-api-contracts → 07-data-plan → 08-design-spec → 09-traceability-pass

**Path B: Brownfield-Compliant** (existing docs following conventions)
- Assessment → 00b-selective-update → targeted updates via manage-project workflows → 09-traceability-pass

**Path C: Brownfield-Legacy** (existing docs, non-standard format)
- Assessment → 00c-normalize-legacy → 00b-selective-update → 09-traceability-pass

---

## Manual Override (rare)

If user explicitly specifies a starting point:
- "Start from PRD" → `/commands/init-project/01-prd.md`
- "Update API contracts" → `/commands/init-project/06-api-contracts.md`
- "Just validate" → `/commands/init-project/09-traceability-pass.md`

Otherwise, **always start with assessment**.

---

## Sequence (and gates)
1. PRD → @/file-templates/init-project/product-requirements.yaml
2. User Flows → @/file-templates/init-project/user-flows/user-flow-title.yaml
3. User Stories → @/file-templates/init-project/user-stories/story-title.yaml
4. Feature Specs → @/file-templates/init-project/feature-spec/feature-title.yaml
5. System Design → @/file-templates/init-project/system-design.yaml
6. API Contracts → @/file-templates/init-project/api-contracts.yaml
7. Data Plan → @/file-templates/init-project/data-plan.yaml
8. Design Spec → @/file-templates/init-project/design-spec.yaml
9. Traceability/Consistency pass (no template link; update all above as needed)

At each gate, present a concise diff or bullet list of decisions and ask for explicit sign-off before persisting.

---

## Idempotency rules
- Before generating, check if the target file(s) already exist under `<project_root>/docs`. If they do, ask whether to revise/improve or skip.
- For multi-file steps (flows, stories, feature specs): check per-item existence by naming conventions; offer to update, append, rename, or leave unchanged.
- Never overwrite without confirmation. Always show what will be written.

---

## Saving rules
- Mirror templates' structure in `<project_root>/docs`.
- Use these default names:
  - `docs/product-requirements.yaml`
  - `docs/system-design.yaml`
  - `docs/design-spec.yaml`
  - `docs/api-contracts.yaml`
  - `docs/data-plan.yaml`
  - `docs/user-flows/<slug>.yaml`
  - `docs/user-stories/US-<###>-<slug>.yaml`
  - `docs/feature-spec/F-<##>-<slug>.yaml`
- Maintain front-matter fields (`status`, `last_updated`, IDs) per templates.

---

## Cross-document conventions
- Feature IDs: `F-01..F-n` (unique). Story IDs: `US-101..` (unique). Link stories to `feature_id`.
- Keep `status: draft` until a gate is approved; then update to `approved`. Set `last_updated` to YYYY-MM-DD on save.
- Ensure PRD Feature List ↔ Feature Specs ↔ Stories ↔ API endpoints ↔ Data events remain consistent.

---

## Run the steps
- Run the step files in numeric order in this folder. After each step, summarize decisions, unresolved questions, and proposed defaults for the next step.
- If later steps uncover changes, propose upstream edits and, upon approval, apply them immediately to keep everything consistent.
