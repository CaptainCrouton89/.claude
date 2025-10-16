# Implement — Orchestrated Workflow

Complete implementation lifecycle orchestrator. Routes to phases or runs full workflow.

$ARGUMENTS

@docs/product-requirements.md
@docs/system-design.md
@docs/api-contracts.yaml

---

## ⚡ Delegation Decision

**This is a multi-phase workflow** requiring investigation → planning → execution → validation.

**Recommended approach:**
- **DELEGATE phases aggressively** — Each phase (investigate, plan, execute, validate) should spawn specialist agents
- **Handle orchestration directly** — This file coordinates phases and user approval gates
- **Simple cases only** — For single-file, isolated changes with no dependencies, you may handle execution inline

**Each phase delegates to:**
- **Investigation** → Parallel `@agent-code-finder` or `@agent-general-purpose` research agents
- **Planning** → `@agent-documentor` for task breakdown and plan synthesis
- **Execution** → `@agent-backend-developer`, `@agent-frontend-ui-developer` based on scope; orchestrator agent for complex multi-layer work
- **Validation** → `@agent-validation-orchestrator` or parallel validation agents

**Quick reference:** See `@CLAUDE.md` for full delegation heuristics.

---

## Process

### 1. Parse Identifier
Extract what to implement from arguments:
- **F-##** → Feature from `docs/feature-spec/F-##-*.yaml`
- **S-##** → Story from feature specs
- **API-{METHOD}-{path}** → API endpoint from `docs/api-contracts.yaml`
- **FLOW-##** → User flow from `docs/user-flows/`

### 2. Load Specification
Read the relevant specification:
```bash
# For features
./list-features.sh | grep "F-##"
# Show feature spec summary
```

Display spec summary to user.

### 2.5 Orchestration Delegation Checkpoint

**For substantial features (multi-layer, 3+ files, architectural impact):**

Present delegation option:
```markdown
This is a substantial implementation requiring multi-phase orchestration.

**Recommended:** Spawn a dedicated implementor orchestrator agent to coordinate investigation → planning → execution → validation phases.

The orchestrator will:
- Manage all phases and approval gates
- Coordinate parallel investigation agents
- Spawn specialized execution agents (backend-developer, frontend-ui-developer)
- Handle continuous validation
- Keep you updated with milestone reports

**Options:**
1. [RECOMMENDED] Spawn implementor orchestrator now
2. Handle orchestration directly (select phase below)

Which approach do you prefer?
```

**For simple changes (single file, isolated scope):**
Skip orchestrator spawn and proceed to phase selection.

### 3. Determine Starting Phase
Ask: "Which phase would you like to start from?"

| Option | Command | When to Use |
|--------|---------|-------------|
| **Full workflow** | Run all phases | Start from beginning, complete implementation |
| **Investigation** | `/manage-project/implement/investigate` | Need to understand codebase first |
| **Planning** | `/manage-project/implement/plan` | Investigation complete, need task breakdown |
| **Execution** | `/manage-project/implement/execute` | Plan ready, start implementation |
| **Validation** | `/manage-project/implement/validate` | Implementation complete, need validation |

### 4. Route to Phase
Execute the selected command with the specification context.

### 5. Full Workflow Automation
If user selects "Full workflow":
1. Run `/manage-project/implement/investigate`
2. Wait for user sign-off
3. Run `/manage-project/implement/plan`
4. Wait for user sign-off
5. Run `/manage-project/implement/execute`
6. Wait for completion
7. Run `/manage-project/implement/validate`
8. Present final results

## Phase Overview

### Phase 1: Investigation
**Command:** `/manage-project/implement/investigate F-##`
- Spawn parallel investigation agents
- Document patterns, integrations, constraints
- Create requirements document
- **Output:** `@docs/plans/implement-{id}-requirements.md` + investigation artifacts

### Phase 2: Planning
**Command:** `/manage-project/implement/plan F-##`
- Delegate to `@agent-documentor` for plan synthesis
- Create task breakdown with dependencies
- Define validation criteria
- **Output:** `@docs/plans/implement-{id}-plan.md`

### Phase 3: Execution
**Command:** `/manage-project/implement/execute F-##`
- Execute tasks from plan
- Spawn validation agents in parallel
- Handle validation failures
- **Output:** Implemented code + task validation reports

### Phase 4: Validation
**Command:** `/manage-project/implement/validate F-##`
- Comprehensive final validation
- Verify all requirements met
- Check for regressions
- **Output:** `agent-responses/final-validation-*.md` + acceptance report

## Special Cases

### Resume Interrupted Workflow
If work was interrupted, determine completed phases:
- Check for `docs/plans/implement-{id}-requirements.md` → Investigation done
- Check for `docs/plans/implement-{id}-plan.md` → Planning done
- Check for implementation commits → Execution in progress

Route to appropriate phase to resume.

### Simple vs Complex
**Simple (skip investigation/planning):**
- Single file change
- Clear, isolated scope
- No dependencies

Route directly to execution with inline mini-plan.

**Complex (full workflow):**
- Multi-file/multi-layer
- Integration points
- Architectural impact

Run full investigation → planning → execution → validation.

## Quick Start Examples

### Example 1: Full Workflow
```
User: /manage-project/implement F-07

→ "Starting full implementation workflow for F-07: OAuth Authentication"
→ Phase 1: Investigation (5 agents spawned)
→ [User reviews and approves requirements]
→ Phase 2: Planning (detailed task breakdown created)
→ [User reviews and approves plan]
→ Phase 3: Execution (8 tasks implemented with validation)
→ Phase 4: Final validation passes
→ "✓ F-07 fully implemented and validated"
```

### Example 2: Resume at Planning
```
User: /manage-project/implement F-07

→ Detects requirements.md exists
→ "Investigation already complete. Starting at planning phase?"
→ Runs /manage-project/implement/plan F-07
```

### Example 3: Specific Phase
```
User: /manage-project/implement/execute F-07

→ Loads plan from docs/plans/implement-F-07-plan.md
→ Executes tasks T1-T8
→ "Execution complete. Run /manage-project/implement/validate F-07 for final validation"
```

