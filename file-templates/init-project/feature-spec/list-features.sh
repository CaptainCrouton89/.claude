#!/bin/bash

# list-features.sh - List feature specifications with metadata and filtering options
# Usage: ./list-features.sh [options]
# Run from project root. Scans docs/feature-specs by default.

# Default values
FEATURES_DIR="docs/feature-specs"
SHOW_ALL=false
FORMAT="summary"
FILTER_STATUS=""
SORT_BY="id"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Help text
show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

List and filter feature specifications from the project documentation.

OPTIONS:
    -h, --help              Show this help message
    -d, --dir DIR           Features directory (default: docs/feature-specs)
    -a, --all               Show all features (default: only incomplete)
    -s, --status STATUS     Filter by status (incomplete|complete|in-progress)
    -v, --verbose           Show detailed information
    --sort FIELD            Sort by: id|status|title (default: id)
    --format FORMAT         Output format: summary|detailed|tree|json|stats (default: summary)

EXAMPLES:
    $(basename "$0")                          # List all incomplete features
    $(basename "$0") -a                       # List all features
    $(basename "$0") -s in-progress           # List in-progress features
    $(basename "$0") --format detailed        # Show detailed information
    $(basename "$0") --format tree            # Show features with their components
    $(basename "$0") --format stats           # Show statistics summary
    $(basename "$0") --sort title             # Sort by title instead of ID

EOF
}

# Parse YAML value
parse_yaml() {
    local file="$1"
    local key="$2"
    
    awk -v key="$key" '
        /^[a-z_]+:/ && $1 == key":" {
            gsub(/^[a-z_]+: /, "")
            gsub(/^"/, ""); gsub(/"$/, "")
            print
            exit
        }
    ' "$file"
}

# Parse nested YAML value
parse_nested_yaml() {
    local file="$1"
    local parent="$2"
    local child="$3"
    
    awk -v parent="$parent" -v child="$child" '
        BEGIN { in_parent = 0 }
        /^[a-z_]+:/ && $1 == parent":" { in_parent = 1; next }
        in_parent && /^[a-z_]+:/ && !/^  / { exit }
        in_parent && /^  [a-z_]+:/ && $1 == "  "child":" {
            gsub(/^  [a-z_]+: /, "")
            gsub(/^"/, ""); gsub(/"$/, "")
            print
            exit
        }
    ' "$file"
}

# Count array items in a section
count_yaml_array_items() {
    local file="$1"
    local parent="$2"
    local child="$3"
    
    awk -v parent="$parent" -v child="$child" '
        BEGIN { in_parent = 0; in_child = 0; count = 0 }
        /^[a-z_]+:/ && $1 == parent":" { in_parent = 1; next }
        in_parent && /^[a-z_]+:/ && !/^  / { exit }
        in_parent && /^  [a-z_]+:/ && $1 == "  "child":" { in_child = 1; next }
        in_child && /^  [a-z_]+:/ { exit }
        in_child && /^    - / && !/^      / { count++ }
        END { print count }
    ' "$file"
}

# Count data structures
count_data_structures() {
    local file="$1"
    count_yaml_array_items "$file" "detailed_design" "data_structures"
}

# Count APIs
count_apis() {
    local file="$1"
    count_yaml_array_items "$file" "detailed_design" "apis"
}

# Count implementation notes
count_impl_notes() {
    local file="$1"
    awk '
        BEGIN { in_impl = 0; count = 0 }
        /^implementation_status:/ { in_impl = 1; next }
        in_impl && /^[a-z_]+:/ && !/^  / { exit }
        in_impl && /^  notes:/ { getline; while (/^    - /) { count++; getline } }
        END { print count }
    ' "$file"
}

# Get dependencies summary
get_dependencies() {
    local file="$1"
    local type="$2"  # libraries, services, or data_sources
    
    parse_nested_yaml "$file" "dependencies" "$type"
}

