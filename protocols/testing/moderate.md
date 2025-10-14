# Testing Protocol (Moderate)

## Step 1: Determine Test Type

| Component | Test Method |
|-----------|-------------|
| Pure logic (parsing, calculations) | Unit tests |
| AI/ML outputs | Manual verification suite |
| Integration flows | End-to-end tests |
| Bugs | Debug logging + reproduce |

---

## Step 2: Unit Tests

**For deterministic logic:**

```javascript
describe('functionName', () => {
  it('handles happy path', () => {
    expect(fn(input)).toBe(expected);
  });

  it('handles edge case', () => {
    expect(fn(edgeInput)).toBe(edgeExpected);
  });

  it('rejects invalid input', () => {
    expect(() => fn(invalid)).toThrow();
  });
});
```

**Coverage targets:**
- Happy path
- Common edge cases
- Error conditions

---

## Step 3: Integration Tests

**For workflow testing:**

```bash
#!/bin/bash
# Test end-to-end flow

# Setup
cat > input.json << 'EOF'
{"field": "value"}
EOF

# Execute
result=$(cat input.json | node script.js 2>&1)

# Validate
echo "$result" | jq -e '.expectedField' || echo "FAIL: Missing field"

# Check side effects
[ -f "expected-file.log" ] || echo "FAIL: Log not created"
```

---

## Step 4: AI/ML Quality Tests

**Use manual verification, not assertions:**

```bash
#!/bin/bash
# run-verification.sh

for test_case in test-cases/*/; do
  result=$(cat "$test_case/input.json" | node ai-script.js)

  echo "=== INPUT ==="
  cat "$test_case/input.json" | jq

  echo "=== RESULT ==="
  echo "$result" | jq

  echo "Correct? (y/n): "
  read response

  [ "$response" = "y" ] && echo "$result" > "$test_case/verified.json"
done
```

**Analyze results:**
- Track accuracy per category
- Identify patterns in failures
- Adjust thresholds if needed

---

## Step 5: Debugging

**Add targeted logging:**

```javascript
console.error('[DEBUG] Step 1:', JSON.stringify(data, null, 2));
console.error('[DEBUG] Step 2:', transformedData);
console.error('[DEBUG] Final result:', result);
```

**Run with trace:**

```bash
cat input.json | node script.js 2> debug.log
cat debug.log
```

**Quote actual code when analyzing:**

```
Location: file.js:45-50
Code: const result = transform(data);
Debug shows: data={...}, result=undefined
Hypothesis: transform() returns void
Fix: Check transform implementation
```

---

## Step 6: Test Execution

```bash
npm test                      # Unit tests
./run-verification.sh         # AI quality
./test-integration.sh         # Integration
cat input.json | node script.js 2> debug.log  # Debug
```

---

## Quality Checklist

**For Unit Tests:**
- [ ] Happy path covered
- [ ] Key edge cases tested
- [ ] Error conditions handled

**For Integration:**
- [ ] End-to-end flow verified
- [ ] Side effects checked
- [ ] Error scenarios tested

**For Debugging:**
- [ ] Actual code quoted
- [ ] Debug logging added
- [ ] Root cause identified
