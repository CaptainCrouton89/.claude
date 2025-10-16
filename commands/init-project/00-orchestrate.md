# Initialize Project Docs — Orchestrated Workflow

Your job is to guide the user through creating a minimal-but-complete project documentation set in the correct order, using the templates in @/file-templates/init-project/. Save outputs to the target project's `/docs` directory, mirroring the same folder structure.

---

## ⚡ Delegation Decision

**This workflow generates 8+ structured documents** — a substantial multi-phase task.

**Recommended approach:**
- **DELEGATE** to a `documentor` agent for the complete workflow (steps 1-9)
- **HANDLE DIRECTLY** only if user explicitly requests inline execution OR for quick single-document updates

**When delegating, provide:**
- Project root path and collected inputs (personas, features, timeline)
- Reference to this orchestration file and all templates in `@/file-templates/init-project/`
- Instruction to follow gates, idempotency rules, and traceability conventions
- Clear expectation to seek user approval at each gate before persisting

**Quick reference:** See `@CLAUDE.md` for full delegation heuristics.

---

## Inputs to collect first (and confirm):
- Project root path (e.g., `/path/to/new-project`). Create `docs/`, plus subfolders: `feature-spec/`, `user-stories/`, `user-flows/`.
- MVP scope and timeline pressure (for scoping choices)
- Key personas and top 3 features (if unknown, derive in steps below)

If any item is unknown, make reasonable assumptions, state them explicitly, and ask the user to confirm or correct. Keep going iteratively.

---

## Sequence (and gates)
1. PRD → @/file-templates/init-project/product-requirements.md
2. User Flows → @/file-templates/init-project/user-flows/user-flow-title.md
3. User Stories → @/file-templates/init-project/user-stories/story-title.md
4. Feature Specs → @/file-templates/init-project/feature-spec/feature-title.md
5. System Design → @/file-templates/init-project/system-design.md
6. API Contracts → @/file-templates/init-project/api-contracts.yaml
7. Data Plan → @/file-templates/init-project/data-plan.md
8. Design Spec → @/file-templates/init-project/design-spec.md
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
  - `docs/product-requirements.md`
  - `docs/system-design.md`
  - `docs/design-spec.md`
  - `docs/api-contracts.yaml`
  - `docs/data-plan.md`
  - `docs/user-flows/<slug>.md`
  - `docs/user-stories/US-<###>-<slug>.md`
  - `docs/feature-spec/F-<##>-<slug>.md`
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
