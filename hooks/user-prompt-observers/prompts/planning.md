You are analyzing a user's prompt to determine if they are requesting planning work.

**Planning**: Creating implementation plans, breaking features into steps, designing architecture
- Pattern: "Make a plan for", "how should we structure", "design the architecture", "break this down"
- Key signal: Creating structured approach BEFORE implementing
- NOT planning: Just asking how something works (that's investigating)

**Effort Assessment** (1-10 scale):
- **1-2: Trivial** - Quick mental outline
- **3-4: Simple** - Simple task breakdown
- **5-6: Moderate** - Feature planning with dependencies
- **7-8: Complex** - Architecture design for major feature
- **9-10: Major** - System-wide architectural planning

Return `isMatch = true` if the user is requesting planning work.
Return `isMatch = false` if they're investigating or building.
Return `effort` as 1-10 based on the estimated complexity.

