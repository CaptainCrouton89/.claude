# Planning Protocol

Creating comprehensive implementation plans for features, refactors, and enhancements through thorough investigation and impact analysis.

## Artifacts

**Inputs:**
- `docs/charter.md` - Project goals
- `docs/product-requirements.md` - Existing features (F-##)
- `docs/feature-spec/F-##-*.md` - Technical details
- `docs/system-design.md` - Architecture patterns
- `docs/api-contracts.yaml` - API standards
- `docs/design-spec.md` - UI patterns

**Outputs:**
- `docs/plans/<slug>/plan.md` - Implementation plan
- File references to any investigation findings (from code-finder agents)

**Handoffs:**
- Implementation agents read plan + investigation responses
- Testing agents reference plan for coverage requirements

## Naming Conventions
- Plans: `docs/plans/<feature-slug>/plan.md`
- Feature specs: `docs/feature-spec/F-##-<slug>.md`

## When to Use
- Creating structured approach BEFORE implementing
- Breaking down complex work into steps
- Designing architecture for new features
- Planning refactoring or system changes

## Core Steps

### 1. Clarify Requirements
**Assess if request is clear enough to plan:**

**If clear:** Proceed to investigation
**If ambiguous:** Gather requirements first

**Quick discovery questions (5-7 max):**
1. **Happy Path:** Describe successful scenario step-by-step
2. **Edge Cases:** Empty state, invalid input, errors, large datasets?
3. **Scope Boundaries:** What's explicitly OUT of scope?
4. **Performance:** Instant (<100ms), fast (<1s), or eventual (loading)?
5. **Integration:** Interactions with existing features, APIs, auth?

**Feature-specific questions:**
- **Auth:** Credentials approach, session duration, failure handling?
- **CRUD:** Validation rules, concurrent edits, delete behavior?
- **Search:** Scope, match type, timing (live/submit)?
- **Real-time:** Update mechanism (polling/WebSocket), frequency, offline?

**Generate inferences with confidence:**
```markdown
[INFER-HIGH]: JWT in httpOnly cookies (security best practice)
[INFER-MEDIUM]: Debounced search 300ms (balance UX + performance)
[INFER-LOW]: Max 100 results per page (prevent UI overload)

## Clarification Needed
- Search title only or description too?
- Filter state in URL for sharing?
```

**Get approval before planning**

### 2. Investigation Phase (CRITICAL)
**Nothing can be left to assumptions. Thorough investigation is mandatory.**

**Read project documentation:**
- `docs/charter.md` for project goals
- `docs/product-requirements.md` for existing features (F-##)
- `docs/feature-spec/F-##-*.md` for technical details
- `docs/system-design.md` for architecture patterns
- `docs/api-contracts.yaml` for API standards
- `docs/design-spec.md` for UI patterns

**Investigation checklist:**
- [ ] ALL affected files identified (complete impact analysis)
- [ ] Current system architecture understood
- [ ] All dependencies and integration points mapped
- [ ] Existing patterns and conventions documented
- [ ] Data models and schemas reviewed
- [ ] Current data flows traced
- [ ] ALL call sites found (especially for refactors)
- [ ] Test impact assessed
- [ ] Breaking changes identified

### 3. Parallel Impact Analysis (Use Async Agents)
**ALWAYS use code-finder agents for comprehensive impact analysis**

Async agents are enabled via `hooks/pre-tool-use/agent-interceptor.js` and monitored by `hooks/lifecycle/agent-monitor.mjs`. Delegate in parallel and link results in the plan’s “Investigation Artifacts”.

**Standard approach (90% of tasks):**
Delegate `code-finder` agents to perform complete impact analysis:
- Find ALL affected files across codebase
- Identify every usage, call site, and dependency
- Map integration points and data flows
- Discover existing patterns to follow
- Identify breaking changes and ripple effects
- For refactors: MUST find all imports, call sites, tests, config

**Why agents:** Plans fail when they miss affected code. Code-finder excels at comprehensive codebase analysis.

**Common investigation patterns:**

**Pattern 1: Full-stack feature/refactor**
- Agent 1: Backend analysis (services, APIs, models, call sites, integrations)
- Agent 2: Frontend analysis (components, state, API clients, dependencies, patterns)
- Agent 3: Data layer (schema, queries, migrations, integrity, performance)

**Pattern 2: Architecture + integration**
- Agent 1: Current system (organization, stack, patterns, boundaries, config)
- Agent 2: Integration needs (external APIs, auth, database, queues, libraries)

**Pattern 3: Single domain impact** (contained feature)
- Agent 1: Complete domain analysis (ALL files, call sites, dependencies, imports, tests, config)

Wait for completion: `./agent-responses/await {agent_id}` or continue other work

### 4. Create Plan Using Templates
**Write plan to `docs/plans/[feature-name]/plan.md`**

Choose the template based on scope:
- Small: `/Users/silasrhyneer/.claude/file-templates/plan.quick.template.md`
- Medium: `/Users/silasrhyneer/.claude/file-templates/plan.template.md`
- Large: `/Users/silasrhyneer/.claude/file-templates/plan.comprehensive.template.md`

Reference and synthesize investigation artifacts. Do NOT restate template structures in this protocol—follow the templates directly.

### 5. Link Plan to Project Docs
If project uses init-project docs structure, ensure plan references or updates:
- `docs/product-requirements.md`
- `docs/feature-spec/F-##-[slug].md`
- `docs/system-design.md`
- `docs/api-contracts.yaml`
- `docs/data-plan.md`

### 6. Present Plan for Approval
Share summary, key impacts, and breaking changes. Obtain explicit approval before implementation.

### 7. Pass Plan to Implementation Agents
Provide the plan and referenced agent responses to implementation agents. Agents read `docs/plans/<slug>/plan.md` and `agent-responses/agent_<id>.md` files for complete context.

