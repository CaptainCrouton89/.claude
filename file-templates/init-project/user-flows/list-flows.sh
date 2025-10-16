#!/bin/bash

# list-flows.sh - List user flows with metadata and filtering options
# Usage: ./list-flows.sh [options]
# Run from project root or docs directory. Scans docs/user-flows by default.

# Detect if running from docs directory or project root
resolve_flows_dir() {
    local current_dir="$(pwd)"

    # Check if current directory is "docs"
    if [[ "$(basename "$current_dir")" == "docs" && -d "$current_dir/user-flows" ]]; then
        echo "$current_dir/user-flows"
        return 0
    fi

    # Check if docs directory exists in current location
    if [[ -d "$current_dir/docs/user-flows" ]]; then
        echo "$current_dir/docs/user-flows"
        return 0
    fi

    # Default (will fail gracefully if not found)
    echo "docs/user-flows"
    return 1
}

# Default values
FLOWS_DIR="$(resolve_flows_dir)"
SHOW_ALL=true
FORMAT="summary"
FILTER_PERSONA=""

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

List and filter user flows from the project documentation.

OPTIONS:
    -h, --help              Show this help message
    -d, --dir DIR           Flows directory (default: docs/user-flows)
    -p, --persona PERSONA   Filter by persona name
    -v, --verbose           Show detailed information
    --format FORMAT         Output format: summary|detailed|tree|json (default: summary)

EXAMPLES:
    $(basename "$0")                          # List all flows
    $(basename "$0") -p "Admin User"          # List flows for Admin User persona
    $(basename "$0") --format detailed        # Show detailed information
    $(basename "$0") --format tree            # Show flows as a tree structure
    $(basename "$0") --format json            # Show JSON output

EOF
}

# Parse YAML value (simple parser for our use case)
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

# Parse YAML array
parse_yaml_array() {
    local file="$1"
    local key="$2"
    
    awk -v key="$key" '
        BEGIN { in_array = 0 }
        /^[a-z_]+:/ && $1 == key":" { in_array = 1; next }
        in_array && /^[a-z_]+:/ { exit }
        in_array && /^  - / {
            gsub(/^  - /, "")
            gsub(/^"/, ""); gsub(/"$/, "")
            if (length($0) > 0) print
        }
    ' "$file"
}

# Count primary flows
count_primary_flows() {
    local file="$1"
    awk '
        BEGIN { count = 0; in_primary = 0 }
        /^primary_flows:/ { in_primary = 1; next }
        in_primary && /^[a-z_]+:/ { exit }
        in_primary && /^  - name:/ { count++ }
        END { print count }
    ' "$file"
}

# Count secondary flows
count_secondary_flows() {
    local file="$1"
    awk '
        BEGIN { count = 0; in_secondary = 0 }
        /^secondary_flows:/ { in_secondary = 1; next }
        in_secondary && /^[a-z_]+:/ { exit }
        in_secondary && /^  - name:/ { count++ }
        END { print count }
    ' "$file"
}

# Get flow names
get_flow_names() {
    local file="$1"
    local flow_type="$2"  # primary_flows or secondary_flows
    
    awk -v type="$flow_type" '
        BEGIN { in_flows = 0 }
        $0 ~ "^"type":" { in_flows = 1; next }
        in_flows && /^[a-z_]+:/ { exit }
        in_flows && /^  - name:/ {
            gsub(/^  - name: /, "")
            gsub(/^"/, ""); gsub(/"$/, "")
            if (length($0) > 0) print
        }
    ' "$file"
}

