# Agent Skills

> Package expertise into discoverable capabilities that extend Claude's functionality.

Skills are modular instructions that Claude autonomously uses when relevant, plus optional supporting files like scripts and templates.

## Contents

- [What are Skills](#what-are-skills)
- [Create a Skill](#create-a-skill)
- [Write SKILL.md](#write-skillmd)
- [Structure & Organization](#structure--organization)
- [Best Practices](#best-practices)
- [Debugging](#debugging)

## What are Skills

Agent Skills package reusable expertise into discoverable capabilities. Each Skill consists of:
- `SKILL.md` - Instructions Claude reads when the Skill becomes relevant
- Optional supporting files - Scripts, templates, reference docs

**Discovery**: Skills are **model-invoked**. Claude autonomously decides when to use them based on your request and the Skill's description. This differs from slash commands, which are **user-invoked**.

**Benefits**:
- Extend Claude's capabilities for specific workflows
- Share expertise across teams via git
- Reduce repetitive prompting
- Compose multiple Skills for complex tasks

## Create a Skill

Skills are stored as directories containing a `SKILL.md` file.

### Personal Skills

Available across all projects. Store in `~/.claude/skills/`:

```bash
mkdir -p ~/.claude/skills/my-skill-name
```

Use for: Individual workflows, experimental Skills, personal productivity tools.

### Project Skills

Shared with your team. Store in `.claude/skills/` within your project:

```bash
mkdir -p .claude/skills/my-skill-name
```

Use for: Team workflows, project-specific expertise, shared utilities.

Project Skills are checked into git and automatically available to team members.

### Plugin Skills

Skills bundled with Claude Code plugins are automatically available when the plugin is installed.

## Write SKILL.md

Create a `SKILL.md` file with YAML frontmatter and Markdown content:

```yaml
---
name: Your Skill Name
description: Brief description of what this Skill does and when to use it
---

# Your Skill Name

## Instructions
Provide clear, step-by-step guidance for Claude.

## Examples
Show concrete examples of using this Skill.
```

### Frontmatter fields

- `name` - Human-readable name (64 characters max)
- `description` - What it does + when to use it (1024 characters max)
- `allowed-tools` (optional) - Restrict which tools Claude can use

### The description field is critical

Claude uses the description when deciding whether to activate your Skill. Include:

1. **What it does** - Concrete capabilities
2. **When to use** - Specific triggers and contexts

**Good example**:
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents.
Use when working with PDF files or when the user mentions PDFs, forms, or extraction.
```

**Bad example**:
```yaml
description: Helps with documents
```

### Naming conventions

Use **gerund form** (verb + -ing) for clarity:
- "Processing PDFs"
- "Analyzing spreadsheets"
- "Managing databases"
- "Testing code"
- "Writing documentation"

## Structure & Organization

### Simple Skill (single file)

For focused capabilities:

```
commit-helper/
└── SKILL.md
```

### Skill with supporting files

Reference files only load when needed:

```
pdf-processing/
├── SKILL.md              # Main instructions
├── FORMS.md              # Form-filling guide
├── REFERENCE.md          # API reference
├── EXAMPLES.md           # Usage examples
└── scripts/
    ├── analyze_form.py
    ├── fill_form.py
    └── validate.py
```

### Organization patterns

**Pattern 1: High-level guide with references**

SKILL.md provides quick start, links to detailed files:

```markdown
# PDF Processing

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

**Pattern 2: Domain-specific organization**

For Skills with multiple domains, organize by domain:

```
bigquery-skill/
├── SKILL.md
└── reference/
    ├── finance.md (revenue, billing)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (API usage)
    └── marketing.md (campaigns)
```

SKILL.md acts as router:

```markdown
# BigQuery Analysis

## Available datasets

**Finance** → See [reference/finance.md](reference/finance.md)
**Sales** → See [reference/sales.md](reference/sales.md)
**Product** → See [reference/product.md](reference/product.md)
**Marketing** → See [reference/marketing.md](reference/marketing.md)
```

### Keep content under 500 lines

Longer Skill.md files impact performance. Split into supporting files if approaching this limit.

### Progressive disclosure

Include table of contents in files over 100 lines so Claude can see full scope even with partial reads.

## Best Practices

### Assume Claude is smart

Don't explain basic concepts. Use the conciseness principle from [agent-doc.md](agent-doc.md):

**Verbose** (~150 tokens):
```
PDF files are a common format containing text, images, and other content.
To extract text, you need a library. Many libraries exist for PDF processing,
but we recommend pdfplumber because it's easy to use and handles most cases...
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

### Match specificity to task fragility

**High freedom** (text guidance): Multiple approaches valid, context determines best path.
```markdown
## Code review process
1. Analyze code structure and organization
2. Check for potential bugs and edge cases
3. Suggest improvements for readability
4. Verify adherence to project conventions
```

**Low freedom** (specific steps): Exact sequence required, operations fragile.
```markdown
## Database migration

Run exactly this script:
```bash
python scripts/migrate.py --verify --backup
```

Do not modify the command or add additional flags.
```

### Use workflows with checklists

For complex, multi-step operations:

```markdown
## PDF form filling workflow

```
Task Progress:
- [ ] Step 1: Analyze form (run analyze_form.py)
- [ ] Step 2: Create field mapping (edit fields.json)
- [ ] Step 3: Validate mapping (run validate_fields.py)
- [ ] Step 4: Fill the form (run fill_form.py)
- [ ] Step 5: Verify output (run verify_output.py)
```

**Step 1: Analyze the form**

Run: `python scripts/analyze_form.py input.pdf`

This extracts form fields, saving to `fields.json`.
```

### Implement validation loops

For quality-critical tasks:

```markdown
## Document editing process

1. Make your edits to `word/document.xml`
2. **Validate immediately**: `python scripts/validate.py unpacked_dir/`
3. If validation fails:
   - Review the error message
   - Fix the issues
   - Run validation again
4. **Only proceed when validation passes**
5. Rebuild: `python scripts/pack.py unpacked_dir/ output.docx`
```

### Use examples over explanations

Provide input/output pairs:

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

### Provide utility scripts

Pre-made scripts are more reliable than generated code and save tokens:

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

**fill_form.py**: Apply field values to PDF
```bash
python scripts/fill_form.py input.pdf fields.json output.pdf
```
```

### List required packages

Specify dependencies so Claude knows what to install:

```markdown
## Requirements

Packages must be installed in your environment:
```bash
pip install pypdf pdfplumber
```
```

### Restrict tool access (optional)

Use `allowed-tools` to limit tool access:

```yaml
---
name: Safe File Reader
description: Read files without making changes. Use when you need read-only file access.
allowed-tools: Read, Grep, Glob
---
```

When specified, Claude can only use those tools without asking for permission.

### Avoid Windows-style paths

Always use forward slashes:
- ✓ Good: `scripts/helper.py`
- ✗ Wrong: `scripts\helper.py`

## Testing & Debugging

### Test the Skill

Ask Claude questions matching your description:

```
Can you help me extract text from this PDF?
```

Claude autonomously activates your Skill if it matches the request.

### Debug: Make descriptions specific

**Too vague**:
```yaml
description: Helps with documents
```

**Specific**:
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents.
Use when working with PDF files or when the user mentions PDFs, forms, or extraction.
```

### Debug: Verify file paths

**Personal Skills**: `~/.claude/skills/skill-name/SKILL.md`
**Project Skills**: `.claude/skills/skill-name/SKILL.md`

Verify with:
```bash
# Personal
ls ~/.claude/skills/my-skill/SKILL.md

# Project
ls .claude/skills/my-skill/SKILL.md
```

### Debug: Check YAML syntax

Invalid YAML prevents loading. Verify:
```bash
cat SKILL.md | head -n 10
```

Ensure:
- Opening `---` on line 1
- Closing `---` before content
- Valid YAML syntax (no tabs, correct indentation)

### Debug: Multiple Skills conflict

Use distinct trigger terms in descriptions:

**Instead of**:
```yaml
# Skill 1
description: For data analysis

# Skill 2
description: For analyzing data
```

**Use**:
```yaml
# Skill 1
description: Analyze sales data in Excel files and CRM exports.
Use for sales reports, pipeline analysis, and revenue tracking.

# Skill 2
description: Analyze log files and system metrics data.
Use for performance monitoring, debugging, and system diagnostics.
```

## Share Skills

### With your team via git

1. Add Skill to your project:
```bash
mkdir -p .claude/skills/team-skill
# Create SKILL.md
```

2. Commit to git:
```bash
git add .claude/skills/
git commit -m "Add team Skill for PDF processing"
git push
```

3. Team members pull and Skills are immediately available:
```bash
git pull
claude  # Skills now available
```

### Via plugins (recommended for distribution)

For details, see the Claude Code documentation on adding Skills to plugins.

## Next Steps

- Refer to [agent-doc.md](agent-doc.md) for general LLM documentation principles
- Start with a focused Skill solving one specific problem
- Test with your team and iterate based on usage
- Build evaluations before writing extensive documentation
