#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname, resolve } from "path";
import { query } from "/Users/silasrhyneer/.claude/claude-cli/sdk.mjs";

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

/**
 * Background validation worker
 */
async function backgroundWorker() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString("utf-8");
  const { toolName, toolInput, toolResponse, cwd, claudeMdContent, userMessage } =
    JSON.parse(input);

  // Set up logging
  const logPath = join(process.env.HOME, ".claude", "hooks.log");
  const logMessage = (msg) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [claude-md-validator] ${msg}\n`;
    try {
      writeFileSync(logPath, logEntry, { flag: 'a' });
    } catch (e) {
      // Silent fail
    }
  };

  // Build descriptive log message
  let logDetail = `Validating ${toolName}`;
  if (toolName === "Bash" && toolInput?.command) {
    const cmd = toolInput.command.length > 60
      ? toolInput.command.substring(0, 60) + "..."
      : toolInput.command;
    logDetail += `: ${cmd}`;
  } else if (toolInput?.file_path) {
    logDetail += `: ${toolInput.file_path}`;
  }
  logMessage(logDetail);

  // Determine validation file path - use cwd (Claude's working directory)
  const validationPath = join(cwd, '.claude', 'validation.md');

  // Build validation prompt
  const validationPrompt = `You are an expert code quality validator specializing in enforcing project-specific coding standards. Your role is to analyze tool usage against CLAUDE.md rules and identify violations with precision.

Rules are organized from most specific (file's directory) to global (HOME). More specific rules take precedence.

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
</tool_usage>

Your task:

1. **Analyze the tool usage** - Compare the tool input and response against each rule in CLAUDE.md
2. **Consider user intent** - CRITICAL: If the user explicitly requested something that appears to violate a general rule, it is NOT a violation. Explicit user requests override general guidelines.
3. **Identify violations** - Determine if any rules were broken (e.g., using \`any\` type, using fallbacks instead of throwing errors)
4. **Check for resolved violations** - If @${validationPath.replace(process.env.HOME, '~')} exists, Read it first to check if this tool usage resolves any previously documented violations. If violations are now fixed, remove those entries from the validation file.
5. **Fix or document** - For violations found:
   a. **If it's a simple fix** (e.g., replacing \`any\` with proper type, changing fallback to throw error): Use Edit/Write to fix it directly
   b. **If it's complex or requires user decision**: Document in validation.md:
      - First, use Bash to create the directory: mkdir -p ${dirname(validationPath)}
      - Then use Read to get current content (if file exists)
      - Use Write tool to write to this EXACT file path: @${validationPath.replace(process.env.HOME, '~')}

Append a detailed entry with this format:

## <timestamp>
**Tool:** ${toolName}
**Violation:** <specific description of what was violated>
**Context:** <relevant code or explanation>
**File:** <file reference using @ notation>

IMPORTANT: For the File field, use @ notation relative to cwd (${cwd}):
- Extract file_path from tool_input (e.g., toolInput.file_path or toolInput.edits[0].file_path)
- Make it relative to cwd: use path.relative('${cwd}', file_path)
- Prefix with @: "@relative/path/to/file.txt"
- If the file is IN cwd, it should be "@filename.txt" not "@${cwd}/filename.txt"

IMPORTANT: If the file doesn't exist OR is empty, create it with this header first:
# CLAUDE.md Validation Reports

This file tracks violations of coding standards defined in CLAUDE.md files throughout the project.

---

Then append your violation entry.

6. **Self-healing for Bash commands** - If this is a Bash command that could NEVER realistically trigger a CLAUDE.md violation (read-only commands, inspection tools, etc.), use the Write tool to append the command prefix to @.claude/ignored-bash.txt so it will be skipped in the future. Only add commands that are purely informational and cannot create/modify code.

7. **Return verdict** - Your FINAL message must contain ONLY ONE LINE with one of these exact formats:
   - "PASS" if no violations found
   - "FIXED: <brief description>" if you fixed violations automatically
   - "FAIL: <brief violation summary>" if violations were documented (too complex to auto-fix)
   - "SKIP: <command>" if you added this command to ignored-bash.txt

Do not include analysis, explanations, or thinking in your final response. ONLY the verdict line.

Focus on actual rule violations. Be precise and actionable in your assessment.`;

  try {
    const response = query({
      prompt: validationPrompt,
      cwd: cwd,
      maxTurns: 2,
      options: {
        model: "claude-sonnet-4-5",
        allowedTools: ["Write", "Bash", "Edit", "Read"],
        permissionMode: "bypassPermissions",
        disableHooks: true,
      },
      continueConversation: false,
    });

    let validationResult = "";
    for await (const message of response) {
      if (message.type === 'assistant' && message.message?.content) {
        for (const block of message.message.content) {
          if (block.type === 'text') {
            validationResult += block.text;
          }
        }
      }
    }

    const result = validationResult.trim();
    logMessage(`Validation complete: ${result}`);

    if (result.startsWith("FAIL")) {
      logMessage(`❌ Violation detected: ${result}`);
      console.error(`⚠️  CLAUDE.md violation: ${result}`);
    } else if (result.startsWith("FIXED")) {
      logMessage(`🔧 Auto-fixed: ${result}`);
    } else if (result === "PASS") {
      logMessage(`✓ Validation passed for ${toolName}`);
    } else {
      logMessage(`⚠️  Unexpected validation result: ${result}`);
    }
  } catch (error) {
    logMessage(`Error during validation: ${error.message}`);
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
  const userMessage = input.user_message;

  // Skip validation for non-code tools
  if (toolName === "TodoWrite") {
    process.exit(0);
  }

  // Skip validation for safe read-only Bash commands
  if (toolName === "Bash" && toolInput?.command) {
    const ignoredBashPath = join(cwd, ".claude", "ignored-bash.txt");
    let safeCommands = [];

    if (existsSync(ignoredBashPath)) {
      const content = readFileSync(ignoredBashPath, "utf-8");
      safeCommands = content
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"));
    }

    const cmd = toolInput.command.trim();
    if (safeCommands.some(safe => cmd.startsWith(safe))) {
      process.exit(0);
    }
  }

  // Collect CLAUDE.md files from file dir → cwd → HOME
  const claudeMdContent = collectClaudeMdFiles(toolInput, cwd);

  // Spawn detached background process for validation
  const { spawn } = await import("child_process");

  const validationData = JSON.stringify({
    toolName,
    toolInput,
    toolResponse,
    cwd,
    claudeMdContent,
    userMessage,
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

  // Exit immediately - validation happens in background
  process.exit(0);
}

main();