# Get API endpoints list
get_api_endpoints() {
    local file="$1"
    
    awk '
        BEGIN { in_apis = 0 }
        /^detailed_design:/ { in_design = 1; next }
        in_design && /^  apis:/ { in_apis = 1; next }
        in_apis && /^  [a-z_]+:/ && !/^    / { exit }
        in_apis && /^    - method:/ {
            method = $3
            gsub(/^"/, "", method); gsub(/"$/, "", method)
            getline
            if (/^      endpoint:/) {
                endpoint = $0
                gsub(/^      endpoint: /, "", endpoint)
                gsub(/^"/, "", endpoint); gsub(/"$/, "", endpoint)
                if (length(endpoint) > 0) print method " " endpoint
            }
        }
    ' "$file"
}

# Get integration points
get_integration_points() {
    local file="$1"
    
    awk '
        BEGIN { in_functional = 0; in_integration = 0 }
        /^functional_overview:/ { in_functional = 1; next }
        in_functional && /^[a-z_]+:/ && !/^  / { exit }
        in_functional && /^  integration_points:/ { in_integration = 1; next }
        in_integration && /^  [a-z_]+:/ { exit }
        in_integration && /^    - / {
            point = $0
            gsub(/^    - /, "", point)
            gsub(/^"/, "", point); gsub(/"$/, "", point)
            if (length(point) > 0) print point
        }
    ' "$file"
}

