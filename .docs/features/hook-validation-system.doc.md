# Hook Validation System

## Overview
The hook validation system is a multi-layered automated code quality enforcement framework that validates tool usage against CLAUDE.md rules, manages CLAUDE.md files across directory hierarchies, validates feature completeness, and surfaces validation issues to user context for resolution.

## User Perspective
Users experience automated quality checks that run in the background after tool operations. When violations occur, they receive notifications and can review detailed reports in `@.claude/validation.md`. The system also proactively manages CLAUDE.md files to keep coding standards documented and surfaces validation context at the start of new prompts to ensure issues are addressed.

## Data Flow
1. User action triggers tool execution (Write, Edit, Bash, etc.)
2. PostToolUse hook captures tool input/response and spawns background validators
3. Background validators analyze code against CLAUDE.md rules using SDK query
4. Violations are auto-fixed when simple, or documented in `@.claude/validation.md`
5. UserPromptSubmit hook injects validation.md context into user's next prompt
6. Feature-validator runs on Stop events to verify completion criteria and assumptions
7. Validation-monitor ensures validation.md exists and adds reminder to user context

## Implementation

### Key Files
- `@hooks/claude-md-validator.mjs` - PostToolUse hook validating tool usage against CLAUDE.md rules
- `@hooks/claude-md-manager.mjs` - PostToolUse hook managing CLAUDE.md files in edited directories
- `@hooks/feature-validator.mjs` - Stop hook validating feature completion and assumptions
- `@hooks/validation-monitor.mjs` - UserPromptSubmit hook surfacing validation.md context
- `@.claude/validation.md` - Centralized validation report file (created automatically)
- `@.claude/ignored-bash.txt` - List of bash command prefixes to skip validation

### Hook Execution Points

**PostToolUse Hooks** (run in parallel after tool execution):
- `claude-md-validator.mjs` - Validates all code-modifying tools except TodoWrite
- `claude-md-manager.mjs` - Triggers for Write/Edit/MultiEdit tools to manage CLAUDE.md

**Stop Hooks** (run when Claude finishes responding):
- `feature-validator.mjs` - Validates features when code changes detected

**UserPromptSubmit Hooks** (run before processing user prompt):
- `validation-monitor.mjs` - Injects validation.md context if file exists

### Background Processing Pattern

All validators use the same detached background process pattern:

1. Main hook receives stdin with tool/event data
2. Hook performs quick filtering (skip TodoWrite, check ignored commands, etc.)
3. Hook spawns detached child process with `--background` flag
4. Main hook exits immediately (non-blocking)
5. Background worker reads data from stdin, runs SDK query with validation prompt
6. Background worker writes results to validation.md or auto-fixes issues
7. Logs all activity to `@~/.claude/hooks.log`

```javascript
// Main hook pattern
const child = spawn(process.execPath, [
  import.meta.url.replace('file://', ''),
  '--background'
], {
  detached: true,
  stdio: ['pipe', 'ignore', 'ignore'],
  env: { ...process.env, CLAUDE_VALIDATOR_ACTIVE: "1" }
});

child.stdin.write(JSON.stringify(validationData));
child.stdin.end();
child.unref();
process.exit(0);
```

### CLAUDE.md File Collection

The `claude-md-validator.mjs` collects CLAUDE.md files with hierarchical precedence:

1. Extract file directory from tool input (file_path or edits[0].file_path)
2. Walk from file directory up to cwd, collecting CLAUDE.md files
3. Add `@~/.claude/CLAUDE.md` if not already included
4. Merge files with section headers: "# Rules from: [directory]"
5. More specific rules (closer to file) take precedence in validation

### Validation Prompt Architecture

All validators use Claude SDK with structured prompts:

**claude-md-validator**:
- Receives: CLAUDE.md hierarchy, tool name/input/response, user message
- Task: Identify violations, auto-fix simple issues, document complex violations
- Output: "PASS" | "FIXED: description" | "FAIL: summary" | "SKIP: command"
- Allowed tools: Write, Bash, Edit, Read
- Model: claude-sonnet-4-5
- Max turns: 2

**claude-md-manager**:
- Receives: Directory context, existing CLAUDE.md, parent CLAUDE.md files
- Task: Decide if CLAUDE.md should be created/updated for edited directory
- Output: Writes CLAUDE.md or does nothing (minimal/conservative approach)
- Allowed tools: Write only
- Model: claude-sonnet-4-5-20250929
- Max turns: 1

**feature-validator**:
- Receives: Recent assistant messages, tool calls, assistant text
- Task: Validate completion criteria and verify assumptions using subagents
- Output: Structured report with completion checklist and assumption verification
- Allowed tools: All tools
- Model: claude-sonnet-4-5
- Max turns: 30

### Validation File Format

`@.claude/validation.md` uses timestamped entries:

