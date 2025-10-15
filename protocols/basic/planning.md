# Planning Protocol (Basic)

Streamlined approach to creating implementation plans with focused investigation using direct tools.

## Artifacts

**Inputs:**
- `docs/product-requirements.md` - Project goals and existing features (F-##)
- `docs/feature-spec/F-##-*.md` - Technical details
- `docs/system-design.md` - Architecture patterns
- `docs/api-contracts.yaml` - API standards
- `docs/design-spec.md` - UI patterns

**Outputs:**
- `docs/plans/<slug>/plan.md` - Implementation plan
- Investigation notes (inline)

## When to Use
- Creating structured approach BEFORE implementing
- Breaking down complex work into steps
- Designing architecture for new features
- Planning refactoring or system changes

## Core Steps

### 1. Validate Requirements
**Quick 3-question check:**

1. **Happy Path:** Is the successful scenario clear?
2. **Edge Cases:** Do we know how to handle errors and edge cases?
3. **Integration:** Are dependencies and integration points understood?

**If unclear:** Gather requirements first (requirements-gathering protocol)

**If clear:** Proceed to investigation

### 2. Investigation
**Read project documentation:**
- `docs/product-requirements.md` for project goals and existing features (F-##)
- `docs/feature-spec/F-##-*.md` for technical details
- `docs/system-design.md` for architecture patterns
- `docs/api-contracts.yaml` for API standards
- `docs/design-spec.md` for UI patterns

**Use direct tools for impact analysis:**

**Key areas to investigate:**
- [ ] Affected files identified
- [ ] Current architecture understood
- [ ] Dependencies and integration points mapped
- [ ] Existing patterns documented
- [ ] Data models reviewed
- [ ] For refactors: All call sites found

**Investigation tools:**
- `read_file` - Examine existing code and docs
- `grep` - Find all usages, imports, call sites
- `codebase_search` - Understand how features work
- `glob_file_search` - Find files by pattern

**For refactors, be thorough:**
```bash
# Find all imports
grep -r "import.*ComponentName" --include="*.tsx"

# Find all usages
grep -r "ComponentName" --include="*.ts"

# Find tests
grep -r "describe.*ComponentName" --include="*.test.ts"
```

### 3. Create Implementation Plan
**Write concise plan with 3-6 tasks:**

```markdown
# Implementation Plan: [Feature Name]

## Overview
[Brief description of what we're building and why]

## Tasks

### Task 1: [Name]
**What:** [What needs to be done]
**Files:** [Files to create/modify]
**Dependencies:** None / Requires Task X

### Task 2: [Name]
**What:** [What needs to be done]
**Files:** [Files to create/modify]
**Dependencies:** Requires Task 1

### Task 3: [Name]
**What:** [What needs to be done]
**Files:** [Files to create/modify]
**Dependencies:** None (can run parallel to Task 2)

## Integration Points
- [External systems or APIs]
- [Existing features that interact]

## Testing
- [Key test scenarios]

## Risks
- [Potential issues or unknowns]
```

**Use planning templates for more structure:**
- Small: `~/.claude/file-templates/plan.quick.template.md`
- Medium: `~/.claude/file-templates/plan.template.md`
- Large: `~/.claude/file-templates/plan.comprehensive.template.md`

### 4. Identify Parallelization Opportunities
**Only if obviously independent:**

```markdown
## Batch 1 (Parallel - no shared dependencies)
- Task 1: Backend API endpoint
- Task 2: Frontend component
- Task 3: Database migration

## Batch 2 (Sequential - depends on Batch 1)
- Task 4: Integration layer
- Task 5: Tests
```

**Default to sequential unless clear benefit to parallel execution**

### 5. Link to Project Docs
**If project uses docs structure, reference:**
- `docs/product-requirements.md`
- `docs/feature-spec/F-##-[slug].md`
- `docs/system-design.md`
- `docs/api-contracts.yaml`

### 6. Present Plan
**Share summary:**
- Key tasks (3-6 items)
- Major integration points
- Any breaking changes
- Estimated approach

**Get approval before implementation**

## Investigation Checklist

**For new features:**
- [ ] Read existing feature specs for patterns
- [ ] Check system design for architecture guidance
- [ ] Review API contracts for naming conventions
- [ ] Examine similar features in codebase

**For refactors:**
- [ ] Find ALL files importing/using the code
- [ ] Identify ALL call sites
- [ ] Locate ALL tests
- [ ] Check configuration files
- [ ] Find documentation references

**For integrations:**
- [ ] Review existing integration patterns
- [ ] Check authentication/authorization approach
- [ ] Understand error handling conventions
- [ ] Identify shared utilities

## Quick Planning Template

```markdown
# Plan: [Feature Name]

## Goal
[What we're building and why]

## Tasks
1. [Task] - [Files] - [Dependencies]
2. [Task] - [Files] - [Dependencies]
3. [Task] - [Files] - [Dependencies]

## Key Decisions
- [Important technical decision with reasoning]

## Risks
- [Potential issues]
```

