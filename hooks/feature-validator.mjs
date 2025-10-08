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

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { query } from '/Users/silasrhyneer/.claude/claude-cli/sdk.mjs';

const HOOK_NAME = 'feature-validator';
const TODO_CACHE_MAX_AGE_MS = 2 * 60 * 1000;

function appendLog(message) {
  const homeDir = process.env.HOME;
  if (!homeDir) {
    return;
  }
  const logPath = join(homeDir, '.claude', 'logs', 'hooks.log');
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${HOOK_NAME}] ${message}\n`;
  try {
    writeFileSync(logPath, entry, { flag: 'a' });
  } catch (error) {
    // Ignore logging failures to avoid breaking the hook
  }
}

function getMessageText(message) {
  if (!message) {
    return '';
  }
  const content = message.message?.content || message.content || [];
  const parts = [];
  for (const block of content) {
    if (block.type === 'text' && typeof block.text === 'string') {
      parts.push(block.text);
    }
  }
  return parts.join('\n').trim();
}

const CHECKBOX_PATTERN = /(?:\[(?: |x|X)\]|[☐☑☒✅❌])/;
const TODO_CHECKBOX_REGEX = /(^|\n)\s*(?:[-*]|\d+\.)?\s*(?:\[(?: |x|X)\]|[☐☑☒✅❌])/;
const TODO_HEADER_REGEX = /(^|\n)\s*(todo(?:\s+list)?|todos?)\s*[:\-]/i;

function extractTodoInfoFromMessage(message) {
  if (!message) {
    return null;
  }

  const content = message.message?.content || message.content || [];
  let combinedText = '';
  let todoBlocks = [];

  for (const block of content) {
    if (block.type === 'text' && typeof block.text === 'string') {
      combinedText += `${block.text}\n`;
    }
    if (block.type === 'tool_use' && block.name === 'TodoWrite') {
      const todos = Array.isArray(block.input?.todos) ? block.input.todos : [];
      todoBlocks.push({ todos, block });
    }
  }

  const textMatches = combinedText && (TODO_CHECKBOX_REGEX.test(combinedText) || TODO_HEADER_REGEX.test(combinedText));
  if (todoBlocks.length > 0) {
    return {
      source: 'tool',
      todos: todoBlocks[0].todos,
      block: todoBlocks[0].block,
      text: combinedText.trim(),
      signature: computeTodoSignature(todoBlocks[0].todos),
    };
  }

  if (textMatches) {
    return {
      source: 'text',
      todos: null,
      block: null,
      text: combinedText.trim(),
      signature: null,
    };
  }

  return null;
}

function summarizeTodoList(info) {
  if (!info) {
    return 'todo list';
  }

  if (info.source === 'tool' && Array.isArray(info.todos) && info.todos.length > 0) {
    const parts = info.todos.slice(0, 3).map(todo => {
      const content = typeof todo.content === 'string' && todo.content.trim().length > 0
        ? todo.content.trim().slice(0, 80)
        : '(unnamed)';
      const status = typeof todo.status === 'string' ? todo.status : 'unknown';
      return `${content} [${status}]`;
    });
    const suffix = info.todos.length > 3 ? '...' : '';
    return parts.join(' | ') + suffix;
  }

  const text = info.text || '';
  if (!text) {
    return 'todo list';
  }

  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return 'todo list';
  }

  const checkboxLines = lines.filter(line => {
    const trimmed = line.replace(/^[-*]?\s*/, '');
    return CHECKBOX_PATTERN.test(trimmed);
  });
  const targets = checkboxLines.length > 0 ? checkboxLines : lines;
  const preview = targets.slice(0, 2).map(line => line.length > 80 ? `${line.slice(0, 77)}...` : line);
  const suffix = targets.length > 2 ? '...' : '';
  return `${preview.join(' | ')}${suffix}`;
}

function computeTodoSignature(todos) {
  if (!Array.isArray(todos) || todos.length === 0) {
    return null;
  }
  return todos
    .map(todo => {
      if (!todo || typeof todo !== 'object') {
        return 'unknown';
      }
      const id = typeof todo.id === 'string' && todo.id.length > 0
        ? `id:${todo.id}`
        : typeof todo.activeForm === 'string' && todo.activeForm.length > 0
          ? `active:${todo.activeForm}`
          : typeof todo.content === 'string' && todo.content.length > 0
            ? `content:${todo.content}`
            : JSON.stringify(todo);
      const status = typeof todo.status === 'string' ? todo.status : 'unknown';
      return `${id}:${status}`;
    })
    .join('|');
}

function getTodoStateCachePath() {
  const homeDir = process.env.HOME;
  if (!homeDir) {
    return null;
  }
  return join(homeDir, '.claude', 'hooks-state', 'todo-state.json');
}

function readCachedTodoState() {
  const path = getTodoStateCachePath();
  if (!path || !existsSync(path)) {
    return { signature: null, statuses: {}, todos: [], updatedAt: null };
  }
  try {
    const raw = JSON.parse(readFileSync(path, 'utf-8'));
    if (!raw || typeof raw !== 'object') {
      return { signature: null, statuses: {}, todos: [], updatedAt: null };
    }
    return {
      signature: typeof raw.signature === 'string' ? raw.signature : null,
      statuses: raw.statuses && typeof raw.statuses === 'object' ? raw.statuses : {},
      todos: Array.isArray(raw.todos) ? raw.todos : [],
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
    };
  } catch (error) {
    return { signature: null, statuses: {}, todos: [], updatedAt: null };
  }
}

function isTodoStateFresh(state, maxAgeMs = TODO_CACHE_MAX_AGE_MS) {
  if (!state || !state.updatedAt) {
    return false;
  }
  const updatedTime = Date.parse(state.updatedAt);
  if (Number.isNaN(updatedTime)) {
    return false;
  }
  return Date.now() - updatedTime <= maxAgeMs;
}

function getFeatureStatePath() {
  const homeDir = process.env.HOME;
  if (!homeDir) {
    return null;
  }
  return join(homeDir, '.claude', 'hooks-state', 'feature-validator-state.json');
}

const DEFAULT_STATE = { byTranscript: {} };

function normalizeLegacyState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_STATE };
  }

  if (raw.byTranscript && typeof raw.byTranscript === 'object') {
    return { byTranscript: raw.byTranscript };
  }

  const entries = {};
  if (typeof raw.lastSignature === 'string') {
    entries.__global__ = {
      signature: raw.lastSignature,
      processedAt: typeof raw.lastProcessedAt === 'string' ? raw.lastProcessedAt : null,
    };
  }

  return { byTranscript: entries };
}

function readFeatureValidatorState() {
  const path = getFeatureStatePath();
  if (!path || !existsSync(path)) {
    return { ...DEFAULT_STATE };
  }
  try {
    const raw = JSON.parse(readFileSync(path, 'utf-8'));
    return normalizeLegacyState(raw);
  } catch (error) {
    return { ...DEFAULT_STATE };
  }
}

function pruneFeatureState(state, maxAgeMs = 12 * 60 * 60 * 1000) {
  const now = Date.now();
  const entries = state.byTranscript || {};
  for (const [key, value] of Object.entries(entries)) {
    if (!value || typeof value !== 'object') {
      delete entries[key];
      continue;
    }
    const processedAt = value.processedAt ? Date.parse(value.processedAt) : NaN;
    if (Number.isNaN(processedAt) || now - processedAt > maxAgeMs) {
      delete entries[key];
    }
  }
  state.byTranscript = entries;
}

function writeFeatureValidatorState(state) {
  const path = getFeatureStatePath();
  if (!path) {
    return;
  }
  try {
    pruneFeatureState(state);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(state), 'utf-8');
  } catch (error) {
    // Ignore persistence failures
  }
}

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
 * Background validation worker (runs as detached process)
 */
async function backgroundWorker() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf8');
  const { assistantMessages, cwd, projectDir, todoSummary } = JSON.parse(input);

  await runBackgroundValidation(assistantMessages, cwd, projectDir, todoSummary || 'todo list');
  process.exit(0);
}

/**
 * Main hook execution
 */
async function main() {
  if (process.argv.includes('--background')) {
    await backgroundWorker();
    return;
  }

  const input = await loadInput();

  const inputKeys = Object.keys(input || {});
  const transcriptPath = input.transcript_path;
  const cwd = input.cwd || process.cwd();
  const cachedTodoState = readCachedTodoState();
  const cacheAgeMsRaw = cachedTodoState.updatedAt ? Date.now() - Date.parse(cachedTodoState.updatedAt) : Number.POSITIVE_INFINITY;
  const cacheAgeDisplay = Number.isFinite(cacheAgeMsRaw) ? Math.max(Math.round(cacheAgeMsRaw), 0) : 'inf';
  const cacheFresh = isTodoStateFresh(cachedTodoState);

  const lastAssistantSnippet = assistantMessages => {
    if (!assistantMessages || assistantMessages.length === 0) {
      return 'none';
    }
    const text = getMessageText(assistantMessages[assistantMessages.length - 1]) || '';
    return text.slice(0, 80).replace(/\s+/g, ' ').trim() || 'empty';
  };

  const skip = (reason, extra = '') => {
    const details = [
      `keys=${inputKeys.join('|')}`,
      `path=${transcriptPath || 'none'}`,
      `cacheTodos=${cachedTodoState.todos.length}`,
      `cacheAgeMs=${cacheAgeDisplay}`,
    ];
    if (extra) {
      details.push(extra.trim());
    }
    appendLog(`Skipped: ${reason} (${details.join(', ')})`);
    process.exit(0);
  };

  if (input.hook_event_name !== 'Stop') {
    skip('event not Stop');
  }

  if (input.stop_hook_active) {
    skip('stop hook already active');
  }

  if (!transcriptPath) {
    skip('missing transcript path');
  }

  const assistantMessages = getRecentAssistantMessages(transcriptPath);
  if (assistantMessages.length === 0) {
    skip('no assistant messages after last user', 'assistantCount=0');
  }

  const recentToolCalls = getToolCalls(assistantMessages);
  const hasValidationWrite = recentToolCalls.some(tc =>
    ['Write', 'Edit'].includes(tc.tool) &&
    (tc.input?.file_path?.endsWith('/validation.json') || tc.input?.file_path?.endsWith('/validation.md'))
  );
  if (hasValidationWrite) {
    skip('validation files recently updated');
  }

  const hasTodoWrites = recentToolCalls.some(tc => tc.tool === 'TodoWrite');

  let todoMessageIndex = -1;
  let todoInfo = null;
  for (let i = assistantMessages.length - 1; i >= 0; i--) {
    const info = extractTodoInfoFromMessage(assistantMessages[i]);
    if (info) {
      todoMessageIndex = i;
      todoInfo = info;
      break;
    }
  }

  if (todoMessageIndex === -1 && cacheFresh && cachedTodoState.todos.length > 0) {
    todoInfo = {
      source: 'cached',
      todos: cachedTodoState.todos,
      text: '',
      signature: cachedTodoState.signature,
    };
    todoMessageIndex = assistantMessages.length > 0 ? assistantMessages.length - 1 : 0;
  }

  if (todoMessageIndex === -1) {
    skip(
      'no todo list in assistant messages',
      `assistantCount=${assistantMessages.length}, hasTodoWrite=${hasTodoWrites}, cacheFresh=${cacheFresh}, last="${lastAssistantSnippet(assistantMessages)}"`
    );
  }

  if (!todoInfo && todoMessageIndex >= 0) {
    todoInfo = extractTodoInfoFromMessage(assistantMessages[todoMessageIndex]) || todoInfo;
  }

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
  const todoSummary = summarizeTodoList(todoInfo);

  let todoSignature = (todoInfo && todoInfo.signature) || null;
  if (!todoSignature && todoInfo && Array.isArray(todoInfo.todos)) {
    todoSignature = computeTodoSignature(todoInfo.todos);
  }
  if (!todoSignature) {
    todoSignature = cachedTodoState.signature;
  }

  const featureState = readFeatureValidatorState();
  const transcriptKey = transcriptPath || '__global__';
  const existingEntry = featureState.byTranscript?.[transcriptKey];
  if (todoSignature && existingEntry && existingEntry.signature === todoSignature) {
    const processedAtTime = existingEntry.processedAt ? Date.parse(existingEntry.processedAt) : NaN;
    if (!Number.isNaN(processedAtTime) && Date.now() - processedAtTime <= TODO_CACHE_MAX_AGE_MS) {
      skip('duplicate todo signature recently processed', `signature=${todoSignature}, transcript=${transcriptKey}`);
    }
  }

  const { spawn } = await import('child_process');

  const validationData = JSON.stringify({
    assistantMessages,
    cwd,
    projectDir,
    todoSummary,
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

  if (todoSignature) {
    featureState.byTranscript = featureState.byTranscript || {};
    featureState.byTranscript[transcriptKey] = {
      signature: todoSignature,
      processedAt: new Date().toISOString(),
    };
    writeFeatureValidatorState(featureState);
  }

  console.log(JSON.stringify({ suppressOutput: true }));
  process.exit(0);
}
/**
 * Run validation in background using Claude SDK
 */
async function runBackgroundValidation(assistantMessages, cwd, projectDir, todoSummary) {
  const assistantText = getAssistantText(assistantMessages);
  const toolCalls = getToolCalls(assistantMessages);

  const systemPrompt = `You are a validation agent that reviews completed work for thoroughness and correctness.

