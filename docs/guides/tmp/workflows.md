### Ground rules (from `docs/CLAUDE.md`)
- Always re-read upstream docs before work: `docs/product-requirements.md` → flows → stories → feature specs → system design/API/data/design.
- Maintain ID/link hygiene: PRD features `F-##`, stories `US-###` with `feature_id`, feature specs as `docs/feature-spec/F-##-<slug>.md`.
- Idempotency: list and read existing files first; propose edits; wait for approval; never overwrite silently.
- End with a traceability check: features ↔ specs ↔ stories, metrics ↔ data plan, APIs ↔ contracts, flows/screens ↔ design spec.

---

## Bug in an existing feature

- Read first
  - PRD section for the feature (`F-##`) and its `docs/feature-spec/F-##-*.md`
  - Related `docs/user-stories/US-###-*.md` and acceptance criteria
  - `docs/api-contracts.yaml` and `docs/system-design.md` if relevant
- Workflow
  1. Reproduce and scope: write a succinct defect note tied to `F-##` and story IDs; state expected vs actual.
  2. Impact assessment: confirm if PRD behavior or spec is wrong; if spec is wrong, propose spec correction; if code is wrong, plan a fix.
  3. Propose: share root cause hypothesis, fix plan, and any spec/contract adjustments required; request approval.
  4. Implement: add failing test first (story AC), fix code, keep API stable unless approved.
  5. Validate: rerun story AC, regression around the flow, update data events if they were incorrect.
  6. Traceability pass: confirm fixed behavior now matches PRD/spec; link the bug note to `F-##` and `US-###`.
- Docs to update
  - Feature spec: “Known Issues” → resolved note or “Behavior” correction.
  - User stories: refine AC if ambiguity caused the bug.
  - API contracts: only if the bug revealed a mismatch (with approval).
  - Data plan: adjust events if they previously misrepresented metrics.

---

## New feature

### 1) Requirements gathering
- Read first: `docs/product-requirements.md`
- Workflow
  1. Capture assumptions and open questions; map to goals/success metrics.
  2. Propose PRD updates: add `F-##` with clear scope, OOS, metrics; request approval.
  3. Assign `F-##` and slug; create PRD feature entry.
- Docs to update: `docs/product-requirements.md` (new `F-##`), optionally update goals/scope if needed.

### 2) Codebase understanding
- Workflow
  - Inventory relevant domains, modules, data models, and existing APIs linked to similar features.
  - Produce a short dependency note tied to `F-##` with key surfaces, risks, and reuse opportunities.
- Docs to update: reference this note in the feature spec’s Context.

### 3) Feature planning
- Read first: PRD `F-##`
- Workflow
  1. User flows: add `docs/user-flows/<slug>.md` for primary flow(s), citing `F-##`.
  2. User stories: add `docs/user-stories/US-###-<slug>.md` per slice with `feature_id: F-##`, prioritized and with concrete Given/When/Then AC.
  3. Feature spec: create `docs/feature-spec/F-##-<slug>.md` with scope, architecture, data model, rollout, and risks; cite related PRD sections and story IDs.
  4. System design/API: draft `docs/system-design.md` additions; draft endpoints in `docs/api-contracts.yaml` with `F-##` references.
  5. Data plan: define events, properties, and metrics mapping (`F-##` and PRD metrics).
  6. Design spec: describe screens, states, breakpoints, and a11y, citing flows/stories.
  7. Approval gate: share a planning summary and request sign-off before coding.
- Docs to update: flows, stories, feature spec, system design, API contracts, data plan, design spec.

### 4) Implementation
- Workflow
  1. Create branch; scaffold feature flags if rollout is incremental.
  2. Implement by story (small vertical slices), writing tests from AC first.
  3. Wire APIs to match `docs/api-contracts.yaml`; update contract only via approved change.
  4. Instrument analytics per `docs/data-plan.md`.
  5. Keep feature spec “Decisions” and “Deviations” sections current.
- Docs to update: feature spec (decisions), possibly design spec snapshots/links.

### 5) Validation/testing
- Workflow
  1. Validate each story against AC (automated + manual).
  2. Contract tests against `docs/api-contracts.yaml`.
  3. Event verification against `docs/data-plan.md` (names, props, timing).
  4. Accessibility, performance, and error states per design spec.
  5. UAT: demo against PRD success metrics.
  6. Traceability pass across all docs; get final approval.
- Docs to update: mark statuses from `draft` → `approved`/`final` once accepted.

---

## Code review

