---
description: Start feature development - routes to implementation or orchestration workflows
argument-hint: [feature ID or description]
---

# Start Feature Development

**User's Intent:** $ARGUMENTS

## Smart Routing Algorithm

Follow these steps to determine the correct workflow:

### Step 1: Parse Input

Extract feature identifier from user's input:
- Check for explicit feature ID pattern: `F-##` or `F-###`
- If no ID, treat as feature description

### Step 2: If Feature ID Found

Check if spec exists for this feature:

```bash
ls docs/feature-specs/$ARGUMENTS.yaml
```

**IF SPEC EXISTS** → Route to spec-driven workflow:
```bash
klaude start general-purpose "/feature/spec-driven $ARGUMENTS" -s
```

**IF SPEC DOES NOT EXIST** → Ask user:
```
Feature ID $ARGUMENTS doesn't have a spec yet.

Options:
1. Create spec first (exploratory workflow)
2. Different feature ID?

Which would you like?
```

### Step 3: If Feature Description Found

Search for matching features:

```bash
pdocs list features --format json
```

**IF MATCH FOUND** → Ask user:
```
Did you mean feature {feature-id}: {title}?

If yes, I'll implement that feature.
If no, I'll gather requirements for a new feature.
```

**IF NO MATCH** → Route to exploratory workflow:
```bash
klaude start general-purpose "/feature/exploratory $ARGUMENTS" -s
```

### Step 4: If Unclear

Ask user to clarify:
```
I'm not sure which workflow you need:

- Spec-driven: Feature spec exists, ready to implement
- Exploratory: No spec yet, need requirements gathering first

Which applies to your feature?
```

## Key Points

- Trust intelligence over keywords
- Default: ID with spec → spec-driven; description → exploratory
- Always verify spec existence before routing
- Use pdocs CLI to check for matching features
- Ask clarifying questions when ambiguous
