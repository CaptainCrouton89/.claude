# Implementation Requirements – <Identifier>

## Source Specification
- **Item ID:** <F-## / S-## / API-...>
- **Spec:** `docs/feature-spec/F-##-<slug>.yaml` (or `user-stories/US-###-<slug>.yaml`, `api-contracts.yaml`)
- **Status:** draft

> All functional requirements, user value, and technical specs are defined in the source YAML.
> This doc captures **investigation findings** and **implementation-specific requirements**.

## Investigation Findings

### Existing Patterns
- [Pattern/convention at file:line to follow]
- [Existing similar implementation at file:line]

### Integration Points Discovered
- [System/service at file:line] – [how integration works]

### Constraints & Dependencies
- [Technical constraint found in codebase]
- [Library/service version requirement]

## Edge Cases & Error Handling
- **[Edge case]:** [behavior] – [why/how to handle]
- **[Error scenario]:** [approach] – [reference to pattern at file:line]

## Implementation-Specific Decisions
- **Technology choice:** [decision] – [reasoning based on codebase]
- **Pattern to follow:** [pattern name] at `file:line` – [why]
- **Deviation from spec:** [if any] – [justification]

## Implementation Scope
**In this phase:**
- [Concrete deliverable 1]
- [Concrete deliverable 2]

**Deferred:**
- [Item deferred to later] – [reason]

## Success Criteria (beyond spec acceptance criteria)
- [ ] [Implementation-specific validation]
- [ ] [Performance benchmark met]
- [ ] [Integration validated]

## Relevant Files
- src/path/to/file – [why relevant]
- src/other/path – [why relevant]