CRITICAL CONSTRAINTS:
- Focus on verification, not explanation
- Use tools to verify assumptions and completion criteria
- Log ALL issues using MCP tools - do not just describe them
- Your final response must be ONLY the word "Done"

TOOLS AVAILABLE:
- Read/Grep/Glob/Task - for verification and investigation
- mcp__validation__saveValidationFailure - REQUIRED to log any issues found
  * content: Description of issue with context and how to fix
  * files: Array of affected file paths (e.g., ["src/foo.ts"])
- mcp__validation__removeValidationFailure - Remove resolved issues by timestamp

VALIDATION TASKS:

1. **Feature Completion Assessment**
   - Is this feature fully finished?
   - List all completion criteria (NOT tests, just completion criteria)
   - For each criterion, verify it thoroughly using available tools
   - Check for edge cases and error handling. Do not be lazy.

2. **Assumption Verification**
   - List all assumptions being made in the implementation
   - For each assumption, independently verify it is correct, delegating to a subagent for each one
   - Check documentation, code behavior, and actual implementation

3. **Check for Resolved Issues**
   - Read @.claude/validation.json to see if any previously logged issues have been resolved by this work
   - Use removeValidationFailure(timestamp) to remove any fixed issues

REPORTING ISSUES:

For any issues found, you MUST call mcp__validation__saveValidationFailure:
- content: Clear description of the issue including criterion/assumption, what failed, why, and how to fix
- files: Array of affected file paths (extract from tool calls or investigation)

