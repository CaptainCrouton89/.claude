# Activity Tracker Benchmark Suite

## Purpose
Validates activity categorization accuracy through human annotations and automated testing. Measures precision/recall for 10 activity categories plus effort scoring accuracy.

## Workflow

### 1. Sample Collection
**sample-prompts.js**: Exports conversation data from Claude sessions
- Reads from `~/.claude/logs/conversation-data/`
- Filters prompts meeting criteria (length, context)
- Generates `samples.json` with uuid/sessionId/timestamp/prompt

### 2. Human Annotation
**annotate.js**: Interactive CLI for manual ground truth labeling
- Presents prompts with truncated display
- Collects activity category (10 categories from parent CLAUDE.md)
- Collects effort score (1-10 scale from parent CLAUDE.md)
- Generates `annotations.json` with `{uuid, sessionId, timestamp, prompt, annotation: {activity, effort}}`

**auto-annotate.js**: Batch annotation using LLM (requires manual review)

### 3. Benchmark Execution
**run-benchmark.js**: Runs activity-tracker.js logic on annotated samples
- Replicates categorization from `activity-tracker.js:27-149`
- Uses same prompt/schema/model (gpt-4.1-mini)
- Generates predictions for each annotated sample
- Creates `results.json` with `{uuid, prompt, annotation, prediction: {activity, confidence, effort}}`

### 4. Analysis & Reporting
**run-benchmark.js**: Calculates metrics and generates reports
- **Confusion matrix**: Actual vs predicted activity categories
- **Per-category metrics**: Precision, recall, F1 score
- **Effort correlation**: Average difference, within ±1/±2 thresholds
- **Top confusion pairs**: Most common misclassifications
- Outputs `report.txt` with formatted results

### 5. Comparative Analysis
**compare-models.js**: Tests different LLM models for categorization accuracy
**time-comparison.js**: Measures inference latency across models

## Data Schema

**samples.json**: Raw conversation excerpts
```json
[{"uuid": "...", "sessionId": "...", "timestamp": "...", "prompt": "..."}]
```

**annotations.json**: Human-labeled ground truth
```json
[{..., "annotation": {"activity": "feature", "effort": 7}}]
```

**results.json**: Predictions + ground truth
```json
[{..., "annotation": {...}, "prediction": {"activity": "...", "confidence": 0.95, "effort": 6}}]
```

## Key Metrics
- **Accuracy**: Correct predictions / total samples
- **Precision**: TP / (TP + FP) per category
- **Recall**: TP / (TP + FN) per category
- **F1 Score**: Harmonic mean of precision/recall
- **Effort correlation**: % within ±1/±2 of ground truth

## Usage
```bash
# Full pipeline
node sample-prompts.js          # Generate samples
node annotate.js                 # Label samples
node run-benchmark.js            # Run + report

# Analysis
node compare-models.js           # Test model variants
node time-comparison.js          # Latency benchmarks
```
