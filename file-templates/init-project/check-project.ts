#!/usr/bin/env node
/**
 * check-project.ts - Comprehensive project documentation checker
 * Usage: ./check-project.ts [options]
 * Run from project root or docs directory. Checks all documentation files for completeness and traceability.
 */

import { basename, join } from 'path';
import { existsSync, statSync } from 'fs';
import {
  parseYamlValue,
  parseNestedYamlValue,
  parseYamlArray,
  countNestedArrayItems,
  resolveDirectory,
  findYamlFiles,
  loadYamlFile,
  colorize,
} from './yaml-parser.js';

// ============================================================================
// Types
// ============================================================================

interface Options {
  docsDir: string;
  checkLinks: boolean;
  verbose: boolean;
  format: 'summary' | 'detailed' | 'json';
}

interface CheckResult {
  totalChecks: number;
  totalErrors: number;
  totalWarnings: number;
}

// ============================================================================
// State
// ============================================================================

let result: CheckResult = {
  totalChecks: 0,
  totalErrors: 0,
  totalWarnings: 0,
};

// ============================================================================
// Logging Functions
// ============================================================================

function logCheck(message: string, verbose: boolean): void {
  result.totalChecks++;
  if (verbose) {
    console.log(`${colorize('[CHECK]', 'cyan')} ${message}`);
  }
}

function logPass(message: string, verbose: boolean): void {
  if (verbose) {
    console.log(`${colorize('[PASS]', 'green')} ${message}`);
  }
}

function logWarn(message: string): void {
  result.totalWarnings++;
  console.log(`${colorize('[WARN]', 'yellow')} ${message}`);
}

function logError(message: string): void {
  result.totalErrors++;
  console.log(`${colorize('[ERROR]', 'red')} ${message}`);
}

