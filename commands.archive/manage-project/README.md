# Manage Project Commands

Comprehensive command suite for managing project documentation and implementing features.

## Quick Start

### Starting New Work
```bash
/manage-project/start Add user authentication with OAuth2
```
The `start` command intelligently determines whether you're adding a feature, story, API, flow, or updating existing items, then routes to the appropriate command.

### Implementing Features (Full Workflow)
```bash
/manage-project/implement/00-orchestrate F-07
```
The implement workflow orchestrates all phases automatically or lets you run phases individually.

### Implementing Features (Individual Phases)
```bash
# Phase 1: Investigation
/manage-project/implement/investigate F-07

# Phase 2: Planning
/manage-project/implement/plan F-07

# Phase 3: Execution
/manage-project/implement/execute F-07

# Phase 4: Validation
/manage-project/implement/validate F-07
```

## Command Structure

```
manage-project/
├── 00-orchestrate.md      # Main router (when no subcommand specified)
├── start.md               # ✨ Intelligent entry point for any work
├── README.md              # This file
│
├── implement/             # ✨ Implementation workflow (phased)
│   ├── 00-orchestrate.md  # Implementation orchestrator
│   ├── investigate.md     # Phase 1: Requirements & Investigation
│   ├── plan.md            # Phase 2: Planning & Task Breakdown
│   ├── execute.md         # Phase 3: Implementation & Validation
│   └── validate.md        # Phase 4: Final Comprehensive Validation
│
├── add/                   # Add new items
│   ├── add-feature.md
│   ├── add-story.md
│   ├── add-api.md
│   └── add-flow.md
│
├── update/                # Update existing items
│   ├── update-feature.md
│   ├── update-story.md
│   ├── update-api.md
│   ├── update-requirements.md
│   └── update-design.md
│
├── validate/              # Validation checks
│   ├── check-consistency.md
│   ├── check-coverage.md
│   └── check-api-alignment.md
│
└── query/                 # Query project state
    └── current-state.md
```

## Recommended Workflows

### Workflow 1: Quick Feature (Recommended)
```bash
# Step 1: Start work - automatically adds to docs
/manage-project/start Add real-time notifications

# Step 2: Implement - full phased workflow
/manage-project/implement/00-orchestrate F-08
# → Phase 1: Investigation (parallel agents)
# → Phase 2: Planning (task breakdown)
# → Phase 3: Execution (parallel implementation)
# → Phase 4: Validation (comprehensive check)
```

### Workflow 2: Phased Implementation (Control Each Phase)
```bash
# Step 1: Add to docs
/manage-project/start Add user profile customization

# Step 2: Investigate
/manage-project/implement/investigate F-10
# [Review investigation findings, approve]

# Step 3: Plan
/manage-project/implement/plan F-10
# [Review plan, approve]

# Step 4: Execute
/manage-project/implement/execute F-10
# [Monitor implementation progress]

# Step 5: Validate
/manage-project/implement/validate F-10
# [Review validation, accept]
```

### Workflow 3: Manual Step-by-Step
```bash
# Step 1: Add feature
/manage-project/add/add-feature

# Step 2: Add supporting items
/manage-project/add/add-story
/manage-project/add/add-api

# Step 3: Validate
/manage-project/validate/check-consistency

# Step 4: Implement
/manage-project/implement/00-orchestrate F-08
```

## Implementation Workflow Details

The implementation workflow is broken into four distinct phases, each with its own command. You can run the full workflow automatically or control each phase individually.

### Phase 1: Investigation (`investigate.md`)
**Purpose:** Understand codebase, patterns, constraints before planning.

**What it does:**
- Loads specification (feature/story/API/flow)
- Performs initial scope analysis
- Asks clarifying questions
- Spawns 2-5 parallel investigation agents:
  - Patterns & conventions
  - Related code structures
  - Integration points & dependencies
  - UI/UX patterns (if frontend)
  - Database & API layer (if backend)
- Consolidates findings
- Creates requirements document

**Output:**
- `docs/plans/implement-{item-id}-requirements.md`
- Investigation findings (returned via klaude)

**Next:** Run `/manage-project/implement/plan {item-id}`

---

### Phase 2: Planning (`plan.md`)
**Purpose:** Transform investigation findings into actionable task breakdown.

**What it does:**
- Loads all investigation artifacts
- Determines planning strategy (inline vs delegated)
- Creates detailed implementation plan with:
  - Discrete, atomic tasks (T1, T2, T3...)
  - Task dependencies and execution order
  - Parallelization analysis (batches)
  - Integration points
  - Risk assessment
  - Validation criteria per task
- Links to investigation findings throughout
- Presents plan for review and approval

**Output:**
- `docs/plans/implement-{item-id}-plan.md`

**Next:** Run `/manage-project/implement/execute {item-id}`

---

### Phase 3: Execution (`execute.md`)
**Purpose:** Execute planned tasks with continuous validation.

**What it does:**
- Loads plan and determines execution strategy
- Executes tasks in dependency-ordered batches
- For each task:
  - Implements according to plan (directly or via agent)
  - Spawns validation agent one step behind
  - Tracks progress continuously
- Handles validation issues immediately
- Manages parallel agent execution (3-5 agents optimal)
- Ensures shared dependencies created first
- References investigation patterns throughout

