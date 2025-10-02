#!/usr/bin/env node
/**
 * Feature Validation Hook for Claude Code
 *
 * Runs after Claude stops to validate completed work:
 * 1. Assesses if changes require validation
 * 2. For features: validates completion criteria and verifies assumptions
 * 3. Runs validation in background using SDK query
 * 4. Reports findings to .claude/validation.md
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { query } from '/Users/silasrhyneer/.claude/claude-cli/sdk.mjs';

/**
 * Load and parse hook input from stdin
 */
async function loadInput() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(input);
  } catch (e) {
    console.error(`Error: Invalid JSON input: ${e.message}`);
    process.exit(1);
  }
}

/**
 * Extract assistant messages since last user message
 */
function getRecentAssistantMessages(transcriptPath) {
  if (!existsSync(transcriptPath)) {
    return [];
  }

  const lines = readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
  const messages = lines.map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);

  // Find last user message index
  let lastUserIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].type === 'user') {
      lastUserIndex = i;
      break;
    }
  }

  // Get all assistant messages after last user message
  const assistantMessages = [];
  for (let i = lastUserIndex + 1; i < messages.length; i++) {
    if (messages[i].type === 'assistant') {
      assistantMessages.push(messages[i]);
    }
  }

  return assistantMessages;
}

/**
 * Get tool calls from assistant messages
 */
function getToolCalls(assistantMessages) {
  const toolCalls = [];

  for (const msg of assistantMessages) {
    const content = msg.message?.content || msg.content || [];
    for (const block of content) {
      if (block.type === 'tool_use') {
        toolCalls.push({
          tool: block.name,
          input: block.input
        });
      }
    }
  }

  return toolCalls;
}

/**
 * Extract text content from assistant messages
 */
function getAssistantText(assistantMessages) {
  const texts = [];

  for (const msg of assistantMessages) {
    const content = msg.message?.content || msg.content || [];
    for (const block of content) {
      if (block.type === 'text') {
        texts.push(block.text);
      }
    }
  }

  return texts.join('\n\n');
}

/**
 * Determine if changes require validation
 */
function requiresValidation(toolCalls, assistantText) {
  // Check for code changes - validate any time code is modified
  const codeChanges = toolCalls.some(tc =>
    ['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(tc.tool)
  );

  return codeChanges;
}

/**
 * Run validation in background using Claude SDK
 */
async function runBackgroundValidation(assistantMessages, cwd, projectDir) {
  const assistantText = getAssistantText(assistantMessages);
  const toolCalls = getToolCalls(assistantMessages);

  // Set up logging
  const logPath = join(process.env.HOME, '.claude', 'hooks.log');
  const logMessage = (msg) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [feature-validator] ${msg}\n`;
    try {
      writeFileSync(logPath, logEntry, { flag: 'a' });
    } catch (e) {
      // Silent fail
    }
  };

  logMessage(`Starting validation with ${toolCalls.length} tool calls`);

  // Build validation prompt
  const validationPrompt = `You are a validation agent. Review the following recent work and validate it thoroughly.

## Recent Work Summary

${assistantText}

## Tool Calls Made
${toolCalls.map(tc => `- ${tc.tool}: ${JSON.stringify(tc.input).substring(0, 200)}...`).join('\n')}

## Your Validation Tasks

### 1. Feature Completion Assessment
- Is this feature fully finished?
- List all completion criteria (NOT tests, just completion criteria)
- For each criterion, verify it thoroughly using available tools
- Check for edge cases and error handling. Do not be lazy.

### 2. Assumption Verification
- List all assumptions being made in the implementation
- For each assumption, independently verify it is correct, delegating to a subagent for each one.
- Check documentation, code behavior, and actual implementation

## Output Format

**IMPORTANT**: Use @ notation for ALL file and directory references (e.g., @path/to/file, @~/.claude/validation.md)

Provide your findings in this format:

### Completion Criteria
- [ ] Criterion 1: Description (✓ verified / ✗ failed / ⚠ incomplete)
- [ ] Criterion 2: Description (✓ verified / ✗ failed / ⚠ incomplete)

### Assumptions
- [ ] Assumption 1: Description (✓ valid / ✗ invalid)
- [ ] Assumption 2: Description (✓ valid / ✗ invalid)

### Issues Found
1. Issue description [@file:line]
2. Issue description [@file:line]

### Recommendations
- Specific recommendation 1
- Specific recommendation 2

If everything is valid and complete, simply state "✅ Validation passed - no issues found"
`;

  try {
    logMessage(`Running query for validation`);
    // Run validation using Claude SDK
    const response = query({
      prompt: validationPrompt,
      cwd: projectDir || cwd,
      maxTurns: 30,
      options: {
        model: 'claude-sonnet-4-5'
      },
      continueConversation: false,
      disableHooks: true
    });

    // Collect response text
    let validationResult = '';

    for await (const message of response) {
      if (message.type === 'assistant' && message.message?.content) {
        for (const block of message.message.content) {
          if (block.type === 'text') {
            validationResult += block.text;
          }
        }
      }
    }

    // Save to validation file if issues found
    const hasIssues = !validationResult.includes('✅ Validation passed');
    logMessage(`Validation completed. Has issues: ${hasIssues}`);
    logMessage(`Full validation result:\n${validationResult}`);

    if (hasIssues) {
      const validationPath = join(projectDir || cwd, '.claude', 'validation.md');

      // Ensure .claude directory exists
      const claudeDir = dirname(validationPath);
      if (!existsSync(claudeDir)) {
        const { mkdirSync } = await import('fs');
        mkdirSync(claudeDir, { recursive: true });
      }

      // Read existing validation content if it exists
      let existingContent = '';
      if (existsSync(validationPath)) {
        existingContent = readFileSync(validationPath, 'utf8').trim();
      }

      // Prepare new entry
      const timestamp = new Date().toISOString();
      const newEntry = `
## Validation Report - ${timestamp}

${validationResult}

---
`;

      // Append to existing or create new (including when file is empty)
      const finalContent = existingContent
        ? existingContent + '\n' + newEntry
        : `# Validation Reports\n\n${newEntry}`;

      writeFileSync(validationPath, finalContent, 'utf8');

      logMessage(`Issues logged to @${validationPath.replace(process.env.HOME, '~')}`);
      console.log(`Validation issues found and saved to @${validationPath.replace(process.env.HOME, '~')}`);
    }
    // If validation passed, don't create/update file - just log success
    else {
      logMessage(`Validation passed`);
      console.log('✅ Validation passed - no issues found');
    }

  } catch (error) {
    logMessage(`Error: ${error.message}`);
    console.error(`Validation error: ${error.message}`);
    // Don't fail the hook on validation errors
  }
}

