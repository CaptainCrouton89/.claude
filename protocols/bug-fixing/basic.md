# Bug Fixing Protocol (Basic)

Streamlined approach to diagnosing and fixing bugs with direct investigation using built-in tools.

## Artifacts

**Inputs:**
- `docs/feature-spec/F-##-*.md` - Affected feature specs
- `docs/user-stories/US-###-*.md` - Expected behavior and acceptance criteria
- `docs/api-contracts.yaml` - API specifications
- `docs/system-design.md` - Architecture context

**Outputs:**
- Investigation findings (inline or brief notes)
- Updated feature spec with bug resolution notes

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

### 2. Investigation
**Use direct tools to understand the issue:**

**Find the entry point:**
- Use `grep` to locate error messages or related code
- Use `codebase_search` for semantic queries about functionality
- Use `read_file` to examine suspected files

**Trace the flow:**
- Follow function calls and data transformations
- Check related files for connected logic
- Identify integration points and dependencies

**Example investigation:**
For authentication bug:
- Search for login/auth related code: `grep "login" --type ts`
- Read authentication service files
- Trace session creation and validation flow
- Check error handling and validation logic

### 3. Root Cause Analysis
**Generate and evaluate hypotheses:**
- List 3-5 potential root causes based on investigation
- Rank by probability (evidence from code) and impact
- Select most likely cause

**Decision point:**
- **Fix immediately** if root cause is obvious and confirmed
- **Add validation** if uncertain - add targeted logging at decision points

### 4. Validation (if needed)
**Add minimal debugging:**
- Logging at key decision points
- Data inspection at boundaries
- Input/output logging at integration points

**Test to confirm root cause**

### 5. Implementation
**Fix the confirmed root cause:**
- Keep changes minimal and focused
- Maintain API stability unless approved
- Follow existing patterns in the codebase

**Update documentation if needed:**
- Brief note in feature spec or changelog
- Update `docs/api-contracts.yaml` if contract changed (requires approval)

### 6. Validation & Testing
**Verify fix against acceptance criteria:**
- Test primary ACs from affected user stories
- Check 1-2 key edge cases
- Verify events in `docs/data-plan.md` still fire correctly (if applicable)

### 7. Cleanup
- Remove all debugging/logging code
- Verify no temporary files remain

## Investigation Strategy

**Direct investigation:**
- Use grep, codebase_search, read_file to understand the codebase
- Trace flows manually through related files
- Focus on the specific subsystem where bug manifests

**When to validate before fixing:**
- Multiple plausible root causes
- Runtime-dependent behavior
- Intermittent or hard-to-reproduce issues

