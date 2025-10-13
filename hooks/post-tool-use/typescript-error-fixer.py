#!/usr/bin/env python3
"""
TypeScript type checking and error fixing hook for Claude Code.
Runs type checks after Claude stops, and if errors are found, automatically
prompts Claude to fix them using parallel agents for different files.
"""

import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, NamedTuple, Optional, Set


class TypeScriptError(NamedTuple):
    file: str
    line: int
    column: int
    code: str
    message: str


def load_input() -> dict:
    """Load and parse JSON input from stdin."""
    try:
        return json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)


def get_edited_files(transcript_path: str) -> Set[str]:
    """Extract edited TypeScript files from the transcript."""
    edited_files = set()
    
    if not os.path.exists(transcript_path):
        return edited_files
    
    try:
        with open(transcript_path, 'r') as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    if entry.get('type') == 'tool_call':
                        tool_name = entry.get('tool_name', '')
                        tool_input = entry.get('tool_input', {})
                        
                        # Check for file editing tools
                        if tool_name in ['Write', 'Edit', 'MultiEdit']:
                            file_path = tool_input.get('file_path', '')
                            if file_path and (file_path.endswith('.ts') or file_path.endswith('.tsx')):
                                edited_files.add(file_path)
                except (json.JSONDecodeError, KeyError):
                    continue
    except Exception as e:
        print(f"Warning: Could not read transcript: {e}", file=sys.stderr)
    
    return edited_files


def find_package_json(cwd: str) -> Optional[str]:
    """Find the nearest package.json to determine project root."""
    current_dir = Path(cwd).resolve()
    
    while current_dir != current_dir.parent:
        package_json = current_dir / "package.json"
        if package_json.exists():
            return str(current_dir)
        current_dir = current_dir.parent
    
    return None


def has_typescript_config(project_root: str) -> bool:
    """Check if project has TypeScript configuration."""
    ts_configs = ['tsconfig.json', 'jsconfig.json']
    return any(os.path.exists(os.path.join(project_root, config)) for config in ts_configs)


def get_typescript_checker(project_root: str) -> Optional[str]:
    """Determine which TypeScript checker to use."""
    # Check for common TypeScript checkers in package.json
    package_json_path = os.path.join(project_root, 'package.json')
    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
                
            # Check dependencies and devDependencies
            all_deps = {}
            all_deps.update(package_data.get('dependencies', {}))
            all_deps.update(package_data.get('devDependencies', {}))
            
            # Priority order of checkers
            if 'typescript' in all_deps:
                return 'npx tsc --noEmit'
            elif '@types/node' in all_deps:
                return 'npx tsc --noEmit'
        except Exception:
            pass
    
    # Fallback: try to use system TypeScript
    try:
        result = subprocess.run(['which', 'tsc'], capture_output=True, text=True)
        if result.returncode == 0:
            return 'tsc --noEmit'
    except Exception:
        pass
    
    return None


def parse_typescript_errors(output: str) -> List[TypeScriptError]:
    """Parse TypeScript compiler output into structured errors."""
    errors = []
    
    # TypeScript error format: filename(line,column): error TS2304: message
    pattern = r'^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$'
    
    for line in output.split('\n'):
        line = line.strip()
        if not line:
            continue
            
        match = re.match(pattern, line)
        if match:
            file_path, line_num, col_num, error_code, message = match.groups()
            errors.append(TypeScriptError(
                file=file_path,
                line=int(line_num),
                column=int(col_num),
                code=error_code,
                message=message
            ))
    
    return errors


def group_errors_by_file(errors: List[TypeScriptError]) -> Dict[str, List[TypeScriptError]]:
    """Group errors by file for parallel processing."""
    grouped = defaultdict(list)
    for error in errors:
        grouped[error.file].append(error)
    return dict(grouped)


def create_error_fixing_prompt(file_path: str, errors: List[TypeScriptError]) -> str:
    """Create a focused prompt for fixing errors in a specific file."""
    error_details = []
    for error in errors:
        error_details.append(f"Line {error.line}, Column {error.column}: {error.code} - {error.message}")
    
    errors_text = "\n".join(error_details)
    
    return f"""Fix the following TypeScript errors in {file_path}:

{errors_text}

Please read the file, analyze the errors, and fix them. Focus only on these specific errors - do not make unnecessary changes."""


