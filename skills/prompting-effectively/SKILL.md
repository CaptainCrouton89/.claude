---
name: Writing Effective Prompts
description: Structure Claude prompts for clarity and better results using roles, explicit instructions, context, positive framing, and strategic organization. Use when crafting prompts for complex tasks, long documents, tool workflows, or code generation.
---

# Writing Effective Prompts

## Core Principles

### 1. Start with a Role

Set behavioral context upfront:

```
You are an expert software test engineer. Help me write comprehensive unit tests covering edge cases and error conditions.
```

### 2. Be Explicit with Instructions

Replace vague requests with specific requirements:

```
Create a dashboard with:
- Real-time data visualization
- Interactive filtering and drill-down
- Responsive design (mobile + desktop)
- Export functionality for reports
Include as many relevant features as possible.
```

### 3. Add Context and Motivation

Explain **why** to help Claude generalize:

```
Your response will be read aloud via text-to-speech, so avoid ellipses (TTS engines cannot pronounce them). Use complete sentences instead.
```

### 4. Use Positive Framing

Tell what TO do, not what NOT to do:

```
Format your response as plain text with clear paragraph breaks.
```

### 5. Provide Aligned Examples

Examples powerfully shape output. Use `<example>` tags:

```
<example>
Input: "Added JWT authentication"
Output:
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware.
</example>
```

## Structural Techniques

### XML Tags for Complex Output

Structure multi-section responses clearly:

```
<code_quality>
Assess overall code quality and patterns
</code_quality>

<security_review>
Review security concerns step-by-step
</security_review>

<optimization_suggestions>
List specific performance improvements
</optimization_suggestions>
```

### Chain Complex Tasks

Break multi-step processes into explicit phases:

```
Phase 1: Research and Analysis
- Examine existing codebase structure
- Identify patterns and conventions

Phase 2: Design and Planning
- Create architectural design
- Define interfaces and data flow

Phase 3: Implementation
- Build core functionality
- Add error handling
- Implement tests
```

## Long Context Best Practices

### Document Placement

Put large documents (~20K+ tokens) **at the top**, queries at the **end**:

```
[20,000 tokens of annual report]
[15,000 tokens of competitor analysis]

Analyze above. Identify strategic advantages and Q3 focus areas.
```

Improves response quality by up to 30% for complex multi-document inputs.

### Organize Multiple Documents with XML

```
<documents>
  <document>
    <source>annual_report_2023.pdf</source>
    <document_content>
      [CONTENT]
    </document_content>
  </document>
  <document>
    <source>competitor_analysis.xlsx</source>
    <document_content>
      [CONTENT]
    </document_content>
  </document>
</documents>

Provide comprehensive market position analysis with specific recommendations.
```

### Ground Responses in Quotes

For accuracy in long document analysis:

```
1. Extract relevant quotes from documents (use <relevant_quotes> tags)
2. Based on quotes, provide analysis (use <analysis> tags)
3. List recommendations (use <recommendations> tags)
```

## Tool Usage Strategy

### Define Tool Purposes

```
You have access to file and search tools. When working with multiple files:

- Execute independent operations in parallel
- Prefer batch operations over sequential processing
- Verify changes before finalizing
- Clean up temporary artifacts when complete
```

### Encourage Parallelization

Request simultaneous execution for efficiency.

## Output Quality Enhancements

### Basic Quality Modifier

```
Create an analytics dashboard.
```

### Enhanced Quality Modifier

```
Create an analytics dashboard. Include as many relevant features and interactions as possible. Go beyond basics to create a fully-featured implementation.
```

### Code Generation Guidance

For frontend code:
- "Add thoughtful details like hover states, transitions, and micro-interactions"
- "Apply design principles: hierarchy, contrast, balance, and movement"

For general solutions:
```
Please write a high quality, general purpose solution. Implement logic that works for all valid inputs, not just test cases. Don't hard-code values. Provide a principled, maintainable implementation following best practices.
```

## Best Practices Checklist

### ✅ Do

- Start with clear role definition
- Provide explicit, specific instructions
- Use positive framing (what TO do)
- Add context explaining why behaviors matter
- Include aligned examples showing exact desired output
- Leverage XML tags for complex structures
- Request parallel execution when possible
- Break complex tasks into clear phases
- Match prompt style to desired output format

### ❌ Avoid

- Negative instructions ("Don't do X")
- Vague requirements with implicit expectations
- Examples contradicting instructions
- Sequential operations when parallel works
- Test-focused hard-coding for specific cases
- Assuming tool/library availability
- Instructions without explanation
- Overly complex prompts when simple ones work

## Key Success Factors

1. **Role Definition** — Clear identity and expertise
2. **Explicit Instructions** — Specific, actionable directives
3. **Contextual Reasoning** — Explain why behaviors matter
4. **Example Alignment** — Show exact desired output
5. **Structural Clarity** — Use XML tags and organized format
6. **Quality Modifiers** — Use "Include as many features as possible" and "Give it your all"
7. **Tool Strategy** — Specify when/how to use tools and encourage parallelization
8. **Iterative Refinement** — Test and improve prompts based on results
