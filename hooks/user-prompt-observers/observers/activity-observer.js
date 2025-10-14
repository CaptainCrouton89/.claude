const { generateObject } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { z } = require('zod');
const { readFileSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

/**
 * Generic activity observer that uses a prompt file to determine if an activity matches
 * @param {string} activityName - Name of the activity (e.g., 'debugging', 'planning')
 * @param {string} userPrompt - The user's prompt to analyze
 * @param {object} options - Additional options
 * @returns {Promise<{isMatch: boolean, confidence: number, effort: number}>}
 */
async function observeActivity(activityName, userPrompt, options = {}) {
  const promptPath = join(
    homedir(),
    '.claude',
    'hooks',
    'user-prompt-observers',
    'prompts',
    `${activityName}.md`
  );

  let systemPrompt;
  try {
    systemPrompt = readFileSync(promptPath, 'utf-8');
  } catch (err) {
    // Prompt file doesn't exist, return no match
    return { isMatch: false, confidence: 0, effort: 0 };
  }

  const schema = z.object({
    isMatch: z.boolean().describe('Whether this activity matches the user prompt'),
    confidence: z.number().min(0).max(1).describe('0 = Low, 1 = High'),
    effort: z.number().int().min(1).max(10).describe('Estimated effort on 1-10 scale'),
  });

  try {
    const { object: result } = await generateObject({
      model: openai('gpt-4.1-nano'),
      schema,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    return result;
  } catch (err) {
    // Fail silently, return no match
    return { isMatch: false, confidence: 0, effort: 0 };
  }
}

module.exports = { observeActivity };

