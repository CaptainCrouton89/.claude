# Claude Prompting Guide

## General Principles

### 1. Start with a Role

Always begin by giving Claude a clear role and context. This sets expectations and behavioral patterns.

<example>
<less_effective>
Help me write unit tests for this function.
</less_effective>

<more_effective>
You are an expert software test engineer specializing in comprehensive test coverage. Help me write unit tests for this function that cover edge cases, error conditions, and typical usage patterns.
</more_effective>
</example>

### 2. Be Explicit with Instructions

Claude 4 models respond best to clear, specific instructions rather than implicit expectations.

<example>
<less_effective>
Create an analytics dashboard.
</less_effective>

<more_effective>
Create a comprehensive analytics dashboard with:

- Real-time data visualization
- Interactive filtering and drill-down capabilities
- Responsive design for mobile and desktop
- Export functionality for reports
  Include as many relevant features as possible to create a production-ready implementation.
  </more_effective>
  </example>

### 3. Add Context and Motivation

Explain WHY certain behaviors matter - Claude can generalize from explanations.

<example>
<less_effective>
NEVER use ellipses in your response.
</less_effective>

<more_effective>
Your response will be read aloud by a text-to-speech engine, so avoid ellipses since TTS engines cannot pronounce them correctly. Use complete sentences instead.
</more_effective>
</example>

### 4. Use Positive Framing

Tell Claude what TO do rather than what NOT to do.

<example>
<less_effective>
Don't use markdown formatting.
</less_effective>

<more_effective>
Format your response as plain text with clear paragraph breaks.
</more_effective>
</example>

### 5. Provide Aligned Examples

Examples powerfully shape behavior - ensure they demonstrate exactly what you want. Wrap your examples with xml example tags.

## Advanced Techniques

### Use XML Tags for Structure

XML tags provide clear boundaries and structure for complex outputs:

<example_prompt>
Analyze this code and provide your response in the following format:

<code_quality>
Assess the overall code quality, patterns, and architecture
</code_quality>

<security_review>
When performing security review, follow these steps:

1. Details...
2. Details...

</security_review>

<optimization_suggestions>
List specific performance improvements
</optimization_suggestions>

<refactoring_recommendations>
Suggest refactoring opportunities with code examples
</refactoring_recommendations>
</example_prompt>

You can combine markdown and xml. XML is useful for grouping major sections or large chunks of context together, and markdown is good for emphasis within those sections.

### Chain Complex Tasks

Break multi-step processes into clear phases:

<example>
Phase 1: Research and Analysis
- Examine the existing codebase structure
- Identify current patterns and conventions
- Document dependencies and constraints

Phase 2: Design and Planning

- Create architectural design based on findings
- Define interfaces and data flow
- Plan implementation sequence

Phase 3: Implementation

- Build core functionality first
- Add error handling and validation
- Implement tests alongside code
  </example>

## Long Context Best Practices

Claude's 200K token context window enables handling complex, data-rich tasks. Follow these essential strategies:

### 1. Document Placement Strategy

**Put longform data at the top** - Place documents and large inputs (~20K+ tokens) near the beginning of your prompt, with queries and instructions at the end.

<example>
<less_effective>
Analyze these reports and identify Q3 priorities:
[20,000 tokens of annual report]
[15,000 tokens of competitor analysis]
</less_effective>

<more_effective>
[20,000 tokens of annual report]
[15,000 tokens of competitor analysis]

Analyze the annual report and competitor analysis above. Identify strategic advantages and recommend Q3 focus areas.
</more_effective>
</example>

Placing queries at the end can improve response quality by up to 30%, especially with complex multi-document inputs.

### 2. Structure with XML Tags

Organize multiple documents with clear metadata and boundaries:

<example>

<documents>
  <document>
    <source>annual_report_2023.pdf</source>
    <document_content>
      {{ANNUAL_REPORT_CONTENT}}
    </document_content>
  </document>
  <document>
    <source>competitor_analysis_q2.xlsx</source>
    <document_content>
      {{COMPETITOR_ANALYSIS_DATA}}
    </document_content>
  </document>
  <document>
    <source>market_research_findings.docx</source>
    <document_content>
      {{MARKET_RESEARCH_TEXT}}
    </document_content>
  </document>
</documents>

Based on the documents above, provide a comprehensive market position analysis with specific recommendations.
</example>

### 3. Ground Responses in Quotes

For accuracy in long document tasks, request relevant quotes before analysis:

<example>
You are analyzing patient medical records to assist with diagnosis.

<documents>
  <document index="1">
    <source>patient_symptoms.txt</source>
    <document_content>
      {{PATIENT_SYMPTOMS}}
    </document_content>
  </document>
  <document index="2">
    <source>medical_history.txt</source>
    <document_content>
      {{MEDICAL_HISTORY}}
    </document_content>
  </document>
  <document index="3">
    <source>lab_results.pdf</source>
    <document_content>
      {{LAB_RESULTS}}
    </document_content>
  </document>
</documents>

Instructions:

1. First, extract relevant quotes from the documents that relate to the current symptoms. Place these in <relevant_quotes> tags.
2. Based on these quotes, provide your diagnostic assessment in <diagnosis> tags.
3. List recommended next steps in <recommendations> tags.
   </example>

### 4. Long Context Tips Summary

