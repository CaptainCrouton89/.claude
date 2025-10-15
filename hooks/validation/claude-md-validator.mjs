#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { query } from "~/.claude/claude-cli/sdk.mjs";

/**
 * Collects CLAUDE.md files from file directory up to cwd, then includes HOME
 */
function collectClaudeMdFiles(toolInput, cwd) {
  const claudeMdFiles = [];

  // Extract directory from tool input
  let startDir = null;
  if (toolInput?.file_path) {
    startDir = dirname(resolve(toolInput.file_path));
  } else if (toolInput?.edits && toolInput.edits.length > 0) {
    startDir = dirname(resolve(toolInput.edits[0].file_path));
  }

  // If no file path found, start from cwd
  if (!startDir) {
    startDir = cwd;
  }

  const cwdResolved = resolve(cwd);
  const homeDir = process.env.HOME;

  // Walk from file's directory up to cwd
  let currentDir = startDir;
  while (true) {
    const claudeMdPath = join(currentDir, "CLAUDE.md");
    if (existsSync(claudeMdPath)) {
      claudeMdFiles.push({
        path: claudeMdPath,
        content: readFileSync(claudeMdPath, "utf-8"),
        source: currentDir
      });
    }

    // Stop when we reach cwd
    if (currentDir === cwdResolved) {
      break;
    }

    const parentDir = dirname(currentDir);
    // Stop if we can't go up anymore
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  // Add HOME/.claude/CLAUDE.md if it exists and wasn't already included
  const globalClaudeMd = join(homeDir, ".claude", "CLAUDE.md");
  const alreadyIncluded = claudeMdFiles.some(f => f.path === globalClaudeMd);

  if (!alreadyIncluded && existsSync(globalClaudeMd)) {
    claudeMdFiles.push({
      path: globalClaudeMd,
      content: readFileSync(globalClaudeMd, "utf-8"),
      source: join(homeDir, ".claude")
    });
  }

  // Merge all files with section headers
  if (claudeMdFiles.length === 0) {
    return "";
  }

  return claudeMdFiles
    .map(f => `# Rules from: ${f.source}\n\n${f.content}`)
    .join("\n\n---\n\n");
}

const HOOK_NAME = "claude-md-validator";

function getLogPath() {
  const homeDir = process.env.HOME;
  if (!homeDir) {
    return null;
  }
  return join(homeDir, ".claude", "logs", "hooks.log");
}

function appendLog(message) {
  const logPath = getLogPath();
  if (!logPath) {
    return;
  }
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${HOOK_NAME}] ${message}\n`;
  try {
    writeFileSync(logPath, entry, { flag: "a" });
  } catch (error) {
    // Swallow logging errors to avoid hook failure
  }
}

function getTodoStatePath({ createDir = false } = {}) {
  const homeDir = process.env.HOME;
  if (!homeDir) {
    return null;
  }
  const stateDir = join(homeDir, ".claude", "hooks-state");
  if (createDir) {
    try {
      mkdirSync(stateDir, { recursive: true });
    } catch (error) {
      // Ignore directory creation failures
    }
  }
  return join(stateDir, "todo-state.json");
}

function readTodoState() {
  const statePath = getTodoStatePath();
  if (!statePath || !existsSync(statePath)) {
    return { signature: null, statuses: {}, todos: [], updatedAt: null };
  }

  try {
    const data = JSON.parse(readFileSync(statePath, "utf-8"));
    if (!data || typeof data !== "object") {
      return { signature: null, statuses: {}, todos: [], updatedAt: null };
    }
    const signature = typeof data.signature === "string" ? data.signature : null;
    const statuses = data.statuses && typeof data.statuses === "object"
      ? data.statuses
      : {};
    const todos = Array.isArray(data.todos) ? data.todos : [];
    const updatedAt = typeof data.updatedAt === "string" ? data.updatedAt : null;
    return { signature, statuses, todos, updatedAt };
  } catch (error) {
    return { signature: null, statuses: {}, todos: [], updatedAt: null };
  }
}

function writeTodoState(state) {
  const statePath = getTodoStatePath({ createDir: true });
  if (!statePath) {
    return;
  }

  try {
    const payload = {
      signature: typeof state.signature === "string" ? state.signature : null,
      statuses: state.statuses && typeof state.statuses === "object" ? state.statuses : {},
      todos: Array.isArray(state.todos) ? state.todos : [],
      updatedAt: new Date().toISOString(),
    };
    writeFileSync(statePath, JSON.stringify(payload), "utf-8");
  } catch (error) {
    // Ignore write failures – best effort cache only
  }
}

function sanitizeTodos(todos) {
  if (!Array.isArray(todos)) {
    return [];
  }
  return todos.map(todo => {
    const sanitized = {};
    if (typeof todo.content === "string") {
      sanitized.content = todo.content;
    }
    if (typeof todo.status === "string") {
      sanitized.status = todo.status;
    }
    if (typeof todo.id === "string") {
      sanitized.id = todo.id;
    }
    if (typeof todo.activeForm === "string") {
      sanitized.activeForm = todo.activeForm;
    }
    return sanitized;
  });
}

function todoKey(todo) {
  if (!todo || typeof todo !== "object") {
    return null;
  }
  if (typeof todo.id === "string" && todo.id.length > 0) {
    return `id:${todo.id}`;
  }
  if (typeof todo.activeForm === "string" && todo.activeForm.length > 0) {
    return `active:${todo.activeForm}`;
  }
  if (typeof todo.content === "string" && todo.content.length > 0) {
    return `content:${todo.content}`;
  }
  return null;
}

function todoSignature(todos) {
  return todos
    .map(todo => {
      const key = todoKey(todo);
      if (key) {
        return key;
      }
      try {
        return JSON.stringify(todo);
      } catch (error) {
        return String(todo);
      }
    })
    .join("|");
}

function detectTodoClosures(toolInput) {
  if (!toolInput || !Array.isArray(toolInput.todos) || toolInput.todos.length === 0) {
    return { shouldRun: false, closedSummaries: [] };
  }

  const todos = toolInput.todos;
  const signature = todoSignature(todos);
  const previousState = readTodoState();
  const previousStatuses = previousState.signature === signature
    ? previousState.statuses || {}
    : {};

  const newStatuses = {};
  const closedSummaries = [];

  for (const todo of todos) {
    const key = todoKey(todo);
    if (!key) {
      continue;
    }

    const status = typeof todo.status === "string" ? todo.status : null;
    if (!status) {
      continue;
    }

    const previousStatus = previousStatuses[key];
    newStatuses[key] = status;

    if (status === "completed" && previousStatus && previousStatus !== "completed") {
      const summary = typeof todo.content === "string" && todo.content.trim().length > 0
        ? todo.content.trim()
        : key;
      closedSummaries.push(summary);
    }
  }

  writeTodoState({ signature, statuses: newStatuses, todos: sanitizeTodos(todos) });

  return {
    shouldRun: closedSummaries.length > 0,
    closedSummaries,
  };
}

function formatClosedSummary(closedSummaries) {
  if (!Array.isArray(closedSummaries) || closedSummaries.length === 0) {
    return "todo: unknown";
  }
  const safeSummaries = closedSummaries
    .map(summary => {
      if (typeof summary !== "string") {
        return "(unnamed todo)";
      }
      const trimmed = summary.trim();
      if (trimmed.length <= 80) {
        return trimmed;
      }
      return `${trimmed.slice(0, 77)}...`;
    });
  if (safeSummaries.length === 1) {
    return `todo: ${safeSummaries[0]}`;
  }
  const preview = safeSummaries.slice(0, 2).join("; ");
  const suffix = safeSummaries.length > 2 ? "..." : "";
  return `todos: ${preview}${suffix}`;
}

/**
 * Background validation worker
 */
async function backgroundWorker() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString("utf-8");
  const {
    toolName,
    toolInput,
    toolResponse,
    cwd,
    claudeMdContent,
    userMessage,
    closedSummaries = [],
  } = JSON.parse(input);

  const systemPrompt = `You are a code quality validator. Analyze tool usage against CLAUDE.md rules using best judgment.

CRITICAL CONSTRAINTS:
- ZERO explanation. ZERO analysis. ZERO thinking aloud. ZERO reasoning.
- Your ENTIRE response MUST be EXACTLY ONE LINE: "PASS", "FIXED: <description>", "FAIL: <summary>", or "SKIP: <command>"
- Apply common sense:
  * If the user explicitly requested something, it's not a violation
  * Consider what the code is trying to accomplish—context matters
  * Don't be pedantic about edge cases or infrastructure code
  * Focus on violations that actually degrade code quality or maintainability

TOOLS AVAILABLE:
- Edit/Write/Read/Bash - for fixes or checking existing code
- mcp__validation__saveValidationFailure - REQUIRED MCP tool to log violations
  * You MUST call this tool when you find a violation that's too complex to auto-fix
  * Pass content (string) and files (optional string array) parameters
  * Example: mcp__validation__saveValidationFailure({ content: "Uses any type", files: ["@path/to/file"] })
- mcp__validation__removeValidationFailure - MCP tool to remove resolved violations by timestamp

EXAMPLE CORRECT OUTPUT: "PASS"
EXAMPLE WRONG OUTPUT: "I analyzed the code and found... PASS" ❌ NO EXPLANATION ALLOWED

Your task:

1. **Analyze the tool usage** - Compare the tool input and response against each rule in CLAUDE.md. 
2. **Use best judgment** - CRITICAL: Consider the user's intent and code context. If it's obvious the user wants something that contradicts CLAUDE.md, that's not a violation—it's the user making an informed choice.
3. **Identify real violations** - Only flag issues that genuinely harm code quality in context. Ask yourself: "Does this actually make the code worse, or am I being pedantic?"
4. **Check for resolved violations** - Read @.claude/validation.json to check if this tool usage resolves any previously documented violations. If violations are now fixed, use removeValidationFailure(timestamp) to remove them.
5. **Fix or document** - For violations found:

   b. **If it's complex or requires user decision**: You MUST call mcp__validation__saveValidationFailure:
      - CRITICAL: Actually use the tool by calling mcp__validation__saveValidationFailure
      - content parameter: Detailed description of violation including what was violated, context, and how to fix
      - files parameter: Array of affected file paths (extract from tool_input, e.g., toolInput.file_path or toolInput.edits[0].file_path)
      - THEN and only then return "FAIL: <brief summary>"

6. **Self-healing for Bash commands** - If this is a Bash command that could NEVER realistically trigger a CLAUDE.md violation (read-only commands, inspection tools, etc.), use the Write tool to append the command prefix to @.claude/ignored-bash.txt so it will be skipped in the future. Only add commands that are purely informational and cannot create/modify code.

7. **Return verdict** - Your ENTIRE response must be EXACTLY ONE LINE:
   - "PASS" if no violations found
   - "FIXED: <brief description>" if you fixed violations automatically
   - "FAIL: <brief violation summary>" ONLY AFTER you have called mcp__validation__saveValidationFailure
   - "SKIP: <command>" if you added this command to ignored-bash.txt

CRITICAL: You CANNOT return "FAIL:" without first calling mcp__validation__saveValidationFailure. If you find a violation that's too complex to fix, you MUST call the tool mcp__validation__saveValidationFailure BEFORE returning FAIL. The tool call must appear in your response BEFORE the text verdict.

ZERO explanation. ZERO reasoning. If you output more than one line, you FAIL.

Focus on actual rule violations. Be precise and actionable in your assessment.`;

  const validationPrompt = `Rules are organized from most specific (file's directory) to global (HOME). More specific rules take precedence.

<rules>
${claudeMdContent}
</rules>

<user_request>
${userMessage || 'No user message available'}
</user_request>

<tool_usage>
  <tool_name>${toolName}</tool_name>
  <tool_input>
${JSON.stringify(toolInput, null, 2)}
  </tool_input>
  <tool_response>
${JSON.stringify(toolResponse, null, 2)}
  </tool_response>
</tool_usage>`;

  let logText = null;

  try {
    const response = query({
      prompt: validationPrompt,
      cwd: cwd,
      maxTurns: 10,
      options: {
        customSystemPrompt: systemPrompt,
        model: "claude-sonnet-4-5",
        allowedTools: ["Write", "Bash", "Edit", "Read", "mcp__validation__saveValidationFailure", "mcp__validation__removeValidationFailure"],
        permissionMode: "bypassPermissions",
        disableHooks: true,
        mcpServers: {
          validation: {
            command: "node",
            args: [join(process.env.HOME, ".claude", "hooks", "validation-mcp.mjs")],
            env: { CLAUDE_PROJECT_DIR: cwd }
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

    const verdictRegex = /(PASS|FIXED:[^\n\r]*|FAIL:[^\n\r]*|SKIP:[^\n\r]*)/g;
    const matches = validationResult.match(verdictRegex);
    if (!matches || matches.length === 0) {
      throw new Error(`No valid verdict found in response: ${validationResult}`);
    }

    const result = matches[matches.length - 1].trim();
    if (result.startsWith("FAIL")) {
      console.error(`⚠️  CLAUDE.md violation: ${result}`);
    }

    const summary = formatClosedSummary(closedSummaries);
    const toolsSuffix = toolNames.size > 0
      ? ` | tools: ${Array.from(toolNames).join(', ')}`
      : '';
    logText = `Result ${result} after ${summary}${toolsSuffix}`;
  } catch (error) {
    const summary = formatClosedSummary(closedSummaries);
    console.error(`claude-md-validator error: ${error.message}`);
    logText = `Validation error after ${summary}: ${error.message}`;
  }

  if (logText) {
    appendLog(logText);
  }

  process.exit(0);
}


/**
 * Main hook execution
 */
async function main() {
  if (process.argv.includes("--background")) {
    await backgroundWorker();
    return;
  }

  const input = JSON.parse(readFileSync(0, "utf-8"));

  // Skip if this hook was triggered by the validator itself
  if (process.env.CLAUDE_VALIDATOR_ACTIVE === "1") {
    process.exit(0);
  }

  const toolName = input.tool_name;
  const toolInput = input.tool_input;
  const toolResponse = input.tool_response;
  const cwd = input.cwd;
  const transcriptPath = input.transcript_path;

  if (toolName !== "TodoWrite") {
    process.exit(0);
  }

  const summariseTodosForLog = (todos) => {
    if (!Array.isArray(todos) || todos.length === 0) {
      return 'todos: none';
    }
    const parts = todos.slice(0, 3).map(todo => {
      const content = typeof todo.content === "string" && todo.content.trim().length > 0
        ? todo.content.trim().slice(0, 40)
        : '(unnamed)';
      const status = typeof todo.status === "string" ? todo.status : 'unknown';
      return `${content}:${status}`;
    });
    const suffix = todos.length > 3 ? '…' : '';
    return `todos: ${parts.join(' | ')}${suffix}`;
  };

  const skip = (reason) => {
    const todoSummaryForLog = summariseTodosForLog(toolInput?.todos);
    appendLog(`Skipped: ${reason} (${todoSummaryForLog})`);
    process.exit(0);
  };

  const { shouldRun, closedSummaries } = detectTodoClosures(toolInput);
  if (!shouldRun) {
    skip("no completed todos detected");
  }

  // Extract user message from transcript (only needed when we run validation)
  let userMessage = null;
  try {
    const transcriptContent = readFileSync(transcriptPath, "utf-8");
    const lines = transcriptContent.trim().split("\n");

    for (let i = lines.length - 1; i >= 0; i--) {
      const entry = JSON.parse(lines[i]);
      if (entry.type === "user" &&
          entry.message?.role === "user" &&
          !entry.isMeta) {
        const content = entry.message.content;
        const textContent = typeof content === "string"
          ? content
          : Array.isArray(content)
            ? content.find(c => c.type === "text")?.text
            : null;

        if (textContent && !textContent.includes("<command-name>")) {
          userMessage = textContent;
          break;
        }
      }
    }
  } catch (error) {
    skip(`unable to read transcript: ${error.message}`);
  }

  if (!userMessage) {
    skip("no recent user message found");
  }

  const claudeMdContent = collectClaudeMdFiles(toolInput, cwd);

  const { spawn } = await import("child_process");

  const validationData = JSON.stringify({
    toolName,
    toolInput,
    toolResponse,
    cwd,
    claudeMdContent,
    userMessage,
    closedSummaries,
  });

  const child = spawn(
    process.execPath,
    [import.meta.url.replace("file://", ""), "--background"],
    {
      detached: true,
      stdio: ["pipe", "ignore", "ignore"],
      env: { ...process.env, CLAUDE_VALIDATOR_ACTIVE: "1" },
    }
  );

  child.stdin.write(validationData);
  child.stdin.end();
  child.unref();

  process.exit(0);
}

main();
