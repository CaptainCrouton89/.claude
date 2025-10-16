---
name: Writing Documentation for LLMs
description: Create effective documentation that LLMs can discover and use. Use when documenting code, APIs, features, or creating reference materials. Covers structure, conciseness, examples, and anti-patterns for optimal LLM comprehension.
---

# Writing Documentation for LLMs

## When to Use

- Creating documentation, guides, or reference materials
- Writing API docs, feature specs, or knowledge bases
- Structuring information for LLM discovery
- Evaluating documentation quality and comprehensiveness

## Core Principles

### Assume Competence
LLMs already know fundamentals. Only add information they don't have. Every section should justify its token cost.

**Verbose** (~150 tokens):
```
PDF (Portable Document Format) files are a common file format that contains text, images, and other content. To extract text from a PDF, you'll need to use a library. There are many libraries available for PDF processing...
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

### Match Specificity to Task Fragility

**Narrow instructions** (low freedom) when:
- Operations are error-prone or destructive
- Consistency is critical
- Exact sequence required

**General guidance** (high freedom) when:
- Multiple approaches are valid
- Context determines best path
- Heuristics guide the approach

## Structure Best Practices

### Progressive Disclosure
Organize like a table of contents. Main file provides overview; detailed materials referenced only when needed.

- Main file: high-level guide with references (<500 lines)
- Reference files: one per domain/topic
- Avoid nested references (file A → B → C)

### Table of Contents
For files >100 lines, include TOC so LLMs see full scope even with partial reads.

### Consistent Terminology
Choose one term and use it throughout:
- Always "API endpoint" (not "URL", "route", "path")
- Always "field" (not "box", "element")
- Always "extract" (not "pull", "get")

## Content Patterns

### Descriptions: What + When
Enable discovery with concrete capability + context:

**Good**: "Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when user mentions PDFs, forms, or document extraction."

**Bad**: "Helps with documents"

### Examples Over Explanations
Show concrete input/output examples before abstract descriptions.

### Workflows with Clear Steps
Break complex operations into sequential steps. Use checklists for complex workflows.

### Feedback Loops
Use validator patterns for quality-critical tasks:
1. Make edits
2. **Validate** — Run validation
3. If validation fails — Review, fix, retry
4. **Only proceed when validation passes**

## Anti-patterns to Avoid

- **Too many options**: Present single recommended approach, alternatives only if necessary
- **Deeply nested references**: Keep one level deep from main file
- **Vague terminology**: Use specific, discoverable language
- **Windows-style paths**: Always use forward slashes (e.g., `scripts/helper.py`)
- **Time-sensitive information**: Use "Old patterns" sections with details collapsed