# Get flow details
get_flow_details() {
    local file="$1"
    local flow_type="$2"
    
    awk -v type="$flow_type" '
        BEGIN { in_flows = 0; flow_num = 0 }
        $0 ~ "^"type":" { in_flows = 1; next }
        in_flows && /^[a-z_]+:/ && !/^  / { exit }
        in_flows && /^  - name:/ {
            if (flow_num > 0) print "---FLOW_END---"
            flow_num++
            gsub(/^  - name: /, "")
            gsub(/^"/, ""); gsub(/"$/, "")
            print "name:" $0
            next
        }
        in_flows && /^    trigger:/ {
            gsub(/^    trigger: /, "")
            gsub(/^"/, ""); gsub(/"$/, "")
            print "trigger:" $0
        }
        in_flows && /^    outcome:/ {
            gsub(/^    outcome: /, "")
            gsub(/^"/, ""); gsub(/"$/, "")
            print "outcome:" $0
        }
        in_flows && /^    edge_cases:/ {
            gsub(/^    edge_cases: /, "")
            gsub(/^"/, ""); gsub(/"$/, "")
            print "edge_cases:" $0
        }
        in_flows && /^    steps:/ {
            getline
            step_count = 0
            while ($0 ~ /^      - /) {
                step_count++
                getline
            }
            print "steps:" step_count
        }
    ' "$file"
}

# Check if flow involves persona
flow_has_persona() {
    local file="$1"
    local persona="$2"
    
    if [[ -z "$persona" ]]; then
        return 0  # No filter, include all
    fi
    
    # Check if persona is in key_personas array
    parse_yaml_array "$file" "key_personas" | grep -qi "$persona"
}