<long_context_checklist>
✅ **Document Order**

- Large documents at the top
- Instructions and queries at the end
- Examples after documents but before final query

✅ **Organization**

- Use XML tags for document boundaries
- Include metadata (source, date, type)
- Number or index multiple documents

✅ **Accuracy Techniques**

- Request quote extraction first
- Ask for citations with responses
- Use step-by-step processing for complex analysis

✅ **Performance Optimization**

- Combine related documents when possible
- Remove irrelevant sections if known
- Use clear section markers within documents

</long_context_checklist>

## Tool Usage in Prompts

### Explaining Tool Capabilities

When Claude has access to tools, provide clear guidance on when and how to use them:

- **Define tool purposes** - Explain what each tool category is for
- **Specify preferences** - Indicate which tools to prefer in different situations
- **Encourage parallelization** - Request simultaneous execution when possible
- **Set boundaries** - Clarify which tools require approval vs automatic use

### Example Tool Instructions

<example>
<less_effective>
You have access to various tools. Use them as needed.
</less_effective>

<more_effective>
You have access to file manipulation and search tools. When working with multiple files:

- Execute independent operations in parallel for efficiency
- Prefer batch operations over sequential processing
- Verify changes before finalizing
- Clean up temporary artifacts when complete
  </more_effective>
  </example>

### Structuring Tool Workflows

<example>
When defining multi-step processes that involve tools:

<workflow>
  1. Use search and analysis tools to understand the problem space
  2. Create a structured plan based on findings
  3. Implement the solution using appropriate tools
  4. Validate results and clean up any temporary artifacts
</workflow>

</example>

### Enhance Output Quality

For comprehensive implementations:

Don't hold back. Give it your all. Include as many relevant features and interactions as possible.

For robust solutions:

Please write a high quality, general purpose solution. Implement a solution that works correctly for all valid inputs, not just the test cases. Focus on understanding the problem requirements and implementing the correct algorithm.

## Specialized Use Cases

### Frontend Code Generation

Encourage detailed, interactive designs:

Don't hold back. Give it your all.

Additional modifiers:

- "Include as many relevant features and interactions as possible"
- "Add thoughtful details like hover states, transitions, and micro-interactions"
- "Create an impressive demonstration showcasing web development capabilities"
- "Apply design principles: hierarchy, contrast, balance, and movement"

### General Solution Development

Prevent test-focused hard-coding:

Please write a high quality, general purpose solution. Implement a solution that works correctly for all valid inputs, not just the test cases. Do not hard-code values or create solutions that only work for specific test inputs. Instead, implement the actual logic that solves the problem generally.

Focus on understanding the problem requirements and implementing the correct algorithm. Tests are there to verify correctness, not to define the solution. Provide a principled implementation that follows best practices and software design principles.

If the task is unreasonable or infeasible, or if any of the tests are incorrect, please tell me. The solution should be robust, maintainable, and extendable.

## Output Enhancement Techniques

### Quality Modifiers

Add encouraging language to boost output quality:

- **Basic:** "Create an analytics dashboard"
- **Enhanced:** "Create an analytics dashboard. Include as many relevant features and interactions as possible. Go beyond the basics to create a fully-featured implementation."

### Explicit Feature Requests

- Request animations and interactions explicitly when desired
- Specify exact behaviors rather than assuming Claude will infer them
- Describe expected output formats in detail
- Include quality expectations in instructions

## System Prompt Best Practices

An effective system prompt should:

1. **Start with a clear role**
2. **Use XML tags for organization**
3. **Include specific dos and don'ts**
4. **Provide examples where helpful**
5. **Set clear behavioral expectations**

## Best Practices Summary

### ✅ Do

<best_practices>

- **Start with a role** - Define Claude's expertise and perspective
- **Provide explicit instructions** - Be specific about desired outputs
- **Use positive framing** - Tell what TO do, not what NOT to do
- **Add context and motivation** - Explain why behaviors matter
- **Include aligned examples** - Show exactly what you want
- **Leverage XML tags** - Structure complex outputs clearly
- **Request parallel execution** - Maximize efficiency with concurrent operations
- **Match prompt style** - Align formatting with desired output
- **Chain complex tasks** - Break down into clear phases
- **Use thinking capabilities** - For complex reasoning and planning
  </best_practices>

### ❌ Avoid

<common_mistakes>

- **Negative instructions** - "Don't do X" is less effective than "Do Y"
- **Vague requirements** - Implicit expectations lead to varied results
- **Misaligned examples** - Examples that contradict instructions
- **Sequential operations** - When parallel execution is possible
- **Test-focused coding** - Hard-coding for specific test cases
- **Assuming capabilities** - Not checking library/tool availability
- **Missing context** - Instructions without explanation
- **Overly complex prompts** - When simple, direct prompts work better

 </common_mistakes>

### 🔑 Key Success Factors

<success_factors>

1. **Role Definition** - Clear identity and expertise
2. **Explicit Instructions** - Specific, actionable directives
3. **Contextual Reasoning** - Why behaviors matter
4. **Example Alignment** - Demonstrations match expectations
5. **Structural Clarity** - XML tags and organized format
6. **Iterative Refinement** - Test and improve prompts
7. **Tool Optimization** - Strategic parallel execution
8. **Quality Modifiers** - "Give it your all" for enhanced output
  
</success_factors>