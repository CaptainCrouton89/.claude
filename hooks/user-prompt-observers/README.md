# Observer Registry System

This directory contains a unified observer system that analyzes user prompts and injects relevant workflow guidance.

## Architecture

### Observer Registry (`observer-registry.js`)
The main orchestrator that:
- Runs all observers in parallel for performance
- Combines results from activity-based and specialized observers
- Generates unified context messages with workflow recommendations
- Uses `gpt-4.1-nano` for fast, cost-effective analysis

### Activity-Based Observers

Each activity has a prompt file in `prompts/` that defines:
- Activity patterns and signals
- Effort estimation guidelines (1-10 scale)
- Edge cases and distinctions

**Supported Activities:**
- 🐛 **debugging** - Bug fixing and error diagnosis
- 👀 **code-review** - Code quality assessment
- 📝 **documenting** - Writing documentation
- ✨ **feature** - Building new functionality
- 🔍 **investigating** - Understanding existing systems
- 📋 **planning** - Creating implementation plans
- ❓ **requirements-gathering** - Clarifying specifications
- 🔒 **security-auditing** - Security analysis
- 🧪 **testing** - Writing test code

### Specialized Observers

- **Prompt Improvement** - Detects requests to improve prompts (`protocols/prompting-guide.md`)
- **Parallel Execution** - Detects parallelization intent (`protocols/parallel.md`)

## Protocol Injection

Protocols are injected based on effort thresholds:

- **Moderate protocols** - Injected when effort is near moderate threshold (within ±1)
- **Strong protocols** - Injected when effort is near strong threshold (within ±1)
- **Both protocols** - Injected when effort is in the overlap range

Example for feature development (moderate: 5, strong: 7):
- Effort 4-5: Moderate protocol only
- Effort 6: Both moderate and strong protocols
- Effort 7-8: Strong protocol only

## Configuration

The observer is registered in `settings.json` as:
```json
{
  "type": "command",
  "command": "/Users/silasrhyneer/.claude/hooks/user-prompt-submit/activity-observer.js",
  "timeout": 15000
}
```

## Testing

Run tests with:
```bash
node test-observers.js
```

## Adding New Observers

### Activity-based Observer
1. Create prompt file in `prompts/[activity-name].md`
2. Add observer config to `ACTIVITY_OBSERVERS` in `observer-registry.js`
3. Ensure protocol files exist in `protocols/[protocol-dir]/`

### Specialized Observer
1. Add observer function to `observer-registry.js`
2. Add to `runAllObservers` function
3. Add handling in `buildContextMessage` function

## Migration Notes

This replaces the old monolithic `activity-tracker.js` which:
- Used a single large prompt with all activity categories
- Used `gpt-4.1-mini` (more expensive)
- Couldn't match multiple activities
- Had complex effort-to-protocol mapping logic

The new system:
- Runs observers in parallel for better performance
- Uses cheaper `gpt-4.1-nano` model
- Can match and inject multiple workflows
- Has simpler, more maintainable configuration

