# Bug Fixing Protocol

Systematic approach to diagnosing and fixing bugs in existing features, with strategic use of async agents for investigation.

## Artifacts

**Inputs:**
- `docs/feature-spec/F-##-*.md` - Affected feature specs
- `docs/user-stories/US-###-*.md` - Expected behavior and acceptance criteria
- `docs/api-contracts.yaml` - API specifications
- `docs/system-design.md` - Architecture context

**Outputs:**
- Investigation findings (from root-cause-analyzer/code-finder)
- Updated feature spec with bug resolution notes

**Handoffs:**
- Fix agents read investigation artifacts for root cause context

## Naming Conventions
- Feature specs: `docs/feature-spec/F-##-<slug>.md`
- User stories: `docs/user-stories/US-###-<slug>.md`

## When to Use
- Something is broken and needs diagnosis/repair
- Error messages or unexpected behavior
- Performance degradation in existing functionality

## Core Steps

### 1. Context & Reproduction
**Read relevant documentation:**
- `docs/feature-spec/F-##-*.md` for the affected feature
- `docs/user-stories/US-###-*.md` for expected behavior and acceptance criteria
- `docs/api-contracts.yaml` if API-related
- `docs/system-design.md` for architecture context

**Document the bug:**
- Expected behavior (cite story AC or spec)
- Actual behavior (what's broken)
- Reproduction steps
- Feature ID (F-##) and story ID (US-###) if known

### 2. Investigation (Use Async Agents)
**Launch parallel investigation agents for independent areas:**

**Delegate `root-cause-analyzer` agents to:**
- Trace error flow through specific subsystem
- Analyze related failure patterns
- Investigate runtime conditions

**Delegate `code-finder` agents to:**
- Map data flow across multiple files
- Find all error handling for specific operation
- Locate configuration and integration points

**Example:** For authentication bug, spawn:
- Agent 1: "Trace authentication flow from login endpoint to session creation"
- Agent 2: "Find all error handling and validation in auth module"
- Agent 3: "Locate session storage configuration and related code"

Wait for investigation results using `./agent-responses/await {agent_id}`

### 3. Root Cause Analysis
**Synthesize investigation findings:**
- List 5-8 potential root causes from agent reports
- Rank by probability (evidence from code) and impact
- Select top 3 most likely causes

**Decision point:**
- **Fix immediately** if root cause is obvious and confirmed
- **Add validation** if multiple plausible causes or runtime-dependent

### 4. Validation (if needed)
**Add targeted debugging:**
- Logging at decision points
- Data inspection at boundaries
- Input/output logging at integration points

**User tests with logging enabled**

### 5. Implementation
**Fix the confirmed root cause:**
- Keep changes minimal and focused
- Maintain API stability unless approved
- Follow existing patterns in the codebase

**Update documentation if spec/behavior was wrong:**

Run `/manage-project/update/update-feature` to correct feature spec or refine behavior notes
Run `/manage-project/update/update-story` to update story acceptance criteria if ambiguous
Run `/manage-project/update/update-api` if API contract changed (requires approval)

**Parallel implementation with artifact passing:**
If multiple independent fixes needed, pass investigation results to fix agents. They read `agent-responses/agent_<id>.md` files for bug context, root cause, and solution approach.

### 6. Validation & Testing
**Verify fix against acceptance criteria:**
- Test all ACs from affected user stories
- Check edge cases and error states
- Run contract tests if API changed
- Verify events in `docs/data-plan.md` still fire correctly

### 7. Documentation Update
**Update affected docs using slash commands:**

- Run `/manage-project/update/update-feature` to add note in "Known Issues" → "Resolved" or correct "Behavior" section
- Run `/manage-project/update/update-story` to refine AC if ambiguity caused the bug
- Run `/manage-project/update/update-api` to document API changes (with approval)
- Run `/manage-project/update/update-requirements` if data plan events were incorrect

### 8. Cleanup
- Remove all debugging/logging code
- Verify no temporary files remain

## Agent Strategy

**Investigation phase (2-4 agents):**
- Each investigates independent subsystem or hypothesis
- Run in parallel for speed
- Maximum 6 agents (diminishing returns)

**Implementation phase:**
- Usually handle yourself
- Spawn agents only for truly independent fixes in separate modules


