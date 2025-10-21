#!/usr/bin/env node
/**
 * list-apis.ts - List and query API endpoints from OpenAPI specs
 * Usage: ./list-apis.ts [options]
 */

import { join } from 'path';
import { resolveDirectory, loadYamlFile, colorize } from './yaml-parser.js';

interface Options {
  apiFile: string;
  format: 'summary' | 'detailed' | 'curl' | 'markdown';
  filterMethod: string;
  filterPath: string;
  baseUrl: string;
}

interface ApiEndpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  responses: string;
}

function showHelp(): void {
  console.log(`
Usage: list-apis.ts [OPTIONS]

List and filter API endpoints from OpenAPI specification.

OPTIONS:
    -h, --help              Show this help message
    -f, --file FILE         API contract file (default: docs/api-contracts.yaml)
    -m, --method METHOD     Filter by HTTP method (GET|POST|PUT|DELETE|PATCH)
    -p, --path PATTERN      Filter paths containing pattern
    --format FORMAT         Output format: summary|detailed|curl|markdown
    --base-url URL          Base URL for curl commands (default: http://localhost:3000)
`);
}

function parseApiInfo(content: string): { title: string; version: string } {
  const lines = content.split('\n');
  let inInfo = false;
  let title = '';
  let version = '';

  for (const line of lines) {
    if (/^info:/.test(line)) {
      inInfo = true;
      continue;
    }
    if (inInfo && /^[a-z]+:/.test(line) && !/^  /.test(line)) break;
    if (inInfo && /^  title:/.test(line)) {
      title = line.replace(/^  title:\s*/, '').replace(/["']/g, '').trim();
    }
    if (inInfo && /^  version:/.test(line)) {
      version = line.replace(/^  version:\s*/, '').replace(/["']/g, '').trim();
    }
  }

  return { title, version };
}

function parseEndpoints(content: string): ApiEndpoint[] {
  const lines = content.split('\n');
  let inPaths = false;
  let currentPath = '';
  const endpoints: ApiEndpoint[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^paths:/.test(line)) {
      inPaths = true;
      continue;
    }

    if (inPaths && /^  \/.*:$/.test(line)) {
      currentPath = line.replace(/:$/, '').replace(/^  /, '').trim();
      continue;
    }

    if (inPaths && /^    (get|post|put|delete|patch|options|head):$/.test(line)) {
      const method = line.replace(/:$/, '').replace(/^    /, '').trim();
      let summary = '';
      let description = '';
      let responses = '';

      // Look ahead for details
      for (let j = i + 1; j < Math.min(i + 50, lines.length); j++) {
        const nextLine = lines[j];
        if (/^    (get|post|put|delete|patch):/.test(nextLine) || /^  \//.test(nextLine)) break;

        if (/^      summary:/.test(nextLine)) {
          summary = nextLine.replace(/^      summary:\s*/, '').replace(/["']/g, '').trim();
        }
        if (/^      description:/.test(nextLine)) {
          description = nextLine.replace(/^      description:\s*/, '').replace(/["']/g, '').trim();
        }
        if (/^      responses:/.test(nextLine)) {
          // Next line is status code
          if (j + 1 < lines.length && /^        ['"]?\d+/.test(lines[j + 1])) {
            responses = lines[j + 1]
              .replace(/^        /, '')
              .replace(/["':]/g, '')
              .trim();
          }
          break;
        }
      }

      endpoints.push({ method, path: currentPath, summary, description, responses });
    }
  }

  return endpoints;
}

function formatMethodColor(method: string): string {
  const m = method.toUpperCase();
  switch (m) {
    case 'GET':
      return colorize('GET   ', 'green');
    case 'POST':
      return colorize('POST  ', 'blue');
    case 'PUT':
      return colorize('PUT   ', 'yellow');
    case 'DELETE':
      return colorize('DELETE', 'red');
    case 'PATCH':
      return colorize('PATCH ', 'cyan');
    default:
      return m;
  }
}

function formatEndpoint(ep: ApiEndpoint, opts: Options): boolean {
  if (opts.filterMethod && ep.method.toUpperCase() !== opts.filterMethod.toUpperCase()) {
    return false;
  }
  if (opts.filterPath && !ep.path.includes(opts.filterPath)) {
    return false;
  }

  switch (opts.format) {
    case 'summary':
      console.log(
        `${formatMethodColor(ep.method)} ${ep.path.padEnd(40)} ${(ep.summary || 'No description').substring(0, 60)}`
      );
      break;
    case 'detailed':
      console.log(`${formatMethodColor(ep.method)} ${colorize(ep.path, 'cyan')}`);
      if (ep.summary) console.log(`  ${colorize('Summary:', 'yellow')} ${ep.summary}`);
      if (ep.description) console.log(`  ${colorize('Description:', 'yellow')} ${ep.description}`);
      if (ep.responses) console.log(`  ${colorize('Responses:', 'yellow')} ${ep.responses}`);
      console.log();
      break;
    case 'curl':
      generateCurl(ep, opts.baseUrl);
      break;
    case 'markdown':
      console.log(`### ${ep.method.toUpperCase()} \`${ep.path}\``);
      if (ep.summary) console.log(ep.summary);
      if (ep.description) console.log(`\n${ep.description}`);
      if (ep.responses) console.log(`\n**Response:** ${ep.responses}`);
      console.log();
      break;
  }

  return true;
}

function generateCurl(ep: ApiEndpoint, baseUrl: string): void {
  const method = ep.method.toUpperCase();
  switch (method) {
    case 'GET':
    case 'DELETE':
      console.log(`curl -X ${method} "${baseUrl}${ep.path}"`);
      break;
    case 'POST':
    case 'PUT':
    case 'PATCH':
      console.log(`curl -X ${method} "${baseUrl}${ep.path}" \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '{"key": "value"}'`);
      break;
  }
  console.log();
}

function main(): void {
  const args = process.argv.slice(2);
  const options: Options = {
    apiFile: join(resolveDirectory('docs'), 'api-contracts.yaml'),
    format: 'summary',
    filterMethod: '',
    filterPath: '',
    baseUrl: 'http://localhost:3000',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
      case '-f':
      case '--file':
        options.apiFile = args[++i];
        break;
      case '-m':
      case '--method':
        options.filterMethod = args[++i];
        break;
      case '-p':
      case '--path':
        options.filterPath = args[++i];
        break;
      case '--format':
        options.format = args[++i] as Options['format'];
        break;
      case '--base-url':
        options.baseUrl = args[++i];
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
    }
  }

  const content = loadYamlFile(options.apiFile);
  if (!content) {
    console.error(colorize(`Error: File '${options.apiFile}' not found`, 'red'));
    process.exit(1);
  }

  const { title, version } = parseApiInfo(content);
  const endpoints = parseEndpoints(content);

  if (options.format === 'summary' || options.format === 'detailed') {
    console.log(colorize('━'.repeat(80), 'blue'));
    console.log(colorize(`${title} v${version}`, 'blue'));
    console.log(colorize('━'.repeat(80), 'blue'));
    console.log();
  } else if (options.format === 'markdown') {
    console.log(`# ${title} v${version}\n`);
  }

  let count = 0;
  endpoints.forEach(ep => {
    if (formatEndpoint(ep, options)) count++;
  });

  if (options.format === 'summary' || options.format === 'detailed') {
    console.log(colorize('━'.repeat(80), 'blue'));
    console.log(`Found ${colorize(String(count), 'green')} endpoint(s)`);
  }
}

main();
