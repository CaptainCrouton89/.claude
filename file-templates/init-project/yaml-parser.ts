#!/usr/bin/env node
/**
 * YAML Parser for project documentation
 * Provides typed interfaces and parsing utilities for YAML documentation files
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

// ============================================================================
// Types
// ============================================================================

export interface FeatureSpec {
  feature_id: string;
  title: string;
  status: 'incomplete' | 'in-progress' | 'complete';
  summary: string;
  functional_overview?: {
    core_logic?: string;
    integration_points?: string[];
  };
  detailed_design?: {
    data_structures?: Array<{ name: string }>;
    apis?: Array<{ method: string; endpoint: string }>;
  };
  implementation_status?: {
    progress: number;
    completed_components?: string[];
    in_progress_components?: string[];
    blocked_items?: string[];
    notes?: string[];
  };
  dependencies?: {
    libraries?: string;
    services?: string;
    data_sources?: string;
  };
}

export interface UserStory {
  story_id: string;
  title: string;
  feature_id: string;
  status: 'incomplete' | 'in-progress' | 'complete';
  user_story: {
    as_a: string;
    i_want: string;
    so_that: string;
  };
  acceptance_criteria: string[];
}

export interface UserFlow {
  title: string;
  key_personas: string[];
  primary_flows: FlowDefinition[];
  secondary_flows?: FlowDefinition[];
}

export interface FlowDefinition {
  name: string;
  trigger: string;
  steps: string[];
  outcome: string;
  edge_cases?: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  responses?: string;
}

export interface ApiSpec {
  info: {
    title: string;
    version: string;
  };
  paths: Record<string, Record<string, unknown>>;
}

// ============================================================================
// YAML Parsing Utilities
// ============================================================================

/**
 * Parse a simple YAML value (top-level key: value)
 */
