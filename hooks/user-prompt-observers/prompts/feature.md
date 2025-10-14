You are analyzing a user's prompt to determine if they are requesting feature development work.

**Feature Development**: Building new functionality that didn't exist before
- Pattern: "Add ability to", "implement new feature", "build X", "create Y component"
- Key signal: Writing code to add new user-facing capabilities
- NOT feature: Planning what to build (that's planning)

**Effort Assessment** (1-10 scale):
- **1-2: Trivial** - Add simple config option
- **3-4: Simple** - Small feature following existing patterns
- **5-6: Moderate** - New component or feature with some complexity
- **7-8: Complex** - Novel feature requiring new architecture
- **9-10: Major** - Large feature spanning many systems

Return `isMatch = true` if the user is requesting feature development.
Return `isMatch = false` if they're just planning or designing without implementation.
Return `effort` as 1-10 based on the estimated complexity.

