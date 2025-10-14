const { existsSync, readdirSync } = require('fs');
const { join } = require('path');

/**
 * Resolves the file path for an agent definition
 * @param {string} baseDir - Base directory to search in
 * @param {string} agentType - Agent type to resolve
 * @returns {string|null} Resolved file path or null if not found
 */
function resolveAgentFilePath(baseDir, agentType) {
  if (!baseDir || !agentType) {
    return null;
  }

  // Normalize agent type path
  const normalizedType = agentType.replace(/\\/g, '/').replace(/^\/+/, '');
  
  // Check direct path first
  const directPath = join(baseDir, `${normalizedType}.md`);
  if (existsSync(directPath)) {
    return directPath;
  }

  if (!existsSync(baseDir)) {
    return null;
  }

  // Search recursively for the file
  const leafName = normalizedType.split('/').pop();
  const targetFileName = `${leafName}.md`;
  const stack = [baseDir];

  while (stack.length) {
    const currentDir = stack.pop();
    let entries;
    
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch (error) {
      continue;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        stack.push(join(currentDir, entry.name));
        continue;
      }

      if (entry.isFile() && entry.name === targetFileName) {
        return join(currentDir, entry.name);
      }
    }
  }

  return null;
}

module.exports = {
  resolveAgentFilePath
};