- Read first: relevant `F-##` feature spec, story AC, API contracts, data plan entries.
- Workflow
  1. Structural: confirm changes align with system design boundaries and dependency notes.
  2. Behavior: verify tests cover AC; check edge cases and rollback strategy/flags.
  3. API: ensure request/response match contracts; consistent naming/versioning.
  4. Data: confirm events and properties match data plan; PII and privacy.
  5. UX: verify states, empty/loading/error, a11y and responsiveness per design spec.
  6. Docs: require updates for any observed deviations or decisions.
  7. Approve or request changes with explicit doc/code action items (linked to `F-##`/`US-###`).

---

## Refactoring (no behavior change)

- Read first: system design and feature spec for affected areas.
- Workflow
  1. Define scope, invariants, and non-goals; list measurable checks (perf, size, complexity).
  2. Write characterization tests if coverage is lacking.
  3. Refactor in small steps; keep public contracts unchanged.
  4. Run full tests and event verification; ensure no plan/design/PRD changes needed.
  5. Update system design and feature spec “Architecture/Code Structure” if layout changed.
  6. Document migration/rollback notes if relevant.
- Docs to update: system design; feature spec “Technical Notes.” No PRD/story change unless behavior alters.

---

## Minor changes and tweaks

- Theme/spacing/visual tweaks
  - Read: `docs/design-spec.md` and the relevant flow.
  - Steps: propose a design spec update (tokens, spacing scale, components affected); implement; run visual regression/a11y; traceability (design ↔ flows).
  - Docs: design spec only; no PRD/story change unless usability changes AC.

- Small feature modification (within scope)
  - Read: `F-##` spec and affected `US-###`.
  - Steps: propose spec delta and adjusted AC; implement; validate; update data plan only if events change.
  - Docs: feature spec and user story AC.

- Copy/content changes
  - Read: design spec and story AC.
  - Steps: confirm wording doesn’t change meaning/AC; implement; quick validation.
  - Docs: design spec text; no PRD change unless meaning shifts.

- Tiny bugfix/typo
  - Steps: reproduce, fix, quick test; add a short defect note linked to `F-##`.
  - Docs: optional note in feature spec; no PRD/story change.

---

## Approvals and gates (apply to all)
- Proposal gate: show assumptions, decisions, and doc diffs; await approval before writing files.
- Implementation gate: story-by-story demos against AC.
- Final gate: traceability pass; update `status` fields and confirm “All documents consistent. Ready for implementation.”

---

Short summary
- Provided concrete workflows per scenario with exact docs to read/update.
- Emphasized approvals, IDs, and a final traceability pass, scaled from tiny tweaks to full features.

### Lightweight, generic workflow for any small change

- Confirm context
  - Re-read upstream docs that apply: `docs/product-requirements.md` → `docs/feature-spec/F-##-*.md` → `docs/design-spec.md` → `docs/api-contracts.yaml` → `docs/data-plan.md`.
- Scope the change
  - Write a 2–3 sentence change note tied to `F-##` (and `US-###` if relevant): intent, expected outcome, risk.
- Decide doc impact
  - Identify which doc(s) change. If any doc must change, draft the minimal delta and seek approval before coding.
- Implement the smallest viable change
  - Prefer a single vertical slice; feature-flag if risky. Keep API stable unless explicitly approved to change.
- Validate
  - Check against story AC or intended behavior; quick tests; a11y/visual checks if UI; contract tests if API; event checks if analytics.
- Update docs
  - Apply the pre-agreed deltas only: feature spec/design spec/API contracts/data plan as needed. Keep IDs and cross-links correct.
- Quick traceability pass
  - Confirm behavior↔spec↔stories, APIs↔contracts, metrics↔events remain consistent.
- PR and review
  - Link the change note and any updated docs; call out any intentional deviations; merge after approval.

### Quick routing by change type

- Theme/spacing/visual: update `docs/design-spec.md` (tokens/spacing), implement, visual+a11y check. No PRD/story change.
- Copy/content only: update `docs/design-spec.md` text; ensure AC meaning unchanged; implement.
- Small behavior within spec: tiny spec delta + possibly story AC; implement+test; data plan only if events change.
- API/schema change: update `docs/feature-spec/F-##-*.md` and `docs/api-contracts.yaml`; coordinate consumers; contract tests.
- Analytics/metrics only: update `docs/data-plan.md`; instrument; verify events line up with PRD metrics.
- Refactor (no behavior): note scope/invariants in feature/system design; add/fix tests; no PRD/story changes.