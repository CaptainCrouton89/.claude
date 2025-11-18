---
description: Map user journeys and define personas
argument-hint: []
---

# Phase 2: User Flows

**Source:** Existing PRD at `docs/product-requirements.yaml`

## Deliverable

`docs/user-flows/*.yaml` (3-7 flow files) with:
- Flow title and key personas
- Primary and secondary user journeys
- Steps per journey with decision points

## Steps

1. **Read template first**: `pdocs template user-flow`

2. **Load PRD** and extract features/personas for context

3. **Get high-level understanding** via AskUserQuestion:
   - Key personas (roles, goals, pain points)
   - Major user journeys across all features
   - Primary vs secondary flows

4. **List all flows** as bullet points (3-7 flows):
   - One flow per major user journey
   - Example: "Onboarding Flow", "Task Creation Flow", "Collaboration Flow"

5. **Get user approval** on flow list

6. **Update TodoWrite** with each flow as separate todo item

7. **Iterate through each flow**:
   - Ask clarifying questions about steps and decision points
   - Draft flow using template
   - Write to `docs/user-flows/{flow-name}.yaml`
   - Mark todo complete

8. **Validate** all flows with `pdocs check`

9. **Exit** with `klaude checkout`
