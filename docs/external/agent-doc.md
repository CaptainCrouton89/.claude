# Writing Documentation for LLMs

> Guidance for creating effective documentation and instructions that LLMs can discover, understand, and use successfully.

## Contents

- [Core Principles](#core-principles)
- [Structure](#structure)
- [Content Patterns](#content-patterns)
- [Anti-patterns](#anti-patterns)

## Core Principles

### Assume competence

The LLM is already very smart. Only add information the LLM doesn't have. Challenge every piece:

- "Does the LLM really need this explanation?"
- "Can I assume the LLM knows this?"
- "Does this justify its token cost?"

**Verbose example** (~150 tokens):
```
PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing...
```

**Concise example** (~50 tokens):
```
Use pdfplumber for text extraction:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

### Match specificity to task fragility

**Narrow instructions** (low freedom) when:
- Operations are error-prone or destructive
- Consistency is critical
- Exact sequence required
- Example: database migrations

**General guidance** (high freedom) when:
- Multiple approaches are valid
- Context determines best path
- Heuristics guide the approach
- Example: code reviews

### Test across models

Effectiveness depends on the model. Skills that work for Claude Opus may need more detail for Claude Haiku. Test with the models you plan to use.

## Structure

### Progressive disclosure

Organize content like a table of contents. Main file provides overview and points to detailed materials—the LLM reads additional files only when needed.

**Pattern**:
- Main file: high-level guide with references
- Reference files: one per domain or topic
- Keep main file under 500 lines
- Keep references one level deep (avoid nested references)

**Example structure**:
```
my-doc/
├── OVERVIEW.md           # High-level guide
├── reference/
│   ├── api.md           # Specific reference
│   ├── examples.md      # Usage examples
│   └── troubleshooting.md
└── scripts/
    └── helper.py        # Executable utilities
```

### Table of contents

For any file over 100 lines, include a table of contents at the top. This ensures the LLM can see the full scope even with partial reads.

```markdown
## Contents
- Authentication and setup
- Core methods (create, read, update, delete)
- Advanced features
- Error handling patterns
```

### Consistent terminology

Choose one term and use it throughout:

**Good** - consistent:
- Always "API endpoint" (not "URL", "route", "path")
- Always "field" (not "box", "element", "control")
- Always "extract" (not "pull", "get", "retrieve")

## Content Patterns

### Descriptions: what + when

The description field enables discovery. Include:
1. **What it does**: The concrete capability
2. **When to use it**: Specific triggers and contexts

**Good example**:
```
Extract text and tables from PDF files, fill forms, merge documents.
Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Bad example**:
```
Helps with documents
```

### Examples over explanations

Show concrete input/output examples before abstract descriptions:

```markdown
## Generating commit messages

Follow these examples:

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

### Workflows with clear steps

Break complex operations into sequential steps. For complex workflows, provide a checklist:

```markdown
## Database migration workflow

```
Task Progress:
- [ ] Step 1: Create backup
- [ ] Step 2: Run migration script
- [ ] Step 3: Verify schema
- [ ] Step 4: Validate data integrity
```

**Step 1: Create backup**
...
```

### Feedback loops

Use validator patterns for quality-critical tasks:

```markdown
## Document editing process

1. Make your edits
2. **Validate**: Run `validate.py`
3. If validation fails:
   - Review errors
   - Fix issues
   - Run validation again
4. **Only proceed when validation passes**
5. Finalize output
```

### Avoid time-sensitive information

Use "old patterns" sections for deprecated approaches:

```markdown
## Current method

Use the v2 API endpoint: `api.example.com/v2/messages`

## Old patterns

<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>
The v1 API used: `api.example.com/v1/messages`
</details>
```

### Conditional workflows

Guide the LLM through decision points:

```markdown
## Modification workflow

1. Determine the modification type:
   **Creating new content?** → Follow "Creation workflow"
   **Editing existing content?** → Follow "Editing workflow"

2. Creation workflow:
   - Use library X
   - Build from scratch
   - Export format Y

3. Editing workflow:
   - Unpack existing file
   - Modify content
   - Repack when complete
```

### Verifiable intermediate outputs

For complex tasks, create verifiable intermediate formats:

```markdown
## Batch update workflow

1. Create plan file (JSON format)
2. **Validate plan**: Run `validate_plan.py`
3. If validation passes, execute
4. Verify output matches plan
```

## Anti-patterns

### Too many options

Don't present multiple approaches unless necessary:

**Bad**:
```
You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image, or...
```

**Good**:
```
Use pdfplumber for text extraction:
```python
import pdfplumber
```

For scanned PDFs requiring OCR, use pdf2image with pytesseract.
```

### Deeply nested references

Keep references one level deep from the main file. Nested references (file A → file B → file C) cause partial reads.

**Bad**:
```
# MAIN.md
See advanced.md...

# advanced.md
See details.md...

# details.md
Here's the actual information...
```

**Good**:
```
# MAIN.md
**Basic**: [in MAIN.md]
**Advanced**: See advanced.md
**Reference**: See reference.md
**Examples**: See examples.md
```

### Vague trigger terms

Help discovery with specific language:

**Vague**:
```
description: Helps with data
```

**Specific**:
```
description: Analyze Excel spreadsheets, generate pivot tables, create charts.
Use when working with Excel files, spreadsheets, or .xlsx files.
```

### Windows-style paths

Always use forward slashes (Unix style):
- ✓ Good: `scripts/helper.py`
- ✗ Wrong: `scripts\helper.py`

## Testing & Iteration

### Create evaluations first

Before writing extensive documentation, test real scenarios:
1. Identify gaps with the LLM working without docs
2. Create 3+ representative test cases
3. Establish baseline performance
4. Write minimal docs to address gaps
5. Test and iterate based on results

### Develop iteratively with Claude

1. Complete a task with Claude without docs
2. Identify the reusable pattern
3. Ask Claude to create docs capturing that pattern
4. Review for conciseness ("Remove explanation about X—Claude already knows that")
5. Test docs with a fresh instance on similar tasks
6. Iterate based on observations
