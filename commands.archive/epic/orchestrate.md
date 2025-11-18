---
description: Coordinate multi-feature epic implementation (2.3 workflow)
argument-hint: [epic description]
---

# Epic Orchestration

**Epic:** $ARGUMENTS

## Workflow Overview

Multi-feature epic → plan epic → loop through features (2.1 or 2.2) → integration validation

## Your Task

Execute the complete workflow:

1. **Create TodoWrite** with epic-level tracking:
   - Plan epic (identify features and order)
   - Feature 1: [name from epic plan]
   - Feature 2: [name from epic plan]
   - Feature N: [name from epic plan]
   - Integration validation

2. **PHASE 0: Epic Planning (CHECKOUT)**

```bash
klaude start Plan "/epic/plan $ARGUMENTS" -s
```

Plan will:
- Identify constituent features (F-01, F-02, F-03...)
- Determine dependency order
- Create `docs/plans/{epic-name}/epic-plan.yaml`
- Checkout back to you

3. **Read epic plan** to get feature list and build order

```bash
cat docs/plans/{epic-name}/epic-plan.yaml
```

4. **Update TodoWrite** with specific features from plan

5. **PHASE 1-N: Iterate Through Features**

For each feature in dependency order:

- Check if spec exists: `pdocs list features --format json | grep {feature-id}`

- **IF feature spec EXISTS**:
  ```bash
  klaude start general-purpose "/feature/spec-driven {feature-id}" -c -s
  ```

- **IF feature spec DOES NOT EXIST**:
  ```bash
  klaude start general-purpose "/feature/exploratory {description}" -c -s
  ```

- After checkout, mark feature complete in TodoWrite
- Continue to next feature

6. **PHASE FINAL: Integration Validation**

- Run build: `npm run build` or appropriate build command
- Run tests (if they exist): `npm test`
- Generate docs: `pdocs generate`
- Ask user: "Would you like to validate integration points?"
- If yes: `klaude start programmer "/feature/validate {epic-name}" -c -s`

7. **Mark all todos complete** and present summary

## Key Points

- Epic Plan identifies features and creates build order
- For each feature, detect if spec exists and route appropriately
- Each feature workflow gets full checkout
- Features in same phase can be done sequentially (or ask user about parallel)
- Final integration validation after all features complete
