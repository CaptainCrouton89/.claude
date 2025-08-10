For this task, make a `/plans/[plan-dir]/shared.md` document, containing high level information on files and architectures relevant to the new feature described.

First, if it does not exist yet, create a `/plans/[feature-name] directory. If it exists already, read every file within /plans/[feature-name]/.

The shared.md should name relevant files, tables, patterns, and docs, each with a brief description, using the following format:

```
# Title
[3-4 sentence breakdown of how the architecture fits together]

## Relevant Files
- /src/path: very brief description
- /more/paths: very brief description

## Relevant Tables
- Relevant table

## Relevant Patterns
**Patern name**: 1 setence, information dense description, link to example file if possible

## Relevant Docs
**file/path/of/doc**: You _must_ read this when working on [list of topics].
```

If, after reading the other files in /plans/[feature-name], you do not have enough information to build this document, use codebase-research-analyst agents in parallel to research the different aspects of the document.

Each research agent should investigate an aspect of the codebase, and write their findings to `/plans/[feature-name]/[research-topic].docs.md`

Upon finishing, read all of their finished research reports and write the shared.md file.

1. List /plans/[feature-name]
2. Read every file within it
3. Create your todo list
4. Launch _parallel agents_ to perform any necessary research (multiple agents in the same function call)
5. Read their research documents
6. Write `/plans/feature-name/shared.md`