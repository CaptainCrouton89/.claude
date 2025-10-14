#!/usr/bin/env node

const { runAllObservers, buildContextMessage } = require('./observer-registry');

const testCases = [
  {
    name: 'Debugging Request',
    prompt: 'Fix the bug where the login button is not working',
  },
  {
    name: 'Feature Development',
    prompt: 'Add a new user registration feature with email validation',
  },
  {
    name: 'Planning Request',
    prompt: 'Make a plan for implementing a new authentication system',
  },
  {
    name: 'Investigation',
    prompt: 'How does the current authentication flow work in this codebase?',
  },
  {
    name: 'Prompt Improvement',
    prompt: 'Help me improve my prompts for better AI responses',
  },
  {
    name: 'Parallel Execution',
    prompt: 'Can we parallelize these database operations to run concurrently?',
  },
  {
    name: 'Multiple Activities',
    prompt: 'Debug this auth bug and then plan how to refactor the auth system',
  },
  {
    name: 'Low Effort Debugging',
    prompt: 'Fix this typo in the variable name',
  },
  {
    name: 'High Effort Feature',
    prompt: 'Build a complete microservices architecture with event sourcing',
  }
];

async function runTests() {
  console.log('Testing Observer System\n' + '='.repeat(50));
  
  for (const testCase of testCases) {
    console.log(`\n\n📋 Test: ${testCase.name}`);
    console.log(`Prompt: "${testCase.prompt}"\n`);
    
    try {
      const results = await runAllObservers(testCase.prompt);
      
      // Show matched activities
      const matchedActivities = results.activities.filter(
        (a) => a.isMatch && a.confidence >= 0.8
      );
      
      if (matchedActivities.length > 0) {
        console.log('Matched Activities:');
        for (const activity of matchedActivities) {
          console.log(`  ${activity.emoji} ${activity.name}: confidence=${activity.confidence.toFixed(2)}, effort=${activity.effort}/10`);
        }
      }
      
      // Show specialized observers
      const triggered = results.specialized.filter(s => s.shouldInject);
      if (triggered.length > 0) {
        console.log('\nSpecialized Observers:');
        for (const obs of triggered) {
          console.log(`  ✓ ${obs.type} (confidence=${obs.confidence.toFixed(2)})`);
        }
      }
      
      // Show context message
      const contextMessage = buildContextMessage(results);
      if (contextMessage) {
        console.log('\nContext Message:');
        console.log(contextMessage);
      } else {
        console.log('\n❌ No workflows triggered');
      }
      
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }
  
  console.log('\n\n' + '='.repeat(50));
  console.log('Tests complete!');
}

runTests().catch(console.error);