export function parseYamlValue(content: string, key: string): string | null {
  const regex = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const match = content.match(regex);
  if (!match) return null;

  let value = match[1].trim();
  // Remove quotes
  value = value.replace(/^["']|["']$/g, '');
  // Remove brackets for array-like values
  value = value.replace(/^\[|\]$/g, '');

  return value || null;
}

/**
 * Parse a nested YAML value (parent.child)
 */
export function parseNestedYamlValue(
  content: string,
  parent: string,
  child: string
): string | null {
  const lines = content.split('\n');
  let inParent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're entering the parent section
    if (new RegExp(`^${parent}:`).test(line)) {
      inParent = true;
      continue;
    }

    // Exit if we hit another top-level key
    if (inParent && /^[a-z_]+:/.test(line) && !/^  /.test(line)) {
      break;
    }

    // Check for child key
    if (inParent && new RegExp(`^  ${child}:`).test(line)) {
      let value = line.replace(new RegExp(`^  ${child}:\\s*`), '');
      value = value.replace(/^["']|["']$/g, '').trim();
      return value || null;
    }
  }

  return null;
}

/**
 * Parse YAML array items
 */
export function parseYamlArray(content: string, key: string): string[] {
  const lines = content.split('\n');
  let inArray = false;
  const items: string[] = [];

  for (const line of lines) {
    // Check if we're entering the array
    if (new RegExp(`^${key}:`).test(line)) {
      inArray = true;
      continue;
    }

    // Exit if we hit another top-level key
    if (inArray && /^[a-z_]+:/.test(line)) {
      break;
    }

    // Collect array items
    if (inArray && /^  - /.test(line)) {
      let item = line.replace(/^  - /, '');
      item = item.replace(/^["']|["']$/g, '').trim();
      if (item) items.push(item);
    }
  }

  return items;
}

/**
 * Count nested array items (e.g., detailed_design.apis)
 */
export function countNestedArrayItems(
  content: string,
  parent: string,
  child: string
): number {
  const lines = content.split('\n');
  let inParent = false;
  let inChild = false;
  let count = 0;

  for (const line of lines) {
    // Check parent section
    if (new RegExp(`^${parent}:`).test(line)) {
      inParent = true;
      continue;
    }

    // Exit parent
    if (inParent && /^[a-z_]+:/.test(line) && !/^  /.test(line)) {
      break;
    }

    // Check child section
    if (inParent && new RegExp(`^  ${child}:`).test(line)) {
      inChild = true;
      continue;
    }

    // Exit child
    if (inChild && /^  [a-z_]+:/.test(line) && !/^    /.test(line)) {
      break;
    }

    // Count items (- name: or - method:)
    if (inChild && /^    - (name|method):/.test(line)) {
      count++;
    }
  }

  return count;
}

/**
 * Get API endpoints from detailed_design.apis
 */
export function getApiEndpoints(content: string): Array<{ method: string; endpoint: string }> {
  const lines = content.split('\n');
  let inDesign = false;
  let inApis = false;
  const endpoints: Array<{ method: string; endpoint: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^detailed_design:/.test(line)) {
      inDesign = true;
      continue;
    }

    if (inDesign && /^  apis:/.test(line)) {
      inApis = true;
      continue;
    }

    if (inApis && /^  [a-z_]+:/.test(line) && !/^    /.test(line)) {
      break;
    }

    if (inApis && /^    - method:/.test(line)) {
      const method = line.replace(/^    - method:\s*/, '').replace(/["']/g, '').trim();
      // Next line should have endpoint
      if (i + 1 < lines.length && /^      endpoint:/.test(lines[i + 1])) {
        const endpoint = lines[i + 1]
          .replace(/^      endpoint:\s*/, '')
          .replace(/["']/g, '')
          .trim();
        if (method && endpoint) {
          endpoints.push({ method, endpoint });
        }
      }
    }
  }

  return endpoints;
}

/**
 * Get implementation components list
 */
export function getImplementationComponents(
  content: string,
  componentType: 'completed_components' | 'in_progress_components' | 'blocked_items'
): string[] {
  const lines = content.split('\n');
  let inImpl = false;
  let inComp = false;
  const components: string[] = [];

  for (const line of lines) {
    if (/^implementation_status:/.test(line)) {
      inImpl = true;
      continue;
    }

    if (inImpl && /^[a-z_]+:/.test(line) && !/^  /.test(line)) {
      break;
    }

    if (inImpl && new RegExp(`^  ${componentType}:`).test(line)) {
      inComp = true;
      continue;
    }

    if (inComp && /^  [a-z_]+:/.test(line)) {
      break;
    }

    if (inComp && /^    - /.test(line)) {
      const comp = line.replace(/^    - /, '').replace(/["']/g, '').trim();
      if (comp) components.push(comp);
    }
  }

  return components;
}

// ============================================================================
// File System Utilities
// ============================================================================

/**
 * Resolve directory based on current working directory
 */
export function resolveDirectory(defaultPath: string): string {
  const cwd = process.cwd();
  const currentDirName = basename(cwd);

  // If we're in the docs directory
  if (currentDirName === 'docs' && statSync(cwd).isDirectory()) {
    return cwd;
  }

  // If docs exists in current location
  const docsPath = join(cwd, 'docs');
  try {
    if (statSync(docsPath).isDirectory()) {
      return docsPath;
    }
  } catch {
    // Directory doesn't exist
  }

  // Return default
  return defaultPath;
}

/**
 * Find YAML files in a directory
 */
export function findYamlFiles(dir: string): string[] {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    return entries
      .filter(e => e.isFile() && (e.name.endsWith('.yaml') || e.name.endsWith('.yml')))
      .map(e => join(dir, e.name))
      .sort();
  } catch (error) {
    return [];
  }
}

/**
 * Load YAML file as string
 */
export function loadYamlFile(path: string): string | null {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

// ============================================================================
// Color Utilities
// ============================================================================

export const colors = {
  reset: '\x1b[0m',
  red: '\x1b[0;31m',
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  blue: '\x1b[0;34m',
  cyan: '\x1b[0;36m',
  magenta: '\x1b[0;35m',
} as const;

export function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}
