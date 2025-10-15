# Code Review Protocol

Systematic evaluation of code changes for quality, security, correctness, and alignment with project requirements.

## Artifacts

**Inputs:**
- `docs/feature-spec/F-##-*.md` - Technical design and requirements
- `docs/user-stories/US-###-*.md` - Acceptance criteria
- `docs/api-contracts.yaml` - Expected API signatures
- `docs/data-plan.md` - Event tracking requirements
- `docs/design-spec.md` - UI/UX requirements
- `docs/plans/<slug>/plan.md` - Original implementation plan (if available)

**Outputs:**
- Code review report with findings and recommendations

**Handoffs:**
- Fix agents read review report to address issues
- Documentation agents update specs if deviations found

## Naming Conventions
- Review reports: inline or `docs/reviews/<pr-number>-review.md`

## Shared Dependency Setup
Before parallelizing code review, ensure shared test fixtures or review criteria are established to maintain consistency across reviewing agents.

## When to Use
- Evaluating PR or code changes before merge
- Assessing code quality and best practices
- Identifying security vulnerabilities or bugs
- Ensuring implementation matches specifications

## Core Steps

### 1. Context Gathering
**Read relevant project documentation:**
- `docs/feature-spec/F-##-*.md` for technical design and requirements
- `docs/user-stories/US-###-*.md` for acceptance criteria
- `docs/api-contracts.yaml` for expected API signatures
- `docs/data-plan.md` for event tracking requirements
- `docs/design-spec.md` for UI/UX requirements
- `docs/system-design.md` for architecture patterns

**Determine review scope:**
- Files changed
- Features affected (F-## IDs)
- Stories implemented (US-### IDs)
- API changes
- Database changes

### 2. Review Strategy
**Choose approach based on scope:**

**Single-agent review (<5 files, single concern):**
- Review yourself sequentially
- Focus on one area of concern

**Parallel multi-agent review (>5 files, multiple concerns):**
- Spawn specialized agents for different review aspects
- Each agent focuses on specific quality dimension

**Delegate agents for parallel review:**
- **Security:** `root-cause-analyzer` for vulnerability assessment
- **Architecture:** `code-finder` for pattern compliance and structure
- **API Contracts:** `backend-developer` for endpoint validation
- **Frontend:** `frontend-ui-developer` for UI/UX and accessibility
- **Documentation:** `documentor` for comment quality and docs updates

**Example:** For full-stack feature PR:
- Agent 1: Review backend API against `docs/api-contracts.yaml`
- Agent 2: Review frontend against `docs/design-spec.md` and accessibility
- Agent 3: Security review for auth and data handling
- Agent 4: Check data events against `docs/data-plan.md`

Wait for results: `./agent-responses/await {agent_id}` or continue other work

**If original implementation had artifacts, pass them to reviewers** by referencing `docs/plans/<slug>/plan.md` and `agent-responses/agent_<id>.md` files for verification against original design.

### 3. Quality Assessment
**Evaluate across dimensions:**

**Security (/25):**
- Input validation and sanitization
- Authentication/authorization checks
- Sensitive data handling
- Injection vulnerabilities (SQL, XSS, etc.)

**Correctness (/25):**
- Logic matches acceptance criteria
- Edge cases handled
- Error handling complete
- Null/undefined checks

**Spec Alignment (/20):**
- APIs match `docs/api-contracts.yaml`
- Data events match `docs/data-plan.md`
- UI matches `docs/design-spec.md`
- Implementation follows feature spec

**Performance (/15):**
- Algorithm efficiency
- Database query optimization
- Resource usage (memory, network)

**Maintainability (/15):**
- Code clarity and readability
- Consistent with codebase patterns
- Appropriate abstraction
- Comments where needed

**Total: /100**

### 4. Report Findings
**Structure by priority:**

#### 🔴 CRITICAL (Must fix before merge)
- Security vulnerabilities
- Broken functionality
- Spec violations (API contract breaks)
- Data corruption risks

**Format:**
```
Location: file.ts:123
Problem: [Description]
Impact: [Risk/consequence]
Fix: [Specific change needed]
Spec reference: [docs/api-contracts.yaml line X]
```

#### 🟡 IMPORTANT (Should fix)
- Logic bugs in edge cases
- Missing error handling
- Performance issues
- Missing analytics events
- Accessibility violations

#### 🟢 NICE-TO-HAVE (Optional improvements)
- Code style improvements
- Better abstractions
- Enhanced documentation

#### ✅ GOOD PRACTICES
Highlight what was done well for learning

### 5. Summary & Recommendation
**Quality Score:** [X/100]
**Issues:** Critical: [N], Important: [N], Nice-to-have: [N]
**Assessment:** [APPROVE / NEEDS REVISION / MAJOR REWORK]

**Spec compliance:**
- [ ] APIs match `docs/api-contracts.yaml`
- [ ] Events match `docs/data-plan.md`
- [ ] UI matches `docs/design-spec.md`
- [ ] Logic satisfies story AC

### 6. Fix Implementation (if requested)
**Offer options:**
1. Fix critical + important issues
2. Fix only critical (minimum for safety)
3. Provide detailed explanation for learning
4. Review only (no changes)

**If fixing, parallel approach:**
- Spawn agents for independent fix areas
- Each agent addresses specific file/concern
- Coordinate on shared dependencies

**Document each fix:**
```
✅ FIXED: [Issue name]
File: [path:line]
Change: [what changed]
Verification: [how to test]
```

### 7. Documentation Updates
**Check if docs need updates:**
- Feature spec "Decisions" or "Deviations" if implementation differs
- Design spec if UI changed
- API contracts if endpoints modified (requires approval)
- Data plan if events changed

**Flag for user approval before modifying specs**

## Agent Strategy

**Review phase:**
- 2-5 agents for parallel review of large PRs
- Each reviews specific aspect (security, API, UI, data)
- Consolidate findings from all agents

**Fix phase:**
- Usually handle yourself for small fixes
- Spawn agents for independent fix areas in large revisions


