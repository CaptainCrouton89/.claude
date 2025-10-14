# Investigation: [Topic]

> Context bundle for implementing [feature/fix]. All file references, data flows, and patterns needed for implementation.

## Goal
[One sentence: what we're building or fixing]

## Related Docs
- `docs/feature-spec/[slug].md` – F-## [if exists]
- `docs/system-design.md` – [relevant section]
- `docs/api-contracts.yaml` – [relevant endpoints]

## Key Files

### Entry Points
- `path/to/entry.ts:45` – [Where user/system triggers this]
- `path/to/handler.ts:23` – [Initial processing]

### Core Logic
- `path/to/service.ts:89-145` – [What it does]
- `path/to/validator.ts:12` – [Validation logic]
- `path/to/transformer.ts:67` – [Data transformation]

### UI Components (if applicable)
- `path/to/Component.tsx:34` – [Purpose]
- `path/to/hooks/useX.ts:12` – [State management]

### API/Database
- `path/to/api/routes.ts:56` – [Endpoint definition]
- `path/to/models/Entity.ts:23` – [Data model]
- `path/to/queries.ts:78` – [Database queries]

### Configuration
- `path/to/config.ts:12` – [Settings/env vars]
- `path/to/constants.ts:5` – [Constants used]

### Tests (if relevant)
- `path/to/feature.test.ts` – [Coverage areas]

### Utilities
- `path/to/utils/helper.ts:34` – [Helper function]
- `path/to/lib/shared.ts:89` – [Shared logic]

## Database Tables
- **`table_name`**: columns `id, user_id, data, created_at` – [Purpose]
- **`related_table`**: [Relationship and purpose]

## Data Flow
1. Input: [Source/shape] → `file.ts:line`
2. Validation → `file.ts:line`
3. Processing → `file.ts:line`
4. Database/API call → `file.ts:line`
5. Response/side effects → `file.ts:line`

## Patterns to Follow
- **Error handling**: [Pattern found in `file.ts:line`]
- **Validation**: [Pattern found in `file.ts:line`]
- **Auth/permissions**: [Pattern found in `file.ts:line`]
- **Naming**: [Convention observed]

## Integration Points
- [External service/API] via `file.ts:line`
- [Related feature] at `file.ts:line`
- [Shared state/events] in `file.ts:line`

## Notes
- [Any gotchas, edge cases, or important context]
- [Performance considerations if relevant]
- [Security considerations if relevant]


