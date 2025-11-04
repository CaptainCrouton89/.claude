---
description: Migrate non-standard documentation into template-compliant format
---

# Normalize Legacy Documentation

Your job is to migrate existing non-standard documentation into the template-compliant format before proceeding with init workflow.

---

## Context

The assessment found existing documentation that doesn't follow template conventions (wrong format, missing IDs, non-YAML, etc.). Migrate it rather than starting from scratch or leaving inconsistencies.

---

## Process

1. **Backup originals:**
   - Create `docs/.legacy-backup/` if it doesn't exist
   - Copy all existing docs to backup with timestamp: `docs/.legacy-backup/YYYYMMDD-HHMMSS/`
   - Confirm backup successful before proceeding

2. **Analyze each document type:**

   **For PRD-like docs:**
   - Extract: project summary, goals, features, success metrics, risks
   - Map to `product-requirements.yaml` template fields
   - Generate feature IDs (F-01..F-n) if missing; create mapping table for references
   
   **For user stories/flows:**
   - Extract: titles, descriptions, acceptance criteria, personas
   - Generate IDs (US-###, flow slugs) following conventions
   - Map to template YAML structure
   
   **For technical specs:**
   - Extract: architecture, APIs, data models, tech stack
   - Map to system-design.yaml, api-contracts.yaml, data-plan.yaml
   
   **For design docs:**
   - Extract: UI descriptions, mockup links, accessibility requirements
   - Map to design-spec.yaml

3. **ID assignment strategy:**
   - Features: sequential F-01..F-n based on priority or discovery order
   - Stories: US-101..US-1## (leave room for additions)
   - Keep a `docs/migration-mapping.yaml` showing old → new ID mappings for reference

4. **Cross-reference migration:**
   - Search legacy docs for implicit feature references
   - Update to use new IDs (F-##, US-###)
   - Document ambiguous cases in migration notes

5. **Write normalized docs immediately:**
   - Use exact template structure from @/file-templates/init-project/
   - Set `status: draft` initially
   - Add `migration_notes` field documenting source and transformation
   - Set `last_updated` to current date
   - If adjustments are needed, edit the files accordingly

6. **Validation:**
   - Run `docs/check-project.sh -v` if it exists
   - Verify all IDs are unique and consistently referenced
   - Check no orphaned references remain

7. **Report:**
   ```
   Migration complete:
   - Backed up to: docs/.legacy-backup/YYYYMMDD-HHMMSS/
   - Migrated: [list of files]
   - ID mappings: docs/migration-mapping.yaml
   - Issues: [any manual review needed]
   
   Next: Gap analysis for missing documents
   ```

---

## Common Migrations

**Markdown → YAML:**
- Extract front-matter or headings as fields
- Convert bullet lists to YAML arrays
- Move inline content to structured fields

**Old ID formats:**
- `FEAT-xyz` → `F-##`
- `Story_123` → `US-###`
- Record mappings

**Missing metadata:**
- Infer `priority` from context (default: Medium)
- Set `owner: TBD` if unknown
- Add `last_updated` from file mtime or current date

---

## Edge Cases

- **No clear features:** Create single F-01 "Core Functionality" as placeholder; refine later
- **Duplicate stories:** Merge or sequence as US-101, US-102
- **Mixed formats:** Migrate highest-value docs first; note others in migration-mapping for manual review
- **Binary assets:** Keep in place; reference from new YAML docs

---

## Completion

After normalization, **route to selective update:**
```
Next: /commands/init-project/00b-selective-update.md
```

This ensures any remaining gaps are filled using the standard workflow.

---

## Delegation Note

**This is substantial work.** If >5 files need migration, delegate to `documentor` agent with:
- Backup location
- Migration strategy (this file)
- Template references
- Instruction to write files immediately, make edits if adjustments are needed, and report when complete

Monitor through `agent-responses/` and await completion before routing to 00b.

