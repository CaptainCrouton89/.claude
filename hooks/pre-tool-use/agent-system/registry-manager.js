const { readFileSync, writeFileSync, existsSync } = require('fs');

/**
 * Reads the agent registry from disk
 * @param {string} registryPath - Path to registry file
 * @returns {Object} Registry object
 */
function readRegistry(registryPath) {
  if (!existsSync(registryPath)) {
    return {};
  }
  
  try {
    return JSON.parse(readFileSync(registryPath, 'utf-8')) || {};
  } catch (error) {
    return {};
  }
}

/**
 * Writes the agent registry to disk
 * @param {string} registryPath - Path to registry file
 * @param {Object} registry - Registry object to write
 */
function writeRegistry(registryPath, registry) {
  writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
}

/**
 * Creates a registry entry for an agent
 * @param {string} agentId - Unique agent identifier
 * @param {number} currentDepth - Current recursion depth
 * @param {string|null} parentAgentId - Parent agent ID
 * @param {string} subagentType - Type of subagent
 * @param {Array|null} normalizedAllowedAgents - Allowed agents list
 * @param {Array|null} normalizedAllowedMcpServers - Allowed MCP servers list
 * @param {Array} missingMcpServers - Missing MCP servers list
 * @param {string} spawnedBySessionId - Session ID that spawned this agent
 * @returns {Object} Registry entry
 */
function createAgentRegistryEntry(
  agentId,
  currentDepth,
  parentAgentId,
  subagentType,
  normalizedAllowedAgents,
  normalizedAllowedMcpServers,
  missingMcpServers,
  spawnedBySessionId
) {
  return {
    pid: null, // Will update after spawn
    depth: currentDepth,
    parentId: parentAgentId,
    agentType: subagentType,
    allowedAgents: Array.isArray(normalizedAllowedAgents) ? [...normalizedAllowedAgents] : null,
    allowedMcpServers: Array.isArray(normalizedAllowedMcpServers) ? [...normalizedAllowedMcpServers] : null,
    missingMcpServers: missingMcpServers.length > 0 ? [...missingMcpServers] : [],
    spawnedBySessionId
  };
}

/**
 * Updates the PID for an agent in the registry
 * @param {string} registryPath - Path to registry file
 * @param {string} agentId - Agent ID
 * @param {number} pid - Process ID
 */
function updateAgentPid(registryPath, agentId, pid) {
  const registry = readRegistry(registryPath);
  if (registry[agentId]) {
    registry[agentId].pid = pid;
    writeRegistry(registryPath, registry);
  }
}

/**
 * Updates session tracking fields for an agent in the registry
 * @param {string} registryPath - Path to registry file
 * @param {string} agentId - Agent ID
 * @param {Object} sessionInfo - Session information object
 * @param {string} sessionInfo.sessionId - Agent's session ID (from Claude SDK)
 * @param {string} sessionInfo.transcriptPath - Full path to transcript file
 * @param {string} sessionInfo.parentSessionId - Parent session ID
 * @param {number} sessionInfo.parentPid - Parent process ID
 */
function updateAgentSessionInfo(registryPath, agentId, sessionInfo) {
  const registry = readRegistry(registryPath);
  if (registry[agentId]) {
    registry[agentId].sessionId = sessionInfo.sessionId;
    registry[agentId].transcriptPath = sessionInfo.transcriptPath;
    registry[agentId].parentSessionId = sessionInfo.parentSessionId;
    registry[agentId].parentPid = sessionInfo.parentPid;
    writeRegistry(registryPath, registry);
  }
}

module.exports = {
  readRegistry,
  writeRegistry,
  createAgentRegistryEntry,
  updateAgentPid,
  updateAgentSessionInfo
};

