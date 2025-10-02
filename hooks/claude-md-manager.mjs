#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { basename, dirname, join, relative } from "path";
import { query } from "/Users/silasrhyneer/.claude/claude-cli/sdk.mjs";

/**
 * Background worker that runs the actual CLAUDE.md query
 */
async function backgroundWorker() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString("utf-8");
  const {
    relativePath,
    claudeMdPath,
    hasClaudeMd,
    existingClaudeMd,
    fileTypes,
    subdirs,
    filePath,
    cwd
  } = JSON.parse(input);

  // Set up logging
  const logPath = join(process.env.HOME, ".claude", "hooks.log");
  const logMessage = (msg) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [claude-md-manager] ${msg}\n`;
    try {
      writeFileSync(logPath, logEntry, { flag: 'a' });
    } catch (e) {
      // Silent fail
    }
  };

  logMessage(`Background worker starting for ${relativePath}`);

  // Collect all CLAUDE.md files from cwd to fileDir
  const claudeMdHierarchy = [];
  let currentDir = fileDir;

  while (currentDir.startsWith(cwd)) {
    const potentialClaudeMd = join(currentDir, 'CLAUDE.md');
    if (existsSync(potentialClaudeMd) && currentDir !== fileDir) {
      try {
        const content = readFileSync(potentialClaudeMd, 'utf-8');
        const lineCount = content.split('\n').length;
        claudeMdHierarchy.unshift({
          path: relative(cwd, potentialClaudeMd),
          content,
          lineCount
        });
      } catch (e) {
        // Skip if unreadable
      }
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  logMessage(`Found ${claudeMdHierarchy.length} parent CLAUDE.md files`);

  // Determine target line count based on directory complexity
  const totalFiles = fileTypes.length;
  const totalSubdirs = subdirs.length;
  const relativeDirPath = relative(cwd, fileDir);
  const isRoot = relativeDirPath === '';

  let targetLines;
  if (isRoot) {
    targetLines = '~150';
  } else if (totalFiles > 20 || totalSubdirs > 8) {
    targetLines = '~100';
  } else if (totalFiles < 5 && totalSubdirs < 3) {
    targetLines = '<25';
  } else {
    targetLines = '~50';
  }

  // Prepare the assistant prompt
  const systemPrompt = `You are an expert at creating concise, focused CLAUDE.md files for subdirectories in software projects.

## Best Practices for Subdirectory CLAUDE.md Files

### When to Create
- Only create if the subdirectory has UNIQUE context not obvious from its name/structure
- Only create if there are specific conventions, patterns, or constraints worth documenting
- Don't create if the directory purpose is self-evident (e.g., "components" folder just contains components)

### Content Guidelines
- **Be extremely concise** - use short, declarative bullet points
- **Focus on what's unique** - don't repeat what's in parent CLAUDE.md files or what's obvious
- **Local context only** - conventions, patterns, or constraints specific to THIS directory
- **Avoid redundancy** - if folder name is "utils", don't explain it contains utilities

### Structure (when needed)
- Brief purpose statement (1 line, only if non-obvious)
- Local coding conventions (only if they differ from project standards)
- Important boundaries or constraints (what NOT to do here)
- Key dependencies or interactions (only if critical)

### Anti-Patterns to Avoid
- Long explanatory paragraphs
- Repeating project-wide conventions
- Obvious information (folder structure explanations)
- Over-engineering simple directories
- Including generic best practices

Remember: **Err on the side of NOT creating or minimally editing**. Less is more.

