# Activity Tracking Hook System

## Overview
The activity tracking system monitors Claude's workflow patterns during conversations, intelligently detects the type of work being performed, and automatically injects appropriate protocol guidance to improve workflow adherence and task quality.

## User Perspective
When you start working with Claude, the activity tracker runs silently in the background analyzing your prompts and conversation history. When it detects specific work patterns (like debugging, feature development, or architecture design) with high confidence, Claude automatically receives protocol guidance tailored to that activity type. This means Claude follows best practices for the specific type of work without you needing to manually reference protocols or remind Claude about workflow steps.

For example:
- If you ask Claude to "fix the search bug showing duplicates," the tracker detects debugging activity and instructs Claude to follow the Bug-Fixing Protocol (asking discovery questions, forming hypotheses, proposing solutions)
- If you say "create a new user dashboard feature," it detects feature development and guides Claude through behavioral unpacking, task breakdown, and systematic implementation
- If you request "review this authentication code," it triggers the Code Review Protocol with security, performance, and accessibility checks

The system is threshold-based, only activating when both confidence is high (≥80%) and the task complexity meets activity-specific minimums. This prevents protocol injection for trivial tasks while ensuring comprehensive guidance for substantial work.

## Data Flow

### 1. User Submits Prompt
User types a message and presses enter in Claude CLI

### 2. Hook Trigger
`UserPromptSubmit` hook event fires, sending JSON to `activity-tracker.js` via stdin:
```json
{
  "hook_event_name": "UserPromptSubmit",
  "session_id": "abc-123",
  "prompt": "Fix the bug in the search feature",
  "transcript_path": "/path/to/session.jsonl",
  "cwd": "/path/to/project"
}
```

### 3. Conversation History Assembly
The hook reads recent conversation history from the transcript file:
- Parses JSONL transcript entries (newest to oldest)
- Extracts user prompts and assistant responses
- Filters out hook outputs that pollute the transcript
- Truncates long assistant responses (800 char limit with smart truncation)
- Reverses to chronological order (oldest to newest)
- Limits to 6 most recent exchanges for context window management

### 4. LLM Classification
Sends conversation history to OpenAI GPT-4.1-mini with structured output:
- System prompt defines 10 activity categories with detailed patterns
- Includes effort scoring rubric (1-10 scale)
- Decision guidelines to prevent ambiguous categorizations
- Returns structured data: `{activity: string, confidence: number, effort: number}`

### 5. Activity Categories Detected
**10 Activity Types:**
1. **architecting** - High-level design decisions, system structure planning
2. **debugging** - Diagnosing and fixing broken functionality
3. **code-review** - Evaluating code quality, security, performance
4. **documenting** - Writing documentation, guides, API docs
5. **feature-development** - Building new capabilities
6. **investigating** - Understanding how existing code works
7. **requirements-gathering** - Defining specifications, discovery questions
8. **security-auditing** - Vulnerability analysis, threat modeling
9. **testing** - Writing tests, improving coverage
10. **other** - Ambiguous or casual conversation

### 6. Threshold Evaluation
Checks if protocol should be injected based on activity-specific thresholds:

| Activity | Confidence Threshold | Effort Threshold | Rationale |
|----------|---------------------|------------------|-----------|
| debugging | ≥80% | ≥3 | Even moderate bugs benefit from protocol |
| architecting | ≥80% | ≥3 | Architecture decisions need structure |
| requirements-gathering | ≥80% | ≥3 | Discovery questions improve clarity |
| code-review | ≥80% | ≥3 | Reviews need comprehensive checklists |
| investigating | ≥80% | ≥3 | Code exploration needs systematic approach |
| security-auditing | ≥80% | ≥4 | Security requires elevated rigor |
| feature-development | ≥80% | ≥7 | Only substantial features benefit |
| documenting | ≥80% | ≥7 | Only comprehensive docs need protocol |
| testing | ≥80% | ≥7 | Only significant test suites benefit |
| other | N/A | ≥10 | Never inject for ambiguous work |

