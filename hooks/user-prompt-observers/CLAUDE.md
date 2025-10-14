# Observer System Conventions

## Core Architecture

**Registry Pattern**: `observer-registry.js` orchestrates all observers in parallel, returning unified results for injection into user prompts.

**Observer Types**:
- **Activity-based** - Generic pattern with prompt template in `prompts/[activity-name].md`
- **Specialized** - Custom logic in `observer-registry.js` functions

## Activity Observer Structure

Each activity requires:
1. **Prompt file** - `prompts/[activity-name].md` defining detection patterns
2. **Registry entry** - Config in `ACTIVITY_OBSERVERS` array with:
   - `name` - Activity identifier (matches prompt filename)
   - `protocolDir` - Directory in `hooks/state-tracking/protocols/`
   - `thresholds` - `{ moderate: N, strong: M }` for protocol injection
   - `emoji` - Display icon for context messages
3. **Protocol files** - `moderate.md` and `strong.md` in protocol directory

## Protocol Injection Logic

Protocols inject based on effort (1-10 scale) relative to thresholds:
- **Moderate**: effort ∈ [moderate, moderate+3]
- **Strong**: effort ∈ [strong, strong+3]
- **Both**: When ranges overlap

Example with thresholds `{ moderate: 5, strong: 7 }`:
- effort=5-6 → moderate only
- effort=7-8 → both moderate and strong
- effort=9-10 → strong only

## Confidence & Matching

**Activity observers** match when:
- `isMatch: true` AND `confidence >= 0.8`

**Specialized observers** inject when:
- `shouldInject: true` (internally uses `confidence >= 0.7`)

## Specialized Observers

Implement in `observer-registry.js`:
1. Create async function returning `{ type, shouldInject, confidence }`
2. Add to `specializedPromises` in `runAllObservers()`
3. Add injection logic in `buildContextMessage()`

## Model Usage

All observers use `openai('gpt-4.1-nano')` for speed and cost-effectiveness.

## Testing

Run `node test-observers.js` to validate observer behavior with test prompts.
