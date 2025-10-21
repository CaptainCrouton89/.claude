#!/usr/bin/env node
/**
 * list-flows.ts - List user flows with metadata and filtering options
 * Usage: ./list-flows.ts [options]
 */

import { basename, join } from 'path';
import {
  parseYamlValue,
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
  flowsDir: string;
  showAll: boolean;
  format: 'summary' | 'detailed' | 'tree' | 'json';
  filterPersona: string;
}

interface FlowDetail {
  name: string;
  trigger: string;
  outcome: string;
  edge_cases?: string;
  steps: number;
}

interface FlowData {
  file: string;
  title: string;
  key_personas: string[];
  primary_flows: FlowDetail[];
  secondary_flows: FlowDetail[];
  primary_count: number;
  secondary_count: number;
  total_flows: number;
  personas_count: number;
}

// ============================================================================
// Helpers
// ============================================================================

function showHelp(): void {
  console.log(`
Usage: list-flows.ts [OPTIONS]

List and filter user flows from the project documentation.

OPTIONS:
    -h, --help              Show this help message
    -d, --dir DIR           Flows directory (default: docs/user-flows)
    -p, --persona PERSONA   Filter by persona name
    -v, --verbose           Show detailed information
    --format FORMAT         Output format: summary|detailed|tree|json (default: summary)

EXAMPLES:
    list-flows.ts                          # List all flows
    list-flows.ts -p "Admin User"          # List flows for Admin User persona
    list-flows.ts --format detailed        # Show detailed information
    list-flows.ts --format tree            # Show flows as a tree structure
    list-flows.ts --format json            # Show JSON output
`);
}

