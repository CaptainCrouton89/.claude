# Testing Protocol

## Step 1: Determine Test Type

| Component | Test Method |
|-----------|-------------|
| Deterministic logic (parsing, thresholds) | Unit tests |
| AI classification quality | User verification suite |
| Full hook flow (stdin→stdout) | bash + jq integration |
| Broken behavior | Quote code line-by-line + debug logging |

---

## Step 2: Unit Tests (Deterministic)

```javascript
describe('shouldInjectProtocol', () => {
  it('debugging: injects when effort >= 3, confidence >= 0.8', () => {
    expect(shouldInject({activity: 'debugging', confidence: 0.9, effort: 5})).toBe(true);
    expect(shouldInject({activity: 'debugging', confidence: 0.7, effort: 5})).toBe(false);
  });
});

describe('parseTranscript', () => {
  it('filters hook pollution', () => {
    const lines = [
      '{"type":"user","message":{"content":"<user-prompt-submit-hook>...</user-prompt-submit-hook>"}}',
      '{"type":"user","message":{"content":"Real prompt"}}'
    ];
    expect(parseTranscript(lines.join('\n'))).toEqual([{role: 'user', content: 'Real prompt'}]);
  });
});
```

---

## Step 3: AI Quality Test Suite

AI outputs vary - use user verification, not assertions.

**Structure:**
```
test-cases/debugging/001-simple-bug/
  input.json, transcript.jsonl, expected.json, result.json
```

**Interactive Runner (run-ai-tests.sh):**
```bash
#!/bin/bash
for test_dir in test-cases/*/*/; do
  result=$(cat "$test_dir/input.json" | node ../../activity-tracker.js 2>/dev/null)

  echo "=== USER MESSAGES ==="
  cat "$test_dir/transcript.jsonl" | jq -r 'select(.type=="user") | .message.content'

  echo "=== AI RESULT ==="
  echo "$result" | jq '{activity, confidence, effort}'

  echo "Correct? (y/n): "
  read response
  [ "$response" = "y" ] && echo "$result" > "$test_dir/result.json"
done
```

**Confidence Calibration (analyze-confidence.py):**
```python
# Check: 0.9-1.0 confidence → 90-100% accurate?
for bucket, stats in confidence_buckets.items():
    accuracy = stats['correct'] / stats['total'] * 100
    print(f"{bucket}: {accuracy:.1f}% accurate")
```

---

## Step 4: Hook Integration Tests

```bash
#!/bin/bash
cat > input.json << 'EOF'
{"hook_event_name": "UserPromptSubmit", "session_id": "test-001", "prompt": "Fix auth bug", "transcript_path": "/tmp/empty.jsonl"}
EOF

result=$(cat input.json | node activity-tracker.js 2>&1)

# Validate output
echo "$result" | jq -e '.activity, .confidence' || echo "FAIL: Missing fields"

# Check side effects
[ -f "$HOME/.claude/logs/activity-tracker.log" ] || echo "FAIL: Log not created"

# Test protocol injection (debugging activity, high confidence/effort)
activity=$(echo "$result" | jq -r '.activity')
confidence=$(echo "$result" | jq -r '.confidence')
effort=$(echo "$result" | jq -r '.effort')

if [ "$activity" = "debugging" ] && [ "$(echo "$confidence >= 0.8" | bc)" -eq 1 ] && [ "$effort" -ge 3 ]; then
  echo "$result" | grep -q "BUG-FIXING.md" || echo "FAIL: Expected protocol injection"
fi
```

---

## Step 5: Debugging with Evidence

**Quote actual code, not assumptions:**
- BAD: "The function probably filters empty lines"
- GOOD: "Lines 38-40 show: `.filter(line => line.trim())`"

**Add debug logging:**
```javascript
console.error('[DEBUG Step 1] Raw input length:', input.length);
console.error('[DEBUG Step 2] Parsed hook data:', JSON.stringify(hookData, null, 2));
console.error('[DEBUG Step 5] AI result:', JSON.stringify(result, null, 2));
```

**Run and trace:**
```bash
cat test-input.json | node activity-tracker.js 2> debug.log
cat debug.log
```

**Example analysis:**
```
Location: activity-tracker.js:251-265
Code: const shouldInjectProtocol = result.confidence >= 0.8 && result.effort >= effortThreshold;
Debug shows: confidence=0.9, effort=5, threshold=3, shouldInject=true
Expected: Protocol injected
Actual: Not injected
Hypothesis: Protocol file missing (line 283)
Result: ls ~/.claude/hooks/state-tracking/protocols/BUG-FIXING.md → File missing!
```

---

## Step 6: Execution

```bash
npm test                                                   # Unit tests
./run-ai-tests.sh && python analyze-confidence.py         # AI quality
./test-hook-integration.sh                                # Integration
cat test-input.json | node activity-tracker.js 2> debug.log  # Debugging
```

---

## Quality Checklist

**AI Quality:**
- [ ] 5+ test cases per activity
- [ ] User verified 100% of corpus
- [ ] Accuracy ≥80%, confidence calibrated

**Integration:**
- [ ] stdin→stdout flow tested with jq
- [ ] Side effects checked (logs, state)
- [ ] Protocol injection thresholds verified

**Debugging:**
- [ ] Quoted actual code
- [ ] Debug logging traced

---

## activity-tracker.js Thresholds

Protocol injection requires: Confidence ≥ 0.8 AND Effort ≥ threshold

```javascript
const activityThresholds = {
  'debugging': 3, 'architecting': 3, 'requirements-gathering': 3,
  'code-review': 3, 'planning': 4, 'investigating': 6,
  'security-auditing': 4, 'feature-development': 7,
  'documenting': 7, 'testing': 7, 'other': 10
};
```

---
