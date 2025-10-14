const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const { resolveAgentFilePath } = require('./agent-file-resolver');
const { parseFrontmatterBlock, toList } = require('./frontmatter-parser');

const AGENT_DIRECTORY = join(homedir(), '.claude', 'agents');
const AGENT_LIBRARY_DIR = join(homedir(), '.claude', 'agents-library');

const agentDefinitionCache = new Map();

/**
 * Loads an agent definition from file
 * @param {string} agentType - Type of agent to load
 * @returns {Object} Agent definition with systemPrompt, modelName, permissions, and metadata
 */
function loadAgentDefinition(agentType) {
  if (!agentType) {
    return {
      filePath: null,
      systemPrompt: null,
      modelName: null,
      allowedAgents: null,
      allowedMcpServers: null,
      metadata: {}
    };
  }

  if (agentDefinitionCache.has(agentType)) {
    return agentDefinitionCache.get(agentType);
  }

  let filePath = resolveAgentFilePath(AGENT_DIRECTORY, agentType);
  let systemPrompt = null;
  let metadata = {};

  // Try library directory if not found in main directory
  if (!filePath) {
    const fallbackPath = resolveAgentFilePath(AGENT_LIBRARY_DIR, agentType);
    if (fallbackPath) {
      filePath = fallbackPath;
    } else {
      filePath = join(AGENT_DIRECTORY, `${agentType}.md`);
    }
  }

  // Parse the agent definition file
  if (existsSync(filePath)) {
    try {
      const raw = readFileSync(filePath, 'utf-8');
      const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      
      if (match) {
        metadata = parseFrontmatterBlock(match[1]);
        systemPrompt = match[2].trim();
      } else {
        systemPrompt = raw.trim();
      }
    } catch (error) {
      metadata = {};
      systemPrompt = null;
    }
  }

  // Extract and normalize metadata
  const allowedAgents = toList(metadata.allowedAgents);
  const allowedMcpServers = toList(metadata.allowedMcpServers);
  const modelName = typeof metadata.model === 'string' && metadata.model.trim()
    ? metadata.model.trim()
    : null;

  const definition = {
    filePath,
    systemPrompt,
    modelName,
    allowedAgents,
    allowedMcpServers,
    metadata
  };

  agentDefinitionCache.set(agentType, definition);
  return definition;
}

/**
 * Clears the agent definition cache
 */
function clearAgentCache() {
  agentDefinitionCache.clear();
}

module.exports = {
  loadAgentDefinition,
  clearAgentCache,
  AGENT_DIRECTORY,
  AGENT_LIBRARY_DIR
};