function parseFlowDetails(content: string, flowType: 'primary_flows' | 'secondary_flows'): FlowDetail[] {
  const lines = content.split('\n');
  let inFlows = false;
  const flows: FlowDetail[] = [];
  let currentFlow: Partial<FlowDetail> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're entering the flows section
    if (new RegExp(`^${flowType}:`).test(line)) {
      inFlows = true;
      continue;
    }

    // Exit if we hit another top-level key
    if (inFlows && /^[a-z_]+:/.test(line) && !/^  /.test(line)) {
      break;
    }

    // New flow item
    if (inFlows && /^  - name:/.test(line)) {
      // Save previous flow if exists
      if (currentFlow.name) {
        flows.push(currentFlow as FlowDetail);
      }

      // Start new flow
      const name = line.replace(/^  - name:\s*/, '').replace(/['"]/g, '').trim();
      currentFlow = { name, trigger: '', outcome: '', steps: 0 };
      continue;
    }

    // Parse flow properties
    if (inFlows && currentFlow.name) {
      if (/^    trigger:/.test(line)) {
        currentFlow.trigger = line.replace(/^    trigger:\s*/, '').replace(/['"]/g, '').trim();
      } else if (/^    outcome:/.test(line)) {
        currentFlow.outcome = line.replace(/^    outcome:\s*/, '').replace(/['"]/g, '').trim();
      } else if (/^    edge_cases:/.test(line)) {
        currentFlow.edge_cases = line.replace(/^    edge_cases:\s*/, '').replace(/['"]/g, '').trim();
      } else if (/^    steps:/.test(line)) {
        // Count steps
        let stepCount = 0;
        let j = i + 1;
        while (j < lines.length && /^      - /.test(lines[j])) {
          stepCount++;
          j++;
        }
        currentFlow.steps = stepCount;
      }
    }
  }

  // Add the last flow
  if (currentFlow.name) {
    flows.push(currentFlow as FlowDetail);
  }

  return flows;
}

function parseFlow(file: string): FlowData | null {
  const content = loadYamlFile(file);
  if (!content) return null;

  let title = parseYamlValue(content, 'title') || basename(file, '.yaml');
  if (title === 'User Flows') {
    title = basename(file, '.yaml');
  }

  const key_personas = parseYamlArray(content, 'key_personas');
  const primary_flows = parseFlowDetails(content, 'primary_flows');
  const secondary_flows = parseFlowDetails(content, 'secondary_flows');

  return {
    file,
    title,
    key_personas,
    primary_flows,
    secondary_flows,
    primary_count: primary_flows.length,
    secondary_count: secondary_flows.length,
    total_flows: primary_flows.length + secondary_flows.length,
    personas_count: key_personas.length,
  };
}

function flowHasPersona(data: FlowData, persona: string): boolean {
  if (!persona) return true;
  return data.key_personas.some(p => p.toLowerCase().includes(persona.toLowerCase()));
}

function formatSummary(data: FlowData): void {
  console.log(
    `${colorize(data.title.substring(0, 40).padEnd(40), 'blue')} ` +
      `${colorize('●', 'green')} ` +
      `${String(data.total_flows).padStart(2)} flows │ ` +
      `${data.personas_count} personas`
  );
}

function formatDetailed(data: FlowData): void {
  console.log(colorize('━'.repeat(50), 'blue'));
  console.log(colorize(`📋 ${data.title}`, 'blue'));
  console.log(colorize('━'.repeat(50), 'blue'));

  // Show personas
  if (data.key_personas.length > 0) {
    console.log(`\n${colorize('👥 Key Personas:', 'cyan')}`);
    data.key_personas.forEach(persona => {
      console.log(`  • ${persona}`);
    });
  }

  // Show primary flows with details
  if (data.primary_count > 0) {
    console.log(`\n${colorize('🔄 Primary Flows:', 'green')}`);
    data.primary_flows.forEach(flow => {
      console.log(`\n${colorize('  ▸', 'green')} ${flow.name}`);
      if (flow.trigger) console.log(`    ${colorize('Trigger:', 'yellow')} ${flow.trigger}`);
      if (flow.steps > 0) console.log(`    ${colorize('Steps:', 'yellow')} ${flow.steps}`);
      if (flow.outcome) console.log(`    ${colorize('Outcome:', 'yellow')} ${flow.outcome}`);
      if (flow.edge_cases) console.log(`    ${colorize('Edge Cases:', 'yellow')} ${flow.edge_cases}`);
    });
  }

  // Show secondary flows count
  if (data.secondary_count > 0) {
    console.log(`\n${colorize(`🔀 Secondary Flows: ${data.secondary_count}`, 'yellow')}`);
  }

  console.log();
}

function formatTree(data: FlowData): void {
  console.log(colorize(`📋 ${data.title}`, 'blue'));

  // Show personas
  if (data.key_personas.length > 0) {
    console.log(colorize('├─ Personas:', 'cyan'));
    data.key_personas.forEach((persona, index) => {
      const isLast = index === data.key_personas.length - 1 && data.primary_count === 0 && data.secondary_count === 0;
      console.log(`${colorize(isLast ? '│  └─' : '│  ├─', 'cyan')} ${persona}`);
    });
  }

  // Show primary flows
  if (data.primary_count > 0) {
    const hasSecondary = data.secondary_count > 0;
    console.log(colorize(`${hasSecondary ? '├─' : '└─'} Primary Flows (${data.primary_count}):`, 'green'));
    data.primary_flows.forEach((flow, index) => {
      const isLast = index === data.primary_flows.length - 1 && !hasSecondary;
      console.log(`${colorize(isLast ? '│  └─' : '│  ├─', 'green')} ${flow.name}`);
    });
  }

  // Show secondary flows
  if (data.secondary_count > 0) {
    console.log(colorize(`└─ Secondary Flows (${data.secondary_count}):`, 'yellow'));
    data.secondary_flows.forEach((flow, index) => {
      const isLast = index === data.secondary_flows.length - 1;
      console.log(`${colorize(isLast ? '   └─' : '   ├─', 'yellow')} ${flow.name}`);
    });
  }

  console.log();
}

function formatJson(data: FlowData): void {
  console.log(
    JSON.stringify({
      title: data.title,
      primary_flows: data.primary_count,
      secondary_flows: data.secondary_count,
      personas: data.key_personas.join(','),
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
    flowsDir: join(resolveDirectory('docs'), 'user-flows'),
    showAll: true,
    format: 'summary',
    filterPersona: '',
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
        options.flowsDir = args[++i];
        break;
      case '-p':
      case '--persona':
        options.filterPersona = args[++i];
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

  const files = findYamlFiles(options.flowsDir);
  if (files.length === 0) {
    console.log(colorize(`No flow files found in ${options.flowsDir}`, 'yellow'));
    process.exit(0);
  }

  let flows = files.map(parseFlow).filter((f): f is FlowData => f !== null);

  // Apply persona filter
  if (options.filterPersona) {
    flows = flows.filter(f => flowHasPersona(f, options.filterPersona));
  }

  // Print header for summary format
  if (options.format === 'summary') {
    console.log(colorize(`User Flows in ${options.flowsDir}`, 'blue'));
    console.log(colorize('━'.repeat(65), 'blue'));
  }

  // Process each flow file
  flows.forEach(flow => {
    switch (options.format) {
      case 'summary':
        formatSummary(flow);
        break;
      case 'detailed':
        formatDetailed(flow);
        break;
      case 'tree':
        formatTree(flow);
        break;
      case 'json':
        formatJson(flow);
        break;
    }
  });

  // Print footer
  if (options.format === 'summary') {
    console.log(colorize('━'.repeat(65), 'blue'));
    console.log(`Found ${colorize(String(flows.length), 'green')} flow file(s)`);
  } else if (options.format === 'detailed' || options.format === 'tree') {
    console.log(colorize('━'.repeat(50), 'blue'));
    console.log(`Found ${colorize(String(flows.length), 'green')} flow file(s)`);
  }
}

main();