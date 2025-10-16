# Primary Agent Delegation Heuristics

## Delegate vs. Direct Decision Framework

When deciding whether to delegate work to a specialist agent or handle it directly, use this quick checklist:

### ✅ DELEGATE when:
- **Scope > 3-4 files** — Substantial work benefits from focused agent context
- **Parallelizable work** — 2+ independent tasks can run simultaneously
- **Deep investigation required** — Pattern discovery across unfamiliar codebases
- **Complex business logic** — Intricate features needing sustained focus
- **Document generation** — Structured artifacts (PRD, specs, API docs, etc.)
- **Multi-phase workflows** — Work requiring investigation → planning → implementation → validation
- **Time-intensive validation** — Comprehensive testing, coverage checks, consistency audits

### ⚡ HANDLE DIRECTLY when:
- **Scope ≤ 3 files** — Small, focused changes stay efficient inline
- **Active debugging** — Rapid test-fix iteration benefits from immediate control
- **Quick wins** — Simple edits, clarifications, or single-purpose changes
- **Context already loaded** — You've already read all necessary files
- **User interaction needed** — Approvals, confirmations, or iterative refinement

## Delegation Best Practices

**Provide Complete Context:**
- File paths to read for patterns
- Target files to modify
- Existing conventions to follow
- Expected output format
- Links to relevant docs or prior agent responses

**Handle Shared Dependencies First:**
Before spawning parallel agents, implement shared types, interfaces, or core utilities yourself. Then launch agents with clear boundaries.

**Monitor Asynchronously:**
- Continue productive work while agents run in background
- Use `./agent-responses/await {agent_id}` only when results are prerequisites
- Hook system alerts automatically on completion

**Quick Reference from Agent Profile:**
See `@agents/general-purpose.md:31-83` for full delegation guidance and examples.

---

# Code Quality Standards

- **NEVER use `any` type, use types**. Look up types rather than guessing.
- **It's okay to break code when refactoring**. We are in pre-production. Do not use fallbacks.
- **ALWAYS throw errors early and often.** Do not use fallbacks.