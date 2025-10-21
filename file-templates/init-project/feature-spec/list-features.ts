#!/usr/bin/env node
/**
 * list-features.ts - List feature specifications with metadata and filtering
 * Usage: ./list-features.ts [options]
 */

import { basename, join } from 'path';
import {
  parseYamlValue,
  parseNestedYamlValue,
  countNestedArrayItems,
  getApiEndpoints,
  getImplementationComponents,
  resolveDirectory,
  findYamlFiles,
  loadYamlFile,
  colorize,
  colors,
} from '../yaml-parser.js';

// ============================================================================
// Types
// ============================================================================

interface Options {
  featuresDir: string;
  showAll: boolean;
  format: 'summary' | 'detailed' | 'tree' | 'json' | 'stats';
  filterStatus: string;
  sortBy: 'id' | 'status' | 'title';
}

interface FeatureData {
  file: string;
  feature_id: string;
  title: string;
  status: string;
  summary: string;
  progress: number;
  dataCount: number;
  apiCount: number;
  completedCount: number;
  inProgressCount: number;
  blockedCount: number;
}

// ============================================================================
// Helpers
// ============================================================================

function showHelp(): void {
  console.log(`
Usage: list-features.ts [OPTIONS]

List and filter feature specifications from the project documentation.

OPTIONS:
    -h, --help              Show this help message
    -d, --dir DIR           Features directory (default: docs/feature-specs)
    -a, --all               Show all features (default: only incomplete)
    -s, --status STATUS     Filter by status (incomplete|complete|in-progress)
    -v, --verbose           Show detailed information
    --sort FIELD            Sort by: id|status|title (default: id)
    --format FORMAT         Output format: summary|detailed|tree|json|stats

EXAMPLES:
    list-features.ts                          # List all incomplete features
    list-features.ts -a                       # List all features
    list-features.ts -s in-progress           # List in-progress features
    list-features.ts --format detailed        # Show detailed information
    list-features.ts --format tree            # Show features with components
    list-features.ts --format stats           # Show statistics summary
`);
}

function parseFeature(file: string): FeatureData | null {
  const content = loadYamlFile(file);
  if (!content) return null;

  const feature_id = parseYamlValue(content, 'feature_id') || '';
  let title = parseYamlValue(content, 'title') || basename(file, '.yaml');
  title = title.replace(/^Technical Specification - /, '');

  const status = parseYamlValue(content, 'status') || 'incomplete';
  const summary = parseYamlValue(content, 'summary') || '';
  const progressStr = parseNestedYamlValue(content, 'implementation_status', 'progress');
  const progress = progressStr ? parseInt(progressStr, 10) : 0;

  const dataCount = countNestedArrayItems(content, 'detailed_design', 'data_structures');
  const apiCount = countNestedArrayItems(content, 'detailed_design', 'apis');

  const completedCount = getImplementationComponents(content, 'completed_components').length;
  const inProgressCount = getImplementationComponents(content, 'in_progress_components').length;
  const blockedCount = getImplementationComponents(content, 'blocked_items').length;

  return {
    file,
    feature_id,
    title,
    status,
    summary,
    progress,
    dataCount,
    apiCount,
    completedCount,
    inProgressCount,
    blockedCount,
  };
}

function formatStatusIcon(status: string): string {
  switch (status) {
    case 'complete':
      return colorize('✓', 'green');
    case 'in-progress':
      return colorize('●', 'yellow');
    default:
      return colorize('○', 'red');
  }
}

function formatSummary(data: FeatureData): void {
  const icon = formatStatusIcon(data.status);
  console.log(
    `${icon} ${colorize(data.feature_id.padEnd(8), 'blue')} ` +
      `${data.title.substring(0, 40).padEnd(40)} ` +
      `${String(data.dataCount).padStart(2)}D ` +
      `${String(data.apiCount).padStart(2)}A ` +
      `${String(data.progress).padStart(3)}% ` +
      `(${data.status})`
  );
}

