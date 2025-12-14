---
description: After /rpi/arch - create implementation plan from spec
argument-hint: <spec-path or description>
---
# Create Implementation Plan

**Input:** $ARGUMENTS

Parse the input above. It may be:
- A direct path to a spec file
- A topic name (look in `.claude/specs/{topic}.spec.md`)
- A description with additional context, priorities, or constraints

Extract the spec reference and any guidance about what to prioritize or skip.

## Objective

Create a comprehensive, actionable implementation plan based on the feature specification and codebase context.

## Inputs

1. **Read the specification**
   - If a path was provided, read it directly
   - If a topic was given, look in `.claude/specs/`
   - The spec defines *what* to build—the plan defines *how*

2. **Locate context documents** (if any)
   - Check `.claude/context/` for related context files
   - These are optional—only created for large multi-domain features
   - If none exist, use the spec's "Related files" section as your context

## Planning Approach

1. **Review spec and context**
   - Understand the required behavior from the spec
   - Review context docs for patterns, constraints, and integration points
   - Identify areas of complexity or risk

2. **Determine plan complexity and strategy**
   
   - **Simple plans** (1-3 files, single domain)
     - Create a single plan document with all details
   
   - **Medium plans** (multiple domains, 4-10 files)
     - Spawn multiple `silas-toolkit:planner` agents in parallel with `run_in_background: true`
     - Each agent focuses on a specific phase, domain, or architectural layer
     - Provide each agent with relevant context documents
     - **Synthesize their outputs into one cohesive master plan document**
   
   - **Large plans** (many files, complex cross-cutting changes)
     - Create a master plan document that outlines phases, using two or more `silas-toolkit:planner` agents.
     - Afterwards, delegate each phase to a `silas-toolkit:planner` agent to create detailed sub-plans
     - **Sub-plans are saved as separate documents** in `{cwd}/.claude/plans/`
     - **Link to sub-plans from each phase** in the master plan

## Plan Document Requirements

### Structure
- **Overview** - What we're building and why
- **Phases** - Logical breakdown of work (if multi-phase)
- **Implementation details** - File-by-file changes, organized by phase
- **Integration points** - How pieces connect
- **Verification** - Actionable tests for each major phase

### Content Guidelines
- **Concise but complete** - Include critical implementation details without verbosity
- **Type definitions** - Specify exact types/interfaces being created
- **Pseudocode when helpful** - For complex algorithms or non-obvious logic
- **No code smells** - Avoid fallbacks, magic values, or shortcuts
- **No timelines** - Focus on what, not when

### Quality Standards
- Follow existing patterns and conventions from context
- Maintain consistency across the codebase
- Design for maintainability and testability
- Make dependencies and side effects explicit

## Output

Save the master plan to `{cwd}/.claude/plans/` with a descriptive name (e.g., `implement-auth-flow.plan.md`).

For large plans with sub-plans, list the linked sub-plan documents.

State: "Implementation plan complete. Ready for review or execution."