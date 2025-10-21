#!/usr/bin/env node
/**
 * list-stories.ts - List user stories with metadata and filtering
 * Usage: ./list-stories.ts [options]
 */

import { basename, join } from 'path';
import {
  parseYamlValue,
  parseNestedYamlValue,
  parseYamlArray,
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
  storiesDir: string;
  showAll: boolean;
  format: 'summary' | 'detailed' | 'ids' | 'json';
  filterStatus: string;
  filterFeature: string;
}

interface StoryData {
  file: string;
  story_id: string;
  title: string;
  feature_id: string;
  status: string;
  as_a: string;
  i_want: string;
  so_that: string;
  totalCriteria: number;
  completedCriteria: number;
}

// ============================================================================
// Helpers
// ============================================================================

function showHelp(): void {
  console.log(`
Usage: list-stories.ts [OPTIONS]

List and filter user stories from the project documentation.

OPTIONS:
    -h, --help              Show this help message
    -d, --dir DIR           Stories directory (default: docs/user-stories)
    -a, --all               Show all stories (default: only incomplete)
    -s, --status STATUS     Filter by status (incomplete|complete|in-progress)
    -f, --feature ID        Filter by feature ID (e.g., F-01)
    -v, --verbose           Show detailed information
    --format FORMAT         Output format: summary|detailed|ids|json (default: summary)

EXAMPLES:
    list-stories.ts                          # List all incomplete stories
    list-stories.ts -a                       # List all stories
    list-stories.ts -s in-progress           # List in-progress stories
    list-stories.ts -f F-01                  # List stories for feature F-01
    list-stories.ts --format detailed        # Show detailed information
    list-stories.ts --format ids             # Show only story IDs
`);
}

function countCriteria(content: string): number {
  const lines = content.split('\n');
  return lines.filter(line => /^  - /.test(line)).length;
}

function countCompletedCriteria(content: string): number {
  const lines = content.split('\n');
  return lines.filter(line => /^  - "\[x\]/.test(line)).length;
}

function parseStory(file: string): StoryData | null {
  const content = loadYamlFile(file);
  if (!content) return null;

  const story_id = parseYamlValue(content, 'story_id') || '';
  const title = parseYamlValue(content, 'title') || basename(file, '.yaml');
  const feature_id = parseYamlValue(content, 'feature_id') || '';
  const status = parseYamlValue(content, 'status') || 'incomplete';
  const as_a = parseNestedYamlValue(content, 'user_story', 'as_a') || '';
  const i_want = parseNestedYamlValue(content, 'user_story', 'i_want') || '';
  const so_that = parseNestedYamlValue(content, 'user_story', 'so_that') || '';

  const totalCriteria = countCriteria(content);
  const completedCriteria = countCompletedCriteria(content);

  return {
    file,
    story_id,
    title,
    feature_id,
    status,
    as_a,
    i_want,
    so_that,
    totalCriteria,
    completedCriteria,
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

function formatSummary(data: StoryData): void {
  const icon = formatStatusIcon(data.status);
  console.log(
    `${icon} ${colorize(data.story_id.padEnd(10), 'blue')} ` +
      `${data.feature_id.padEnd(8)} ` +
      `${data.title.substring(0, 40).padEnd(40)} ` +
      `(${data.status})`
  );
}

function formatDetailed(data: StoryData): void {
  console.log(colorize('━'.repeat(50), 'blue'));
  console.log(`${colorize(data.story_id, 'green')} - ${data.title}`);
  console.log(`  ${colorize('Feature:', 'yellow')} ${data.feature_id}`);
  console.log(`  ${colorize('Status:', 'yellow')} ${data.status}`);
  console.log(`  ${colorize('Progress:', 'yellow')} ${data.completedCriteria}/${data.totalCriteria} criteria completed`);
  console.log();
  console.log(`  ${colorize('As a:', 'yellow')} ${data.as_a}`);
  console.log(`  ${colorize('I want:', 'yellow')} ${data.i_want}`);
  console.log(`  ${colorize('So that:', 'yellow')} ${data.so_that}`);
  console.log();
}

function formatIds(data: StoryData): void {
  console.log(data.story_id);
}

function formatJson(data: StoryData): void {
  console.log(
    JSON.stringify({
      story_id: data.story_id,
      title: data.title,
      feature_id: data.feature_id,
      status: data.status,
      as_a: data.as_a,
      i_want: data.i_want,
      so_that: data.so_that,
      total_criteria: data.totalCriteria,
      completed_criteria: data.completedCriteria,
      file: data.file,
    })
  );
}

// ============================================================================
// Main
// ============================================================================

function main(): void {
  const args = process.argv.slice(2);
  const options: Options = {
    storiesDir: join(resolveDirectory('docs'), 'user-stories'),
    showAll: false,
    format: 'summary',
    filterStatus: '',
    filterFeature: '',
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
        options.storiesDir = args[++i];
        break;
      case '-a':
      case '--all':
        options.showAll = true;
        break;
      case '-s':
      case '--status':
        options.filterStatus = args[++i];
        break;
      case '-f':
      case '--feature':
        options.filterFeature = args[++i];
        break;
      case '-v':
      case '--verbose':
        options.format = 'detailed';
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

  const files = findYamlFiles(options.storiesDir);
  if (files.length === 0) {
    console.log(colorize(`No story files found in ${options.storiesDir}`, 'yellow'));
    process.exit(0);
  }

  let stories = files.map(parseStory).filter((s): s is StoryData => s !== null);

  // Apply filters
  if (!options.showAll) {
    stories = stories.filter(s => s.status !== 'complete');
  }
  if (options.filterStatus) {
    stories = stories.filter(s => s.status === options.filterStatus);
  }
  if (options.filterFeature) {
    stories = stories.filter(s => s.feature_id === options.filterFeature);
  }

  // Print header for summary format
  if (options.format === 'summary') {
    console.log(colorize(`User Stories in ${options.storiesDir}`, 'blue'));
    console.log(colorize('━'.repeat(70), 'blue'));
    console.log(`${''.padEnd(2)} ${'ID'.padEnd(10)} ${'Feature'.padEnd(8)} ${'Title'.padEnd(40)} Status`);
    console.log(colorize('━'.repeat(70), 'blue'));
  }

  // Process each story
  stories.forEach(story => {
    switch (options.format) {
      case 'summary':
        formatSummary(story);
        break;
      case 'detailed':
        formatDetailed(story);
        break;
      case 'ids':
        formatIds(story);
        break;
      case 'json':
        formatJson(story);
        break;
    }
  });

  // Print footer
  if (options.format === 'summary') {
    console.log(colorize('━'.repeat(70), 'blue'));
    console.log(`Found ${colorize(String(stories.length), 'green')} matching stories`);
  } else if (options.format === 'detailed') {
    console.log(colorize('━'.repeat(50), 'blue'));
    console.log(`Found ${colorize(String(stories.length), 'green')} matching stories`);
  }
}

main();