### 7. Session State Tracking
If threshold met, records session state in `~/.claude/conversation-state/`:
```json
{
  "protocol": "debugging",
  "timestamp": "2025-10-08T12:34:56.789Z"
}
```
This prevents duplicate protocol injections for the same session.

### 8. Protocol Context Injection
Hook returns JSON output with critical instruction for Claude:
```json
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "<system-reminder>Detected debugging activity (confidence: 95%, effort: 6).

CRITICAL: You MUST read /path/to/protocols/BUG-FIXING.md for comprehensive guidance on debugging workflows before proceeding.

Only after reading and understanding this protocol should you begin work on this task.
</system-reminder>"
  }
}
```

### 9. Claude Receives Context
Claude CLI injects the `additionalContext` as a system-level reminder before processing the user's prompt, ensuring Claude:
- Reads the appropriate protocol file
- Follows structured workflows (discovery questions, analysis, implementation)
- Applies activity-specific best practices
- Maintains quality standards throughout the task

### 10. Logging & Analytics
Activity classification logged to `~/.claude/logs/activity-tracker.log`:
```json
{
  "timestamp": "2025-10-08T12:34:56.789Z",
  "sessionId": "abc-123",
  "activity": "debugging",
  "confidence": 0.95,
  "effort": 6
}
```

## Implementation

### Key Files

**Hook Implementation:**
- `hooks/state-tracking/activity-tracker.js` - Main hook script (Node.js)
  - Lines 24-27: Event filtering (only runs on UserPromptSubmit)
  - Lines 36-90: Transcript parsing and conversation history assembly
  - Lines 100-188: LLM classification system prompt with activity categories
  - Lines 200-222: Zod schema for structured output validation
  - Lines 224-229: OpenAI API call with GPT-4.1-mini
  - Lines 251-262: Activity-specific effort thresholds
  - Lines 264-265: Threshold evaluation logic
  - Lines 267-278: Activity-to-protocol filename mapping
  - Lines 283-312: Session state tracking and context injection

**Protocol Definitions:**
- `hooks/state-tracking/protocols/ARCHITECTURE-DESIGN.md` - Architecture workflow (1050 lines)
- `hooks/state-tracking/protocols/BUG-FIXING.md` - Debugging workflow (547 lines)
- `hooks/state-tracking/protocols/CODE-REVIEW.md` - Review workflow (720 lines)
- `hooks/state-tracking/protocols/DOCUMENTATION.md` - Documentation workflow
- `hooks/state-tracking/protocols/FEATURE-DEVELOPMENT.md` - Feature workflow (632 lines)
- `hooks/state-tracking/protocols/INVESTIGATION.md` - Investigation workflow (782 lines)
- `hooks/state-tracking/protocols/REQUIREMENTS-GATHERING.md` - Requirements workflow (559 lines)
- `hooks/state-tracking/protocols/SECURITY-AUDIT.md` - Security workflow

Each protocol provides:
- Structured multi-phase workflows
- Context-appropriate discovery questions
- Quality checklists and criteria
- Decision frameworks
- Parallel agent execution strategies
- Common patterns and best practices

**Configuration:**
- `hooks/state-tracking/package.json` - Dependencies (ai SDK, OpenAI provider, Zod)
- `hooks/state-tracking/pnpm-lock.yaml` - Locked dependency versions
- `.claude/settings.json` - Hook registration:
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node $CLAUDE_PROJECT_DIR/hooks/state-tracking/activity-tracker.js"
          }
        ]
      }
    ]
  }
}
```

**State & Logs:**
- `conversation-state/{session_id}.json` - Session-specific protocol tracking
- `logs/activity-tracker.log` - Activity classification history (JSONL format)

**Testing:**
- `hooks/state-tracking/TESTING.md` - Comprehensive testing guide
- `hooks/state-tracking/test-gemma.js` - Test script for Gemma 2 model
- `hooks/state-tracking/todo-stats.py` - Analytics for todo patterns

### Technology Stack

**Runtime:** Node.js (CommonJS modules)

**LLM Integration:**
- AI SDK (`ai`) - Vercel's AI SDK for structured LLM outputs
- OpenAI Provider (`@ai-sdk/openai`) - GPT-4.1-mini for classification
- Model: `gpt-4.1-mini` - Fast, cost-effective classification

**Validation:**
- Zod (`zod`) - TypeScript-first schema validation for structured outputs
- Ensures LLM returns valid activity classifications with confidence/effort scores

**Data Formats:**
- JSON for hook I/O and session state
- JSONL for transcript parsing and activity logs
- Markdown for protocol documentation

## Configuration

### Environment Variables
- `CLAUDE_PROJECT_DIR` - Absolute path to project root (provided by Claude CLI)
- `OPENAI_API_KEY` - Required for GPT-4.1-mini classification (from environment)

### Hook Settings
Located in `.claude/settings.json`:
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node $CLAUDE_PROJECT_DIR/hooks/state-tracking/activity-tracker.js",
            "timeout": 60000
          }
        ]
      }
    ]
  }
}
```

