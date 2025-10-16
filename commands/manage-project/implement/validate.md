---
description: Final comprehensive validation of implementation against all requirements
argument-hint: [F-## | S-## | API-METHOD-path]
---

# Implementation Phase 4: Final Validation

Comprehensive validation of complete implementation against all requirements and acceptance criteria.

$ARGUMENTS

@docs/product-requirements.md
@docs/system-design.md
@docs/api-contracts.yaml
@agent-completion-validator

## Purpose

Systematically verify that the complete implementation meets all requirements, follows patterns, handles edge cases, and introduces no regressions.

## Process

### 1. Load All Artifacts
- `@docs/plans/implement-{item-id}-requirements.md` - Requirements
- `@docs/plans/implement-{item-id}-plan.md` - Implementation plan
- `agent-responses/agent_*.md` - Investigation findings and task validations
- Original specification (feature/story/API/flow)
- Implemented code

Verify execution phase complete. If missing artifacts, prompt to run `/manage-project/implement/execute` first.

### 2. Validation Strategy
**Simple (inline):** Small scope (1-3 tasks), single domain, straightforward requirements  
**Complex (delegated):** Large scope (4+ tasks), multi-domain, complex integration - delegate to `@agent-completion-validator`

### 3. Delegate Final Validation Agent (if complex)
```markdown
Perform comprehensive final validation of {item-id} implementation.

**Requirements:** @docs/plans/implement-{item-id}-requirements.md
**Plan:** @docs/plans/implement-{item-id}-plan.md
**Task Validations:** agent-responses/agent_*.md
**Patterns:** agent-responses/agent_*.md
**Original Spec:** [Feature/Story/API spec]

Systematically verify ALL requirements met, patterns followed, edge cases handled, no regressions.

**Output:** agent-responses/agent_{agent_id}.md
```

### 4. Comprehensive Validation
Validate across dimensions:

#### Requirements Compliance
- All functional requirements implemented
- All acceptance criteria met
- All user stories satisfied (if story-based)
- All API contract requirements met (if API)
- All success criteria achieved

#### Specification Alignment
- APIs match `@docs/api-contracts.yaml`
- Events match `@docs/data-plan.md` (if exists)
- UI matches `@docs/design-spec.md`
- Architecture follows `@docs/system-design.md`
- Behavior matches original specification

#### Task Completion
- All tasks from plan implemented
- All task validation reports reviewed
- All task validation issues resolved
- No pending or incomplete tasks

#### Code Quality
- Code follows project patterns and conventions from investigations
- Error handling consistent
- Proper validation
- Clear naming
- Appropriate comments

#### Edge Cases & Error Handling
- Empty states handled gracefully
- Large datasets handled efficiently
- Invalid input validated and rejected
- Network failures handled (if applicable)
- Concurrent actions handled (if applicable)
- User-friendly error messages
- Loading states during async operations

#### Integration Points
- Integrates correctly with existing features
- API calls work as expected
- Database operations correct
- Authentication/authorization works
- External APIs integrated properly

#### Performance
- Time complexity acceptable
- No N+1 query problems
- No unnecessary re-renders (frontend)
- Efficient data structures
- Appropriate caching

#### Security
- Input validation prevents injection
- Authentication required where needed
- Authorization checks in place
- Sensitive data not logged
- CORS configured correctly (if API)

#### Accessibility (if UI)
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast meets WCAG
- Screen reader compatible

#### Regression Check
- Existing tests still passing
- Related features still working
- No breaking changes to APIs (unless intentional)
- Backward compatibility maintained (if required)

### 5. Consolidate Validation Results
```markdown
## Final Validation Summary

**Feature:** [F-## name]
**Overall Status:** ✓ PASS / ⚠ PASS WITH ISSUES / ✗ FAIL

### Requirements: [X/Y met]
- ✓ Requirement 1
- ✓ Requirement 2

### Code Quality: ✓ PASS
### Edge Cases: ✓ PASS
### Integration: ✓ PASS
### Performance: ✓ PASS
### Security: ✓ PASS
### Regressions: ✓ NONE

### Issues Found
**Critical Issues:** [Must fix before acceptance]
- [None / List issues]

**Non-Critical Issues:** [Should fix but not blocking]
- [None / List issues]
```

### 6. Handle Validation Issues
**Critical (must fix):** Requirements not met, breaking changes, security vulnerabilities, data corruption risks  
**Important (should fix):** Edge cases not handled, poor error messages, performance concerns  
**Minor (nice to fix):** Code polish, documentation improvements

Fix critical issues, re-validate, then present non-critical issues to user for decision.

### 7. User Acceptance
```markdown
## Final Validation Complete

**Feature:** [F-## name]
**Status:** ✓ Validation Passed

### Summary
- ✓ All requirements met
- ✓ All acceptance criteria satisfied
- ✓ All tasks completed and validated
- ✓ Code quality standards met
- ✓ No regressions introduced
- ✓ Edge cases handled
- ✓ Integration points working

**Validation Report:** agent-responses/agent_{agent_id}.md

Ready for acceptance?
```

Wait for user sign-off.

### 8. Update Project Documentation
After user acceptance:

```bash
# Verify cross-document consistency
/manage-project/validate/check-consistency

# Ensure feature/story/API coverage
/manage-project/validate/check-coverage

# Verify API alignment (if API feature)
/manage-project/validate/check-api-alignment
```

Update feature status from `in_progress` to `implemented`, update timestamps.

### 9. Implementation Complete
```markdown
## ✓ Implementation Complete

**Feature:** [F-## name]
**Implementation:** Complete and validated
**Validation Status:** Passed

### Artifacts Created
- Feature/Story/API implementation
- @docs/plans/implement-{item-id}-requirements.md
- @docs/plans/implement-{item-id}-plan.md
- agent-responses/agent_*.md (investigations and validations)

### Summary
[Brief description of what was implemented]

**Implementation lifecycle complete!**
```

## Output Artifacts

**Created:**
- `agent-responses/agent_{agent_id}.md` - Comprehensive validation report

**References:**
- All artifacts from investigation, planning, and execution phases

**Completes:** Implementation workflow

## Edge Cases

### Validation Fails Completely
- Determine if planning was flawed or execution went wrong
- May need to return to planning or execution phase
- Present options to user

### Minor Issues User Wants to Fix
- Return to execution phase for specific fixes
- Re-validate after fixes

### Validation Reveals Missing Requirements
- Document the gap
- Determine if critical or nice-to-have
- User decides: implement now or defer

### Regression Detected
- Document regression clearly
- Fix regression
- Re-validate thoroughly