# Format output based on format type
format_flow() {
    local file="$1"
    local title primary_count secondary_count
    
    title=$(parse_yaml "$file" "title")
    [[ -z "$title" || "$title" == "User Flows" ]] && title=$(basename "$file" .yaml)
    
    primary_count=$(count_primary_flows "$file")
    secondary_count=$(count_secondary_flows "$file")
    
    case "$FORMAT" in
        json)
            local personas=$(parse_yaml_array "$file" "key_personas" | paste -sd "," -)
            cat << JSON
{"title":"$title","primary_flows":$primary_count,"secondary_flows":$secondary_count,"personas":"$personas","file":"$file"}
JSON
            ;;
        tree)
            echo -e "${BLUE}📋 $title${NC}"
            
            # Show personas
            local personas=$(parse_yaml_array "$file" "key_personas")
            if [[ -n "$personas" ]]; then
                echo -e "${CYAN}├─ Personas:${NC}"
                while IFS= read -r persona; do
                    [[ -z "$persona" ]] && continue
                    echo -e "${CYAN}│  └─${NC} $persona"
                done <<< "$personas"
            fi
            
            # Show primary flows
            if [[ $primary_count -gt 0 ]]; then
                echo -e "${GREEN}├─ Primary Flows ($primary_count):${NC}"
                local flow_names=$(get_flow_names "$file" "primary_flows")
                local last_line=$(echo "$flow_names" | tail -1)
                while IFS= read -r flow_name; do
                    [[ -z "$flow_name" ]] && continue
                    if [[ "$flow_name" == "$last_line" && $secondary_count -eq 0 ]]; then
                        echo -e "${GREEN}│  └─${NC} $flow_name"
                    else
                        echo -e "${GREEN}│  ├─${NC} $flow_name"
                    fi
                done <<< "$flow_names"
            fi
            
            # Show secondary flows
            if [[ $secondary_count -gt 0 ]]; then
                echo -e "${YELLOW}└─ Secondary Flows ($secondary_count):${NC}"
                local flow_names=$(get_flow_names "$file" "secondary_flows")
                local last_line=$(echo "$flow_names" | tail -1)
                while IFS= read -r flow_name; do
                    [[ -z "$flow_name" ]] && continue
                    if [[ "$flow_name" == "$last_line" ]]; then
                        echo -e "${YELLOW}   └─${NC} $flow_name"
                    else
                        echo -e "${YELLOW}   ├─${NC} $flow_name"
                    fi
                done <<< "$flow_names"
            fi
            echo ""
            ;;
        detailed)
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${BLUE}📋 $title${NC}"
            echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            
            # Show personas
            local personas=$(parse_yaml_array "$file" "key_personas")
            if [[ -n "$personas" ]]; then
                echo -e "\n${CYAN}👥 Key Personas:${NC}"
                while IFS= read -r persona; do
                    [[ -z "$persona" ]] && continue
                    echo -e "  • $persona"
                done <<< "$personas"
            fi
            
            # Show primary flows with details
            if [[ $primary_count -gt 0 ]]; then
                echo -e "\n${GREEN}🔄 Primary Flows:${NC}"
                local flow_details=$(get_flow_details "$file" "primary_flows")
                local flow_data=""
                
                while IFS= read -r line; do
                    if [[ "$line" == "---FLOW_END---" ]]; then
                        # Process accumulated flow data
                        echo -e "\n${GREEN}  ▸${NC} $(echo "$flow_data" | awk -F: '/^name:/{print $2}')"
                        local trigger=$(echo "$flow_data" | awk -F: '/^trigger:/{print $2}')
                        local outcome=$(echo "$flow_data" | awk -F: '/^outcome:/{print $2}')
                        local steps=$(echo "$flow_data" | awk -F: '/^steps:/{print $2}')
                        
                        [[ -n "$trigger" ]] && echo -e "    ${YELLOW}Trigger:${NC} $trigger"
                        [[ -n "$steps" && "$steps" != "0" ]] && echo -e "    ${YELLOW}Steps:${NC} $steps"
                        [[ -n "$outcome" ]] && echo -e "    ${YELLOW}Outcome:${NC} $outcome"
                        
                        flow_data=""
                    else
                        flow_data+="$line"$'\n'
                    fi
                done <<< "$flow_details"
                
                # Process last flow
                if [[ -n "$flow_data" ]]; then
                    echo -e "\n${GREEN}  ▸${NC} $(echo "$flow_data" | awk -F: '/^name:/{print $2}')"
                    local trigger=$(echo "$flow_data" | awk -F: '/^trigger:/{print $2}')
                    local outcome=$(echo "$flow_data" | awk -F: '/^outcome:/{print $2}')
                    local steps=$(echo "$flow_data" | awk -F: '/^steps:/{print $2}')
                    
                    [[ -n "$trigger" ]] && echo -e "    ${YELLOW}Trigger:${NC} $trigger"
                    [[ -n "$steps" && "$steps" != "0" ]] && echo -e "    ${YELLOW}Steps:${NC} $steps"
                    [[ -n "$outcome" ]] && echo -e "    ${YELLOW}Outcome:${NC} $outcome"
                fi
            fi
            
            # Show secondary flows count
            if [[ $secondary_count -gt 0 ]]; then
                echo -e "\n${YELLOW}🔀 Secondary Flows: $secondary_count${NC}"
            fi
            
            echo ""
            ;;
        summary|*)
            local personas=$(parse_yaml_array "$file" "key_personas" | wc -l | tr -d ' ')
            local total_flows=$((primary_count + secondary_count))
            
            printf "${BLUE}%-40s${NC} %s %2d flows │ %d personas\n" \
                "$title" \
                "${GREEN}●${NC}" \
                "$total_flows" \
                "$personas"
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
            FLOWS_DIR="$2"
            shift 2
            ;;
        -p|--persona)
            FILTER_PERSONA="$2"
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
if [[ ! -d "$FLOWS_DIR" ]]; then
    echo -e "${RED}Error: Directory '$FLOWS_DIR' not found${NC}" >&2
    echo "Run from project root or specify directory with -d" >&2
    exit 1
fi

# Find all YAML files
flow_files=$(find "$FLOWS_DIR" -name "*.yaml" -o -name "*.yml" | sort)

if [[ -z "$flow_files" ]]; then
    echo -e "${YELLOW}No flow files found in $FLOWS_DIR${NC}"
    exit 0
fi

# Print header for summary format
if [[ "$FORMAT" == "summary" ]]; then
    echo -e "${BLUE}User Flows in $FLOWS_DIR${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

# Process each flow file
count=0
while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    
    # Apply persona filter
    if ! flow_has_persona "$file" "$FILTER_PERSONA"; then
        continue
    fi
    
    # Format and display
    format_flow "$file"
    ((count++))
done <<< "$flow_files"

# Print footer
if [[ "$FORMAT" == "summary" ]]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Found ${GREEN}$count${NC} flow file(s)"
elif [[ "$FORMAT" == "detailed" || "$FORMAT" == "tree" ]]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Found ${GREEN}$count${NC} flow file(s)"
fi