CRITICAL: After all validation is complete, your ENTIRE response must be exactly: "Done"
Do not provide summaries, do not list findings - just submit via MCP tools and respond "Done".`;

  const validationPrompt = `<recent_work>
${assistantText}
</recent_work>

<tool_calls_made>
${toolCalls.map(tc => `- ${tc.tool}: ${JSON.stringify(tc.input).substring(0, 200)}...`).join('\n')}
</tool_calls_made>

<todo_list_summary>
${todoSummary}
</todo_list_summary>

Review the above work and validate it thoroughly according to your instructions.`;

  let logText = null;

  try {
    const response = query({
      prompt: validationPrompt,
      cwd: projectDir || cwd,
      maxTurns: 30,
      options: {
        customSystemPrompt: systemPrompt,
        model: "claude-sonnet-4-5",
        allowedTools: ["Read", "Grep", "Glob", "Task", "mcp__validation__saveValidationFailure", "mcp__validation__removeValidationFailure"],
        permissionMode: "bypassPermissions",
        disableHooks: true,
        mcpServers: {
          validation: {
            command: "node",
            args: [join(process.env.HOME, ".claude", "hooks", "validation-mcp.mjs")],
            env: { CLAUDE_PROJECT_DIR: projectDir || cwd }
          }
        },
      },
      continueConversation: false,
    });

    let validationResult = "";
    const toolNames = new Set();

    for await (const message of response) {
      if (message.type === 'assistant' && message.message?.content) {
        for (const block of message.message.content) {
          if (block.type === 'text') {
            validationResult += block.text;
          } else if (block.type === 'tool_use' && block.name) {
            toolNames.add(block.name);
          }
        }
      }
    }

    const trimmed = validationResult.trim();
    const completed = trimmed.toLowerCase() === 'done';
    const firstLine = trimmed.split('\n')[0] || trimmed;
    const resultSummary = completed
      ? 'Done'
      : (firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine || 'Incomplete');

    if (completed) {
      console.log('Validation complete - check @.claude/validation.json for any issues');
    } else {
      console.log('Validation finished - check @.claude/validation.json');
    }

    const issueLogged = Array.from(toolNames).some(name => name === 'mcp__validation__saveValidationFailure');
    const issueSuffix = issueLogged ? ' | issues logged' : '';
    const toolsSuffix = toolNames.size > 0
      ? ` | tools: ${Array.from(toolNames).join(', ')}`
      : '';
    logText = `Result ${resultSummary} for ${todoSummary}${issueSuffix}${toolsSuffix}`;
  } catch (error) {
    console.error(`Validation error: ${error.message}`);
    logText = `Validation error for ${todoSummary}: ${error.message}`;
  }

  if (logText) {
    appendLog(logText);
  }
}

main();