function formatDetailed(data: FeatureData): void {
  const content = loadYamlFile(data.file);
  if (!content) return;

  console.log(colorize('━'.repeat(50), 'blue'));
  console.log(`${colorize(data.feature_id, 'blue')} - ${data.title}`);
  console.log(colorize('━'.repeat(50), 'blue'));

  const statusColor = data.status === 'complete' ? 'green' : data.status === 'in-progress' ? 'yellow' : 'red';
  console.log(`${colorize('Status:', 'yellow')} ${colorize(data.status, statusColor)}`);

  if (data.summary) {
    console.log(`\n${colorize('Summary:', 'yellow')}`);
    console.log(`  ${data.summary}`);
  }

  const coreLogic = parseNestedYamlValue(content, 'functional_overview', 'core_logic');
  if (coreLogic) {
    console.log(`\n${colorize('Core Logic:', 'yellow')}`);
    console.log(`  ${coreLogic}`);
  }

  console.log(`\n${colorize('Data Structures:', 'yellow')} ${data.dataCount}`);
  console.log(`${colorize('API Endpoints:', 'yellow')} ${data.apiCount}`);

  if (data.apiCount > 0) {
    const endpoints = getApiEndpoints(content);
    endpoints.forEach(ep => {
      console.log(`  ${colorize('•', 'cyan')} ${ep.method} ${ep.endpoint}`);
    });
  }

  console.log(`\n${colorize('Implementation Status:', 'yellow')}`);
  console.log(`  ${colorize('Progress:', 'cyan')} ${data.progress}%`);

  if (data.completedCount > 0) {
    console.log(`  ${colorize('✓ Completed:', 'green')} ${data.completedCount} components`);
    getImplementationComponents(content, 'completed_components').forEach(comp => {
      console.log(`    ${colorize('•', 'green')} ${comp}`);
    });
  }

  if (data.inProgressCount > 0) {
    console.log(`  ${colorize('● In Progress:', 'yellow')} ${data.inProgressCount} components`);
    getImplementationComponents(content, 'in_progress_components').forEach(comp => {
      console.log(`    ${colorize('•', 'yellow')} ${comp}`);
    });
  }

  if (data.blockedCount > 0) {
    console.log(`  ${colorize('⊗ Blocked:', 'red')} ${data.blockedCount} items`);
    getImplementationComponents(content, 'blocked_items').forEach(item => {
      console.log(`    ${colorize('•', 'red')} ${item}`);
    });
  }

  console.log();
}

function formatTree(data: FeatureData): void {
  const content = loadYamlFile(data.file);
  if (!content) return;

  const icon = formatStatusIcon(data.status);
  console.log(
    `${colorize(data.feature_id, 'blue')} ${icon} ${data.title} ${colorize(`(${data.progress}%)`, 'cyan')}`
  );

  if (data.summary) {
    console.log(`${colorize('├─ Summary:', 'cyan')} ${data.summary}`);
  }

  if (data.dataCount > 0) {
    console.log(`${colorize('├─ Data Structures:', 'cyan')} ${data.dataCount}`);
  }

  if (data.apiCount > 0) {
    console.log(colorize('├─ APIs:', 'cyan'));
    const endpoints = getApiEndpoints(content);
    endpoints.forEach(ep => {
      console.log(`${colorize('│  ├─', 'cyan')} ${ep.method} ${ep.endpoint}`);
    });
  }

  if (data.completedCount > 0 || data.inProgressCount > 0 || data.blockedCount > 0) {
    console.log(colorize('└─ Implementation:', 'cyan'));
    if (data.completedCount > 0) console.log(`   ${colorize(`✓ Completed: ${data.completedCount}`, 'green')}`);
    if (data.inProgressCount > 0)
      console.log(`   ${colorize(`● In Progress: ${data.inProgressCount}`, 'yellow')}`);
    if (data.blockedCount > 0) console.log(`   ${colorize(`⊗ Blocked: ${data.blockedCount}`, 'red')}`);
  }

  console.log();
}

function formatJson(data: FeatureData): void {
  console.log(
    JSON.stringify({
      feature_id: data.feature_id,
      title: data.title,
      status: data.status,
      progress: data.progress,
      data_structures: data.dataCount,
      apis: data.apiCount,
      completed_components: data.completedCount,
      in_progress_components: data.inProgressCount,
      blocked_items: data.blockedCount,
      summary: data.summary,
      file: data.file,
    })
  );
}

