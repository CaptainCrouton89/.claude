#!/bin/bash

# list-apis.sh - List and query API endpoints from OpenAPI specs
# Usage: ./list-apis.sh [options]
# Run from project root. Scans docs/api-contracts.yaml by default.

# Default values
API_FILE="docs/api-contracts.yaml"
FORMAT="summary"
FILTER_METHOD=""
FILTER_PATH=""

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

List and filter API endpoints from OpenAPI specification.

OPTIONS:
    -h, --help              Show this help message
    -f, --file FILE         API contract file (default: docs/api-contracts.yaml)
    -m, --method METHOD     Filter by HTTP method (GET|POST|PUT|DELETE|PATCH)
    -p, --path PATTERN      Filter paths containing pattern
    --format FORMAT         Output format: summary|detailed|curl|markdown|postman (default: summary)
    --base-url URL          Base URL for curl commands (default: http://localhost:3000)

EXAMPLES:
    $(basename "$0")                          # List all endpoints
    $(basename "$0") -m GET                   # List only GET endpoints
    $(basename "$0") -p users                 # List endpoints containing "users"
    $(basename "$0") --format detailed        # Show detailed information
    $(basename "$0") --format curl            # Generate curl commands
    $(basename "$0") --format markdown        # Generate markdown documentation

EOF
}

# Parse YAML for OpenAPI structure
get_api_info() {
    local file="$1"
    
    awk '
        /^info:/ { in_info = 1; next }
        in_info && /^  title:/ { title = $0; gsub(/^  title: /, "", title); gsub(/"/, "", title) }
        in_info && /^  version:/ { version = $0; gsub(/^  version: /, "", version); gsub(/"/, "", version) }
        in_info && /^[a-z]+:/ && !/^  / { in_info = 0 }
        END { print title "|" version }
    ' "$file"
}

# Extract all endpoints
get_endpoints() {
    local file="$1"
    
    awk '
        BEGIN { current_path = ""; in_paths = 0 }
        /^paths:/ { in_paths = 1; next }
        in_paths && /^  \/.*:$/ {
            current_path = $1
            gsub(/:$/, "", current_path)
            gsub(/^  /, "", current_path)
            next
        }
        in_paths && /^    (get|post|put|delete|patch|options|head):$/ {
            method = $1
            gsub(/:$/, "", method)
            gsub(/^    /, "", method)
            # Read next lines for summary and description
            summary = ""
            description = ""
            responses = ""
            getline
            while ($0 ~ /^      /) {
                if ($0 ~ /^      summary:/) {
                    summary = $0
                    gsub(/^      summary: /, "", summary)
                    gsub(/"/, "", summary)
                }
                if ($0 ~ /^      description:/) {
                    description = $0
                    gsub(/^      description: /, "", description)
                    gsub(/"/, "", description)
                }
                if ($0 ~ /^      responses:/) {
                    getline
                    if ($0 ~ /^        "?[0-9]+/) {
                        responses = $1
                        gsub(/"/, "", responses)
                        gsub(/:$/, "", responses)
                        gsub(/^        /, "", responses)
                    }
                }
                if ($0 !~ /^      / && $0 !~ /^        /) break
                getline
            }
            print method "|" current_path "|" summary "|" description "|" responses
        }
        in_paths && /^[a-z]+:/ && !/^  / { exit }
    ' "$file"
}

# Format HTTP method with color
format_method() {
    local method="$1"
    case "${method^^}" in
        GET) echo -e "${GREEN}GET   ${NC}" ;;
        POST) echo -e "${BLUE}POST  ${NC}" ;;
        PUT) echo -e "${YELLOW}PUT   ${NC}" ;;
        DELETE) echo -e "${RED}DELETE${NC}" ;;
        PATCH) echo -e "${CYAN}PATCH ${NC}" ;;
        *) echo -e "${NC}${method^^}${NC}" ;;
    esac
}

# Generate curl command
generate_curl() {
    local method="$1"
    local path="$2"
    local base_url="${3:-http://localhost:3000}"
    
    case "${method^^}" in
        GET)
            echo "curl -X GET \"${base_url}${path}\""
            ;;
        POST)
            echo "curl -X POST \"${base_url}${path}\" \\"
            echo "  -H \"Content-Type: application/json\" \\"
            echo "  -d '{\"key\": \"value\"}'"
            ;;
        PUT)
            echo "curl -X PUT \"${base_url}${path}\" \\"
            echo "  -H \"Content-Type: application/json\" \\"
            echo "  -d '{\"key\": \"value\"}'"
            ;;
        DELETE)
            echo "curl -X DELETE \"${base_url}${path}\""
            ;;
        PATCH)
            echo "curl -X PATCH \"${base_url}${path}\" \\"
            echo "  -H \"Content-Type: application/json\" \\"
            echo "  -d '{\"key\": \"value\"}'"
            ;;
    esac
}

