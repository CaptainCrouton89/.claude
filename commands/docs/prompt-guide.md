Here is a general guide on how to write good system prompts:

# Claude Prompting Guide

## Prerequisites

Before engineering prompts:
1. Define clear success criteria for your use case
2. Establish empirical testing methods
3. Create a first draft prompt

Use the prompt generator in Anthropic Console for initial drafts.

## Core Principles

### Instruction Fundamentals
- **Be explicit** - specify desired outputs clearly and precisely
- **Add context** - explain why behaviors matter to improve targeting
- **Use positive framing** - tell what TO do instead of what NOT to do
- **Provide examples** - ensure examples align with desired behaviors
- **Match style** - align prompt formatting with desired output format

## Technique Hierarchy

Apply techniques in this order for troubleshooting:

### 1. Be Clear and Direct
Foundation principle - explicit, specific instructions.

### 2. Use Examples (Multishot)
Demonstrate patterns through examples that align with desired behaviors.

### 3. Let Claude Think (Chain of Thought)
Enable reasoning with thinking capabilities:
```
After receiving tool results, carefully reflect on their quality and determine optimal next steps before proceeding. Use your thinking to plan and iterate based on this new information, then take the best next action.
```

### 4. Use XML Tags
Structure responses with format indicators:
```
Write the prose sections of your response in <smoothly_flowing_prose_paragraphs> tags.
```

### 5. Give Claude a Role (System Prompts)
Set context and behavioral expectations.

### 6. Prefill Claude's Response
Steer output direction by starting the response.

### 7. Chain Complex Prompts
Break down multi-step processes.

### 8. Long Context Tips
Handle extended inputs effectively.

## Format Control Strategies

### 1. Positive Framing
- **Instead of:** "Do not use markdown in your response"
- **Try:** "Your response should be composed of smoothly flowing prose paragraphs"

### 2. XML Format Indicators
Use tags to structure output: `<response_section>content</response_section>`

### 3. Style Matching
Match prompt formatting style to desired output style.

## Advanced Capabilities

### Thinking & Interleaved Thinking
Claude 4 offers reflection capabilities for:
- Complex multi-step reasoning
- Post-tool-use analysis
- Planning and iteration

### Parallel Tool Execution
Optimize with this prompt:
```
For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.
```
Success rate: ~100% with proper prompting.

### Temporary File Management
Claude 4 uses files as iteration scratchpads. To minimize file creation:
```
If you create any temporary new files, scripts, or helper files for iteration, clean up these files by removing them at the end of the task.
```

## Specialized Use Cases

### Frontend Code Generation
Encourage detailed, interactive designs:
```
Don't hold back. Give it your all.
```

Additional modifiers:
- "Include as many relevant features and interactions as possible"
- "Add thoughtful details like hover states, transitions, and micro-interactions"
- "Create an impressive demonstration showcasing web development capabilities"
- "Apply design principles: hierarchy, contrast, balance, and movement"

### General Solution Development
Prevent test-focused hard-coding:
```
Please write a high quality, general purpose solution. Implement a solution that works correctly for all valid inputs, not just the test cases. Do not hard-code values or create solutions that only work for specific test inputs. Instead, implement the actual logic that solves the problem generally.

Focus on understanding the problem requirements and implementing the correct algorithm. Tests are there to verify correctness, not to define the solution. Provide a principled implementation that follows best practices and software design principles.

If the task is unreasonable or infeasible, or if any of the tests are incorrect, please tell me. The solution should be robust, maintainable, and extendable.
```

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

## Performance Optimization Prompts

### Parallel Tool Usage
```
For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.
```

### Creative Enhancement
```
Don't hold back. Give it your all.
```

### Quality Focus
```
Please write a high quality, general purpose solution. Implement a solution that works correctly for all valid inputs, not just the test cases.
```

### Cleanup Management
```
If you create any temporary new files, scripts, or helper files for iteration, clean up these files by removing them at the end of the task.
```

## System Prompt Example

Effective system prompt structure (concise, role-focused, actionable):

```
You are an interactive CLI tool for Silas that helps him with software engineering tasks. Use the instructions below and the tools available to you to assist him.

# Code Conventions and Style Guide

## Proactiveness
You are allowed to be proactive, but only when the user asks you to do something. Strike a balance between:
1. Doing the right thing when asked, including follow-up actions
2. Not surprising the user with actions you take without asking

## Following conventions
When making changes to files, first understand the file's code conventions. Mimic code style, use existing libraries and utilities, and follow existing patterns.
- Search for existing types before defining new ones
- NEVER assume libraries are available - check the codebase first
- Look at existing components to understand framework choice and conventions

## Code style
- **IMPORTANT:** DO NOT ADD ANY COMMENTS
- **NO DEFENSIVE NULL CHECKING**: Throw errors instead of fallbacks
- **FAIL FAST**: Let null/undefined errors bubble up
- **NO `any`**: Use globally defined types only

## Tone and Style Guidelines
Be concise, direct, and to the point. Keep responses under 4 lines unless detail requested. Answer directly without preamble or explanations.
```

## Best Practices Summary

### Do
- Provide explicit instructions with context
- Use positive framing (tell what TO do)
- Match prompt style to desired output
- Leverage thinking capabilities for complex tasks
- Request parallel tool execution for efficiency
- Add quality modifiers for enhanced results

### Avoid
- Negative instructions (what NOT to do)
- Vague or implicit requirements
- Relying on "above and beyond" behavior without explicit requests
- Test-focused solutions that don't generalize
- Sequential tool use when parallel execution is possible

### Key Success Factors
1. **Clarity** - explicit, specific instructions
2. **Context** - motivation and reasoning
3. **Examples** - aligned demonstrations
4. **Structure** - XML tags and formatting
5. **Testing** - empirical evaluation methods

---

$ARGUMENTS