# Documentation Protocol

## Step 1: Ask Discovery Questions

**Don't start writing blindly.** Ask:

1. **Type**: README / API docs / User guide / Developer guide / Architecture / Code comments / Changelog
2. **Audience**: End users / Developers / Contributors / Operations
3. **Existing docs**: New / Updating / Migrating - What needs improvement?
4. **Format**: Markdown / JSDoc/TSDoc / OpenAPI / Docusaurus
5. **Scope**: What specifically to document

---

## Step 2: Present Plan

```markdown
## Documentation Plan: [Name]

**Type:** [Type]
**Audience:** [Audience]
**Format:** [Format]

### Structure

#### Section 1: [Name]
- [Key items]

#### Section 2: [Name]
- [Key items]

### Writing Style
**Tone:** [Formal/Casual/Technical]
**Level:** [Beginner/Intermediate/Advanced]

**Proceed?** (yes/modify)
```

---

## Parallel Documentation

### When to Parallelize

**Use agents for:**
- Multi-component systems (API + SDK + CLI)
- Frontend + backend simultaneously
- Multiple doc types (README + API + guides)

**Work directly for:**
- Single README or guide
- Updates to existing docs
- Small scope (<3 sections)

### Agent Selection

| Task | Agent | Why |
|------|-------|-----|
| API docs | backend-developer | API patterns, accurate examples |
| Component docs | frontend-ui-developer | React patterns, usage examples |
| Architecture | general-purpose | Cross-cutting synthesis |
| README/guides | general-purpose | Broad context, user focus |

After completion, consolidate for consistency.

---

## Step 3: Write Documentation Templates

### README Template

```markdown
# [Project Name]

[One-line description]

## Features
- **[Feature]** - Description

## Installation
```bash
npm install [package]
```

## Quick Start
```javascript
import { Feature } from '[package]';
const result = Feature.doSomething({ option: 'value' });
```

## API Reference

### `Class: ClassName`
```typescript
new ClassName(options: Options)
```

**Parameters:**
- `options.option1` (string) - Description
- `options.option2` (boolean, optional) - Default: `false`

#### Methods

##### `method(param1, param2)`
**Returns:** `Promise<Result>`
**Throws:** `Error` - When [condition]

## Configuration
```javascript
const config = {
  apiKey: 'key',      // Required
  timeout: 5000,      // Optional, default: 5000
};
```

## Troubleshooting

### Error: [Message]
**Cause:** [Why]
**Solution:** [Fix]
```

### JSDoc Template

```typescript
/**
 * Brief description
 *
 * @example
 * ```typescript
 * const result = doSomething('input');
 * ```
 *
 * @param {string} param1 - Description
 * @param {Object} options - Options
 * @param {boolean} options.flag - Description
 * @returns {Promise<Result>} Description
 * @throws {ValidationError} When input invalid
 */
export async function doSomething(
  param1: string,
  options?: Options
): Promise<Result> {
  // Implementation
}
```

### Architecture Template

```markdown
# Architecture Overview

## High-Level Design
```
[ASCII diagram]
```

## Component Breakdown

### Client Layer
**Responsibility:** UI interaction
**Technology:** React, TypeScript
**Key Files:** `src/components/`, `src/pages/`

## Data Flow
1. User action
2. Validation
3. API call
4. Process
5. Response

## Technology Decisions

### Why React?
**Reasoning:** Ecosystem, team experience, TypeScript support
**Trade-offs:** Learning curve, boilerplate
```

---

## Quality Checklist

- [ ] Code examples tested and working
- [ ] Written for target audience
- [ ] Proper heading hierarchy
- [ ] Version and date included

---