### Activity Thresholds
Defined in `activity-tracker.js` lines 251-262:
```javascript
const activityThresholds = {
  'debugging': 3,           // Low threshold - even simple bugs benefit
  'architecting': 3,
  'requirements-gathering': 3,
  'code-review': 3,
  'investigating': 3,
  'security-auditing': 4,   // Slightly higher for security rigor
  'feature-development': 7, // High threshold - only substantial features
  'documenting': 7,
  'testing': 7,
  'other': 10               // Never inject for ambiguous work
};
```

### Protocol File Paths
Protocols must exist at `~/.claude/hooks/state-tracking/protocols/`:
- `ARCHITECTURE-DESIGN.md`
- `BUG-FIXING.md`
- `CODE-REVIEW.md`
- `DOCUMENTATION.md`
- `FEATURE-DEVELOPMENT.md`
- `INVESTIGATION.md`
- `REQUIREMENTS-GATHERING.md`
- `SECURITY-AUDIT.md`

## Usage Example

### Example 1: Bug Fixing Detection
```bash
# User prompt
$ claude
> Fix the bug where search results show duplicates

# Hook processes prompt
# - Reads conversation history
# - Classifies as "debugging" (confidence: 92%, effort: 5)
# - Exceeds threshold (≥80% confidence, ≥3 effort)
# - Injects BUG-FIXING.md protocol

# Claude receives context and follows protocol:
# 1. Asks discovery questions (reproduction steps, scope, recent changes)
# 2. Forms hypothesis about root cause
# 3. Proposes fix with verification plan
# 4. Implements fix after approval
# 5. Documents learning if pattern found
```

### Example 2: Feature Development Detection
```bash
# User prompt
> Create a new user dashboard with analytics widgets

# Hook processes prompt
# - Classifies as "feature-development" (confidence: 88%, effort: 8)
# - Exceeds threshold (≥80% confidence, ≥7 effort)
# - Injects FEATURE-DEVELOPMENT.md protocol

# Claude follows structured workflow:
# 1. Asks 5-7 behavioral unpacking questions
# 2. Creates behavioral specification
# 3. Generates technical inferences with confidence levels
# 4. Breaks down into atomic tasks
# 5. Implements with self-review checklist
# 6. Creates state snapshots between tasks
```

### Example 3: Threshold Not Met
```bash
# User prompt
> Read that file for me

# Hook processes prompt
# - Classifies as "other" (confidence: 75%, effort: 1)
# - Below threshold (confidence <80%, effort <3)
# - No protocol injected
# - Simple stdout logging only

# Claude handles normally without special protocol
```

### Example 4: Session State Prevents Duplicate
```bash
# First prompt in session
> Debug the login timeout issue

# Protocol injected → session state created

# Second prompt in same session
> Also check the logout flow

# Hook detects existing session state
# No duplicate protocol injection
# Claude already has debugging protocol loaded
```

## Testing

### Manual Testing
From `hooks/state-tracking/TESTING.md`:

**Test 1: Verify Hook Registration**
```bash
cd ~/.claude
grep -A 10 "UserPromptSubmit" .claude/settings.json
# Should show activity-tracker.js command
```

