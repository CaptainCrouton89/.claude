# Requirements: [Feature Name]

## Overview
**Purpose:** [Brief description and why this is needed]
**User Benefit:** [Value proposition]
**Problem:** [What problem this solves]

**Related Documentation:**
- `docs/product-requirements.md` - [Product context and goals]
- `docs/user-flows/[feature-slug].md` - [User journey]
- `docs/feature-spec/[feature-slug].md` - [Technical spec]
- `docs/api-contracts.yaml` - [API contracts]
- `docs/system-design.md` - [Architecture]
- `docs/data-plan.md` - [Data model]

### Edge Cases
- **Empty state:** [Behavior when no data]
- **Error state:** [Behavior on failure]
- **Loading state:** [What user sees during processing]
- **Large dataset/performance:** [Considerations]

## Functional Requirements

### User Interactions
- [Specific interaction 1]
- [Specific interaction 2]

### Data Requirements
- **Fields:** [List with types, required/optional]
- **Validation:** [Rules per field]
- **Relationships:** [Data dependencies]

### API Requirements (if applicable)
- **Endpoint:** [Method + path]
- **Request:** [Payload structure]
- **Response:** [Data structure]
- **Errors:** [Error codes and handling]

### UI Requirements (if applicable)
- **Layout:** [Structure and components]
- **States:** [Default, loading, error, success]
- **Accessibility:** [WCAG requirements]
- **Responsive:** [Mobile/tablet behavior]

## Technical Requirements

### Performance
- Operation X: < [time target]
- Page load: < [time target]
- API response: < [time target]

### Security
- Authentication: [Method]
- Authorization: [Access control]
- Data protection: [Encryption, sanitization]
- Rate limiting: [Throttle policy]

### Integration Points
1. [System/service 1]: [How they interact]
2. [System/service 2]: [How they interact]

## Implementation Notes
**Existing patterns:** [File:line references to follow]
**Technology choices:** [Decisions with reasoning]
**Error handling:** [Approach for each scenario]

## Out of Scope
- [Future feature 1]
- [Future feature 2]
- [Deferred edge case]

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [User acceptance criterion]

## Relevant Files // every single relevant file path
- src/file/path
- src/other/path
- etc...