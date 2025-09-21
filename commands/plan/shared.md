For this task, make a `.docs/plans/[plan-dir]/shared.md` document, containing high level information on files and architectures relevant to the new feature: $ARGUMENTS.

First, if it does not exist yet, create a `.docs/plans/[feature-name]` directory. If it exists already, read every file within `.docs/plans/[feature-name]/`.

The shared.md should name relevant files, tables, patterns, and docs, each with a brief description, using the template `/Users/silasrhyneer/.claude/file-templates/shared.template.md`. It should also list other relevant files, like utility files, json logs, and whatever else will be used to implement the feature.

If, after reading the other files in .docs/plans/[feature-name], you do not have enough information to build this document, use @code-finder and/or @code-finder-advanced agents in parallel to research the different aspects of the document. Those agents should investigate an aspect of the codebase, and write their findings to `.docs/plans/[feature-name]/[research-topic].docs.md`, listing _all_ files relevant to their search topic in addition to their explanation.

Upon finishing, read all of their finished research reports and write the shared.md file.

In summary:

1. List .docs/plans/[feature-name]
2. Read every file within it
3. Create your todo list
4. Launch parallel agents to perform any necessary research
5. Read their research documents
6. Write `.docs/plans/feature-name/shared.md`