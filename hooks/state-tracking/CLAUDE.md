# State Tracking System

## Overview
Intelligent activity tracking and protocol injection for Claude conversations. Categorizes developer activities using AI and injects contextual protocols when appropriate.

## Key Components

### activity-tracker.js
Main hook on `UserPromptSubmit`. Analyzes conversation history to:
- Categorize activity (10 categories: debugging, feature, investigating, etc.)
- Score effort level (1-10 scale)
- Inject protocol context when confidence ≥ 0.8 and effort meets threshold

### Activity Categories & Thresholds
Each activity has an effort threshold triggering protocol injection:
- **debugging**: 3 (low barrier)
- **code-review**: 3
- **security-auditing**: 4
- **requirements-gathering**: 5
- **planning**: 5
- **investigating**: 6
- **feature**: 7
- **documenting**: 7
- **testing**: 7
- **other**: 10 (never inject)

### Protocol Selection Logic
**Moderate protocol** (`moderate.md`): For `planning`, `investigating`, `feature`, `testing` when effort is threshold to threshold+2
  - Example: Planning at effort 5-7 uses moderate.md

**Strong protocol** (`strong.md`): For all other qualifying activities or when effort > threshold+2

### Reminder Verbosity
- **Minimal**: Same protocol + equal/lower effort → just file reference
- **Full**: New protocol or higher effort → complete workflow reminder

Session state in `~/.claude/conversation-state/{session_id}.json` tracks: protocol name, effort level, timestamp

## Protocol Structure
Protocols in `protocols/{activity-name}/` with:
- `moderate.md`: Lighter guidance for mid-complexity tasks
- `strong.md`: Comprehensive workflows for complex work

## Important Patterns

### Transcript Parsing
- Expands `@file` by reading files from cwd
- Wraps user prompt in `<user-request>` tags
- Truncates content >400 chars (200 from start + 200 from end)
- Filters hook outputs from conversation history
- Limits to 6 recent exchanges for LLM context

### Effort Scoring
1-2: Trivial (<10min) | 3-4: Simple (10-30min) | 5-6: Moderate (30-90min)
7-8: Complex (2-4hrs) | 9-10: Major (hours to days)

## Dependencies
- `ai` + `@ai-sdk/openai`: LLM categorization using gpt-4.1-mini
- `zod`: Schema validation
