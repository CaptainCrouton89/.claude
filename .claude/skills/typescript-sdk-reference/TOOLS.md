# Tool Reference

Complete input/output schemas for all built-in Claude Code tools.

---

## Quick Lookup

| Tool | Input | Output | Purpose |
|------|-------|--------|---------|
| `Task` | `AgentInput` | `TaskOutput` | Delegate to subagent |
| `Bash` | `BashInput` | `BashOutput` | Execute shell commands |
| `BashOutput` | `BashOutputInput` | `BashOutputToolOutput` | Retrieve background shell output |
| `Read` | `FileReadInput` | `ReadOutput` | Read files, images, PDFs, notebooks |
| `Write` | `FileWriteInput` | `WriteOutput` | Write files to filesystem |
| `Edit` | `FileEditInput` | `EditOutput` | String replace in files |
| `MultiEdit` | `FileMultiEditInput` | `MultiEditOutput` | Multiple edits in single file |
| `Glob` | `GlobInput` | `GlobOutput` | Pattern-based file matching |
| `Grep` | `GrepInput` | `GrepOutput` | Regex search across files |
| `KillBash` | `KillShellInput` | `KillBashOutput` | Terminate background shell |
| `NotebookEdit` | `NotebookEditInput` | `NotebookEditOutput` | Edit Jupyter notebook cells |
| `WebFetch` | `WebFetchInput` | `WebFetchOutput` | Fetch & analyze web content |
| `WebSearch` | `WebSearchInput` | `WebSearchOutput` | Web search |
| `TodoWrite` | `TodoWriteInput` | `TodoWriteOutput` | Manage task lists |
| `ExitPlanMode` | `ExitPlanModeInput` | `ExitPlanModeOutput` | Exit planning mode |
| `ListMcpResources` | `ListMcpResourcesInput` | `ListMcpResourcesOutput` | List MCP resources |
| `ReadMcpResource` | `ReadMcpResourceInput` | `ReadMcpResourceOutput` | Read MCP resource |

---

## Core File Operations

### Read

Read files: text, images (PNG/JPG), PDFs (with page extraction), or Jupyter notebooks.

**Input:**
```typescript
interface FileReadInput {
  file_path: string;    // Absolute path (required)
  offset?: number;      // Start line (1-indexed)
  limit?: number;       // Number of lines to read
}
```

**Output (text):**
```typescript
interface TextFileOutput {
  content: string;          // Lines with line numbers
  total_lines: number;      // Total file lines
  lines_returned: number;   // Actual lines returned
}
```

**Output (image):**
```typescript
interface ImageFileOutput {
  image: string;       // Base64 encoded data
  mime_type: string;   // e.g., 'image/png'
  file_size: number;   // Bytes
}
```

**Output (PDF):**
```typescript
interface PDFFileOutput {
  pages: Array<{
    page_number: number;
    text?: string;
    images?: Array<{ image: string; mime_type: string }>;
  }>;
  total_pages: number;
}
```

**Output (Jupyter Notebook):**
```typescript
interface NotebookFileOutput {
  cells: Array<{
    cell_type: 'code' | 'markdown';
    source: string;
    outputs?: any[];
    execution_count?: number;
  }>;
  metadata?: Record<string, any>;
}
```

### Write

Write entire file content (overwrites if exists).

**Input:**
```typescript
interface FileWriteInput {
  file_path: string;  // Absolute path (required)
  content: string;    // Full content
}
```

**Output:**
```typescript
interface WriteOutput {
  message: string;          // Confirmation
  bytes_written: number;
  file_path: string;
}
```

### Edit

Single string replacement with exact matching.

**Input:**
```typescript
interface FileEditInput {
  file_path: string;      // Absolute path (required)
  old_string: string;     // Text to find (must be unique or use replace_all)
  new_string: string;     // Replacement text (must differ from old_string)
  replace_all?: boolean;  // Replace all occurrences?
}
```

**Output:**
```typescript
interface EditOutput {
  message: string;
  replacements: number;   // How many replacements made
  file_path: string;
}
```

### MultiEdit

