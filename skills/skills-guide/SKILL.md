---
name: Skills Guide
description: Defines required structure, frontmatter format, and best practices for SKILL.md files. Use BEFORE creating or editing any skill - this is the spec to follow, not optional reference.
---

# Skills Guide

Package reusable expertise into discoverable capabilities. Skills are modular instructions Claude autonomously activates when relevant—extending your workflow without requiring slash commands.

## Contents

- [Quick Start](#quick-start)
- [What are Skills](#what-are-skills)
- [Create a Skill](#create-a-skill)
- [Structure & Organization](#structure--organization)
- [Best Practices](#best-practices)
- [Debugging](#debugging)

## Quick Start

### Personal Skill (available everywhere)

```bash
mkdir -p ~/.claude/skills/my-skill-name
```

### Project Skill (shared with team)

```bash
mkdir -p .claude/skills/my-skill-name
```

### Create SKILL.md

```yaml
---
name: Skill Name
description: What it does + when to use it (be specific!)
---

# Skill Name

## Instructions
Step-by-step guidance for Claude

## Examples
Concrete usage examples
```

## What are Skills

**Agent Skills** package expertise into discoverable, composable capabilities:

- **SKILL.md** — Instructions Claude reads when relevant
- **Supporting files** — Optional scripts, templates, reference docs
- **Model-invoked** — Claude autonomously decides when to use based on description
- **Discoverable** — No slash commands; integrated with your workflow

### Benefits
- Solve recurring problems once, reuse everywhere
- Share expertise across teams via git
- Compose multiple Skills for complex tasks
- Reduce token overhead from repetitive prompting

## Create a Skill

### Personal Skills: `~/.claude/skills/`

Available across all projects. Use for:
- Individual workflows and experimental Skills
- Personal productivity tools
- Utilities you use across multiple projects

### Project Skills: `.claude/skills/`

Shared with your team via git. Use for:
- Team workflows and shared expertise
- Project-specific capabilities
- Utilities team members need together

Team members automatically get Project Skills when they pull your repo.

### Plugin Skills

Bundled with Claude Code plugins; automatically available when plugin installed.

## Write SKILL.md

Every Skill requires YAML frontmatter + Markdown content.

### Required Fields

| Field | Limit | Purpose |
|-------|-------|---------|
| `name` | 64 chars | Human-readable name |
| `description` | 1024 chars | **What it does + when to use** |

### Optional Fields

| Field | Purpose |
|-------|---------|
| `allowed-tools` | Restrict which tools Claude can use (e.g., `Read, Grep, Glob`) |

### The description field is critical

Claude uses this to decide whether to activate your Skill. **Always include**:

1. **What it does** — Concrete capabilities
2. **When to use** — Specific triggers and contexts

**Good** (triggers Claude):
```
Extract text and tables from PDF files, fill forms, merge documents.
Use when working with PDF files or when the user mentions PDFs, forms, or extraction.
```

**Bad** (too vague):
```
Helps with documents
```

### Naming conventions

Use **gerund form** (verb + -ing):
- "Processing PDFs"
- "Analyzing spreadsheets"
- "Testing code"
- "Writing documentation"

## Structure & Organization

### Simple Skill (single file)

For focused, single-purpose capabilities:

```
commit-helper/
└── SKILL.md
```

### Skill with supporting files

Reference files load on-demand; keep SKILL.md under 500 lines for optimal performance:

```
pdf-processing/
├── SKILL.md              # Main instructions (quick start)
├── FORMS.md              # Form-filling guide
├── REFERENCE.md          # API reference
├── EXAMPLES.md           # Usage examples
└── scripts/
    ├── analyze_form.py
    ├── fill_form.py
    └── validate.py
```

### Progressive disclosure pattern

**High-level overview in SKILL.md**:
- Quick start and common use cases
- Links to detailed reference files

```markdown
## Quick start

Extract text with pdfplumber:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## Advanced features

**Form filling**: See [FORMS.md](FORMS.md)
**API reference**: See [REFERENCE.md](REFERENCE.md)
**Examples**: See [EXAMPLES.md](EXAMPLES.md)
```

### Organization for multi-domain Skills

For Skills covering multiple domains, organize by domain:

```
bigquery-skill/
├── SKILL.md
└── reference/
    ├── finance.md
    ├── sales.md
    ├── product.md
    └── marketing.md
```

SKILL.md acts as router linking to domain-specific docs.

## Best Practices

### 1. Assume Claude is smart

Don't explain basic concepts. Be concise and direct.

**Verbose** (~150 tokens):
```
PDF files are a common format containing text, images, and other content.
To extract text, you need a library. Many libraries exist...
```

**Concise** (~50 tokens):
```
Use pdfplumber for text extraction:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

### 2. Use examples over explanations

Provide input/output pairs, especially for transformations:

```markdown
## Commit message format

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**Example 2:**
Input: Fixed bug where dates displayed incorrectly
Output:
```
fix(reports): correct date formatting in timezone conversion
```
```

### 3. Provide utility scripts

Pre-made scripts are more reliable than generated code:

```markdown
## Utility scripts

**analyze_form.py**: Extract form fields from PDF
```bash
python scripts/analyze_form.py input.pdf > fields.json
```

**validate_boxes.py**: Check for overlapping fields
```bash
python scripts/validate_boxes.py fields.json
```
```

### 4. List required packages

Specify dependencies upfront:

```markdown
## Requirements

```bash
pip install pypdf pdfplumber
```
```

### 5. Implement validation loops

For quality-critical tasks, enforce validation checks:

```markdown
## Workflow

1. Make your edits
2. **Validate immediately**: `python scripts/validate.py`
3. If validation fails:
   - Review error message
   - Fix issues
   - Run validation again
4. **Only proceed when validation passes**
```

### 6. Use workflows with checklists

For complex multi-step operations:

```markdown
## Task Progress

- [ ] Step 1: Analyze form
- [ ] Step 2: Create mapping
- [ ] Step 3: Validate mapping
- [ ] Step 4: Fill form
- [ ] Step 5: Verify output
```

### 7. Restrict tool access (optional)

Limit which tools Claude can use:

```yaml
---
name: Safe File Reader
description: Read files without making changes
allowed-tools: Read, Grep, Glob
---
```

### 8. Match specificity to task fragility

**High freedom** (multiple approaches valid):
```markdown
## Code review process

1. Analyze code structure
2. Check for potential bugs
3. Suggest readability improvements
4. Verify project conventions
```

**Low freedom** (exact sequence required):
```markdown
## Database migration

Run exactly this command (do not modify):
```bash
python scripts/migrate.py --verify --backup
```
```

## Debugging

### Skill won't activate?

**Check description specificity**:
- Too vague: `Helps with documents`
- Specific: `Extract text and tables from PDFs. Use when working with PDF files or when the user mentions PDFs, forms, or extraction.`

**Include when-to-use triggers** in description so Claude recognizes your task.

### Multiple Skills conflict?

Use distinct trigger terms:

Instead of:
```yaml
# Skill 1
description: For data analysis

# Skill 2
description: For analyzing data
```

Use:
```yaml
# Skill 1
description: Analyze sales data in Excel and CRM exports.
Use for sales reports, pipeline analysis, and revenue tracking.

# Skill 2
description: Analyze log files and system metrics.
Use for performance monitoring, debugging, and system diagnostics.
```

### Check file paths

Verify Skill location:

```bash
# Personal
ls ~/.claude/skills/my-skill/SKILL.md

# Project
ls .claude/skills/my-skill/SKILL.md
```

### Verify YAML syntax

Invalid YAML prevents loading:

```bash
cat SKILL.md | head -n 10
```

Ensure:
- Opening `---` on line 1
- Closing `---` before content
- Valid YAML (no tabs, correct indentation)

### Use forward slashes only

- ✓ Good: `scripts/helper.py`
- ✗ Wrong: `scripts\helper.py`

## Share Skills

### With your team via git

1. Create Skill in `.claude/skills/`
2. Commit to git:
   ```bash
   git add .claude/skills/
   git commit -m "Add team Skill for PDF processing"
   git push
   ```
3. Team pulls and Skills are immediately available

### Test your Skill

Ask Claude questions matching your description:

```
Can you help me extract text from this PDF?
```

Claude autonomously activates your Skill if description matches the request.
