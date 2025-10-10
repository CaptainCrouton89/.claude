#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { basename, dirname, join, relative } from "path";
import { query } from "/Users/silasrhyneer/.claude/claude-cli/sdk.mjs";

const HOOK_NAME = 'claude-md-manager';

function appendLog(message) {
  const homeDir = process.env.HOME;
  if (!homeDir) return;

  const logPath = join(homeDir, '.claude', 'logs', 'hooks.log');
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${HOOK_NAME}] ${message}\n`;
  try {
    writeFileSync(logPath, entry, { flag: 'a' });
  } catch (error) {
    // Ignore logging failures
  }
}

/**
 * Get directory info for CLAUDE.md analysis
 */
function getDirectoryInfo(dirPath, cwd) {
  const dirContents = readdirSync(dirPath);

  const fileTypes = dirContents
    .filter(f => {
      const fullPath = join(dirPath, f);
      return statSync(fullPath).isFile();
    })
    .map(f => f.split('.').pop())
    .filter(ext => ext && ext.length < 10);

  const subdirs = dirContents.filter(f => {
    const fullPath = join(dirPath, f);
    return statSync(fullPath).isDirectory() && !f.startsWith('.');
  });

  const relativeDirPath = relative(cwd, dirPath);
  const isRoot = relativeDirPath === '';

  let targetLines;
  if (isRoot) {
    targetLines = '~150';
  } else if (fileTypes.length > 20 || subdirs.length > 8) {
    targetLines = '~100';
  } else if (fileTypes.length < 5 && subdirs.length < 3) {
    targetLines = '<25';
  } else {
    targetLines = '~50';
  }

  return { fileTypes, subdirs, relativeDirPath, isRoot, targetLines };
}

/**
 * Collect parent CLAUDE.md files
 */
function getClaudeMdHierarchy(fileDir, cwd) {
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

  return claudeMdHierarchy;
}

/**
 * Background worker that processes all directories changed in the session
 */
async function backgroundWorker() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf-8');
  const { sessionId, cwd } = JSON.parse(input);

  // Get all changed files via git
  const { execSync } = await import('child_process');
  let changedFiles = [];
  try {
    const gitOutput = execSync('git diff --name-only HEAD', { cwd, encoding: 'utf8' });
    changedFiles = gitOutput.trim().split('\n').filter(Boolean);

    if (changedFiles.length === 0) {
      appendLog(`[START] session=${sessionId}, cwd=${cwd} | [SKIP] No file changes detected`);
      process.exit(0);
    }
  } catch (error) {
    appendLog(`[START] session=${sessionId}, cwd=${cwd} | [SKIP] Git check failed or not a repo`);
    process.exit(0);
  }

  // Group files by directory
  const directoriesWithChanges = new Map();

  for (const file of changedFiles) {
    const filePath = join(cwd, file);
    const fileDir = dirname(filePath);
    const relativePath = relative(cwd, fileDir) || '.';

    // Skip .claude directories
    if (relativePath.includes('.claude')) continue;

    // Skip CLAUDE.md files themselves
    if (basename(filePath) === 'CLAUDE.md') continue;

    // Skip files outside cwd
    if (relativePath.startsWith('..')) continue;

    if (!directoriesWithChanges.has(fileDir)) {
      directoriesWithChanges.set(fileDir, []);
    }
    directoriesWithChanges.get(fileDir).push(basename(filePath));
  }

  if (directoriesWithChanges.size === 0) {
    appendLog(`[START] session=${sessionId} | [SKIP] No eligible directories with changes`);
    process.exit(0);
  }

  appendLog(`[START] session=${sessionId}, directories=${directoriesWithChanges.size}`);

  // Process each directory
  for (const [fileDir, changedFilesInDir] of directoriesWithChanges) {
    const relativePath = relative(cwd, fileDir) || '.';
    const claudeMdPath = join(fileDir, 'CLAUDE.md');
    const hasClaudeMd = existsSync(claudeMdPath);
    const existingClaudeMd = hasClaudeMd ? readFileSync(claudeMdPath, 'utf-8') : '';

    const { fileTypes, subdirs, isRoot, targetLines } = getDirectoryInfo(fileDir, cwd);
    const claudeMdHierarchy = getClaudeMdHierarchy(fileDir, cwd);

    // Build hierarchy context
    let hierarchyContext = '';
    if (claudeMdHierarchy.length > 0) {
      hierarchyContext = '\n\n## Parent CLAUDE.md Files (for context)\n\n';
      for (const { path, content, lineCount } of claudeMdHierarchy) {
        hierarchyContext += `### ${path} (${lineCount} lines)\n\`\`\`\n${content}\n\`\`\`\n\n`;
      }
    }

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

    const userPrompt = hasClaudeMd
      ? `Files were edited in: ${relativePath}

This directory already has a CLAUDE.md file (${existingClaudeMd.split('\n').length} lines):
\`\`\`
${existingClaudeMd}
\`\`\`
${hierarchyContext}
Directory contains:
- File types: ${fileTypes.slice(0, 10).join(', ')}
- Subdirectories: ${subdirs.length === 0 ? 'none' : subdirs.slice(0, 10).join(', ')}

Changed files: ${changedFilesInDir.join(', ')}

**Target length: ${targetLines} lines**

Should this CLAUDE.md be updated? Consider:
1. Does the existing content still accurately reflect the directory purpose?
2. Is there any new critical context from the changed files that's missing?
3. Can any content be removed as redundant or obvious (check parent CLAUDE.md files)?
4. Is it the right length for this directory's complexity?

If you decide to update the CLAUDE.md, use the Write tool to write it to ${claudeMdPath}.
If no update is needed, do nothing.

Be somewhat conservative - only edit if there's a clear, important reason.`
      : `Files were edited in: ${relativePath}

This directory does NOT have a CLAUDE.md file.
${hierarchyContext}
Directory contains:
- File types: ${fileTypes.slice(0, 10).join(', ')}
- Subdirectories: ${subdirs.length === 0 ? 'none' : subdirs.slice(0, 10).join(', ')}

Changed files: ${changedFilesInDir.join(', ')}

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
          hooks: {}
        }
      });

      // Consume the response
      for await (const message of result) {
        // Just consume the stream
      }

      appendLog(`[PROCESSED] ${relativePath}`);
    } catch (error) {
      appendLog(`[ERROR] ${relativePath}: ${error.message}`);
    }
  }

  appendLog(`[DONE] session=${sessionId} | processed ${directoriesWithChanges.size} directories`);
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

  const stdin = readFileSync(0, 'utf-8');
  const inputData = JSON.parse(stdin);

  if (inputData.hook_event_name !== 'SessionEnd') {
    process.exit(0);
  }

  // Skip if reason is other (e.g. triggered by query in hook itself)
  if (inputData.reason === 'other') {
    appendLog(`SessionEnd reason: ${inputData.reason}, skipping`);
    process.exit(0);
  }

  const sessionId = inputData.session_id;
  const cwd = inputData.cwd || process.cwd();

  if (!sessionId) {
    process.exit(0);
  }

  // Spawn detached background process
  const { spawn } = await import('child_process');

  const workerData = JSON.stringify({
    sessionId,
    cwd,
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

  process.exit(0);
}

main();
