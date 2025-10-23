---
name: Fixing Bugs Systematically
description: Diagnose and fix bugs through systematic investigation, root cause analysis, and targeted validation. Use when something is broken, errors occur, performance degrades, or unexpected behavior manifests.
---

# Fixing Bugs Systematically

Structured protocol for isolating root causes and implementing focused fixes in existing features.

## When to Use

- Something is broken and needs diagnosis and repair
- Error messages or unexpected behavior occurs
- Performance degradation in existing functionality
- Intermittent or hard-to-reproduce issues

## Core Steps

### 1. Context & Reproduction

Read relevant documentation:
- `docs/feature-spec/F-##-*.md` for affected feature
- `docs/user-stories/US-###-*.md` for expected behavior and acceptance criteria
- `docs/api-contracts.yaml` if API-related
- `docs/system-design.md` for architecture context

Document the bug:
- **Expected behavior** (cite story AC or spec)
- **Actual behavior** (what's broken)
- **Reproduction steps**
- **Feature ID** (F-##) and **Story ID** (US-###) if known

### 2. Investigation

#### Simple bugs (obvious entry point)
Use direct investigation:
- Grep to locate error messages or related code
- Read suspected files to examine implementation
- Trace function calls and data transformations
- Check related files for connected logic

#### Complex bugs (multiple subsystems or unclear origin)
Delegate to async agents in parallel:

**Spawn `senior-engineer` agents to:**
- Trace error flow through specific subsystem
- Analyze related failure patterns
- Investigate runtime conditions

**Spawn `context-engineer` agents to:**
- Map data flow across multiple files
- Find all error handling for specific operation
- Locate configuration and integration points

**Example:** For authentication bug, spawn:
- Agent 1: "Trace auth flow from login endpoint to session creation"
- Agent 2: "Find all error handling and validation in auth module"
- Agent 3: "Locate session storage config and related code"

Wait for results using `./agent-responses/await {agent_id}`

### 3. Root Cause Analysis

**Generate hypotheses:**
- List 3-8 potential root causes from investigation
- Rank by probability (evidence from code) and impact
- Select most likely cause(s)

**Decision point:**
- **Fix immediately** if root cause is obvious and confirmed
- **Add validation** if multiple plausible causes or runtime-dependent behavior

### 4. Validation (if needed)

Add minimal debugging:
- Logging at decision points
- Data inspection at boundaries
- Input/output logging at integration points

Test to confirm root cause before proceeding to fix.

### 5. Implementation

Fix the confirmed root cause:
- Keep changes minimal and focused
- Maintain API stability unless approved
- Follow existing patterns in codebase

**Update documentation if needed:**
- Add note in feature spec or changelog
- Update `docs/api-contracts.yaml` if contract changed (requires approval)
- For slash commands:
  - `/manage-project/update/update-feature` to correct spec
  - `/manage-project/update/update-story` if ACs were ambiguous
  - `/manage-project/update/update-api` if API changed (with approval)

### 6. Validation & Testing

Verify fix against acceptance criteria:
- Test all ACs from affected user stories
- Check 1-2 key edge cases and error states
- Run contract tests if API changed
- Verify events in `docs/data-plan.md` still fire correctly

### 7. Cleanup

- Remove all debugging and logging code
- Verify no temporary files remain

## Investigation Strategy

**For direct investigation:**
- Use grep, read_file to understand subsystem
- Trace flows manually through related files
- Focus on specific area where bug manifests

**When to validate before fixing:**
- Multiple plausible root causes exist
- Runtime-dependent behavior
- Intermittent or hard-to-reproduce issues

**For async investigation:**
- Each agent investigates independent subsystem
- Run in parallel for speed
- Maximum 6 agents (diminishing returns)

## Artifacts

**Inputs:**
- `docs/feature-spec/F-##-*.md` — Feature specs
- `docs/user-stories/US-###-*.md` — Expected behavior and ACs
- `docs/api-contracts.yaml` — API specs
- `docs/system-design.md` — Architecture context

**Outputs:**
- Investigation findings (inline notes or agent reports)
- Updated feature spec with bug resolution notes
- Fixed code with accompanying tests

## Quick Reference

| Scenario | Approach |
|----------|----------|
| Single subsystem, obvious entry | Direct investigation → immediate fix |
| Multiple subsystems, unclear origin | Spawn 2-4 agents in parallel → synthesize findings → fix |
| Runtime-dependent or intermittent | Add targeted logging → reproduce → analyze logs → fix |
| Multiple independent fixes needed | Pass investigation results to fix agents via artifact files |