# Format output based on format type
format_feature() {
    local file="$1"
    local title feature_id status summary
    
    title=$(parse_yaml "$file" "title")
    feature_id=$(parse_yaml "$file" "feature_id")
    status=$(parse_yaml "$file" "status")
    summary=$(parse_yaml "$file" "summary")
    
    # Clean up title
    title=${title#Technical Specification - }
    [[ -z "$title" ]] && title=$(basename "$file" .yaml)
    
    case "$FORMAT" in
        json)
            local data_count=$(count_data_structures "$file")
            local api_count=$(count_apis "$file")
            cat << JSON
{"feature_id":"$feature_id","title":"$title","status":"$status","data_structures":$data_count,"apis":$api_count,"summary":"$summary","file":"$file"}
JSON
            ;;
        tree)
            local status_icon
            case "$status" in
                complete) status_icon="${GREEN}✓${NC}" ;;
                in-progress) status_icon="${YELLOW}●${NC}" ;;
                *) status_icon="${RED}○${NC}" ;;
            esac
            
            echo -e "${BLUE}$feature_id${NC} $status_icon $title"
            
            # Show summary if present
            if [[ -n "$summary" && "$summary" != '""' ]]; then
                echo -e "${CYAN}├─ Summary:${NC} $summary"
            fi
            
            # Show data structures
            local data_count=$(count_data_structures "$file")
            if [[ $data_count -gt 0 ]]; then
                echo -e "${CYAN}├─ Data Structures:${NC} $data_count"
            fi
            
            # Show APIs
            local api_count=$(count_apis "$file")
            if [[ $api_count -gt 0 ]]; then
                echo -e "${CYAN}├─ APIs:${NC}"
                local endpoints=$(get_api_endpoints "$file")
                while IFS= read -r endpoint; do
                    [[ -z "$endpoint" ]] && continue
                    echo -e "${CYAN}│  ├─${NC} $endpoint"
                done <<< "$endpoints"
            fi
            
            # Show integration points
            local integrations=$(get_integration_points "$file")
            if [[ -n "$integrations" ]]; then
                echo -e "${CYAN}├─ Integrations:${NC}"
                while IFS= read -r integration; do
                    [[ -z "$integration" ]] && continue
                    echo -e "${CYAN}│  └─${NC} $integration"
                done <<< "$integrations"
            fi
            
            # Show dependencies
            local libs=$(get_dependencies "$file" "libraries")
            local services=$(get_dependencies "$file" "services")
            if [[ -n "$libs" || -n "$services" ]]; then
                echo -e "${CYAN}└─ Dependencies:${NC}"
                [[ -n "$libs" ]] && echo -e "   ${CYAN}├─ Libraries:${NC} $libs"
                [[ -n "$services" ]] && echo -e "   ${CYAN}└─ Services:${NC} $services"
            fi
            
            echo ""
            ;;
        detailed)
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${BLUE}$feature_id${NC} - $title"
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            
            # Status
            local status_color
            case "$status" in
                complete) status_color="$GREEN" ;;
                in-progress) status_color="$YELLOW" ;;
                *) status_color="$RED" ;;
            esac
            echo -e "${YELLOW}Status:${NC} ${status_color}$status${NC}"
            
            # Summary
            if [[ -n "$summary" && "$summary" != '""' ]]; then
                echo -e "\n${YELLOW}Summary:${NC}"
                echo -e "  $summary"
            fi
            
            # Core logic
            local core_logic=$(parse_nested_yaml "$file" "functional_overview" "core_logic")
            if [[ -n "$core_logic" && "$core_logic" != '""' ]]; then
                echo -e "\n${YELLOW}Core Logic:${NC}"
                echo -e "  $core_logic"
            fi
            
            # Data structures
            local data_count=$(count_data_structures "$file")
            echo -e "\n${YELLOW}Data Structures:${NC} $data_count"
            
            # APIs
            local api_count=$(count_apis "$file")
            echo -e "${YELLOW}API Endpoints:${NC} $api_count"
            if [[ $api_count -gt 0 ]]; then
                local endpoints=$(get_api_endpoints "$file")
                while IFS= read -r endpoint; do
                    [[ -z "$endpoint" ]] && continue
                    echo -e "  ${CYAN}•${NC} $endpoint"
                done <<< "$endpoints"
            fi
            
            # Integration points
            local integrations=$(get_integration_points "$file")
            if [[ -n "$integrations" ]]; then
                echo -e "\n${YELLOW}Integration Points:${NC}"
                while IFS= read -r integration; do
                    [[ -z "$integration" ]] && continue
                    echo -e "  ${CYAN}•${NC} $integration"
                done <<< "$integrations"
            fi
            
            # Dependencies
            echo -e "\n${YELLOW}Dependencies:${NC}"
            local libs=$(get_dependencies "$file" "libraries")
            local services=$(get_dependencies "$file" "services")
            local data_sources=$(get_dependencies "$file" "data_sources")
            [[ -n "$libs" ]] && echo -e "  ${CYAN}Libraries:${NC} $libs"
            [[ -n "$services" ]] && echo -e "  ${CYAN}Services:${NC} $services"
            [[ -n "$data_sources" ]] && echo -e "  ${CYAN}Data Sources:${NC} $data_sources"
            
            # Implementation notes
            local notes_count=$(count_impl_notes "$file")
            if [[ $notes_count -gt 0 ]]; then
                echo -e "\n${YELLOW}Implementation Notes:${NC} $notes_count"
            fi
            
            echo ""
            ;;
        summary|*)
            local status_icon
            case "$status" in
                complete) status_icon="${GREEN}✓${NC}" ;;
                in-progress) status_icon="${YELLOW}●${NC}" ;;
                *) status_icon="${RED}○${NC}" ;;
            esac
            
            local data_count=$(count_data_structures "$file")
            local api_count=$(count_apis "$file")
            
            printf "%s %-8s %-45s %2dD %2dA %-15s\n" \
                "$status_icon" \
                "$feature_id" \
                "${title:0:45}" \
                "$data_count" \
                "$api_count" \
                "($status)"
            ;;
    esac
}

