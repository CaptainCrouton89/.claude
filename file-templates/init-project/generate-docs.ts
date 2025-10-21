#!/usr/bin/env node
/**
 * generate-docs.ts - Generate documentation from YAML files
 * Usage: ./generate-docs.ts [options]
 * Run from project root or docs directory. Generates human-readable docs from YAML files.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import {
  parseYamlValue,
  parseNestedYamlValue,
  getApiEndpoints,
  getImplementationComponents,
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
  outputDir: string;
  format: 'markdown' | 'html';
  includeToc: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

function showHelp(): void {
  console.log(`
Usage: generate-docs.ts [OPTIONS]

Generate human-readable documentation from YAML specification files.

OPTIONS:
    -h, --help              Show this help message
    -d, --dir DIR           Documentation directory (default: docs)
    -o, --output DIR        Output directory (default: docs/generated)
    -f, --format FORMAT     Output format: markdown|html (default: markdown)
    --no-toc                Skip table of contents generation

GENERATES:
    • Project overview (from PRD)
    • Feature documentation (from feature specs)
    • API documentation (from OpenAPI spec)
    • System architecture docs (from system design)
    • Combined documentation site

EXAMPLES:
    generate-docs.ts                          # Generate markdown docs
    generate-docs.ts -f html                  # Generate HTML docs
    generate-docs.ts -o output                # Custom output directory
`);
}

function setupOutputDir(outputDir: string): void {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log(colorize('✓', 'green') + ' Created output directory: ' + outputDir);
  }
}

// ============================================================================
// Generators
// ============================================================================

function generateOverview(docsDir: string, outputDir: string): void {
  const prdFile = join(docsDir, 'product-requirements.yaml');
  const outputFile = join(outputDir, 'overview.md');

  if (!existsSync(prdFile)) {
    console.log(colorize('⚠', 'yellow') + ' PRD file not found, skipping overview');
    return;
  }

  console.log(colorize('→', 'cyan') + ' Generating project overview...');

  const content = loadYamlFile(prdFile);
  if (!content) return;

  const projectName = parseYamlValue(content, 'project_name') || 'Project';
  const summary = parseNestedYamlValue(content, 'overview', 'summary') || 'No summary provided';
  const goal = parseNestedYamlValue(content, 'overview', 'goal') || 'No goal defined';

  let markdown = `# ${projectName} Overview

## Summary

${summary}

## Goal

${goal}

## Features

`;

  // Extract features
  const lines = content.split('\n');
  let inFeatures = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^features:/.test(line)) {
      inFeatures = true;
      continue;
    }

    if (inFeatures && /^[a-z_]+:/.test(line) && !/^  /.test(line)) {
      break;
    }

    if (inFeatures && /^  - id:/.test(line)) {
      const id = line.replace(/^  - id:\s*/, '').replace(/['"]/g, '').trim();
      if (i + 1 < lines.length && /^    description:/.test(lines[i + 1])) {
        const desc = lines[i + 1].replace(/^    description:\s*/, '').replace(/['"]/g, '').trim();
        markdown += `- **${id}:** ${desc}\n`;
      }
    }
  }

  writeFileSync(outputFile, markdown);
  console.log(colorize('✓', 'green') + ' Generated overview: ' + outputFile);
}

function generateFeatureDocs(docsDir: string, outputDir: string): void {
  const featuresDir = join(docsDir, 'feature-specs');
  const outputFile = join(outputDir, 'features.md');

  if (!existsSync(featuresDir)) {
    console.log(colorize('⚠', 'yellow') + ' Feature specs directory not found, skipping');
    return;
  }

  console.log(colorize('→', 'cyan') + ' Generating feature documentation...');

  let markdown = `# Feature Specifications

This document provides detailed specifications for all features.

---

`;

  const featureFiles = findYamlFiles(featuresDir);

  for (const featureFile of featureFiles) {
    const content = loadYamlFile(featureFile);
    if (!content) continue;

    const featureId = parseYamlValue(content, 'feature_id') || '';
    let title = parseYamlValue(content, 'title') || basename(featureFile, '.yaml');
    title = title.replace(/^Technical Specification - /, '');
    const summary = parseYamlValue(content, 'summary') || '';
    const status = parseYamlValue(content, 'status') || 'incomplete';

    markdown += `## ${featureId} - ${title}

**Status:** ${status}

### Summary

${summary}

### Core Logic

`;

    const coreLogic = parseNestedYamlValue(content, 'functional_overview', 'core_logic') || '';
    markdown += `${coreLogic}

### API Endpoints

`;

    const endpoints = getApiEndpoints(content);
    endpoints.forEach(ep => {
      markdown += `- **${ep.method.toUpperCase()}** \`${ep.endpoint}\`\n`;
    });

    markdown += '\n---\n\n';
  }

  writeFileSync(outputFile, markdown);
  console.log(colorize('✓', 'green') + ' Generated feature docs: ' + outputFile);
}

function generateApiDocs(docsDir: string, outputDir: string): void {
  const apiFile = join(docsDir, 'api-contracts.yaml');
  const outputFile = join(outputDir, 'api-reference.md');

  if (!existsSync(apiFile)) {
    console.log(colorize('⚠', 'yellow') + ' API contracts file not found, skipping');
    return;
  }

  console.log(colorize('→', 'cyan') + ' Generating API documentation...');

  const content = loadYamlFile(apiFile);
  if (!content) return;

  const apiTitle = parseNestedYamlValue(content, 'info', 'title') || 'API';
  const apiVersion = parseNestedYamlValue(content, 'info', 'version') || '1.0.0';

  let markdown = `# API Reference

**${apiTitle}** - Version ${apiVersion}

## Endpoints

`;

  const lines = content.split('\n');
  let inPaths = false;
  let currentPath = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^paths:/.test(line)) {
      inPaths = true;
      continue;
    }

    if (inPaths && /^  \/.*:$/.test(line)) {
      currentPath = line.replace(/:$/, '').replace(/^  /, '');
      continue;
    }

    if (inPaths && /^    (get|post|put|delete|patch):$/.test(line)) {
      const method = line.replace(/:$/, '').replace(/^    /, '');
      markdown += `\n### ${method.toUpperCase()} \`${currentPath}\`\n\n`;

      // Look ahead for summary and description
      let j = i + 1;
      while (j < lines.length && j < i + 50) {
        const nextLine = lines[j];

        if (/^    (get|post|put|delete|patch):$/.test(nextLine) || /^  \//.test(nextLine)) {
          break;
        }

        if (/^      summary:/.test(nextLine)) {
          const summary = nextLine.replace(/^      summary:\s*/, '').replace(/['"]/g, '');
          markdown += `${summary}\n\n`;
        }

        if (/^      description:/.test(nextLine)) {
          const description = nextLine.replace(/^      description:\s*/, '').replace(/['"]/g, '');
          markdown += `${description}\n\n`;
        }

        if (/^      responses:/.test(nextLine)) {
          markdown += '**Responses:**\n\n';
          // Look for response codes
          let k = j + 1;
          while (k < lines.length && k < j + 20) {
            const respLine = lines[k];
            if (/^    (get|post|put|delete|patch):$/.test(respLine) || /^  \//.test(respLine)) {
              break;
            }
            if (/^        ['"]?[0-9]+/.test(respLine)) {
              const code = respLine.replace(/^        /, '').replace(/['":]*/g, '');
              if (k + 1 < lines.length && /^          description:/.test(lines[k + 1])) {
                const desc = lines[k + 1].replace(/^          description:\s*/, '').replace(/['"]/g, '');
                markdown += `- \`${code}\`: ${desc}\n`;
              }
            }
            if (/^      [a-z]+:/.test(respLine) && !/^        /.test(respLine)) {
              break;
            }
            k++;
          }
          break;
        }
        j++;
      }
      markdown += '\n---\n';
    }
  }

  writeFileSync(outputFile, markdown);
  console.log(colorize('✓', 'green') + ' Generated API docs: ' + outputFile);
}

function generateArchitectureDocs(docsDir: string, outputDir: string): void {
  const systemFile = join(docsDir, 'system-design.yaml');
  const outputFile = join(outputDir, 'architecture.md');

  if (!existsSync(systemFile)) {
    console.log(colorize('⚠', 'yellow') + ' System design file not found, skipping');
    return;
  }

  console.log(colorize('→', 'cyan') + ' Generating architecture documentation...');

  const content = loadYamlFile(systemFile);
  if (!content) return;

  let markdown = `# System Architecture

## Overview

`;

  const goal = parseNestedYamlValue(content, 'overview', 'goal') || '';
  markdown += `${goal}

## Components

`;

  // Parse components
  const lines = content.split('\n');
  let inComponents = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^core_components:/.test(line)) {
      inComponents = true;
      continue;
    }

    if (inComponents && /^[a-z_]+:/.test(line) && !/^  /.test(line)) {
      break;
    }

    if (inComponents && /^  - component:/.test(line)) {
      const comp = line.replace(/^  - component:\s*/, '').replace(/['"]/g, '');
      if (i + 1 < lines.length && /^    description:/.test(lines[i + 1])) {
        const desc = lines[i + 1].replace(/^    description:\s*/, '').replace(/['"]/g, '');
        markdown += `### ${comp}\n\n${desc}\n\n`;
      }
    }
  }

  markdown += `## Tech Stack

`;

  // Parse tech stack
  let inTech = false;
  for (const line of lines) {
    if (/^tech_stack:/.test(line)) {
      inTech = true;
      continue;
    }

    if (inTech && /^[a-z_]+:/.test(line) && !/^  /.test(line)) {
      break;
    }

    if (inTech && /^  [a-z_]+:/.test(line)) {
      const key = line.replace(/^  /, '').replace(/:.*/, '');
      const value = line.replace(/^  [a-z_]+:\s*/, '').replace(/['"]/g, '');
      markdown += `- **${key}:** ${value}\n`;
    }
  }

  writeFileSync(outputFile, markdown);
  console.log(colorize('✓', 'green') + ' Generated architecture docs: ' + outputFile);
}

function generateIndex(docsDir: string, outputDir: string): void {
  const outputFile = join(outputDir, 'README.md');

  console.log(colorize('→', 'cyan') + ' Generating documentation index...');

  let markdown = `# Project Documentation

This documentation is automatically generated from YAML specification files.

## Table of Contents

`;

  if (existsSync(join(outputDir, 'overview.md'))) {
    markdown += '- [Project Overview](./overview.md)\n';
  }
  if (existsSync(join(outputDir, 'features.md'))) {
    markdown += '- [Feature Specifications](./features.md)\n';
  }
  if (existsSync(join(outputDir, 'api-reference.md'))) {
    markdown += '- [API Reference](./api-reference.md)\n';
  }
  if (existsSync(join(outputDir, 'architecture.md'))) {
    markdown += '- [System Architecture](./architecture.md)\n';
  }

  markdown += `
## Source Files

This documentation is generated from:
- Product Requirements: \`${docsDir}/product-requirements.yaml\`
- Feature Specs: \`${docsDir}/feature-specs/*.yaml\`
- API Contracts: \`${docsDir}/api-contracts.yaml\`
- System Design: \`${docsDir}/system-design.yaml\`

To regenerate this documentation, run:
\`\`\`bash
./generate-docs.ts
\`\`\`

---

*Generated on ${new Date().toLocaleString()}*
`;

  writeFileSync(outputFile, markdown);
  console.log(colorize('✓', 'green') + ' Generated index: ' + outputFile);
}

// ============================================================================
// Main
// ============================================================================

function main(): void {
  const args = process.argv.slice(2);
  const options: Options = {
    docsDir: resolveDirectory('docs'),
    outputDir: '',
    format: 'markdown',
    includeToc: true,
  };

  // Set default output dir after resolving docs dir
  options.outputDir = join(options.docsDir, 'generated');

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
        options.outputDir = join(options.docsDir, 'generated');
        break;
      case '-o':
      case '--output':
        options.outputDir = args[++i];
        break;
      case '-f':
      case '--format':
        options.format = args[++i] as 'markdown' | 'html';
        break;
      case '--no-toc':
        options.includeToc = false;
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        console.error('Use -h or --help for usage information');
        process.exit(1);
    }
  }

  // Main execution
  console.log(colorize('━'.repeat(50), 'blue'));
  console.log(colorize('Documentation Generator', 'blue'));
  console.log(colorize('━'.repeat(50), 'blue'));
  console.log('');

  // Check if docs directory exists
  if (!existsSync(options.docsDir)) {
    console.log(colorize('✗', 'red') + ' Documentation directory not found: ' + options.docsDir);
    process.exit(1);
  }

  // Setup output directory
  setupOutputDir(options.outputDir);

  // Generate all documentation
  generateOverview(options.docsDir, options.outputDir);
  generateFeatureDocs(options.docsDir, options.outputDir);
  generateApiDocs(options.docsDir, options.outputDir);
  generateArchitectureDocs(options.docsDir, options.outputDir);
  generateIndex(options.docsDir, options.outputDir);

  console.log('');
  console.log(colorize('━'.repeat(50), 'blue'));
  console.log(colorize('✓', 'green') + ' Documentation generation complete!');
  console.log(colorize('→', 'cyan') + ' Output directory: ' + options.outputDir);
  console.log('');
}

main();