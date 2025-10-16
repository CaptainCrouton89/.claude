#!/usr/bin/env node

/**
 * Fetch and inject skills context hook
 *
 * Detects when user runs /init-workspace and:
 * 1. Runs fetch-skills to get all available skills
 * 2. Injects the skill list as additional context to the agent
 * 3. Instructs the agent to copy relevant skills during init
 *
 * Execution: Runs on UserPromptSubmit when /init-workspace is detected
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { homedir } from 'os';

const inputData = JSON.parse(readFileSync(0, 'utf-8'));

// Only process if user is running /init-workspace
const userMessage = inputData.userMessage || '';
if (!userMessage.includes('/init-workspace')) {
  process.exit(0);
}

try {
  // Run fetch-skills to get table output - filter to show only archived skills
  const fetchSkillsPath = `${homedir()}/.claude/bin/fetch-skills`;
  let skillsOutput = '';

  try {
    // Run fetch-skills and capture output (may exit with code 1 if duplicates found, which is ok)
    let allOutput = '';
    try {
      allOutput = execSync(`bash ${fetchSkillsPath} table`, {
        encoding: 'utf-8',
        timeout: 5000
      }).trim();
    } catch (e) {
      // Command may fail due to duplicates detected, but output is still valid
      allOutput = (e.stdout || e.stderr || '').toString().trim();
    }

    // Apply filter to exclude personal skills (which are available everywhere)
    // Only show archived and project-specific skills
    if (allOutput) {
      const lines = allOutput.split('\n');
      const filteredLines = lines.filter(line => {
        // Keep header and separator lines
        if (!line.includes('|')) {
          return true;
        }
        // Exclude lines with personal ~/.claude/skills/ (absolute path, not archived, not project)
        // Pattern: /Users/.../.claude/skills/name (not skills.archive, not relative path)
        if (line.includes('/Users/') && line.includes('/.claude/skills/') && !line.includes('skills.archive')) {
          return false; // Exclude personal skills
        }
        return true; // Include archived and project-specific skills
      });
      skillsOutput = filteredLines.join('\n');
    }
  } catch (e) {
    // If fetch-skills is not available or other error, continue without it
    skillsOutput = '';
  }

  // Build additional context to inject
  const additionalContext = skillsOutput
    ? `\n## Available Skills Across All Projects\n\nThe following skills are available (from personal, archived, and other project directories):\n\n${skillsOutput}`
    : '';

  // Prepare instruction for the agent
  const skillInstruction = `\n\n### About Skills\n\n**Automatically available everywhere**: All personal skills in \`~/.claude/skills/\` are available across all projects — no copying needed.\n\n**Optional for this project**: You can copy relevant skills from the list above (archived and from other projects) using:\n\n\`\`\`bash\nfetch-skills copy ./.claude/skills\n\`\`\`\n\nThen **review and delete** from \`./.claude/skills/\` any skills that aren't relevant to this project's type and workflows. Only keep skills that genuinely enhance this specific project.`;

  // Output JSON to inject context into the prompt
  const output = {
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalSystemContext: additionalContext + skillInstruction,
      messageToLog: '🚀 Skills context injected for project initialization'
    }
  };

  console.log(JSON.stringify(output));
  process.exit(0);

} catch (error) {
  // Silent fail - don't interrupt the session
  process.exit(0);
}
