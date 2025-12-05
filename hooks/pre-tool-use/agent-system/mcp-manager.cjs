const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

/**
 * Loads MCP server configurations from various locations
 * @param {Object} options - Options object
 * @param {string} options.cwd - Current working directory
 * @param {string} options.projectDir - Project directory
 * @returns {Object} Object with servers map and sources array
 */
function loadMcpServerLibrary({ cwd, projectDir }) {
  const servers = {};
  const sources = new Set();
  
  const candidates = [
    join(homedir(), '.claude', 'mcp-library', '.mcp.json'),
    join(homedir(), '.claude', '.mcp.json'),
    projectDir ? join(projectDir, '.claude', '.mcp.json') : null,
    projectDir ? join(projectDir, '.mcp.json') : null,
    cwd ? join(cwd, '.claude', '.mcp.json') : null,
    cwd ? join(cwd, '.mcp.json') : null
  ];

  for (const candidate of candidates) {
    if (!candidate || sources.has(candidate) || !existsSync(candidate)) {
      continue;
    }

    try {
      const raw = readFileSync(candidate, 'utf-8');
      const parsed = JSON.parse(raw);
      
      if (parsed && typeof parsed === 'object' && 
          parsed.mcpServers && typeof parsed.mcpServers === 'object') {
        Object.assign(servers, parsed.mcpServers);
        sources.add(candidate);
      }
    } catch (error) {
      // Ignore malformed MCP config files
    }
  }

  return { servers, sources: Array.from(sources) };
}

/**
 * Selects specific MCP servers from the library
 * @param {Array<string>} names - Server names to select
 * @param {Object} library - Server library to select from
 * @returns {Object} Object with selected servers and missing server names
 */
function selectMcpServers(names, library) {
  const selection = {};
  const missing = [];
  
  if (!Array.isArray(names)) {
    return { servers: selection, missing };
  }

  for (const name of names) {
    if (library && Object.prototype.hasOwnProperty.call(library, name)) {
      selection[name] = library[name];
    } else {
      missing.push(name);
    }
  }

  return { servers: selection, missing };
}

module.exports = {
  loadMcpServerLibrary,
  selectMcpServers
};

