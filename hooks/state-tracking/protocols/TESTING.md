# Testing Protocol

## Step 1: Testing Discovery

Ask 2-3 questions to determine testing approach:

**Q1: What needs testing?**
- Deterministic logic (parsing, thresholds) → Unit tests
- AI classification quality → User verification test suite
- Full hook flow → Tool-based integration tests
- Broken behavior → Line-by-line debugging with quoted code

**Q2: Current situation?**
- New code → Prevent regressions
- Broken code → Diagnose with evidence
- AI behavior concerns → Build verification corpus

---

## Step 2: Testing Strategy for activity-tracker.js

### Components & Approaches

| Component | Test Method | Why |
|-----------|-------------|-----|
| Transcript parsing | Unit tests | Deterministic |
| Protocol injection thresholds | Unit tests | Pure logic |
| AI classification | User verification suite | Non-deterministic, quality is subjective |
| Full hook (stdin→stdout) | bash + jq integration tests | Side effects, file creation |
| Debugging failures | Quote code line-by-line | Evidence-based diagnosis |

### Key Insight: AI Testing is Different

**Can't use traditional assertions:**
- AI outputs vary (same input ≠ same output)
- Quality is subjective
- Need user to judge correctness

**Solution:**
- Build test corpus with expected ranges
- Show prompts to user (transparency)
- User verifies each classification
- Track accuracy over time

---

## Step 3A: Unit Tests (Deterministic Parts)

Test activity-tracker.js thresholds and parsing:

```javascript
// Test protocol injection logic
describe('shouldInjectProtocol', () => {
  it('debugging: injects when effort >= 3, confidence >= 0.8', () => {
    expect(shouldInject({activity: 'debugging', confidence: 0.9, effort: 5})).toBe(true);
    expect(shouldInject({activity: 'debugging', confidence: 0.7, effort: 5})).toBe(false);
    expect(shouldInject({activity: 'debugging', confidence: 0.9, effort: 2})).toBe(false);
  });

  it('investigating: injects when effort >= 6', () => {
    expect(shouldInject({activity: 'investigating', confidence: 0.9, effort: 7})).toBe(true);
    expect(shouldInject({activity: 'investigating', confidence: 0.9, effort: 5})).toBe(false);
  });
});

// Test transcript filtering
describe('parseTranscript', () => {
  it('filters hook pollution', () => {
    const lines = [
      '{"type":"user","message":{"content":"<user-prompt-submit-hook>...</user-prompt-submit-hook>"}}',
      '{"type":"user","message":{"content":"Real prompt"}}'
    ];
    expect(parseTranscript(lines.join('\n'))).toEqual([
      {role: 'user', content: 'Real prompt'}
    ]);
  });
});
```

---

## Step 3B: AI Quality Test Suite (Non-Obvious)

### Why This Matters

Traditional testing assumes deterministic outputs. AI classification needs:
- **User verification** - Human judges quality
- **Prompt transparency** - User sees what model sees
- **Confidence calibration** - Confidence score should match accuracy

### Test Suite Structure

```
test-cases/
  debugging/
    001-simple-bug/
      input.json           # Hook input
      transcript.jsonl     # Conversation context
      expected.json        # Expected activity (range, not exact)
      result.json          # Actual AI output
```

### Interactive Test Runner

**run-ai-tests.sh** - Shows prompts to user for quality judgment

```bash
#!/bin/bash

for test_dir in test-cases/*/*/; do
  test_name=$(basename "$(dirname "$test_dir")")/$(basename "$test_dir")

  # Run classification
  result=$(cat "$test_dir/input.json" | node ../../activity-tracker.js 2>/dev/null)
  activity=$(echo "$result" | jq -r '.activity')
  confidence=$(echo "$result" | jq -r '.confidence')
  effort=$(echo "$result" | jq -r '.effort')

  # Show transparency - what the model saw
  echo "=== SYSTEM PROMPT ==="
  echo "You are analyzing a developer's conversation..."
  echo "(See activity-tracker.js lines 100-188)"
  echo ""

  echo "=== USER MESSAGES ==="
  cat "$test_dir/transcript.jsonl" | jq -r 'select(.type=="user") | .message.content'
  echo ""

  echo "=== CURRENT PROMPT ==="
  cat "$test_dir/input.json" | jq -r '.prompt'
  echo ""

  echo "=== AI RESULT ==="
  echo "Activity: $activity (confidence: $confidence, effort: $effort)"
  echo ""

  # User verification
  echo "Correct? (y/n): "
  read response

  if [ "$response" = "y" ]; then
    echo "$test_name,$activity,$confidence,$effort,YES" >> results.csv
    echo "$result" > "$test_dir/result.json"  # Save for regression
  else
    echo "What should it be?: "
    read correct_activity
    echo "$test_name,$activity,$confidence,$effort,NO,$correct_activity" >> results.csv
  fi
done
```

### Confidence Calibration

Track if confidence scores match reality:

```python
# analyze-confidence.py
# Check: 0.9-1.0 confidence → 90-100% accurate?

confidence_buckets = {'0.9-1.0': {'correct': 0, 'total': 0}, ...}

for row in csv.DictReader(open('results.csv')):
    conf = float(row['Confidence'])
    bucket = '0.9-1.0' if conf >= 0.9 else '0.8-0.9' if conf >= 0.8 else ...
    confidence_buckets[bucket]['total'] += 1
    if row['Correct'] == 'YES':
        confidence_buckets[bucket]['correct'] += 1

# Report calibration
for bucket, stats in confidence_buckets.items():
    accuracy = stats['correct'] / stats['total'] * 100
    print(f"{bucket}: {accuracy:.1f}% accurate")
```

**If miscalibrated:** Adjust prompts or thresholds in activity-tracker.js

---

## Step 3C: Hook Integration Tests

Test full hook flow with bash tools:

```bash
#!/bin/bash

# Test: Hook executes and outputs valid JSON
cat > input.json << 'EOF'
{
  "hook_event_name": "UserPromptSubmit",
  "session_id": "test-001",
  "prompt": "Fix auth bug",
  "transcript_path": "/tmp/empty.jsonl"
}
EOF

result=$(cat input.json | node activity-tracker.js 2>&1)

# Validate with jq
echo "$result" | jq -e '.activity' || echo "FAIL: Missing activity"
echo "$result" | jq -e '.confidence' || echo "FAIL: Missing confidence"

# Check side effects
[ -f "$HOME/.claude/logs/activity-tracker.log" ] || echo "FAIL: Log not created"
grep -q "test-001" "$HOME/.claude/logs/activity-tracker.log" || echo "FAIL: Session not logged"

# Test protocol injection
activity=$(echo "$result" | jq -r '.activity')
confidence=$(echo "$result" | jq -r '.confidence')
effort=$(echo "$result" | jq -r '.effort')

if [ "$activity" = "debugging" ] && [ "$(echo "$confidence >= 0.8" | bc)" -eq 1 ] && [ "$effort" -ge 3 ]; then
  echo "$result" | grep -q "BUG-FIXING.md" || echo "FAIL: Expected protocol injection"
fi
```

---

## Step 3D: Debugging with Evidence

### Critical: Quote Actual Code

**BAD:** "The function probably filters empty lines"
**GOOD:** "Lines 38-40 show: `.filter(line => line.trim())` - this filters empty lines"

### Add Debug Logging

```javascript
// activity-tracker.js - add at each stage
console.error('[DEBUG Step 1] Raw input length:', input.length);
console.error('[DEBUG Step 2] Parsed hook data:', JSON.stringify(hookData, null, 2));
console.error('[DEBUG Step 3] Transcript lines:', transcriptLines.length);
console.error('[DEBUG Step 4] Conversation history:', conversationHistory.length);
console.error('[DEBUG Step 5] AI result:', JSON.stringify(result, null, 2));
console.error('[DEBUG Step 6] Should inject?', shouldInjectProtocol);
```

### Run and Trace

```bash
cat test-input.json | node activity-tracker.js 2> debug.log
cat debug.log
```

### Analyze with Evidence

```markdown
## Bug Analysis

**Location:** activity-tracker.js:251-265

**Code (lines 251-265):**
```javascript
const effortThreshold = activityThresholds[result.activity] || 7;
const shouldInjectProtocol = result.confidence >= 0.8 && result.effort >= effortThreshold;
```

**Debug output shows:**
- Activity: "debugging"
- Confidence: 0.9
- Effort: 5
- effortThreshold: 3 (from activityThresholds line 252)
- shouldInjectProtocol: true

**Expected:** Protocol should inject
**Actual:** Not injecting

**Hypothesis:** Check if protocol file exists (line 283)

```bash
ls ~/.claude/hooks/state-tracking/protocols/BUG-FIXING.md
```

**Result:** File missing - that's the bug!
```

---

## Step 4: Test Execution

```bash
# Unit tests (deterministic)
npm test

# AI quality (user verification)
./run-ai-tests.sh
python analyze-confidence.py

# Integration (hook flow)
./test-hook-integration.sh

# Debugging (broken code)
cat test-input.json | node activity-tracker.js 2> debug.log
```

---

## Quality Criteria

**AI Quality Tests:**
- [ ] 5+ test cases per activity type
- [ ] User verified 100% of corpus
- [ ] Accuracy ≥80%
- [ ] Confidence calibrated (0.9 confidence → ~90% accurate)
- [ ] Prompts shown transparently

**Integration Tests:**
- [ ] stdin→stdout flow tested
- [ ] Output validated with jq
- [ ] Side effects checked (log files, state files)
- [ ] Protocol injection thresholds verified

**Debugging:**
- [ ] Quoted actual code (no assumptions)
- [ ] Debug logging at each step
- [ ] Traced execution with real values
- [ ] Evidence-based diagnosis

---

## activity-tracker.js Specific Thresholds

**Protocol injection requires:**
- Confidence ≥ 0.8 (all activities)
- Effort ≥ threshold (varies by activity):

```javascript
const activityThresholds = {
  'debugging': 3,
  'architecting': 3,
  'requirements-gathering': 3,
  'code-review': 3,
  'planning': 4,
  'investigating': 6,
  'security-auditing': 4,
  'feature-development': 7,
  'documenting': 7,
  'testing': 7,
  'other': 10  // Never inject
};
```

**Test these thresholds explicitly** - they're business logic, not AI behavior.

---