function logInfo(message: string, verbose: boolean): void {
  if (verbose) {
    console.log(`${colorize('[INFO]', 'blue')} ${message}`);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function resolveDocsDir(): string {
  const cwd = process.cwd();
  const currentDirName = basename(cwd);

  // Check if current directory is "docs"
  if (currentDirName === 'docs' && existsSync(join(cwd, 'product-requirements.yaml'))) {
    return cwd;
  }

  // Check if docs directory exists in current location
  const docsPath = join(cwd, 'docs');
  if (existsSync(docsPath) && existsSync(join(docsPath, 'product-requirements.yaml'))) {
    return docsPath;
  }

  // Default to docs (will fail gracefully if not found)
  return 'docs';
}

function checkFileExists(file: string, label: string, verbose: boolean): boolean {
  logCheck(`Checking for ${label}`, verbose);

  if (existsSync(file)) {
    logPass(`${label} found`, verbose);
    return true;
  } else {
    logError(`${label} missing: ${file}`);
    return false;
  }
}

function checkYamlField(file: string, field: string, label: string): boolean {
  if (!existsSync(file)) {
    return false;
  }

  const content = loadYamlFile(file);
  if (!content) {
    return false;
  }

  const value = parseYamlValue(content, field);

  if (!value || value === '""') {
    logWarn(`${label}: '${field}' is empty in ${basename(file)}`);
    return false;
  }

  return true;
}

// ============================================================================
// Check Functions
// ============================================================================

function checkPrd(docsDir: string, verbose: boolean): void {
  const prdFile = join(docsDir, 'product-requirements.yaml');

  console.log(`\n${colorize('━━━ Product Requirements Document ━━━', 'blue')}`);

  if (!checkFileExists(prdFile, 'Product Requirements Document', verbose)) {
    return;
  }

  // Check required fields
  checkYamlField(prdFile, 'project_name', 'PRD');
  checkYamlField(prdFile, 'summary', 'PRD');
  checkYamlField(prdFile, 'goal', 'PRD');

  // Count features
  const content = loadYamlFile(prdFile);
  if (content) {
    const features = parseYamlArray(content, 'features');
    const featureCount = features.length;
    logInfo(`Features defined in PRD: ${featureCount}`, verbose);

    if (featureCount === 0) {
      logWarn('No features defined in PRD');
    }
  }
}

function checkUserFlows(docsDir: string, verbose: boolean): void {
  const flowsDir = join(docsDir, 'user-flows');

  console.log(`\n${colorize('━━━ User Flows ━━━', 'blue')}`);

  if (!existsSync(flowsDir)) {
    logError(`User flows directory missing: ${flowsDir}`);
    return;
  }

  const flowFiles = findYamlFiles(flowsDir);
  const flowCount = flowFiles.length;

  logInfo(`User flow files found: ${flowCount}`, verbose);

  if (flowCount === 0) {
    logWarn('No user flow files found');
    return;
  }

  // Check each flow file
  flowFiles.forEach(flowFile => {
    const flowName = basename(flowFile, '.yaml');
    logCheck(`Checking flow: ${flowName}`, verbose);

    const content = loadYamlFile(flowFile);
    if (content) {
      const primaryFlows = parseYamlArray(content, 'primary_flows');
      if (primaryFlows.length === 0) {
        logWarn(`No flows defined in ${flowName}`);
      }
    }
  });
}

function checkUserStories(docsDir: string, verbose: boolean): void {
  const storiesDir = join(docsDir, 'user-stories');

  console.log(`\n${colorize('━━━ User Stories ━━━', 'blue')}`);

  if (!existsSync(storiesDir)) {
    logError(`User stories directory missing: ${storiesDir}`);
    return;
  }

  const storyFiles = findYamlFiles(storiesDir);
  const storyCount = storyFiles.length;

  logInfo(`User story files found: ${storyCount}`, verbose);

  if (storyCount === 0) {
    logWarn('No user story files found');
    return;
  }

  let incompleteCount = 0;
  let completeCount = 0;

  // Check each story
  storyFiles.forEach(storyFile => {
    const content = loadYamlFile(storyFile);
    if (!content) return;

    const storyId = parseYamlValue(content, 'story_id') || '';
    const status = parseYamlValue(content, 'status') || '';

    if (status === 'complete') {
      completeCount++;
    } else {
      incompleteCount++;
    }

    // Check for empty user story fields
    const asA = parseNestedYamlValue(content, 'user_story', 'as_a');
    if (!asA || asA === '""' || asA.includes('[type')) {
      logWarn(`Story ${storyId} has incomplete user story definition`);
    }
  });

  logInfo(`Complete stories: ${completeCount}`, verbose);
  logInfo(`Incomplete stories: ${incompleteCount}`, verbose);
}

function checkFeatureSpecs(docsDir: string, verbose: boolean): void {
  const featuresDir = join(docsDir, 'feature-specs');

  console.log(`\n${colorize('━━━ Feature Specifications ━━━', 'blue')}`);

  if (!existsSync(featuresDir)) {
    logError(`Feature specs directory missing: ${featuresDir}`);
    return;
  }

  const featureFiles = findYamlFiles(featuresDir);
  const featureCount = featureFiles.length;

  logInfo(`Feature spec files found: ${featureCount}`, verbose);

  if (featureCount === 0) {
    logWarn('No feature spec files found');
    return;
  }

  let incompleteCount = 0;
  let completeCount = 0;

  // Check each feature
  featureFiles.forEach(featureFile => {
    const content = loadYamlFile(featureFile);
    if (!content) return;

    const featureId = parseYamlValue(content, 'feature_id') || '';
    const status = parseYamlValue(content, 'status') || '';

    if (status === 'complete') {
      completeCount++;
    } else {
      incompleteCount++;
    }

    // Check for summary
    checkYamlField(featureFile, 'summary', `Feature ${featureId}`);
  });

  logInfo(`Complete features: ${completeCount}`, verbose);
  logInfo(`Incomplete features: ${incompleteCount}`, verbose);
}

function checkSystemDesign(docsDir: string, verbose: boolean): void {
  const systemFile = join(docsDir, 'system-design.yaml');

  console.log(`\n${colorize('━━━ System Design ━━━', 'blue')}`);

  if (!checkFileExists(systemFile, 'System Design', verbose)) {
    return;
  }

  checkYamlField(systemFile, 'goal', 'System Design');

  // Check for tech stack
  const content = loadYamlFile(systemFile);
  if (content) {
    const techStack = parseYamlValue(content, 'tech_stack');
    if (!techStack) {
      logWarn('No tech stack defined in system design');
    }
  }
}

function checkApiContracts(docsDir: string, verbose: boolean): void {
  const apiFile = join(docsDir, 'api-contracts.yaml');

  console.log(`\n${colorize('━━━ API Contracts ━━━', 'blue')}`);

  if (!checkFileExists(apiFile, 'API Contracts', verbose)) {
    return;
  }

  // Count endpoints
  const content = loadYamlFile(apiFile);
  if (content) {
    const lines = content.split('\n');
    const endpointCount = lines.filter(line => /^  \/.*:$/.test(line)).length;
    logInfo(`API endpoints defined: ${endpointCount}`, verbose);

    if (endpointCount === 0) {
      logWarn('No API endpoints defined');
    }
  }
}

function checkDataPlan(docsDir: string, verbose: boolean): void {
  const dataFile = join(docsDir, 'data-plan.yaml');

  console.log(`\n${colorize('━━━ Data Plan ━━━', 'blue')}`);

  if (!checkFileExists(dataFile, 'Data Plan', verbose)) {
    return;
  }

  // Check for data sources
  const content = loadYamlFile(dataFile);
  if (content) {
    const dataSources = parseYamlArray(content, 'data_sources');
    if (dataSources.length > 0) {
      logInfo(`Data sources defined: ${dataSources.length}`, verbose);
    }
  }
}

function checkDesignSpec(docsDir: string, verbose: boolean): void {
  const designFile = join(docsDir, 'design-spec.yaml');

  console.log(`\n${colorize('━━━ Design Specification ━━━', 'blue')}`);

  if (!checkFileExists(designFile, 'Design Specification', verbose)) {
    return;
  }

  checkYamlField(designFile, 'design_goals', 'Design Spec');
}

function checkCrossReferences(docsDir: string, checkLinks: boolean, verbose: boolean): void {
  if (!checkLinks) {
    return;
  }

  console.log(`\n${colorize('━━━ Cross-Reference Validation ━━━', 'blue')}`);

  // Get all feature IDs from PRD
  const prdFile = join(docsDir, 'product-requirements.yaml');
  const prdContent = loadYamlFile(prdFile);
  if (!prdContent) {
    logWarn('No PRD file to cross-reference');
    return;
  }

  const features = parseYamlArray(prdContent, 'features');
  const featureIds = features.map(f => {
    const match = f.match(/id:\s*(\S+)/);
    return match ? match[1].replace(/"/g, '') : null;
  }).filter(id => id !== null);

  if (featureIds.length === 0) {
    logWarn('No features in PRD to cross-reference');
    return;
  }

  // Check if features have specs
  const featuresDir = join(docsDir, 'feature-specs');
  if (existsSync(featuresDir)) {
    const featureFiles = findYamlFiles(featuresDir);

    featureIds.forEach(featureId => {
      logCheck(`Checking if ${featureId} has specification`, verbose);

      const hasSpec = featureFiles.some(file => {
        const content = loadYamlFile(file);
        if (!content) return false;
        const fileFeatureId = parseYamlValue(content, 'feature_id');
        return fileFeatureId === featureId;
      });

      if (!hasSpec) {
        logWarn(`Feature ${featureId} (in PRD) has no specification file`);
      } else {
        logPass(`Feature ${featureId} has specification`, verbose);
      }
    });
  }

  // Check if stories reference valid features
  const storiesDir = join(docsDir, 'user-stories');
  if (existsSync(storiesDir)) {
    const storyFiles = findYamlFiles(storiesDir);

    storyFiles.forEach(storyFile => {
      const content = loadYamlFile(storyFile);
      if (!content) return;

      const storyId = parseYamlValue(content, 'story_id');
      const featureRef = parseYamlValue(content, 'feature_id');

      if (featureRef && featureRef !== 'F-##' && !featureIds.includes(featureRef)) {
        logWarn(`Story ${storyId} references unknown feature: ${featureRef}`);
      }
    });
  }
}

// ============================================================================
// Summary Generation
// ============================================================================

function generateSummary(): number {
  console.log(`\n${colorize('━'.repeat(50), 'blue')}`);
  console.log(colorize('Summary', 'blue'));
  console.log(colorize('━'.repeat(50), 'blue'));

  console.log(`\n${colorize('Checks performed:', 'yellow')} ${result.totalChecks}`);

  if (result.totalErrors === 0) {
    console.log(`${colorize('Errors:', 'green')} 0 ✓`);
  } else {
    console.log(`${colorize('Errors:', 'red')} ${result.totalErrors}`);
  }

  if (result.totalWarnings === 0) {
    console.log(`${colorize('Warnings:', 'green')} 0 ✓`);
  } else {
    console.log(`${colorize('Warnings:', 'yellow')} ${result.totalWarnings}`);
  }

  console.log('');

  if (result.totalErrors === 0 && result.totalWarnings === 0) {
    console.log(colorize('✓ All checks passed!', 'green'));
    return 0;
  } else if (result.totalErrors === 0) {
    console.log(colorize('⚠ All checks passed with warnings', 'yellow'));
    return 0;
  } else {
    console.log(colorize('✗ Some checks failed', 'red'));
    return 1;
  }
}

// ============================================================================
// Help and Main
// ============================================================================

function showHelp(): void {
  console.log(`
Usage: check-project.ts [OPTIONS]

Check project documentation for completeness, consistency, and traceability.

OPTIONS:
    -h, --help              Show this help message
    -d, --dir DIR           Documentation directory (default: docs)
    -v, --verbose           Show verbose output
    --no-links              Skip checking cross-references
    --format FORMAT         Output format: summary|detailed|json (default: summary)

CHECKS PERFORMED:
    • PRD (Product Requirements) completeness
    • Feature specifications status
    • User stories coverage
    • User flows definition
    • API contracts presence
    • Data plan completeness
    • System design documentation
    • Design specifications
    • Cross-reference validation (feature IDs, story IDs)

EXAMPLES:
    check-project.ts                          # Check all documentation
    check-project.ts -v                       # Verbose output
    check-project.ts --no-links               # Skip link checking
    check-project.ts --format detailed        # Detailed report
`);
}

function main(): void {
  const args = process.argv.slice(2);
  const options: Options = {
    docsDir: resolveDocsDir(),
    checkLinks: true,
    verbose: false,
    format: 'summary',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
      case '-d':
      case '--dir':
        options.docsDir = args[++i];
        break;
      case '-v':
      case '--verbose':
        options.verbose = true;
        break;
      case '--no-links':
        options.checkLinks = false;
        break;
      case '--format':
        options.format = args[++i] as Options['format'];
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        console.error('Use -h or --help for usage information');
        process.exit(1);
    }
  }

  // Header
  console.log(colorize('━'.repeat(50), 'blue'));
  console.log(colorize('Project Documentation Check', 'blue'));
  console.log(colorize('━'.repeat(50), 'blue'));
  console.log(`${colorize('Documentation directory:', 'cyan')} ${options.docsDir}`);
  console.log('');

  // Check if docs directory exists
  if (!existsSync(options.docsDir)) {
    logError(`Documentation directory not found: ${options.docsDir}`);
    logError('Ensure you run this script from either:');
    logError('  • Project root: cd /path/to/project && ./docs/check-project.ts');
    logError('  • Docs directory: cd /path/to/project/docs && ./check-project.ts');
    process.exit(1);
  }

  // Run all checks
  checkPrd(options.docsDir, options.verbose);
  checkUserFlows(options.docsDir, options.verbose);
  checkUserStories(options.docsDir, options.verbose);
  checkFeatureSpecs(options.docsDir, options.verbose);
  checkSystemDesign(options.docsDir, options.verbose);
  checkApiContracts(options.docsDir, options.verbose);
  checkDataPlan(options.docsDir, options.verbose);
  checkDesignSpec(options.docsDir, options.verbose);
  checkCrossReferences(options.docsDir, options.checkLinks, options.verbose);

  // Generate summary and exit
  const exitCode = generateSummary();
  process.exit(exitCode);
}

// ESM entry point check
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}