const { generateObject } = require('ai');
const { ollama } = require('ollama-ai-provider');
const { z } = require('zod');

async function test() {
  const schema = z.object({
    activity: z.enum(['debugging', 'testing']),
    confidence: z.number(),
    effort: z.number()
  });

  console.error('Starting...');
  const start = Date.now();
  const { object } = await generateObject({
    model: ollama('gemma3:1b'),
    schema,
    prompt: 'Categorize this work: fix authentication bug. Return activity, confidence (0-1), effort (1-3)'
  });
  console.error(`Took ${Date.now() - start}ms`);
  console.log(JSON.stringify(object));
}

test().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
