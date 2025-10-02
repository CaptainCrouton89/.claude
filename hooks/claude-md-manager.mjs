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
    cwd,
    fileDir
  } = JSON.parse(input);

  // Set up logging
  const logPath = join(process.env.HOME, ".claude", "hooks.log");
  const logMessage = (msg) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [claude-md-manager] ${msg}\n`;
    writeFileSync(logPath, logEntry, { flag: 'a' });
  };

  // Collect all CLAUDE.md files from cwd to fileDir
  const claudeMdHierarchy = [];
  let currentDir = fileDir;

  while (currentDir.startsWith(cwd)) {
    const potentialClaudeMd = join(currentDir, 'CLAUDE.md');
    if (existsSync(potentialClaudeMd) && currentDir !== fileDir) {
      const content = readFileSync(potentialClaudeMd, 'utf-8');
      const lineCount = content.split('\n').length;
      claudeMdHierarchy.unshift({
        path: relative(cwd, potentialClaudeMd),
        content,
        lineCount
      });
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }


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

  // Prepare the assistant prompt based on whether this is root or subdirectory
  const systemPrompt = isRoot
    ? `You are an expert at creating comprehensive CLAUDE.md files for project root directories.

## Root Directory CLAUDE.md Requirements

Root CLAUDE.md files should provide essential project context:
- **Project purpose and domain** - what this project does
- **Key technologies and frameworks** - main stack
- **Architecture overview** - how major components relate
- **Critical conventions** - coding standards, patterns
- **Important constraints** - what to avoid, boundaries

Be comprehensive but concise. Root CLAUDE.md is the foundation for all subdirectory context.

## Output Format
- Use the Write tool with NO explanatory text
- Create a well-structured CLAUDE.md with clear sections`
    : `You are an expert at creating concise, focused CLAUDE.md files for subdirectories in software projects.

## Best Practices for Subdirectory CLAUDE.md Files

### When to Create
- Create for directories with >5 files or significant complexity
- Create if there are specific conventions, patterns, or constraints worth documenting
- Skip only if the directory is trivial (few files, obvious purpose)

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

Remember: **Create docs for directories with >5 files**. Be helpful and proactive.

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

Should a CLAUDE.md be created for this directory?

**Creation criteria (at least one should be true):**
1. Directory has >5 files OR >3 subdirectories
2. There are specific conventions, patterns, or constraints to document
3. There is important unique context not covered in parent CLAUDE.md files

If any criteria is met, use the Write tool to create ${claudeMdPath}.
If none apply, do nothing.`;

  try {
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

    // Consume the response
    for await (const message of result) {
      // Just consume the stream
    }
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
    writeFileSync(logPath, logEntry, { flag: 'a' });
  };

  // Read hook input from stdin
  const stdin = readFileSync(0, "utf-8");
  const inputData = JSON.parse(stdin);

  const { tool_name, tool_input, cwd } = inputData;

  // Only process Write and Edit tools
  if (!["Write", "Edit", "MultiEdit"].includes(tool_name)) {
    process.exit(0);
  }

  // Get the file path from tool input
  const filePath = tool_input?.file_path;
  if (!filePath) {
    process.exit(0);
  }

  // Get the directory containing the edited file
  const fileDir = dirname(filePath);
  const relativePath = relative(cwd, fileDir) || '.';

  // Skip if file is outside cwd (relative path would go up with ..)
  if (relativePath.startsWith('..')) {
    process.exit(0);
  }

  const claudeMdPath = join(fileDir, "CLAUDE.md");

  // Skip if this IS a CLAUDE.md file
  if (basename(filePath) === "CLAUDE.md") {
    process.exit(0);
  }

  // Skip if directory is .claude or hooks directory
  if (fileDir.includes("/.claude/") || fileDir.includes("/.claude") || fileDir.endsWith("/.claude")) {
    process.exit(0);
  }

  // Skip if this is a CLAUDE.md file being written by this hook or validator
  if (filePath.endsWith("/CLAUDE.md")) {
    process.exit(0);
  }

  // Get information about the directory
  const dirContents = readdirSync(fileDir);
  const hasClaudeMd = existsSync(claudeMdPath);

  // Read existing CLAUDE.md if it exists
  let existingClaudeMd = "";
  if (hasClaudeMd) {
    existingClaudeMd = readFileSync(claudeMdPath, "utf-8");
  }

  // Get some context about the directory
  const fileTypes = dirContents
    .filter(f => {
      const fullPath = join(fileDir, f);
      return statSync(fullPath).isFile();
    })
    .map(f => f.split('.').pop())
    .filter(ext => ext && ext.length < 10);

  const subdirs = dirContents.filter(f => {
    const fullPath = join(fileDir, f);
    return statSync(fullPath).isDirectory() && !f.startsWith('.');
  });

  // Log only when actually processing
  logMessage(`Checking CLAUDE.md for ${relativePath}`);
  console.error(`🔍 Checking if ${relativePath} needs a CLAUDE.md...`);

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
    cwd,
    fileDir
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
