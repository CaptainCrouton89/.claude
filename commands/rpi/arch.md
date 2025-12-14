---
description: Start new feature - define spec and gather context
argument-hint: <topic or description>
---
# Feature Specification

**Input:** $ARGUMENTS

Parse the input above. It may be:
- A single topic word (e.g., "auth")
- A longer description of what the user wants
- Context about priorities or constraints

Extract the core feature topic and any relevant context to inform your investigation.

## Objective

Define the feature through collaborative conversation. Produce a clear specification that captures behavior and—when relevant—high-level architecture.

---

## Process

### 1. Initial Investigation

Briefly explore the codebase to understand:
- Relevant existing patterns or similar features
- Constraints that might affect the feature design
- Integration points or dependencies
- Architectural patterns already in use

### 2. Present Findings and Proposal

Always share:
- What you found in the codebase
- A concrete proposal for how the feature should work
- Relevant file paths that will be involved

Then ask: **"Does this need further discussion, or should I capture this as the spec?"**

### 3. Design Through Conversation (if needed)

If there's ambiguity or complexity worth discussing:
- Propose high-level approaches with rationale
- Ask substantive questions about architecture, behavior, edge cases, or design
- Questions should be specific: Bad: "What should happen on error?" Good: "If the API returns a 429, should we retry with backoff or surface the rate limit to the user?"
- Iterate until the feature is well-defined

Ambiguity can be technical, architectural, or design-related (UI/UX choices count).

### 4. Save Specification

When the feature is well-defined, save to `{cwd}/.claude/specs/{topic-name}.spec.md`

**Spec format:**
- **Summary** — One paragraph describing the feature
- **Behavior** — How it works in plain English (normal operation, edge cases, user feedback)
- **Architecture** (if applicable) — Key abstractions, component interactions, integration points
- **Constraints** — Limitations, requirements, or boundaries
- **Related files** — Paths to relevant existing code

**No code.** No pseudocode. No type definitions. Abstract and behavioral only.

---

## After Saving the Spec

### Evaluate Need for Research

**Small features** (touches ~10 or fewer files):
- The spec's "Related files" section is sufficient context
- No separate research documents needed
- State: "Specification saved to `{path}`. Ready for `/rpi/plan {spec-path}`."

**Large features** (touches 10+ files across multiple domains):
- Offer: "This feature spans multiple areas. Would you like me to create dedicated context documents for planning?"
- If yes, proceed to research phase

---

## Research Phase (optional)

Only run if the user confirms, for large multi-domain features.

### 1. Investigate Thoroughly

- Spawn `Explore` agents with `run_in_background: true` to investigate different areas in parallel
- Each agent focuses on a specific domain (e.g., data models, API patterns, UI components)
- Synthesize findings into focused context documents

### 2. Create Context Documents

Save to `{cwd}/.claude/context/` with descriptive names (e.g., `{topic}-data.context.md`, `{topic}-api.context.md`).

Each context document should include:
- Relevant file paths and key code patterns
- Existing abstractions or utilities to leverage
- Integration points and dependencies
- Constraints or gotchas to be aware of

Documents should be:
- **Organized by domain or layer**
- **Cohesive** — Each covers a complete slice
- **Non-overlapping**
- **Implementation-ready**

### 3. Output

List context documents created with brief summaries.

State: "Spec and context complete. Ready for `/rpi/plan {spec-path}`."
