#!/bin/bash

# list-stories.sh - List user stories with metadata and filtering options
# Usage: ./list-stories.sh [options]
# Run from project root or docs directory. Scans docs/user-stories by default.

# Detect if running from docs directory or project root
resolve_stories_dir() {
    local current_dir="$(pwd)"

    # Check if current directory is "docs"
    if [[ "$(basename "$current_dir")" == "docs" && -d "$current_dir/user-stories" ]]; then
        echo "$current_dir/user-stories"
        return 0
    fi

    # Check if docs directory exists in current location
    if [[ -d "$current_dir/docs/user-stories" ]]; then
        echo "$current_dir/docs/user-stories"
        return 0
    fi

    # Default (will fail gracefully if not found)
    echo "docs/user-stories"
    return 1
}

# Default values
STORIES_DIR="$(resolve_stories_dir)"
SHOW_ALL=false
FORMAT="summary"
FILTER_STATUS=""
FILTER_FEATURE=""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help text
show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

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
    $(basename "$0")                          # List all incomplete stories
    $(basename "$0") -a                       # List all stories
    $(basename "$0") -s in-progress           # List in-progress stories
    $(basename "$0") -f F-01                  # List stories for feature F-01
    $(basename "$0") --format detailed        # Show detailed information
    $(basename "$0") --format ids             # Show only story IDs

EOF
}

# Parse YAML value (simple parser for our use case)
parse_yaml() {
    local file="$1"
    local key="$2"
    
    # Handle nested keys (e.g., user_story.as_a)
    if [[ "$key" == *.* ]]; then
        local parent_key="${key%%.*}"
        local child_key="${key#*.}"
        awk -v parent="$parent_key" -v child="$child_key" '
            /^[a-z_]+:/ { current_parent = $1; gsub(/:/, "", current_parent) }
            current_parent == parent && /^  [a-z_]+:/ {
                k = $1; gsub(/:/, "", k)
                if (k == child) {
                    gsub(/^  [a-z_]+: /, "")
                    gsub(/^"/, ""); gsub(/"$/, "")
                    gsub(/^\[/, ""); gsub(/\]$/, "")
                    print
                    exit
                }
            }
        ' "$file"
    else
        awk -v key="$key" '
            /^[a-z_]+:/ && $1 == key":" {
                gsub(/^[a-z_]+: /, "")
                gsub(/^"/, ""); gsub(/"$/, "")
                gsub(/^</, ""); gsub(/>$/, "")
                print
                exit
            }
        ' "$file"
    fi
}

# Count acceptance criteria
count_criteria() {
    local file="$1"
    grep -c "^  - " "$file" 2>/dev/null || echo "0"
}

# Count completed criteria
count_completed_criteria() {
    local file="$1"
    grep -c "^  - \"\[x\]" "$file" 2>/dev/null || echo "0"
}

# Format output based on format type
format_story() {
    local file="$1"
    local title story_id feature_id status as_a i_want
    
    title=$(parse_yaml "$file" "title")
    story_id=$(parse_yaml "$file" "story_id")
    feature_id=$(parse_yaml "$file" "feature_id")
    status=$(parse_yaml "$file" "status")
    as_a=$(parse_yaml "$file" "user_story.as_a")
    i_want=$(parse_yaml "$file" "user_story.i_want")
    
    case "$FORMAT" in
        ids)
            echo "$story_id"
            ;;
        json)
            cat << JSON
{"story_id":"$story_id","title":"$title","feature_id":"$feature_id","status":"$status","as_a":"$as_a","i_want":"$i_want","file":"$file"}
JSON
            ;;
        detailed)
            local total_criteria=$(count_criteria "$file")
            local completed_criteria=$(count_completed_criteria "$file")
            local so_that=$(parse_yaml "$file" "user_story.so_that")
            
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}$story_id${NC} - $title"
            echo -e "  ${YELLOW}Feature:${NC} $feature_id"
            echo -e "  ${YELLOW}Status:${NC} $status"
            echo -e "  ${YELLOW}Progress:${NC} $completed_criteria/$total_criteria criteria completed"
            echo ""
            echo -e "  ${YELLOW}As a:${NC} $as_a"
            echo -e "  ${YELLOW}I want:${NC} $i_want"
            echo -e "  ${YELLOW}So that:${NC} $so_that"
            echo ""
            ;;
        summary|*)
            local status_icon
            case "$status" in
                complete) status_icon="${GREEN}✓${NC}" ;;
                in-progress) status_icon="${YELLOW}●${NC}" ;;
                *) status_icon="${RED}○${NC}" ;;
            esac
            
            printf "%s %-10s %-8s %-40s %s\n" \
                "$status_icon" \
                "$story_id" \
                "$feature_id" \
                "$title" \
                "($status)"
            ;;
    esac
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--dir)
            STORIES_DIR="$2"
            shift 2
            ;;
        -a|--all)
            SHOW_ALL=true
            shift
            ;;
        -s|--status)
            FILTER_STATUS="$2"
            shift 2
            ;;
        -f|--feature)
            FILTER_FEATURE="$2"
            shift 2
            ;;
        -v|--verbose)
            FORMAT="detailed"
            shift
            ;;
        --format)
            FORMAT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Check if directory exists
if [[ ! -d "$STORIES_DIR" ]]; then
    echo -e "${RED}Error: Directory '$STORIES_DIR' not found${NC}" >&2
    echo "Run from project root or specify directory with -d" >&2
    exit 1
fi

# Find all YAML files
story_files=$(find "$STORIES_DIR" -name "*.yaml" -o -name "*.yml" | sort)

if [[ -z "$story_files" ]]; then
    echo -e "${YELLOW}No story files found in $STORIES_DIR${NC}"
    exit 0
fi

# Print header for summary format
if [[ "$FORMAT" == "summary" ]]; then
    echo -e "${BLUE}User Stories in $STORIES_DIR${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    printf "%-2s %-10s %-8s %-40s %s\n" "" "ID" "Feature" "Title" "Status"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

# Process each story file
count=0
while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    
    status=$(parse_yaml "$file" "status")
    feature_id=$(parse_yaml "$file" "feature_id")
    
    # Apply filters
    if [[ "$SHOW_ALL" == false && "$status" == "complete" ]]; then
        continue
    fi
    
    if [[ -n "$FILTER_STATUS" && "$status" != "$FILTER_STATUS" ]]; then
        continue
    fi
    
    if [[ -n "$FILTER_FEATURE" && "$feature_id" != "$FILTER_FEATURE" ]]; then
        continue
    fi
    
    # Format and display
    format_story "$file"
    ((count++))
done <<< "$story_files"

# Print footer
if [[ "$FORMAT" == "summary" ]]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Found ${GREEN}$count${NC} matching stories"
elif [[ "$FORMAT" == "detailed" ]]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Found ${GREEN}$count${NC} matching stories"
fi