```markdown
# CLAUDE.md Validation Reports

This file tracks violations of coding standards...

---

## 2025-10-02T10:30:45.123Z
**Tool:** Write
**Violation:** Used `any` type instead of proper type
**Context:** `function foo(x: any) { ... }`
**File:** @src/utils/helper.ts:15

---

## Validation Report - 2025-10-02T11:15:22.456Z

### Completion Criteria
- [ ] Criterion 1: Description (✓ verified / ✗ failed / ⚠ incomplete)

### Assumptions
- [ ] Assumption 1: Description (✓ valid / ✗ invalid)

### Issues Found
1. Issue description [@file:line]

### Recommendations
- Specific recommendation
```

### SDK Integration

All hooks use `@~/.claude/claude-cli/sdk.mjs` query function:

```javascript
import { query } from "/Users/silasrhyneer/.claude/claude-cli/sdk.mjs";

const response = query({
  prompt: validationPrompt,
  cwd: cwd,
  maxTurns: 2,
  options: {
    model: "claude-sonnet-4-5",
    allowedTools: ["Write", "Bash", "Edit", "Read"],
    permissionMode: "bypassPermissions",
    disableHooks: true,  // Prevent circular validation
  },
  continueConversation: false,
});
```

**Important SDK options**:
- `disableHooks: true` - Prevents validation hooks from triggering during validation
- `permissionMode: "bypassPermissions"` - Auto-approves tool usage
- `continueConversation: false` - Single-turn isolated queries

## Configuration

Hook registration in `@.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/hooks/claude-md-validator.mjs" },
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/hooks/claude-md-manager.mjs" }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/hooks/feature-validator.mjs" }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "$CLAUDE_PROJECT_DIR/hooks/validation-monitor.mjs" }
        ]
      }
    ]
  }
}
```

Environment variables:
- `CLAUDE_VALIDATOR_ACTIVE=1` - Set by validators to prevent circular validation
- `CLAUDE_PROJECT_DIR` - Set by Claude Code, points to project root
- `HOME` - Used to locate global CLAUDE.md and hooks.log

## Usage Example

```bash
# User edits a file with type violation
# (uses `any` type, which violates CLAUDE.md)

# 1. PostToolUse hook fires after Edit tool
# 2. claude-md-validator spawns background process
# 3. Validator analyzes: "Used any type on line 15"
# 4. Simple fix: Validator uses Edit to replace `any` with proper type
# 5. Logs: "FIXED: Replaced any with string on line 15"

# Complex violation scenario:
# 1. User writes code with fallback instead of throwing error
# 2. Validator identifies: "Used fallback, violates 'throw early' rule"
# 3. Too complex to auto-fix: Writes to @.claude/validation.md
# 4. Logs: "FAIL: Fallback used instead of error throw"
# 5. Next prompt: validation-monitor injects validation.md context
# 6. User sees: "By the way, I noticed [issue]. Let me fix that..."

# Feature validation scenario:
# 1. User completes a feature implementation
# 2. Stop hook fires, feature-validator checks completion
# 3. Validator delegates assumption checks to subagents
# 4. Finds incomplete edge case handling
# 5. Writes structured report to @.claude/validation.md
# 6. Next prompt: User sees validation report and addresses issues
```

## Testing

**Manual test for claude-md-validator**:
1. Create a CLAUDE.md file with rule: "Never use `any` type"
2. Edit a file to add `function foo(x: any)`
3. Check `@~/.claude/hooks.log` for validation activity
4. Verify violation is auto-fixed or documented in `@.claude/validation.md`

**Manual test for claude-md-manager**:
1. Create a new subdirectory with unique conventions
2. Edit a file in that directory
3. Check if CLAUDE.md is created with appropriate content
4. Verify parent CLAUDE.md files are considered (not redundant)

**Manual test for feature-validator**:
1. Complete a feature implementation with code changes
2. Stop Claude's response
3. Check `@.claude/validation.md` for completion criteria report
4. Verify assumptions were validated using subagents

**Manual test for validation-monitor**:
1. Create `@.claude/validation.md` with test content
2. Submit a new prompt
3. Verify system reminder appears in context with validation.md reference
4. Verify Claude mentions and addresses the issues

**Expected behavior**:
- Hooks execute in under 100ms (spawn background, exit immediately)
- Background validation completes within 10-30 seconds
- Simple violations auto-fixed without user notification
- Complex violations documented with file:line references
- No circular validation (hooks don't trigger during validation)
- All activity logged to `@~/.claude/hooks.log`

## Related Documentation

- Architecture: `@~/.claude/.docs/guides/hooks.md`
- SDK reference: `@~/.claude/claude-cli/sdk.mjs`
- Hook configuration: `@.claude/settings.json`
- CLAUDE.md format: `@.claude/CLAUDE.md`
- Validation output: `@.claude/validation.md`
