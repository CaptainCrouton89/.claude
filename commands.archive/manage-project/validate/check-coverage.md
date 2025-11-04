---
description: Check feature coverage across documentation including user stories and specs
---

# Check Feature Coverage

Verify all features have specs, stories, APIs, flows, design, testing.

@~/.claude/file-templates/init-project/CLAUDE.md

## Process

### 1. Get Features from PRD
```bash
./list-features.sh --format ids
```

### 2. Check Each Dimension
For each feature:
- Spec file exists: `ls feature-specs/F-##-*.yaml`
- Stories exist: `./list-stories.sh -f F-##`
- APIs exist: `./list-apis.sh | grep "F-##"`
- Flows exist: `grep -l "F-##" user-flows/*.yaml`
- Design screens: `grep -l "F-##" design-spec.yaml`
- Testing: Check spec files for testing_strategy

### 3. Generate Coverage Matrix

```
Feature Coverage Matrix:
========================================================================================
Feature | Spec | Stories | APIs | Flows | Design | Testing | Overall | Status
========================================================================================
F-01    | ✓    | 3       | 3    | ✓     | ✓      | ✓       | 100%    | Complete
F-02    | ✓    | 4       | 2    | ✓     | ✓      | ✓       | 100%    | Complete
F-03    | ✗    | 2       | 2    | ✗     | ✗      | ✗       | 33%     | Incomplete
========================================================================================
```

### 4. Identify Gaps
For each incomplete feature:
- What's missing
- Impact on implementation
- Priority level (P0/P1/P2)

### 5. Offer Fixes
For gaps:
- Create missing specs
- Add missing stories
- Add missing APIs
- Update design spec

### 6. Generate Report
Exportable coverage report with recommendations.

## Thresholds

- Specs: 100% (required)
- Stories: 80%+ (recommended)
- APIs: 80%+ (recommended)
- Flows/Design/Testing: 60%+ (nice-to-have)

## Output
Coverage matrix, gap analysis, action recommendations.