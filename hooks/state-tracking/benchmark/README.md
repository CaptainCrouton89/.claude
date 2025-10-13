# Activity Tracker Benchmark

Benchmarking system for testing activity tracker accuracy.

## Workflow

### 1. Sample Prompts

Extract ~100 random prompts from conversation transcripts:

```bash
cd ~/.claude/hooks/state-tracking/benchmark
node sample-prompts.js 100
```

This creates `samples.json` with randomly sampled user prompts from all projects.

### 2. Annotate Ground Truth

Manually label each prompt with correct activity category:

```bash
node annotate.js
```

Interactive CLI will show each prompt and ask you to:
- Select activity category (1-10)
- Rate effort level (1-10)

Progress saved to `annotations.json` after each prompt. You can quit (q) and resume later.

Commands:
- `1-10`: Select activity category
- `1-10`: Rate effort level
- `s`: Skip this prompt
- `q`: Quit and save progress
- `?`: Show help

### 3. Run Benchmark

Test activity tracker against annotated ground truth:

```bash
node run-benchmark.js
```

This will:
- Run activity tracker on each annotated prompt
- Compare predictions vs ground truth
- Generate accuracy metrics

Output:
- `results.json`: Full results with predictions
- `report.txt`: Human-readable report

## Metrics

**Overall Accuracy**: % of prompts correctly categorized

**Per-Category Metrics**:
- **Precision**: Of all predictions for this category, how many were correct?
- **Recall**: Of all actual instances of this category, how many were found?
- **F1**: Harmonic mean of precision and recall

**Effort Accuracy**:
- Average difference between predicted and actual effort
- % within ±1 or ±2 points

**Confusion Matrix**: Shows which categories get confused with each other

## Improving Accuracy

Use benchmark results to:
1. Identify confused categories (e.g., "investigating" vs "planning")
2. Refine system prompt with better examples
3. Adjust effort scoring guidelines
4. Re-run benchmark to measure improvement

## Files

- `sample-prompts.js`: Extract random prompts from transcripts
- `annotate.js`: Interactive annotation CLI
- `run-benchmark.js`: Run benchmark and generate report
- `samples.json`: Sampled prompts (generated)
- `annotations.json`: Ground truth labels (generated)
- `results.json`: Benchmark results (generated)
- `report.txt`: Human-readable report (generated)