**Test 2: Test Activity Detection**
```bash
# Create test input
cat > /tmp/test-input.json << 'EOF'
{
  "hook_event_name": "UserPromptSubmit",
  "session_id": "test-123",
  "prompt": "Fix the authentication bug",
  "transcript_path": "/tmp/empty.jsonl",
  "cwd": "/tmp"
}
EOF

# Test hook
node hooks/state-tracking/activity-tracker.js < /tmp/test-input.json

# Expected output for debugging activity (effort ≥3):
# JSON with hookSpecificOutput containing protocol path
```

**Test 3: Verify Threshold Logic**
```bash
# Test low-effort task (should not inject)
echo '{"hook_event_name":"UserPromptSubmit","session_id":"test","prompt":"Read file","transcript_path":"/tmp/empty.jsonl","cwd":"/tmp"}' | \
  node hooks/state-tracking/activity-tracker.js

# Expected: Simple activity log output, no protocol injection
```

**Test 4: Check Logging**
```bash
# Trigger hook with real conversation
# Then check logs
tail -f ~/.claude/logs/activity-tracker.log

# Expected: JSONL entries with timestamp, activity, confidence, effort
```

### Expected Behavior

**Protocol Injection Criteria:**
1. Hook event is `UserPromptSubmit`
2. Conversation history successfully parsed (≥1 message)
3. LLM classification succeeds
4. Confidence ≥80%
5. Effort meets activity-specific threshold
6. Activity maps to existing protocol file
7. No existing session state file

**Logging Behavior:**
- All classifications logged to `activity-tracker.log` (regardless of threshold)
- Session state only created when protocol injected
- Silent failure on errors (exit 0 to prevent blocking prompts)

**Performance:**
- Classification typically completes in 1-3 seconds
- Transcript parsing handles conversations up to 1000+ lines
- Smart truncation prevents token limit issues

## Related Documentation

### Architecture
- `.docs/guides/hooks.md` - Claude Code hooks reference documentation
  - Hook events (UserPromptSubmit, PreToolUse, PostToolUse, etc.)
  - Hook input/output schemas
  - JSON vs exit code output patterns
  - Security considerations and best practices

- `.docs/guides/hook-examples.md` - Real hook event examples
  - Complete event schemas with actual data
  - Tool input/output examples (Bash, Read, Write, TodoWrite, Task)
  - PreToolUse and PostToolUse event pairs

### Protocols
Each protocol provides comprehensive workflow guidance:

- **ARCHITECTURE-DESIGN.md** - System design workflows
  - Discovery questions (purpose, requirements, constraints)
  - Multi-option architecture proposals with trade-offs
  - Detailed component design (data, API, business logic layers)
  - Parallel agent strategies for layer-based design

- **BUG-FIXING.md** - Debugging workflows
  - Root cause diagnosis (hypothesis → verification → fix)
  - Complex multi-file bug investigation
  - Parallel bug fixing across components
  - Root-cause-analyzer agent usage patterns

- **CODE-REVIEW.md** - Review workflows
  - Multi-level issue prioritization (Critical/Important/Nice-to-have)
  - Parallel review agents (security, performance, accessibility, impact)
  - Quality scoring rubric (security, correctness, performance, etc.)
  - Automated fix implementation

- **FEATURE-DEVELOPMENT.md** - Feature workflows
  - Behavioral unpacking (5-7 discovery questions)
  - Technical inference generation with confidence levels
  - Atomic task breakdown with dependencies
  - Parallel execution planning (layer-based, feature-based patterns)
  - Self-review checklists (accessibility, performance, error handling)

- **INVESTIGATION.md** - Code exploration workflows
  - Investigation type classification (flow explanation, performance, logic, location)
  - code-finder usage patterns and capabilities
  - Parallel multi-domain investigation patterns
  - Performance analysis with bottleneck identification

### Testing
- `hooks/state-tracking/TESTING.md` - Activity tracker testing guide
  - Hook registration verification
  - Activity detection testing
  - Threshold logic validation
  - Logging verification
  - End-to-end workflow testing

### Analytics
- `hooks/state-tracking/todo-stats.py` - Todo pattern analysis
  - Analyzes TodoWrite hook events
  - Generates statistics on task completion patterns
