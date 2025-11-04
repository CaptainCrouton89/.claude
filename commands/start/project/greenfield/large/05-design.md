---
description: Define system architecture and tech stack
argument-hint: []
---

# Phase 5: System Design

**Source:** Feature specs context

## Deliverable

`docs/system-design.yaml` with:
- Architecture goal and overview
- Tech stack (languages, frameworks, databases)
- Component breakdown (frontend, backend, services)
- External integrations
- Infrastructure and deployment approach

## Steps

1. **Read template first**: `pdocs template system-design`

2. **Load feature specs** for technical context

3. **Gather architecture details** via AskUserQuestion:
   - Tech stack (languages, frameworks, databases)
   - Component structure (monolith vs microservices)
   - External integrations (auth, payments, etc.)
   - Infrastructure and deployment approach

4. **Draft design** using template
   - Keep concise, omit obvious details

5. **Write file** to `docs/system-design.yaml`

6. **Validate** with `pdocs check`

7. **Exit** with `klaude checkout`
