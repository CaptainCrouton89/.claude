#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { basename, dirname, join, relative } from "path";
import { query } from "~/.claude/claude-cli/sdk.mjs";

const HOOK_NAME = 'claude-md-manager';
const STATE_FILE_NAME = 'claude-md-manager-cache.json';

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

function getStateFilePath() {
  const homeDir = process.env.HOME;
  if (!homeDir) return null;
  return join(homeDir, '.claude', 'state', STATE_FILE_NAME);
}

function loadProcessingCache() {
  const statePath = getStateFilePath();
  if (!statePath || !existsSync(statePath)) return {};

  try {
    return JSON.parse(readFileSync(statePath, 'utf-8'));
  } catch (error) {
    appendLog(`[WARN] Failed to load cache: ${error.message}`);
    return {};
  }
}

function saveProcessingCache(cache) {
  const statePath = getStateFilePath();
  if (!statePath) return;

  try {
    mkdirSync(dirname(statePath), { recursive: true });
    writeFileSync(statePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    appendLog(`[WARN] Failed to persist cache: ${error.message}`);
  }
}

function getFileSignature(filePath) {
  try {
    const stats = statSync(filePath);
    return { deleted: false, mtimeMs: stats.mtimeMs, size: stats.size };
  } catch (error) {
    return { deleted: true };
  }
}

function signaturesEqual(current, cached) {
  if (!current || !cached) return false;
  if (current.deleted !== cached.deleted) return false;
  if (current.deleted) return true;
  return current.mtimeMs === cached.mtimeMs && current.size === cached.size;
}

function markFilesAsHandled(filesInDir, filesHandled) {
  for (const { file, signature } of filesInDir) {
    filesHandled.set(file, signature);
  }
}

function pruneCache(cache, activeFiles) {
  if (!cache) return {};
  const pruned = {};
  for (const [file, signature] of Object.entries(cache)) {
    if (activeFiles.has(file)) {
      pruned[file] = signature;
    }
  }
  return pruned;
}

/**
 * Get directory info for CLAUDE.md analysis
 */
function getDirectoryInfo(dirPath, cwd) {
  if (!existsSync(dirPath)) {
    const relativeDirPath = relative(cwd, dirPath);
    const isRoot = relativeDirPath === '';
    return {
      fileCount: 0,
      fileTypes: [],
      subdirs: [],
      relativeDirPath,
      isRoot,
      targetLines: isRoot ? '~150' : '<25'
    };
  }

  const dirContents = readdirSync(dirPath);

  const files = dirContents.filter(f => {
    const fullPath = join(dirPath, f);
    try {
      return statSync(fullPath).isFile();
    } catch (error) {
      return false;
    }
  });

  const fileTypes = files
    .map(f => f.split('.').pop())
    .filter(ext => ext && ext.length < 10);

  const subdirs = dirContents.filter(f => {
    const fullPath = join(dirPath, f);
    try {
      return statSync(fullPath).isDirectory() && !f.startsWith('.');
    } catch (error) {
      return false;
    }
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

  return { fileCount: files.length, fileTypes, subdirs, relativeDirPath, isRoot, targetLines };
}

/**
 * Load ignore patterns from a file (one pattern per line, # for comments)
 */
function loadIgnoreFile(filePath) {
  if (!existsSync(filePath)) return [];

  try {
    const content = readFileSync(filePath, 'utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  } catch (error) {
    return [];
  }
}

/**
 * Load settings with exclusion patterns from ignore files
 */
function loadSettings(cwd) {
  const homeDir = process.env.HOME;
  const excludedDirectories = [];

  // Load from global ignore file
  if (homeDir) {
    const candidatePaths = [
      join(homeDir, '.claude', '.claude-md-manager-ignore'),
      join(homeDir, '.claude-md-manager-ignore')
    ];

    for (const path of candidatePaths) {
      excludedDirectories.push(...loadIgnoreFile(path));
    }
  }

  // Load from local ignore file
  const localIgnorePath = join(cwd, '.claude-md-manager-ignore');
  excludedDirectories.push(...loadIgnoreFile(localIgnorePath));

  return { excludedDirectories };
}

/**
 * Check if a directory path matches exclusion patterns
 */
function isDirectoryExcluded(relativePath, excludedPatterns) {
  for (const pattern of excludedPatterns) {
    // Normalize pattern: remove trailing slashes
    const normalizedPattern = pattern.replace(/\/$/, '');

    const pathParts = relativePath.split('/');

    // Exact match
    if (relativePath === normalizedPattern) return true;

    // Check if path starts with pattern (handles "foo/" matching "foo/bar")
    if (relativePath.startsWith(normalizedPattern + '/')) return true;

    // Handle simple wildcard directory patterns like "foo/*"
    const wildcardDirMatch = normalizedPattern.match(/^(.*)\/(\*)$/);
    if (wildcardDirMatch) {
      const baseDir = wildcardDirMatch[1];
      if (relativePath === baseDir || relativePath.startsWith(baseDir + '/')) {
        return true;
      }
    }

    // Check if any path segment matches
    for (const part of pathParts) {
      if (part === normalizedPattern) return true;
    }

    // Pattern matching (e.g., "commands/*")
    if (normalizedPattern.includes('*')) {
      const regex = new RegExp('^' + normalizedPattern.replace(/\*/g, '.*') + '$');
      if (regex.test(relativePath)) return true;
    }
  }

  return false;
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
  const { sessionId, cwd, parentSessionId } = JSON.parse(input);

  // Use parent session ID for tracking to prevent duplicate processing across child sessions
  const trackingSessionId = parentSessionId || sessionId;

  const homeDir = process.env.HOME;
  const lockPath = homeDir ? join(homeDir, '.claude', 'state', `claude-md-${trackingSessionId}.lock`) : null;

  // Check if already processing this session
  if (lockPath && existsSync(lockPath)) {
    appendLog(`[SKIP] session=${sessionId} | Already processed for parent session=${trackingSessionId}`);
    process.exit(0);
  }

  // Create lock file
  if (lockPath) {
    try {
      const lockDir = dirname(lockPath);
      execSync(`mkdir -p "${lockDir}"`, { stdio: 'ignore' });
      writeFileSync(lockPath, JSON.stringify({ sessionId, parentSessionId, timestamp: new Date().toISOString() }));
    } catch (error) {
      appendLog(`[WARN] session=${sessionId} | Could not create lock file: ${error.message}`);
    }
  }

  // Get all changed files via git
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

  const processingCache = loadProcessingCache();
  const changedFileSet = new Set();
  const directoryFiles = new Map();
  const relativeDirLookup = new Map();
  let skippedGitIgnored = 0;
  let unchangedSinceLastRun = 0;

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

    // Skip git-ignored files
    try {
      execSync(`git check-ignore -q "${file}"`, { cwd, stdio: 'pipe' });
      skippedGitIgnored++;
      continue;
    } catch (error) {
      // Non-zero exit code means file is NOT ignored
    }

    changedFileSet.add(file);

    const signature = getFileSignature(filePath);
    const cachedSignature = processingCache[file];
    if (cachedSignature && signaturesEqual(signature, cachedSignature)) {
      unchangedSinceLastRun++;
      continue;
    }

    if (!directoryFiles.has(fileDir)) {
      directoryFiles.set(fileDir, []);
      relativeDirLookup.set(fileDir, relativePath);
    }

    directoryFiles.get(fileDir).push({
      file,
      signature
    });
  }

  if (directoryFiles.size === 0) {
    const prunedCache = pruneCache(processingCache, changedFileSet);
    saveProcessingCache(prunedCache);
    const detailParts = [];
    if (unchangedSinceLastRun > 0) {
      detailParts.push(`unchanged=${unchangedSinceLastRun}`);
    }
    if (skippedGitIgnored > 0) {
      detailParts.push(`git-ignored=${skippedGitIgnored}`);
    }
    const detailSuffix = detailParts.length > 0 ? ` (${detailParts.join(', ')})` : '';
    appendLog(`[START] session=${sessionId}, cwd=${cwd} | [SKIP] No new file changes since last run${detailSuffix}`);
    process.exit(0);
  }

  const { excludedDirectories } = loadSettings(cwd);

  const filesHandled = new Map();
  const directoriesToProcess = [];

  for (const [fileDir, filesInDir] of directoryFiles.entries()) {
    const relativePath = relativeDirLookup.get(fileDir) || '.';

    if (isDirectoryExcluded(relativePath, excludedDirectories)) {
      appendLog(`[SKIP] ${relativePath} (excluded by config)`);
      markFilesAsHandled(filesInDir, filesHandled);
      continue;
    }

    const claudeMdPath = join(fileDir, 'CLAUDE.md');
    const globalClaudePath = homeDir ? join(homeDir, '.claude', 'CLAUDE.md') : null;
    if (globalClaudePath && claudeMdPath === globalClaudePath) {
      appendLog(`[SKIP] ${relativePath} (global CLAUDE.md - not managed by hook)`);
      markFilesAsHandled(filesInDir, filesHandled);
      continue;
    }

    const hasClaudeMd = existsSync(claudeMdPath);
    const existingClaudeMd = hasClaudeMd ? readFileSync(claudeMdPath, 'utf-8') : '';
    const { fileCount, fileTypes, subdirs, isRoot, targetLines } = getDirectoryInfo(fileDir, cwd);

    if (!hasClaudeMd && !isRoot && fileCount < 4) {
      appendLog(`[SKIP] ${relativePath} (only ${fileCount} files, need ≥4)`);
      markFilesAsHandled(filesInDir, filesHandled);
      continue;
    }

    const claudeMdHierarchy = getClaudeMdHierarchy(fileDir, cwd);
    const changedFilesInDir = filesInDir.map(({ file }) => basename(file));

    directoriesToProcess.push({
      relativePath,
      claudeMdPath,
      hasClaudeMd,
      existingClaudeMd,
      fileTypes,
      subdirs,
      isRoot,
      targetLines,
      claudeMdHierarchy,
      changedFilesInDir,
      filesInDir
    });
  }

  const startParts = [
    `session=${sessionId}`,
    `directories=${directoriesToProcess.length}`
  ];
  if (skippedGitIgnored > 0) {
    startParts.push(`git-ignored=${skippedGitIgnored}`);
  }
  if (unchangedSinceLastRun > 0) {
    startParts.push(`unchanged=${unchangedSinceLastRun}`);
  }
  appendLog(`[START] ${startParts.join(', ')}`);

  if (excludedDirectories.length > 0) {
    appendLog(`[CONFIG] Excluded directories: ${excludedDirectories.join(', ')}`);
  }

  if (directoriesToProcess.length === 0) {
    const finalCache = pruneCache(processingCache, changedFileSet);
    for (const [file, signature] of filesHandled.entries()) {
      finalCache[file] = signature;
    }
    saveProcessingCache(finalCache);
    appendLog('[SKIP] No directories qualified after filtering');
    process.exit(0);
  }

  for (const {
    relativePath,
    claudeMdPath,
    hasClaudeMd,
    existingClaudeMd,
    fileTypes,
    subdirs,
    isRoot,
    targetLines,
    claudeMdHierarchy,
    changedFilesInDir,
    filesInDir
  } of directoriesToProcess) {
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
          model: "claude-haiku-4-5",
          allowedTools: ["Write"],
          permissionMode: "bypassPermissions",
          hooks: {}
        }
      });

      for await (const message of result) {
        // Consume the stream
      }

      appendLog(`[PROCESSED] ${relativePath}`);
      markFilesAsHandled(filesInDir, filesHandled);
    } catch (error) {
      appendLog(`[ERROR] ${relativePath}: ${error.message}`);
    }
  }

  const finalCache = pruneCache(processingCache, changedFileSet);
  for (const [file, signature] of filesHandled.entries()) {
    finalCache[file] = signature;
  }
  saveProcessingCache(finalCache);

  appendLog(`[DONE] session=${sessionId} | processed ${directoriesToProcess.length} directories`);
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

  // Determine parent session ID from transcript to track actual user session
  let parentSessionId = null;
  try {
    const transcriptPath = inputData.transcript_path;
    if (transcriptPath && existsSync(transcriptPath)) {
      const transcript = readFileSync(transcriptPath, 'utf-8');
      const lines = transcript.trim().split('\n').filter(Boolean);

      // Find the first session start event to get the original session ID
      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.type === 'session_start') {
            parentSessionId = event.sessionId || sessionId;
            break;
          }
        } catch {
          continue;
        }
      }
    }
  } catch (error) {
    // Ignore errors reading transcript
  }

  // Spawn detached background process
  const { spawn } = await import('child_process');

  const workerData = JSON.stringify({
    sessionId,
    parentSessionId,
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