function generateStats(features: FeatureData[]): void {
  let total = 0;
  let complete = 0;
  let inProgress = 0;
  let incomplete = 0;
  let totalData = 0;
  let totalApis = 0;

  features.forEach(f => {
    total++;
    if (f.status === 'complete') complete++;
    else if (f.status === 'in-progress') inProgress++;
    else incomplete++;
    totalData += f.dataCount;
    totalApis += f.apiCount;
  });

  console.log(colorize('━'.repeat(50), 'blue'));
  console.log(colorize('Feature Specifications Statistics', 'blue'));
  console.log(colorize('━'.repeat(50), 'blue'));
  console.log();
  console.log(`${colorize('Total Features:', 'yellow')} ${total}`);
  console.log(`  ${colorize('✓ Complete:', 'green')}     ${complete}`);
  console.log(`  ${colorize('● In Progress:', 'yellow')}  ${inProgress}`);
  console.log(`  ${colorize('○ Incomplete:', 'red')}   ${incomplete}`);
  console.log();
  console.log(colorize('Components:', 'yellow'));
  console.log(`  ${colorize('Data Structures:', 'cyan')} ${totalData}`);
  console.log(`  ${colorize('API Endpoints:', 'cyan')}   ${totalApis}`);
  console.log();

  if (total > 0) {
    const completePct = Math.floor((complete * 100) / total);
    const progressPct = Math.floor(((complete + inProgress) * 100) / total);
    console.log(colorize('Progress:', 'yellow'));
    console.log(`  ${colorize('Complete:', 'green')}      ${completePct}%`);
    console.log(`  ${colorize('Started:', 'yellow')}       ${progressPct}%`);
  }
  console.log();
}

// ============================================================================
// Main
// ============================================================================

function main(): void {
  const args = process.argv.slice(2);
  const options: Options = {
    featuresDir: join(resolveDirectory('docs'), 'feature-specs'),
    showAll: false,
    format: 'summary',
    filterStatus: '',
    sortBy: 'id',
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
        options.featuresDir = args[++i];
        break;
      case '-a':
      case '--all':
        options.showAll = true;
        break;
      case '-s':
      case '--status':
        options.filterStatus = args[++i];
        break;
      case '-v':
      case '--verbose':
        options.format = 'detailed';
        break;
      case '--sort':
        options.sortBy = args[++i] as 'id' | 'status' | 'title';
        break;
      case '--format':
        options.format = args[++i] as Options['format'];
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
    }
  }

  const files = findYamlFiles(options.featuresDir);
  if (files.length === 0) {
    console.log(colorize(`No feature files found in ${options.featuresDir}`, 'yellow'));
    process.exit(0);
  }

  let features = files.map(parseFeature).filter((f): f is FeatureData => f !== null);

  // Filter
  if (!options.showAll) {
    features = features.filter(f => f.status !== 'complete');
  }
  if (options.filterStatus) {
    features = features.filter(f => f.status === options.filterStatus);
  }

  // Sort
  if (options.sortBy === 'title') {
    features.sort((a, b) => a.title.localeCompare(b.title));
  } else if (options.sortBy === 'status') {
    features.sort((a, b) => a.status.localeCompare(b.status));
  }

  // Stats mode
  if (options.format === 'stats') {
    generateStats(features);
    process.exit(0);
  }

  // Header
  if (options.format === 'summary') {
    console.log(colorize(`Feature Specifications in ${options.featuresDir}`, 'blue'));
    console.log(colorize('━'.repeat(80), 'blue'));
    console.log(`${''.padEnd(2)} ${'ID'.padEnd(8)} ${'Title'.padEnd(40)} D A Prog% Status`);
    console.log(colorize('━'.repeat(80), 'blue'));
  }

  // Output
  features.forEach(f => {
    switch (options.format) {
      case 'summary':
        formatSummary(f);
        break;
      case 'detailed':
        formatDetailed(f);
        break;
      case 'tree':
        formatTree(f);
        break;
      case 'json':
        formatJson(f);
        break;
    }
  });

  // Footer
  if (options.format === 'summary') {
    console.log(colorize('━'.repeat(80), 'blue'));
    console.log(`Found ${colorize(String(features.length), 'green')} matching features (D=Data Structures, A=APIs, Prog%=Progress)`);
  } else if (options.format === 'detailed' || options.format === 'tree') {
    console.log(colorize('━'.repeat(50), 'blue'));
    console.log(`Found ${colorize(String(features.length), 'green')} matching features`);
  }
}

main();
