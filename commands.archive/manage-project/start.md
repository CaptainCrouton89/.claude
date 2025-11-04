---
description: Intelligent entry point for work on any feature, requirement, story, or update
argument-hint: [feature description or ID]
---

# Start Work on Feature/Requirement

Intelligent entry point for beginning work on any feature, requirement, flow, story, or update.

$ARGUMENTS

@docs/product-requirements.md
@docs/system-design.md
@docs/api-contracts.yaml

## Process

### 1. Show Current Project State
```bash
./list-features.sh
./list-apis.sh
```

### 2. Analyze User Description
Parse the provided description to determine:
- **Type**: New feature, update to existing, new story, new flow, new API, requirement change
- **Scope**: Single component, multi-component, architectural, documentation-only
- **Complexity**: Simple (single task), moderate (3-5 tasks), complex (6+ tasks)
- **Related Items**: Existing features, stories, APIs, flows that are affected or related

### 3. Determine Classification
Based on analysis, classify as one of:

| Classification | Indicators | Route To |
|----------------|-----------|----------|
| **New Feature** | "new feature", "add capability", introduces novel functionality | `/manage-project/add/add-feature` |
| **New Story** | "user story", "as a user", workflow-focused | `/manage-project/add/add-story` |
| **New API** | "endpoint", "API", "route", mentions HTTP methods | `/manage-project/add/add-api` |
| **New Flow** | "flow", "sequence", "journey", multi-step process | `/manage-project/add/add-flow` |
| **Update Feature** | "modify", "change", "update" + existing feature name | `/manage-project/update/update-feature` |
| **Update API** | "change endpoint", "modify API" + existing API | `/manage-project/update/update-api` |
| **Update Requirements** | "requirement change", affects PRD | `/manage-project/update/update-requirements` |
| **Update Design** | "architecture change", "design change" | `/manage-project/update/update-design` |

### 4. Execute Appropriate Command
Run the determined command with the user's description as context.

### 5. Summarize Changes
After command completion, show:
- What was added/updated
- File changes made
- Related items that may need attention

### 6. Offer Next Steps
Present contextual next steps based on what was done:

**After adding a feature:**
- ✓ Feature added to docs
- **Next options:**
  - Add user stories: `/manage-project/add/add-story`
  - Add API endpoints: `/manage-project/add/add-api`
  - Add user flows: `/manage-project/add/add-flow`
  - **Implement the feature**: `/manage-project/implement/00-orchestrate F-##`
  - Validate consistency: `/manage-project/validate/check-consistency`

**After adding a story:**
- ✓ Story added to feature spec
- **Next options:**
  - Add another story: `/manage-project/add/add-story`
  - Add API endpoints: `/manage-project/add/add-api`
  - **Implement the story**: `/manage-project/implement/00-orchestrate S-##`
  - Check coverage: `/manage-project/validate/check-coverage`

**After adding an API:**
- ✓ API endpoint added to contracts
- **Next options:**
  - Add another API: `/manage-project/add/add-api`
  - Update feature spec with API details: `/manage-project/update/update-feature`
  - **Implement the API**: `/manage-project/implement/00-orchestrate API-<method>-<path>`
  - Check API alignment: `/manage-project/validate/check-api-alignment`

**After adding a flow:**
- ✓ Flow added to documentation
- **Next options:**
  - Add another flow: `/manage-project/add/add-flow`
  - Add related stories: `/manage-project/add/add-story`
  - **Implement the flow**: `/manage-project/implement/00-orchestrate FLOW-##`

**After updating items:**
- ✓ Documentation updated
- **Next options:**
  - Check impacted features: `./list-features.sh`
  - Validate consistency: `/manage-project/validate/check-consistency`
  - **Implement the changes**: `/manage-project/implement/00-orchestrate <item-id>`

## Edge Cases

### Ambiguous Description
If classification is unclear:
- Ask clarifying questions
- Show relevant existing items that might be related
- Offer multiple routing options for user to choose

### Multiple Actions Needed
If description implies multiple actions:
- Break down into discrete steps
- Execute in logical order (e.g., requirements → feature → story → API)
- Show progress after each step

### No Project Structure
If docs/ directory or project structure doesn't exist:
- Offer to run `/init-project/00-orchestrate` first
- Explain project structure requirements

### Complex Cross-Cutting Changes
If affects multiple features, APIs, or architectural components:
- Flag as complex scope
- Suggest starting with `/manage-project/update/update-requirements` or `/manage-project/update/update-design`
- List all affected components

## Examples

### Example 1: New Feature
```
User: "/manage-project/start Add user authentication with OAuth2"

→ Classified as: New Feature
→ Routes to: /manage-project/add/add-feature
→ Creates: F-07-oauth-authentication.yaml
→ Next steps offered: Add stories, Add APIs, /manage-project/implement/00-orchestrate F-07
```

### Example 2: API Update
```
User: "/manage-project/start Change the /api/share endpoint to return more metadata"

→ Classified as: Update API
→ Routes to: /manage-project/update/update-api
→ Updates: api-contracts.yaml, related feature specs
→ Next steps offered: Validate alignment, /manage-project/implement/00-orchestrate API-POST-/api/share
```

### Example 3: Ambiguous Case
```
User: "/manage-project/start Better error handling"

→ Classified as: Ambiguous (could be feature, design, or requirement)
→ Questions asked: 
  - "Is this a new error handling system (new feature) or improving existing (update)?"
  - "Does this affect architecture/design or specific components?"
→ Routes based on answers
```

## Output
- Documentation updated via routed command
- Summary of changes
- Contextual next steps with implementation option highlighted