**Output:**
- Implemented code (feature/story/API)
- `agent-responses/validate-T#-*.md` (per-task validation)
- Tests (if in plan)

**Next:** Run `/manage-project/implement/validate {item-id}`

---

### Phase 4: Validation (`validate.md`)
**Purpose:** Comprehensive final validation of complete implementation.

**What it does:**
- Loads all artifacts (requirements, plan, investigations, implementations)
- Performs systematic validation across:
  - Requirements compliance
  - Specification alignment
  - Task completion
  - Code quality
  - Edge cases & error handling
  - Integration points
  - Performance
  - Security
  - Accessibility (if UI)
  - Testing coverage
  - Regression check
- Consolidates validation results
- Handles critical issues vs non-critical
- Creates final validation report
- Gets user acceptance

**Output:**
- `agent-responses/final-validation-{item-id}-*.md`
- Implementation acceptance

**Result:** Implementation complete and validated!

---

## Command Details

### Start Command (`start.md`)
**Purpose:** Intelligent entry point that analyzes your description and routes to the appropriate add/update command.

**Auto-includes:**
- `@~/.claude/docs/product-requirements.md`
- `@~/.claude/docs/system-design.md`
- `@~/.claude/docs/api-contracts.yaml`

**Features:**
- Classifies intent (new vs update, type of item)
- Routes to appropriate command
- Offers contextual next steps
- Highlights implementation option

**Example:**
```bash
/manage-project/start Add webhook support for external integrations
→ Classifies as: New Feature
→ Creates: F-09-webhook-support.yaml
→ Offers: Add stories/APIs or /manage-project/implement/00-orchestrate F-09
```

---

### Implement Orchestrator (`implement/00-orchestrate.md`)
**Purpose:** Orchestrate complete implementation lifecycle or route to specific phases.

**Options:**
- Run full workflow (all 4 phases automatically)
- Start from specific phase
- Resume interrupted work

**Phases:**
1. Investigation → `/manage-project/implement/investigate`
2. Planning → `/manage-project/implement/plan`
3. Execution → `/manage-project/implement/execute`
4. Validation → `/manage-project/implement/validate`

---


## Agent Usage

The implement workflow strategically delegates to specialized agents:

**Investigation Phase:**
- 2-5 `@Explore` agents for parallel codebase analysis
- Each investigates independent domain
- Results saved to `agent-responses/agent_*.md`

**Planning Phase:**
- Planning agent (if complex) creates comprehensive plan
- Uses all investigation artifacts as context

**Execution Phase:**
- `@programmer` for API/services/data, React/UI/forms
- `@orchestrator` for utilities/config
- Validation agents run one step behind implementation

**Validation Phase:**
- `@senior-engineer` for comprehensive final validation

---

## Tips

### Use Start for Discovery
If you're not sure what type of work you're doing, use `/manage-project/start` - it will figure it out.

### Control Implementation Phases
You can run each phase individually for maximum control, or use the orchestrator for automatic workflow.

### Resume Interrupted Work
The orchestrator detects completed phases and can resume from where you left off.

### Let Agents Work in Parallel
Investigation and validation agents run asynchronously. Use `./agent-responses/await {agent_id}` to monitor specific agents.

### Review Artifacts Between Phases
Each phase produces artifacts that feed the next phase. Review them before proceeding.

### Simple Features Can Skip Phases
For very simple features, you can skip investigation/planning and go straight to execution.

---

## Dependencies

These commands assume:
- Project has `docs/` directory with standard structure
- Bash utilities available (`./list-features.sh`, `./list-apis.sh`, `./check-project.sh`)
- Agent spawning capability
- Investigation template at `~/.claude/file-templates/investigation.template.md`
- Planning templates at `~/.claude/file-templates/plan*.template.md`

If missing, run `/init-project/00-orchestrate` first.

---

## Examples

### Example 1: Full Automatic Workflow
```bash
# One command for everything
/manage-project/start Add user profile customization
# → Creates F-10
/manage-project/implement/00-orchestrate F-10
# → Investigation: 5 agents spawn, findings consolidated
# → Planning: Task breakdown created
# → Execution: 8 tasks implemented with validation
# → Validation: Comprehensive check passes
# ✓ Complete and validated!
```

### Example 2: Phased Controlled Workflow
```bash
/manage-project/start Add notification preferences

# Phase 1
/manage-project/implement/investigate F-11
# [Review requirements doc, approve]

# Phase 2
/manage-project/implement/plan F-11
# [Review task breakdown, approve]

# Phase 3
/manage-project/implement/execute F-11
# [Monitor 6 tasks execute]

# Phase 4
/manage-project/implement/validate F-11
# [Review validation, accept]
```

### Example 3: API Implementation
```bash
/manage-project/start Add /api/notifications endpoint

# Implement the API
/manage-project/implement/00-orchestrate API-POST-/api/notifications
# → Investigation focuses on API patterns, routes, handlers
# → Plan creates 4 tasks: route, handler, validation, tests
# → Execution implements all tasks
# → Validation confirms endpoint works per contract
```

### Example 4: Resume After Interruption
```bash
# Work interrupted after investigation
/manage-project/implement/00-orchestrate F-12
# → Detects requirements.md exists
# → "Investigation complete. Starting at planning?"
# → Continues from planning phase
```