Batch multiple edits in one operation (atomic—all succeed or none do).

**Input:**
```typescript
interface FileMultiEditInput {
  file_path: string;
  edits: Array<{
    old_string: string;
    new_string: string;
    replace_all?: boolean;
  }>;
}
```

**Output:**
```typescript
interface MultiEditOutput {
  message: string;
  edits_applied: number;
  file_path: string;
}
```

---

## Shell Operations

### Bash

Execute shell commands with optional timeout and background support.

**Input:**
```typescript
interface BashInput {
  command: string;              // Shell command (required)
  description?: string;         // 5-10 word description of what command does
  timeout?: number;             // Max milliseconds (max 600000)
  run_in_background?: boolean;  // Run in background and return shellId?
}
```

**Output:**
```typescript
interface BashOutput {
  output: string;    // Combined stdout + stderr (max 30000 chars)
  exitCode: number;
  killed?: boolean;  // Was process killed by timeout?
  shellId?: string;  // For background: use BashOutput tool to poll
}
```

### BashOutput

Poll output from background shell.

**Input:**
```typescript
interface BashOutputInput {
  bash_id: string;
  filter?: string;   // Optional regex to filter lines
}
```

**Output:**
```typescript
interface BashOutputToolOutput {
  output: string;                           // New output since last check
  status: 'running' | 'completed' | 'failed';
  exitCode?: number;                        // Set when completed
}
```

### KillBash

Terminate background shell.

**Input:**
```typescript
interface KillShellInput {
  shell_id: string;  // From BashOutput tool's shellId
}
```

**Output:**
```typescript
interface KillBashOutput {
  message: string;
  shell_id: string;
}
```

---

## Search & Matching

### Glob

Fast pattern-based file matching.

**Input:**
```typescript
interface GlobInput {
  pattern: string;   // Glob pattern (e.g., "**/*.js")
  path?: string;     // Search directory (default: cwd)
}
```

**Output:**
```typescript
interface GlobOutput {
  matches: string[];      // Matching file paths (sorted by mtime)
  count: number;
  search_path: string;
}
```

### Grep

Ripgrep-based regex search with filtering.

**Input:**
```typescript
interface GrepInput {
  pattern: string;                           // Regex pattern (required)
  path?: string;                             // Search directory (default: cwd)
  glob?: string;                             // Glob filter (e.g., "*.ts")
  type?: string;                             // File type (e.g., "js", "py")
  output_mode?: 'content' | 'files_with_matches' | 'count';
  '-i'?: boolean;                            // Case insensitive
  '-n'?: boolean;                            // Show line numbers (content mode)
  '-B'?: number;                             // Lines before match
  '-A'?: number;                             // Lines after match
  '-C'?: number;                             // Lines before and after
  head_limit?: number;                       // Limit results (first N)
  multiline?: boolean;                       // Enable multiline matching
}
```

**Output (content mode):**
```typescript
interface GrepContentOutput {
  matches: Array<{
    file: string;
    line_number?: number;
    line: string;
    before_context?: string[];
    after_context?: string[];
  }>;
  total_matches: number;
}
```

**Output (files mode):**
```typescript
interface GrepFilesOutput {
  files: string[];
  count: number;
}
```

**Output (count mode):**
```typescript
interface GrepCountOutput {
  counts: Array<{
    file: string;
    count: number;
  }>;
  total: number;
}
```

---

## Web Operations

### WebFetch

Fetch URL and process with AI analysis.

**Input:**
```typescript
interface WebFetchInput {
  url: string;      // Full URL (required)
  prompt: string;   // AI analysis prompt (required)
}
```

**Output:**
```typescript
interface WebFetchOutput {
  response: string;      // AI's analysis
  url: string;
  final_url?: string;    // After redirects
  status_code?: number;
}
```

### WebSearch

Search the web.

**Input:**
```typescript
interface WebSearchInput {
  query: string;                    // Search query (required)
  allowed_domains?: string[];       // Only these domains
  blocked_domains?: string[];       // Never these domains
}
```