## Output Format
- If you decide to use the Write tool, use it with NO explanatory text
- If you decide NOT to create/update, output NOTHING
- Do not explain your reasoning or decision`;

  // Build hierarchy context
  let hierarchyContext = '';
  if (claudeMdHierarchy.length > 0) {
    hierarchyContext = '\n\n## Parent CLAUDE.md Files (for context)\n\n';
    for (const { path, content, lineCount } of claudeMdHierarchy) {
      hierarchyContext += `### ${path} (${lineCount} lines)\n\`\`\`\n${content}\n\`\`\`\n\n`;
    }
  }

  const userPrompt = hasClaudeMd
    ? `A file was just edited in: ${relativePath}

This directory already has a CLAUDE.md file (${existingClaudeMd.split('\n').length} lines):
\`\`\`
${existingClaudeMd}
\`\`\`
${hierarchyContext}
Directory contains:
- File types: ${fileTypes.slice(0, 10).join(', ')}
- Subdirectories: ${subdirs.length === 0 ? 'none' : subdirs.slice(0, 10).join(', ')}

Edited file: ${basename(filePath)}

**Target length: ${targetLines} lines**

Should this CLAUDE.md be updated? Consider:
1. Does the existing content still accurately reflect the directory purpose?
2. Is there any new critical context from the edited file that's missing?
3. Can any content be removed as redundant or obvious (check parent CLAUDE.md files)?
4. Is it the right length for this directory's complexity?

If you decide to update the CLAUDE.md, use the Write tool to write it to ${claudeMdPath}.
If no update is needed, do nothing.

Be somewhat conservative - only edit if there's a clear, important reason.`
    : `A file was just edited in: ${relativePath}

This directory does NOT have a CLAUDE.md file.
${hierarchyContext}
Directory contains:
- File types: ${fileTypes.slice(0, 10).join(', ')}
- Subdirectories: ${subdirs.length === 0 ? 'none' : subdirs.slice(0, 10).join(', ')}

Edited file: ${basename(filePath)}

**Target length: ${targetLines} lines**

Should a CLAUDE.md be created for this directory? Consider:
1. Is the directory purpose non-obvious from its name and contents?
2. Are there specific conventions or patterns that need documentation?
3. Are there important constraints or boundaries to establish?
4. Is there unique context not already covered in parent CLAUDE.md files?

If you decide to create a CLAUDE.md, use the Write tool to write it to ${claudeMdPath}.
If no CLAUDE.md is needed, do nothing.`;

  try {
    logMessage(`Starting query for ${relativePath}`);
    const result = query({
      prompt: userPrompt,
      cwd: cwd,
      options: {
        systemPrompt,
        model: "claude-sonnet-4-5-20250929",
        allowedTools: ["Write"],
        permissionMode: "bypassPermissions",
        disableHooks: true,
      }
    });

    let allText = '';
    for await (const message of result) {
      // Collect all text for logging
      if (message.type === 'assistant' && message.message?.content) {
        for (const block of message.message.content) {
          if (block.type === 'text') {
            allText += block.text;
          }
        }
      }
    }

    logMessage(`Completed query for ${relativePath}`);
    logMessage(`Agent reasoning:\n${allText.substring(0, 500)}${allText.length > 500 ? '...' : ''}`);
  } catch (error) {
    logMessage(`Error for ${relativePath}: ${error.message}`);
  }

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

  // Set up logging
  const logPath = join(process.env.HOME, ".claude", "hooks.log");
  const logMessage = (msg) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [claude-md-manager] ${msg}\n`;
    try {
      writeFileSync(logPath, logEntry, { flag: 'a' });
    } catch (e) {
      // Silent fail
    }
  };

  logMessage("Hook triggered - starting execution");

  // Read hook input from stdin
  let inputData;
  try {
    const stdin = readFileSync(0, "utf-8");
    logMessage(`Raw stdin received: ${stdin.substring(0, 200)}`);
    inputData = JSON.parse(stdin);
    logMessage(`Parsed input - tool: ${inputData?.tool_name}, has_path: ${!!inputData?.tool_input?.file_path}`);
  } catch (e) {
    logMessage(`Error parsing stdin: ${e.message}`);
    process.exit(0);
  }

  const { tool_name, tool_input, cwd } = inputData;

  // Only process Write and Edit tools
  if (!["Write", "Edit", "MultiEdit"].includes(tool_name)) {
    logMessage(`Skipping - tool is ${tool_name}, not Write/Edit/MultiEdit`);
    process.exit(0);
  }

  // Get the file path from tool input
  const filePath = tool_input?.file_path;
  if (!filePath) {
    logMessage(`Skipping - no file_path in tool_input`);
    process.exit(0);
  }
  logMessage(`Processing file: ${filePath}`)

  // Get the directory containing the edited file
  const fileDir = dirname(filePath);
  const claudeMdPath = join(fileDir, "CLAUDE.md");

  // Skip if this IS a CLAUDE.md file
  if (basename(filePath) === "CLAUDE.md") {
    logMessage(`Skipping - file is CLAUDE.md itself`);
    process.exit(0);
  }

  // Skip if directory is .claude or hooks directory
  if (fileDir.includes("/.claude/") || fileDir.includes("/.claude") || fileDir.endsWith("/.claude")) {
    logMessage(`Skipping - directory is in .claude: ${fileDir}`);
    process.exit(0);
  }

  // Skip if this is a CLAUDE.md file being written by this hook or validator
  if (filePath.endsWith("/CLAUDE.md")) {
    logMessage(`Skipping - file is CLAUDE.md itself (including newly created)`);
    process.exit(0);
  }

  // Get information about the directory
  const dirContents = readdirSync(fileDir);
  const hasClaudeMd = existsSync(claudeMdPath);

  // Read existing CLAUDE.md if it exists
  let existingClaudeMd = "";
  if (hasClaudeMd) {
    try {
      existingClaudeMd = readFileSync(claudeMdPath, "utf-8");
    } catch (e) {
      logMessage(`Error reading CLAUDE.md: ${e.message}`);
      process.exit(0);
    }
  }

  // Get some context about the directory
  const fileTypes = dirContents
    .filter(f => {
      const fullPath = join(fileDir, f);
      try {
        return statSync(fullPath).isFile();
      } catch (e) {
        return false;
      }
    })
    .map(f => f.split('.').pop())
    .filter(ext => ext && ext.length < 10);

  const subdirs = dirContents.filter(f => {
    const fullPath = join(fileDir, f);
    try {
      return statSync(fullPath).isDirectory() && !f.startsWith('.');
    } catch (e) {
      return false;
    }
  });

  const relativePath = relative(cwd, fileDir);
  if (!relativePath) {
    logMessage(`Could not determine relative path`);
    process.exit(0);
  }

  // Show user message
  console.error(`🔍 Checking if ${relativePath} needs a CLAUDE.md...`);
  logMessage(`Triggered for ${relativePath} (file: ${basename(filePath)})`);
  logMessage(`Spawning background worker process`);

  // Spawn detached background process
  const { spawn } = await import('child_process');

  const workerData = JSON.stringify({
    relativePath,
    claudeMdPath,
    hasClaudeMd,
    existingClaudeMd,
    fileTypes,
    subdirs,
    filePath,
    cwd
  });

  const child = spawn(process.execPath, [
    import.meta.url.replace('file://', ''),
    '--background'
  ], {
    detached: true,
    stdio: ['pipe', 'ignore', 'ignore']
  });

  child.stdin.write(workerData);
  child.stdin.end();
  child.unref();

  // Exit immediately - background work continues
  process.exit(0);
}

main();
