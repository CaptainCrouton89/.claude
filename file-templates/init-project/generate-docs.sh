#!/bin/bash

# generate-docs.sh - Generate documentation from YAML files
# Usage: ./generate-docs.sh [options]
# Run from project root. Generates human-readable docs from YAML files.

# Default values
DOCS_DIR="docs"
OUTPUT_DIR="docs/generated"
FORMAT="markdown"
INCLUDE_TOC=true

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Help text
show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

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
    $(basename "$0")                          # Generate markdown docs
    $(basename "$0") -f html                  # Generate HTML docs
    $(basename "$0") -o output                # Custom output directory

EOF
}

# Create output directory
setup_output_dir() {
    if [[ ! -d "$OUTPUT_DIR" ]]; then
        mkdir -p "$OUTPUT_DIR"
        echo -e "${GREEN}✓${NC} Created output directory: $OUTPUT_DIR"
    fi
}

# Generate project overview
generate_overview() {
    local prd_file="$DOCS_DIR/product-requirements.yaml"
    local output_file="$OUTPUT_DIR/overview.md"
    
    if [[ ! -f "$prd_file" ]]; then
        echo -e "${YELLOW}⚠${NC} PRD file not found, skipping overview"
        return
    fi
    
    echo -e "${CYAN}→${NC} Generating project overview..."
    
    local project_name=$(awk '/project_name:/{gsub(/.*: /,""); gsub(/"/,""); print; exit}' "$prd_file")
    local summary=$(awk '/^  summary:/{gsub(/.*: /,""); gsub(/"/,""); print; exit}' "$prd_file")
    local goal=$(awk '/^  goal:/{gsub(/.*: /,""); gsub(/"/,""); print; exit}' "$prd_file")
    
    cat > "$output_file" << EOF
# ${project_name:-Project} Overview

## Summary

${summary:-No summary provided}

## Goal

${goal:-No goal defined}

## Features

EOF
    
    # Extract features
    awk '
        /^features:/ { in_features = 1; next }
        in_features && /^  - id:/ {
            id = $3
            gsub(/"/, "", id)
            getline
            if (/^    description:/) {
                desc = $0
                gsub(/^    description: /, "", desc)
                gsub(/"/, "", desc)
                print "- **" id ":** " desc
            }
        }
        in_features && /^[a-z_]+:/ && !/^  / { exit }
    ' "$prd_file" >> "$output_file"
    
    echo -e "${GREEN}✓${NC} Generated overview: $output_file"
}

# Generate feature documentation
generate_feature_docs() {
    local features_dir="$DOCS_DIR/feature-specs"
    local output_file="$OUTPUT_DIR/features.md"
    
    if [[ ! -d "$features_dir" ]]; then
        echo -e "${YELLOW}⚠${NC} Feature specs directory not found, skipping"
        return
    fi
    
    echo -e "${CYAN}→${NC} Generating feature documentation..."
    
    cat > "$output_file" << EOF
# Feature Specifications

This document provides detailed specifications for all features.

---

EOF
    
    local feature_files=$(find "$features_dir" -name "*.yaml" -o -name "*.yml" | sort)
    
    while IFS= read -r feature_file; do
        [[ -z "$feature_file" ]] && continue
        
        local feature_id=$(awk '/^feature_id:/{print $2}' "$feature_file")
        local title=$(awk '/^title:/{gsub(/^title: /,""); gsub(/^Technical Specification - /,""); gsub(/"/,""); print; exit}' "$feature_file")
        local summary=$(awk '/^summary:/{gsub(/^summary: /,""); gsub(/"/,""); print; exit}' "$feature_file")
        local status=$(awk '/^status:/{print $2}' "$feature_file")
        
        cat >> "$output_file" << EOF
## $feature_id - $title

**Status:** $status

### Summary

$summary

### Core Logic

EOF
        
        local core_logic=$(awk '
            /^functional_overview:/ { in_func = 1; next }
            in_func && /^  core_logic:/ { 
                gsub(/^  core_logic: /, "")
                gsub(/^"/, ""); gsub(/"$/, "")
                print
                exit
            }
        ' "$feature_file")
        
        echo "$core_logic" >> "$output_file"
        
        echo -e "\n### API Endpoints\n" >> "$output_file"
        
        awk '
            BEGIN { in_apis = 0 }
            /^detailed_design:/ { in_design = 1; next }
            in_design && /^  apis:/ { in_apis = 1; next }
            in_apis && /^  [a-z_]+:/ && !/^    / { exit }
            in_apis && /^    - method:/ {
                method = $3
                gsub(/"/, "", method)
                getline
                if (/^      endpoint:/) {
                    endpoint = $0
                    gsub(/^      endpoint: /, "", endpoint)
                    gsub(/"/, "", endpoint)
                    print "- **" toupper(method) "** `" endpoint "`"
                }
            }
        ' "$feature_file" >> "$output_file"
        
        echo -e "\n---\n" >> "$output_file"
        
    done <<< "$feature_files"
    
    echo -e "${GREEN}✓${NC} Generated feature docs: $output_file"
}

# Generate API documentation
generate_api_docs() {
    local api_file="$DOCS_DIR/api-contracts.yaml"
    local output_file="$OUTPUT_DIR/api-reference.md"
    
    if [[ ! -f "$api_file" ]]; then
        echo -e "${YELLOW}⚠${NC} API contracts file not found, skipping"
        return
    fi
    
    echo -e "${CYAN}→${NC} Generating API documentation..."
    
    local api_title=$(awk '/^info:/,/^[a-z]+:/{if(/^  title:/) {gsub(/.*: /,""); gsub(/"/,""); print; exit}}' "$api_file")
    local api_version=$(awk '/^info:/,/^[a-z]+:/{if(/^  version:/) {gsub(/.*: /,""); print; exit}}' "$api_file")
    
    cat > "$output_file" << EOF
# API Reference

**${api_title}** - Version ${api_version}

## Endpoints

EOF
    
    awk '
        BEGIN { current_path = ""; in_paths = 0 }
        /^paths:/ { in_paths = 1; next }
        in_paths && /^  \/.*:$/ {
            current_path = $1
            gsub(/:$/, "", current_path)
            gsub(/^  /, "", current_path)
            next
        }
        in_paths && /^    (get|post|put|delete|patch):$/ {
            method = $1
            gsub(/:$/, "", method)
            gsub(/^    /, "", method)
            print "\n### " toupper(method) " `" current_path "`\n"
            
            summary = ""
            description = ""
            
            getline
            while ($0 ~ /^      /) {
                if ($0 ~ /^      summary:/) {
                    summary = $0
                    gsub(/^      summary: /, "", summary)
                    gsub(/"/, "", summary)
                    print summary "\n"
                }
                if ($0 ~ /^      description:/) {
                    description = $0
                    gsub(/^      description: /, "", description)
                    gsub(/"/, "", description)
                    print description "\n"
                }
                if ($0 ~ /^      responses:/) {
                    print "**Responses:**\n"
                    getline
                    while ($0 ~ /^        /) {
                        if ($0 ~ /^        "?[0-9]+/) {
                            code = $1
                            gsub(/"/, "", code)
                            gsub(/:$/, "", code)
                            gsub(/^        /, "", code)
                            getline
                            if ($0 ~ /^          description:/) {
                                desc = $0
                                gsub(/^          description: /, "", desc)
                                gsub(/"/, "", desc)
                                print "- `" code "`: " desc
                            }
                        }
                        getline
                    }
                }
                if ($0 !~ /^      / && $0 !~ /^        /) break
                getline
            }
            print "\n---"
        }
    ' "$api_file" >> "$output_file"
    
    echo -e "${GREEN}✓${NC} Generated API docs: $output_file"
}

# Generate system architecture doc
generate_architecture_docs() {
    local system_file="$DOCS_DIR/system-design.yaml"
    local output_file="$OUTPUT_DIR/architecture.md"
    
    if [[ ! -f "$system_file" ]]; then
        echo -e "${YELLOW}⚠${NC} System design file not found, skipping"
        return
    fi
    
    echo -e "${CYAN}→${NC} Generating architecture documentation..."
    
    cat > "$output_file" << EOF
# System Architecture

## Overview

EOF
    
    awk '
        /^overview:/ { in_overview = 1; next }
        in_overview && /^  goal:/ {
            gsub(/^  goal: /, "")
            gsub(/^"/, ""); gsub(/"$/, "")
            print
            print ""
        }
        in_overview && /^[a-z_]+:/ && !/^  / { exit }
    ' "$system_file" >> "$output_file"
    
    cat >> "$output_file" << EOF

## Components

EOF
    
    awk '
        /^core_components:/ { in_components = 1; next }
        in_components && /^  - component:/ {
            comp = $0
            gsub(/^  - component: /, "", comp)
            gsub(/^"/, "", comp); gsub(/"$/, "", comp)
            getline
            desc = ""
            if (/^    description:/) {
                desc = $0
                gsub(/^    description: /, "", desc)
                gsub(/^"/, "", desc); gsub(/"$/, "", desc)
            }
            print "### " comp "\n"
            print desc "\n"
        }
        in_components && /^[a-z_]+:/ && !/^  / { exit }
    ' "$system_file" >> "$output_file"
    
    cat >> "$output_file" << EOF

## Tech Stack

EOF
    
    awk '
        /^tech_stack:/ { in_tech = 1; next }
        in_tech && /^  [a-z_]+:/ {
            key = $1
            gsub(/:$/, "", key)
            gsub(/^  /, "", key)
            value = $0
            gsub(/^  [a-z_]+: /, "", value)
            gsub(/^"/, "", value); gsub(/"$/, "", value)
            print "- **" key ":** " value
        }
        in_tech && /^[a-z_]+:/ && !/^  / { exit }
    ' "$system_file" >> "$output_file"
    
    echo -e "${GREEN}✓${NC} Generated architecture docs: $output_file"
}

# Generate index/README
generate_index() {
    local output_file="$OUTPUT_DIR/README.md"
    
    echo -e "${CYAN}→${NC} Generating documentation index..."
    
    cat > "$output_file" << EOF
# Project Documentation

This documentation is automatically generated from YAML specification files.

## Table of Contents

EOF
    
    [[ -f "$OUTPUT_DIR/overview.md" ]] && echo "- [Project Overview](./overview.md)" >> "$output_file"
    [[ -f "$OUTPUT_DIR/features.md" ]] && echo "- [Feature Specifications](./features.md)" >> "$output_file"
    [[ -f "$OUTPUT_DIR/api-reference.md" ]] && echo "- [API Reference](./api-reference.md)" >> "$output_file"
    [[ -f "$OUTPUT_DIR/architecture.md" ]] && echo "- [System Architecture](./architecture.md)" >> "$output_file"
    
    cat >> "$output_file" << EOF

## Source Files

This documentation is generated from:
- Product Requirements: \`$DOCS_DIR/product-requirements.yaml\`
- Feature Specs: \`$DOCS_DIR/feature-specs/*.yaml\`
- API Contracts: \`$DOCS_DIR/api-contracts.yaml\`
- System Design: \`$DOCS_DIR/system-design.yaml\`

To regenerate this documentation, run:
\`\`\`bash
./generate-docs.sh
\`\`\`

---

*Generated on $(date "+%Y-%m-%d %H:%M:%S")*
EOF
    
    echo -e "${GREEN}✓${NC} Generated index: $output_file"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--dir)
            DOCS_DIR="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -f|--format)
            FORMAT="$2"
            shift 2
            ;;
        --no-toc)
            INCLUDE_TOC=false
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Main execution
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Documentation Generator${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if docs directory exists
if [[ ! -d "$DOCS_DIR" ]]; then
    echo -e "${RED}✗${NC} Documentation directory not found: $DOCS_DIR"
    exit 1
fi

# Setup output directory
setup_output_dir

# Generate all documentation
generate_overview
generate_feature_docs
generate_api_docs
generate_architecture_docs
generate_index

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓${NC} Documentation generation complete!"
echo -e "${CYAN}→${NC} Output directory: $OUTPUT_DIR"
echo ""

