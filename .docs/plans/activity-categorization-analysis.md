# Plan: Activity Categorization and Scoring Analysis

## Summary

**Goal:** Deep dive analysis of the activity categorization schema, effort scoring algorithms, protocol injection logic, and AI model integration in the activity tracker system

**Type:** Investigation

**Problem:** Need comprehensive understanding of how the activity tracker categorizes developer work and triggers appropriate protocols

---

## Reasoning

**Why this approach:**
- activity-tracker.js:143-222 contains complete categorization schema with detailed patterns and examples
- activity-tracker.js:184-220 defines effort scoring methodology with concrete thresholds
- activity-tracker.js:284-331 implements protocol selection logic with activity-to-protocol mappings
- GPT-4.1-mini integration at line 260 provides AI classification with structured output schema

**Alternatives considered:**
- Surface-level documentation review: Rejected - need deep technical understanding of decision logic

---

## Impact Analysis

### Main Affected Files

**Files requiring analysis:** 1 file total

**Core System:**
- `hooks/state-tracking/activity-tracker.js:143-331` - Complete categorization and scoring system

### Key Integration Points

1. **AI Model Service** (`activity-tracker.js:258-263`) - OpenAI GPT-4.1-mini for classification
2. **Protocol System** (`activity-tracker.js:302-331`) - Dynamic protocol injection based on thresholds
3. **Session State** (`activity-tracker.js:333-361`) - Persistent session tracking and protocol management
4. **Conversation History** (`activity-tracker.js:86-141`) - Context extraction from transcript

---

## Current System

### Relevant Files

**Core System:**
- `hooks/state-tracking/activity-tracker.js` - Activity classification and protocol injection system

### Current Flow

User prompt → Transcript analysis (86-141) → AI classification (258-263) →
Threshold evaluation (284-299) → Protocol injection (301-331) →
Session state update (349-361) → Context delivery to Claude

---

## Deliverables

### Complete Categorization Taxonomy
- 10 activity categories with specific patterns and examples
- Decision guidelines for edge cases and ambiguous requests
- Confidence assessment methodology

### Effort Scoring Methodology
- 5-tier scoring system (1-2: Trivial, 3-4: Simple, 5-6: Moderate, 7-8: Complex, 9-10: Major)
- Concrete time estimates and complexity thresholds
- Activity-specific effort calibration

### Protocol Selection Logic
- Activity-to-protocol mappings with threshold requirements
- Moderate vs Strong protocol selection criteria
- Session state management and protocol persistence

### AI Model Integration
- Structured output schema using Zod validation
- Conversation history processing and token management
- Confidence scoring and decision boundaries

---

## Implementation Checklist

- [x] Primary file identified and read
- [x] Key sections located (categorization, scoring, protocol injection)
- [ ] Categorization taxonomy documented
- [ ] Effort scoring methodology detailed
- [ ] Protocol injection logic mapped
- [ ] AI model integration analyzed
- [ ] Comprehensive analysis report created