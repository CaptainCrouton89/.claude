**Purpose**
Custom code quality and workflow rules for Claude agents and code review.

**Structure**
Each `.md` file defines rules for specific concerns:
- Front matter `paths` field declares which files the rules apply to
- Rules are declarative constraints and standards (not procedural guidance)

**Key Patterns**
- Rules apply globally via path matching—they're not directory-specific
- Rules emphasize investigation and skepticism (test failures, code smells, error handling) over automation
- Rules flag what NOT to do (no `any` types, throw errors early) and how to think about problems (meaningful tests, root cause analysis)
