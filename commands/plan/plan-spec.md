Given the following spec: $ARGUMENTS, please research all the changes necessary to make the plan. Make sure to think through all edge cases, and to thoroughly investigate existing design patterns to avoid duplicate code and conflicting patterns.

In order to plan, create a /plans/[spec-name] directory. For each high-level feature in the spec, a different markdown doc should be created, with research explicitly for that feature.

Begin by research high-level information that will be relevant to all the features. Document this in /plans/[spec-name]/shared.md. This file should name relevant files and high-level patterns, using the following format:

```
# Title
[3-4 sentence, information-dense breakdown]

## Relevant Files
- [/src/path]
- [/more/paths]

## Patterns
- Existing service for [feature], needs extending, etc.
- Reuse these ui components
- Other info
```

Then, make a parallel task with a subagent for creating any additional research docs in /plans/[spec-name], each named /plans/[spec-name]/[topic].research.md. It should document any relevant information for that particular topic. It should name specific relevant files at the top, patterns, and gotchas and edge-cases for implementation. Each agent should be run in parallel, and the shared.md file should be passed to each one.