**Output:**
```typescript
interface WebSearchOutput {
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    metadata?: Record<string, any>;
  }>;
  total_results: number;
  query: string;
}
```

---

## Notebook Operations

### NotebookEdit

Edit, insert, or delete Jupyter notebook cells.

**Input:**
```typescript
interface NotebookEditInput {
  notebook_path: string;                    // Absolute path (required)
  new_source: string;                       // Cell source code (required)
  cell_id?: string;                         // Target cell
  cell_type?: 'code' | 'markdown';          // Cell type (required for insert)
  edit_mode?: 'replace' | 'insert' | 'delete';
}
```

**Output:**
```typescript
interface NotebookEditOutput {
  message: string;
  edit_type: 'replaced' | 'inserted' | 'deleted';
  cell_id?: string;
  total_cells: number;
}
```

---

## Delegation

### Task

Delegate complex work to a specialist subagent.

**Input:**
```typescript
interface AgentInput {
  description: string;     // 3-5 word task description (required)
  prompt: string;          // Full task instructions (required)
  subagent_type: string;   // Agent type: 'general-purpose', 'backend-developer',
                           // 'frontend-ui-developer', 'code-finder', etc.
}
```

**Output:**
```typescript
interface TaskOutput {
  result: string;          // Final result from subagent
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
  total_cost_usd?: number;
  duration_ms?: number;
}
```

---

## Task Management

### TodoWrite

Create or update task lists.

**Input:**
```typescript
interface TodoWriteInput {
  todos: Array<{
    content: string;              // Imperative description (required)
    status: 'pending' | 'in_progress' | 'completed';
    activeForm: string;           // Present continuous form (required)
  }>;
}
```

**Output:**
```typescript
interface TodoWriteOutput {
  message: string;
  stats: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
  };
}
```

### ExitPlanMode

Exit planning mode and prompt user for approval.

**Input:**
```typescript
interface ExitPlanModeInput {
  plan: string;  // Plan markdown (required)
}
```

**Output:**
```typescript
interface ExitPlanModeOutput {
  message: string;
  approved?: boolean;  // User approved?
}
```

---

## MCP Resources

### ListMcpResources

List available MCP resources from connected servers.

**Input:**
```typescript
interface ListMcpResourcesInput {
  server?: string;  // Filter by server name
}
```

**Output:**
```typescript
interface ListMcpResourcesOutput {
  resources: Array<{
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
    server: string;
  }>;
  total: number;
}
```

### ReadMcpResource

Read a specific MCP resource.

**Input:**
```typescript
interface ReadMcpResourceInput {
  server: string;   // MCP server name (required)
  uri: string;      // Resource URI (required)
}
```

**Output:**
```typescript
interface ReadMcpResourceOutput {
  contents: Array<{
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
  }>;
  server: string;
}
```

---

## ToolInput & ToolOutput Union Types

All tool inputs combined:

```typescript
type ToolInput =
  | AgentInput
  | BashInput
  | BashOutputInput
  | FileEditInput
  | FileMultiEditInput
  | FileReadInput
  | FileWriteInput
  | GlobInput
  | GrepInput
  | KillShellInput
  | NotebookEditInput
  | WebFetchInput
  | WebSearchInput
  | TodoWriteInput
  | ExitPlanModeInput
  | ListMcpResourcesInput
  | ReadMcpResourceInput;
```

All tool outputs combined:

```typescript
type ToolOutput =
  | TaskOutput
  | BashOutput
  | BashOutputToolOutput
  | EditOutput
  | MultiEditOutput
  | ReadOutput
  | WriteOutput
  | GlobOutput
  | GrepOutput
  | KillBashOutput
  | NotebookEditOutput
  | WebFetchOutput
  | WebSearchOutput
  | TodoWriteOutput
  | ExitPlanModeOutput
  | ListMcpResourcesOutput
  | ReadMcpResourceOutput;
```

---

## Related

- [Types Reference](./TYPES.md) – Options, PermissionMode, AgentDefinition
- [Message Types](./MESSAGE_TYPES.md) – SDKMessage definitions
- [Main SKILL.md](./SKILL.md) – Quick overview
