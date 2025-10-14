I have just finished one or more changes. It's time to push commits and to potentially update the documentation.

## Phase 1: Analysis

Analyze git diffs, running any additional `git` commands necessary to understand the scope of change.

## Phase 2: Decision & Strategy

### For Small Changes (Handle Directly)
**When:** Single feature, <3 files, or trivial changes
**Action:**
1. Read necessary templates yourself
2. Write documentation if needed
3. Stage and commit: `git add [files] && git commit -m "type(scope): message"`

### For Large Changes (Delegate to Parallel Agents)
**When:** Multiple features, 3+ files with substantial changes, or complex modifications
**Action:** Use parallel agents for documentation

## Phase 3: Agent-Based Documentation (For Large Changes)

### Step 1: Identify Independent Documentation Tasks
Map each feature/module change that needs documentation:
- Feature A → needs feature doc
- Module B → might need CLAUDE.md update
- API changes → needs API doc
- Architecture changes → needs arch doc

### Step 2: Launch Parallel Documentation Agents

**Use a single function_calls block to launch all agents simultaneously:**

```xml
<function_calls>
  <!-- Agent for Feature A Documentation -->
  <invoke name="Task">
    <parameter name="description">Document feature A</parameter>
    <parameter name="subagent_type">general-purpose</parameter>
    <parameter name="prompt">
      Create documentation for Feature A:

      1. Read the template at ~/.claude/file-templates/feature-doc.template.md
      2. Analyze these changed files and any other necessary surrounding code: [list specific files]
      3. Create/update docs/features/feature-a.doc.md following the template
      4. Focus on:
         - User perspective and use cases
         - Data flow through the system
         - Which files implement the feature
    </parameter>
  </invoke>

  <!-- Agent for Feature B Documentation (if independent) -->
  <invoke name="Task">
    <parameter name="description">Document feature B</parameter>
    <parameter name="subagent_type">general-purpose</parameter>
    <parameter name="prompt">
      Create documentation for Feature B:

      1. Read the template at ~/.claude/file-templates/feature-doc.template.md
      2. Analyze these changed files and any other necessary surrounding code: [list specific files]
      3. Create/update docs/features/feature-b.doc.md
      4. Focus on user perspective and implementation details
    </parameter>
  </invoke>

  <!-- Agent for CLAUDE.md Update (ONLY if major architectural change) -->
  <invoke name="Task">
    <parameter name="description">Update module CLAUDE.md</parameter>
    <parameter name="subagent_type">general-purpose</parameter>
    <parameter name="prompt">
      Update CLAUDE.md for major architectural change:

      1. Read template at ~/.claude/file-templates/claude.template.md
      2. Read existing src/module/CLAUDE.md
      3. Update with new critical patterns (keep under 20 lines)
      4. Only document:
         - Critical patterns specific to this directory
         - Security boundaries
         - Major gotchas
    </parameter>
  </invoke>
</function_calls>
```

### Step 3: Wait for Agents & Commit

After all documentation agents complete:

1. **Review created documentation** - Check what agents produced
2. **Stage and commit in logical batches:**
   - Commit each feature with its documentation
   - Group related changes together
   - Use conventional commit messages

Example commit workflow after agents finish:
```bash
# Feature A and its docs
git add src/feature-a.js src/feature-a-utils.js docs/features/feature-a.doc.md
git commit -m "feat(feature-a): implement feature with documentation"

# Feature B and its docs
git add src/feature-b.js docs/features/feature-b.doc.md
git commit -m "feat(feature-b): add new feature with documentation"

# Architecture updates if any
git add src/module/CLAUDE.md
git commit -m "docs(module): update architecture patterns"
```

### Step 4: Agent Instructions Template

Each documentation agent should receive:
- **Specific files to analyze** (don't make them search)
- **Template location** to follow
- **Output file path** for documentation
- **Focus areas** based on change type

## Documentation Decision Tree

### Feature Documentation (docs/features/)
**Agent needed when:**
- ✅ New user-facing features
- ✅ Significant API changes
- ✅ Complex data flows
- ✅ Breaking changes

### CLAUDE.md Updates (RARELY - 90% of changes don't need this)
**Agent needed when (directory-specific only):**
- ✅ New critical patterns in a specific directory
- ✅ Security boundary changes within a directory
- ✅ Major architectural decisions affecting a directory

**NEVER:**
- ❌ Root CLAUDE.md (never update)
- ❌ Feature details (use feature docs)
- ❌ Obvious patterns

### Architecture Docs (docs/architecture/)
**Agent needed when:**
- ✅ System-wide architectural changes
- ✅ New service layers
- ✅ Major technology decisions

## Phase 4: Final Steps

1. Wait for all documentation agents to complete
2. Stage and commit changes in logical batches
3. Push to remote: `git push origin [branch]`
4. List commits and link to any new/updated documentation files

## Documentation Standards

### Feature Docs (docs/features/)
- User perspective first
- Data flow explanation
- File involvement mapping
- Keep focused and actionable

### CLAUDE.md (when rarely needed)
- Under 20 lines ideally
- Directory-specific only
- Critical patterns/warnings only
- Never update root CLAUDE.md

### Commit Messages
- Follow Conventional Commits: `type(scope): subject`
- Types: feat, fix, docs, style, refactor, test, chore
- Commit after agents complete their documentation
- Group related changes in logical commits

## Key Reminders

- **Small changes:** Handle directly, no agents needed
- **Large changes:** Delegate documentation to parallel agents, commit afterward
- **Agent context:** Provide specific file paths, don't make agents search
- **Clean separation:** Agents write docs, main CLI handles all git operations
- **CLAUDE.md rarity:** 90% of changes don't need CLAUDE.md updates

Remember: Most changes need minimal documentation. Focus on what provides lasting value to developers.