# Generate statistics
generate_stats() {
    local files="$1"
    local total=0 complete=0 in_progress=0 incomplete=0
    local total_data=0 total_apis=0
    
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        
        local status=$(parse_yaml "$file" "status")
        ((total++))
        
        case "$status" in
            complete) ((complete++)) ;;
            in-progress) ((in_progress++)) ;;
            *) ((incomplete++)) ;;
        esac
        
        local data_count=$(count_data_structures "$file")
        local api_count=$(count_apis "$file")
        ((total_data += data_count))
        ((total_apis += api_count))
    done <<< "$files"
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Feature Specifications Statistics${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Total Features:${NC} $total"
    echo -e "  ${GREEN}✓ Complete:${NC}     $complete"
    echo -e "  ${YELLOW}● In Progress:${NC}  $in_progress"
    echo -e "  ${RED}○ Incomplete:${NC}   $incomplete"
    echo ""
    echo -e "${YELLOW}Components:${NC}"
    echo -e "  ${CYAN}Data Structures:${NC} $total_data"
    echo -e "  ${CYAN}API Endpoints:${NC}   $total_apis"
    echo ""
    
    if [[ $total -gt 0 ]]; then
        local complete_pct=$((complete * 100 / total))
        local progress_pct=$(( (complete + in_progress) * 100 / total))
        
        echo -e "${YELLOW}Progress:${NC}"
        echo -e "  ${GREEN}Complete:${NC}      $complete_pct%"
        echo -e "  ${YELLOW}Started:${NC}       $progress_pct%"
    fi
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--dir)
            FEATURES_DIR="$2"
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
        -v|--verbose)
            FORMAT="detailed"
            shift
            ;;
        --sort)
            SORT_BY="$2"
            shift 2
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
if [[ ! -d "$FEATURES_DIR" ]]; then
    echo -e "${RED}Error: Directory '$FEATURES_DIR' not found${NC}" >&2
    echo "Run from project root or specify directory with -d" >&2
    exit 1
fi

# Find all YAML files
feature_files=$(find "$FEATURES_DIR" -name "*.yaml" -o -name "*.yml" | sort)

if [[ -z "$feature_files" ]]; then
    echo -e "${YELLOW}No feature files found in $FEATURES_DIR${NC}"
    exit 0
fi

# Handle stats format early
if [[ "$FORMAT" == "stats" ]]; then
    generate_stats "$feature_files"
    exit 0
fi

# Create temp file for sorting if needed
temp_file=""
if [[ "$SORT_BY" != "id" ]]; then
    temp_file=$(mktemp)
    trap "rm -f $temp_file" EXIT
    
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        
        case "$SORT_BY" in
            title)
                local title=$(parse_yaml "$file" "title")
                echo "$title|$file"
                ;;
            status)
                local status=$(parse_yaml "$file" "status")
                echo "$status|$file"
                ;;
        esac
    done <<< "$feature_files" | sort > "$temp_file"
fi

# Print header for summary format
if [[ "$FORMAT" == "summary" ]]; then
    echo -e "${BLUE}Feature Specifications in $FEATURES_DIR${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    printf "%-2s %-8s %-45s %s %s %-15s\n" "" "ID" "Title" "D" "A" "Status"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

# Process each feature file
count=0
if [[ -n "$temp_file" ]]; then
    while IFS='|' read -r sort_key file; do
        [[ -z "$file" ]] && continue
        
        status=$(parse_yaml "$file" "status")
        
        # Apply filters
        if [[ "$SHOW_ALL" == false && "$status" == "complete" ]]; then
            continue
        fi
        
        if [[ -n "$FILTER_STATUS" && "$status" != "$FILTER_STATUS" ]]; then
            continue
        fi
        
        # Format and display
        format_feature "$file"
        ((count++))
    done < "$temp_file"
else
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        
        status=$(parse_yaml "$file" "status")
        
        # Apply filters
        if [[ "$SHOW_ALL" == false && "$status" == "complete" ]]; then
            continue
        fi
        
        if [[ -n "$FILTER_STATUS" && "$status" != "$FILTER_STATUS" ]]; then
            continue
        fi
        
        # Format and display
        format_feature "$file"
        ((count++))
    done <<< "$feature_files"
fi

# Print footer
if [[ "$FORMAT" == "summary" ]]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Found ${GREEN}$count${NC} matching features (D=Data Structures, A=APIs)"
elif [[ "$FORMAT" == "detailed" || "$FORMAT" == "tree" ]]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Found ${GREEN}$count${NC} matching features"
fi