/**
 * Background validation worker (runs as detached process)
 */
async function backgroundWorker() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf8');
  const { assistantMessages, cwd, projectDir } = JSON.parse(input);

  await runBackgroundValidation(assistantMessages, cwd, projectDir);
  process.exit(0);
}

/**
 * Main hook execution
 */
async function main() {
  // Check if running as background worker
  if (process.argv.includes('--background')) {
    await backgroundWorker();
    return;
  }

  const input = await loadInput();
  const logPath = join(process.env.HOME, '.claude', 'hooks.log');

  // Only process Stop events
  if (input.hook_event_name !== 'Stop') {
    process.exit(0);
  }

  // Don't run if we're already in a stop hook to prevent infinite loops
  if (input.stop_hook_active) {
    process.exit(0);
  }

  const transcriptPath = input.transcript_path;
  const cwd = input.cwd || process.cwd();

  // Skip if this is a validation.md or CLAUDE.md write to prevent circular hooks
  const recentToolCalls = getToolCalls(getRecentAssistantMessages(transcriptPath));
  const hasValidationWrite = recentToolCalls.some(tc =>
    ['Write', 'Edit'].includes(tc.tool) &&
    tc.input?.file_path?.endsWith('/validation.md')
  );
  if (hasValidationWrite) {
    process.exit(0);
  }

  // Find project directory (where .claude might be)
  const findProjectDir = (startDir) => {
    let dir = startDir;
    while (dir !== dirname(dir)) {
      if (existsSync(join(dir, '.claude')) || existsSync(join(dir, 'package.json'))) {
        return dir;
      }
      dir = dirname(dir);
    }
    return startDir;
  };

  const projectDir = findProjectDir(cwd);

  // Get recent assistant messages
  const assistantMessages = getRecentAssistantMessages(transcriptPath);

  if (assistantMessages.length === 0) {
    process.exit(0);
  }

  // Get tool calls for analysis
  const toolCalls = getToolCalls(assistantMessages);
  const assistantText = getAssistantText(assistantMessages);

  // Check if validation is needed
  const needsValidation = requiresValidation(toolCalls, assistantText);

  if (!needsValidation) {
    process.exit(0);
  }

  // Only log when actually running validation
  const writeLog = (msg) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [feature-validator] ${msg}\n`;
    try {
      writeFileSync(logPath, logEntry, { flag: 'a' });
    } catch (e) {
      // Silent fail
    }
  };

  writeLog(`Validation triggered: ${toolCalls.length} tool calls detected`);

  // Spawn detached background process for validation
  const { spawn } = await import('child_process');

  const validationData = JSON.stringify({
    assistantMessages,
    cwd,
    projectDir
  });

  const child = spawn(process.execPath, [
    import.meta.url.replace('file://', ''),
    '--background'
  ], {
    detached: true,
    stdio: ['pipe', 'ignore', 'ignore']
  });

  child.stdin.write(validationData);
  child.stdin.end();
  child.unref();

  // Return success immediately - validation happens in background
  const response = {
    suppressOutput: true
  };
  console.log(JSON.stringify(response));

  process.exit(0);
}

main();
