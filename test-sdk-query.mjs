#!/usr/bin/env node

import { query } from '/Users/silasrhyneer/.claude/claude-cli/sdk.mjs';

console.log('[TEST] Starting SDK query test...');

try {
  const result = query({
    prompt: 'Say hello in exactly 3 words',
    options: {
      permissionMode: 'bypassPermissions'
    }
  });

  console.log('[TEST] Query created, iterating messages...');

  for await (const message of result) {
    console.log(`[TEST] Message type: ${message.type}`);

    if (message.type === 'assistant') {
      console.log('[TEST] Assistant message:', JSON.stringify(message.message, null, 2));
    } else if (message.type === 'result') {
      console.log('[TEST] Result:', message.result || 'completed');
    } else {
      console.log('[TEST] Other message:', message);
    }
  }

  console.log('[TEST] Query completed successfully');
} catch (error) {
  console.error('[TEST] Error:', error.message);
  console.error('[TEST] Stack:', error.stack);
  process.exit(1);
}
