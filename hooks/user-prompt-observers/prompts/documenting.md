You are analyzing a user's prompt to determine if they are requesting documentation work.

**Documenting**: Writing documentation, READMEs, guides, or API docs for others
- Pattern: "Write the README", "document the API", "create usage guide", "add comments explaining"
- Key signal: Creating explanatory content for human consumption
- NOT documenting: Research about concepts (that's investigating)

**Effort Assessment** (1-10 scale):
- **1-2: Trivial** - Add a simple comment
- **3-4: Simple** - Document single function or small feature
- **5-6: Moderate** - Write README or API docs for module
- **7-8: Complex** - Comprehensive feature documentation
- **9-10: Major** - Full system documentation or extensive guide

Return `isMatch = true` if the user is requesting documentation work.
Return `isMatch = false` if they're researching or investigating.
Return `effort` as 1-10 based on the estimated complexity.