# Format output
format_endpoint() {
    local method="$1"
    local path="$2"
    local summary="$3"
    local description="$4"
    local responses="$5"
    
    # Apply filters
    if [[ -n "$FILTER_METHOD" && "${method^^}" != "${FILTER_METHOD^^}" ]]; then
        return 1
    fi
    
    if [[ -n "$FILTER_PATH" && ! "$path" =~ $FILTER_PATH ]]; then
        return 1
    fi
    
    case "$FORMAT" in
        curl)
            generate_curl "$method" "$path" "$BASE_URL"
            echo ""
            ;;
        markdown)
            echo "### ${method^^} \`${path}\`"
            [[ -n "$summary" ]] && echo "$summary"
            [[ -n "$description" ]] && echo -e "\n$description"
            [[ -n "$responses" ]] && echo -e "\n**Response:** $responses"
            echo ""
            ;;
        postman)
            cat << JSON
{
  "name": "${summary:-${method^^} ${path}}",
  "request": {
    "method": "${method^^}",
    "header": [],
    "url": {
      "raw": "{{base_url}}${path}",
      "host": ["{{base_url}}"],
      "path": [$(echo "$path" | sed 's/\//","/g' | sed 's/^,"//' | sed 's/",$/"/')]
    }
  }
},
JSON
            ;;
        detailed)
            echo -e "$(format_method "$method") ${CYAN}${path}${NC}"
            [[ -n "$summary" ]] && echo -e "  ${YELLOW}Summary:${NC} $summary"
            [[ -n "$description" ]] && echo -e "  ${YELLOW}Description:${NC} $description"
            [[ -n "$responses" ]] && echo -e "  ${YELLOW}Responses:${NC} $responses"
            echo ""
            ;;
        summary|*)
            local display_summary="${summary:-No description}"
            printf "$(format_method "$method") %-40s %s\n" "$path" "${display_summary:0:60}"
            ;;
    esac
    
    return 0
}

# Parse command line arguments
BASE_URL="http://localhost:3000"
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--file)
            API_FILE="$2"
            shift 2
            ;;
        -m|--method)
            FILTER_METHOD="$2"
            shift 2
            ;;
        -p|--path)
            FILTER_PATH="$2"
            shift 2
            ;;
        --format)
            FORMAT="$2"
            shift 2
            ;;
        --base-url)
            BASE_URL="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Check if file exists
if [[ ! -f "$API_FILE" ]]; then
    echo -e "${RED}Error: File '$API_FILE' not found${NC}" >&2
    echo "Run from project root or specify file with -f" >&2
    exit 1
fi

# Get API info
api_info=$(get_api_info "$API_FILE")
api_title=$(echo "$api_info" | cut -d'|' -f1)
api_version=$(echo "$api_info" | cut -d'|' -f2)

# Print header
if [[ "$FORMAT" == "summary" || "$FORMAT" == "detailed" ]]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}${api_title} v${api_version}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
elif [[ "$FORMAT" == "markdown" ]]; then
    echo "# ${api_title} v${api_version}"
    echo ""
elif [[ "$FORMAT" == "postman" ]]; then
    echo "{"
    echo "  \"info\": {"
    echo "    \"name\": \"${api_title}\","
    echo "    \"schema\": \"https://schema.getpostman.com/json/collection/v2.1.0/collection.json\""
    echo "  },"
    echo "  \"item\": ["
fi

# Get and format endpoints
count=0
endpoints=$(get_endpoints "$API_FILE")

while IFS='|' read -r method path summary description responses; do
    [[ -z "$method" ]] && continue
    
    if format_endpoint "$method" "$path" "$summary" "$description" "$responses"; then
        ((count++))
    fi
done <<< "$endpoints"

# Print footer
if [[ "$FORMAT" == "summary" || "$FORMAT" == "detailed" ]]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Found ${GREEN}$count${NC} endpoint(s)"
elif [[ "$FORMAT" == "postman" ]]; then
    echo "  ]"
    echo "}"
fi

