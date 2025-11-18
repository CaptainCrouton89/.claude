---
description: Gather requirements for a new feature and document comprehensive specifications
argument-hint: [feature name or description]
---

Define a new feature and produce `docs/plans/[feature-name]/requirements.md` using the following requirements template:

```yaml
# Requirements: [Feature Name]
# Detailed requirements for implementing [Feature Name].

title: Requirements - [Feature Name]
feature_id: F-##                    # REQUIRED: Link to feature in product-requirements.yaml
related_feature_specs: []       # List of feature spec IDs (e.g., F-01, F-02)
related_user_stories: []        # List of user story IDs (e.g., US-101, US-102)
related_user_flows: []          # List of user flow file names (e.g., admin-dashboard, onboarding)

# ============================================================================
# OVERVIEW
# ============================================================================

overview:
  purpose: |                                     # OPTIONAL
    # Brief description and why this is needed
    # What does this feature enable? Why does the user need it?

  user_benefit: |                                # OPTIONAL
    # Value proposition for the user
    # What problem does this solve or what capability does it unlock?

  problem: |                                     # OPTIONAL
    # What problem or gap does this address?

  related_docs:                                  # OPTIONAL
    - "docs/product-requirements.md - [Product context and goals]"
    - "docs/user-flows/[feature-slug].md - [User journey]"
    - "docs/feature-spec/[feature-slug].md - [Technical spec]"
    - "docs/api-contracts/paths/[endpoint]/api-contract.yaml - [API contracts]"
    - "docs/system-design.md - [Architecture]"

# ============================================================================
# EDGE CASES & STATES
# ============================================================================

edge_cases:
  empty_state: |                                 # OPTIONAL
    # Behavior when no data exists
    # What does the user see and what can they do?

  error_state: |                                 # OPTIONAL
    # Behavior on failure or invalid input
    # How is the error communicated? Can the user recover?

  loading_state: |                               # OPTIONAL
    # What user sees during async operations
    # Loading indicator? Progress? Timeout handling?

  large_dataset: |                               # OPTIONAL
    # Considerations for scale or performance
    # Pagination? Virtual scrolling? Caching?

# ============================================================================
# FUNCTIONAL REQUIREMENTS
# ============================================================================

functional_requirements:

  user_interactions: |                           # OPTIONAL
    # Specific actions users can take
    # - User can [action 1]
    # - User can [action 2]
    # - System must [requirement 1]

  data_requirements: |                           # OPTIONAL
    # Required fields, types, and validation
    # Field | Type | Required | Description | Validation
    # [field_name] | [string/number/etc] | [yes/no] | [purpose] | [constraints]

  api_endpoints: |                               # OPTIONAL
    # If applicable, reference docs/api-contracts/paths/*/api-contract.yaml for full details
    # - POST /endpoint - [brief purpose]
    # - GET /endpoint/{id} - [brief purpose]

  ui_layout: |                                   # OPTIONAL
    # Component structure and hierarchy
    # Where does this appear? What components are involved?

  ui_states: |                                   # OPTIONAL
    # Visual states beyond the happy path
    # - Default: [what user sees initially]
    # - Loading: [what user sees while waiting]
    # - Success: [what user sees after success]
    # - Error: [what user sees on failure]

  accessibility: |                               # OPTIONAL
    # WCAG 2.1 requirements
    # Required level: AA or AAA
    # Specific needs: [keyboard nav, screen reader, color contrast, etc.]

  responsive_behavior: |                         # OPTIONAL
    # Mobile, tablet, desktop considerations
    # Layout adjustments, touch targets, breakpoints

# ============================================================================
# OUT OF SCOPE
# ============================================================================

out_of_scope: |                                   # OPTIONAL
  # What is explicitly NOT included in this requirement
  # Future enhancements or known gaps
```

At a high level, the feature is:

$ARGUMENTS

Instructions:
- Ask targeted questions focusing on: user flow, technical implementation, and constraints.
- Investigate the codebase in parallel (1-3 agents) if needed to understand current state.
- If investigations are performed, document each using the template from `pdocs template investigation-topic` and save under `docs/plans/[feature-name]/investigations/`.
- **CRITICAL:** Resolve ALL technical inferences and clarifications with the user BEFORE creating the requirements document.
- The final requirements document should contain ONLY confirmed decisions—no open questions or unresolved inferences.
- When all unknowns are resolved, populate the template exactly and confirm with the user before saving.

Output:
- Save the completed requirements to `docs/plans/[feature-name]/requirements.yaml`.