def should_use_parallel_agents(error_groups: Dict[str, List[TypeScriptError]]) -> bool:
    """Determine if errors can be fixed using parallel agents."""
    # Use parallel agents if:
    # 1. Multiple files have errors
    # 2. No single file has too many errors (to avoid overwhelming one agent)
    
    if len(error_groups) < 2:
        return False
    
    max_errors_per_file = max(len(errors) for errors in error_groups.values())
    return max_errors_per_file <= 10  # Arbitrary threshold


def main():
    input_data = load_input()
    
    # Only process Stop events
    if input_data.get('hook_event_name') != 'Stop':
        sys.exit(0)
    
    # Don't run if we're already in a stop hook to prevent infinite loops
    if input_data.get('stop_hook_active', False):
        sys.exit(0)
    
    cwd = input_data.get('cwd', os.getcwd())
    transcript_path = input_data.get('transcript_path', '')
    
    # Find project root
    project_root = find_package_json(cwd)
    if not project_root:
        # No package.json found, this might not be a JS/TS project
        sys.exit(0)
    
    # Check if this is a TypeScript project
    if not has_typescript_config(project_root):
        sys.exit(0)
    
    # Get edited TypeScript files
    edited_files = get_edited_files(transcript_path)
    if not edited_files:
        sys.exit(0)
    
    # Find TypeScript checker
    ts_checker = get_typescript_checker(project_root)
    if not ts_checker:
        print("Warning: TypeScript not found, skipping type check", file=sys.stderr)
        sys.exit(0)
    
    # Run type check
    try:
        os.chdir(project_root)
        result = subprocess.run(
            ts_checker.split(),
            capture_output=True,
            text=True,
            timeout=30
        )
        
        # TypeScript returns non-zero exit code when there are errors
        if result.returncode == 0:
            # No errors, we're done
            sys.exit(0)
            
        # Parse errors
        errors = parse_typescript_errors(result.stdout + result.stderr)
        if not errors:
            # No parseable errors, maybe just warnings
            sys.exit(0)
        
        # Filter errors to only those in files we edited
        edited_errors = [
            error for error in errors 
            if any(error.file.endswith(edited_file.split('/')[-1]) for edited_file in edited_files)
        ]
        
        if not edited_errors:
            # No errors in files we edited
            sys.exit(0)
        
        # Group errors by file
        error_groups = group_errors_by_file(edited_errors)
        
        # Decide how to fix the errors
        if should_use_parallel_agents(error_groups):
            # Use parallel agents for different files
            agent_tasks = []
            for file_path, file_errors in error_groups.items():
                task_prompt = create_error_fixing_prompt(file_path, file_errors)
                agent_tasks.append(f"Task: Fix TypeScript errors in {file_path}\nPrompt: {task_prompt}")
            
            feedback = f"""TypeScript type checking found errors in {len(error_groups)} files after editing.

I need to fix these TypeScript errors using parallel agents:

{chr(10).join(agent_tasks)}

Please use Task tool to fix these errors in parallel - one agent per file."""
        else:
            # Single sequential approach
            all_errors = []
            for file_path, file_errors in error_groups.items():
                all_errors.append(f"\n{file_path}:")
                for error in file_errors:
                    all_errors.append(f"  Line {error.line}: {error.code} - {error.message}")
            
            feedback = f"""TypeScript type checking found errors after editing:

{''.join(all_errors)}

Please fix these TypeScript errors."""
        
        # Return blocking decision with feedback to Claude
        response = {
            "decision": "block",
            "reason": feedback
        }
        
        print(json.dumps(response))
        sys.exit(0)
        
    except subprocess.TimeoutExpired:
        print("Warning: TypeScript check timed out", file=sys.stderr)
        sys.exit(0)
    except Exception as e:
        print(f"Error running TypeScript check: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()