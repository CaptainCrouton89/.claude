# Assess Existing Documentation

Your job is to determine whether this is a greenfield (no docs) or brownfield (existing docs) project, then route to the appropriate workflow path.

---

## Process

1. **Check for docs directory:**
   - Look for `<project_root>/docs/` 
   - If missing → GREENFIELD, proceed to step 4

2. **Inventory existing documentation:**
   - List all files in `docs/`, `docs/user-flows/`, `docs/user-stories/`, `docs/feature-spec/`
   - Check for: `product-requirements.yaml`, `system-design.yaml`, `api-contracts.yaml`, `data-plan.yaml`, `design-spec.yaml`
   - Note any non-standard files (`.md`, old naming conventions, etc.)

3. **Validate existing structure:**
   - If validation scripts exist (`docs/check-project.sh`), run with `-v` flag
   - Check for:
     - ID conventions (F-##, US-###)
     - Required YAML fields (`title`, `template`, `status`, `last_updated`)
     - Cross-references (features ↔ stories, APIs ↔ specs)
   - Note gaps: missing docs, incomplete fields, broken links, ID conflicts

4. **Classification:**
   - **GREENFIELD:** No `docs/` or empty `docs/`
   - **BROWNFIELD-COMPLIANT:** Docs exist, follow template conventions, validation passes
   - **BROWNFIELD-LEGACY:** Docs exist but use old formats, missing IDs, or non-YAML

5. **Report findings:**
   ```
   Status: [GREENFIELD|BROWNFIELD-COMPLIANT|BROWNFIELD-LEGACY]
   
   Found:
   - PRD: [exists|missing|non-standard]
   - User Flows: [N files|missing]
   - User Stories: [N files|missing]
   - Feature Specs: [N files|missing]
   - System Design: [exists|missing]
   - API Contracts: [exists|missing]
   - Data Plan: [exists|missing]
   - Design Spec: [exists|missing]
   
   Issues:
   - [List gaps, ID conflicts, format issues]
   
   Recommendation: [next command to run]
   ```

6. **Route to next step:**
   - **GREENFIELD** → `/commands/init-project/01-prd.md` (start fresh sequence)
   - **BROWNFIELD-COMPLIANT** → `/commands/init-project/00b-selective-update.md` (targeted updates)
   - **BROWNFIELD-LEGACY** → `/commands/init-project/00c-normalize-legacy.md` (migration first)

---

## Output

Present the classification report, then **immediately run the recommended next command** without waiting for user confirmation. The user invoked init workflow; trust the routing.

Next command format:
```
Next: /commands/init-project/[01-prd|00b-selective-update|00c-normalize-legacy].md
```

The assessment is automatic—no user interaction needed unless critical issues require clarification.

