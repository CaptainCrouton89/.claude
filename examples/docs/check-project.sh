#!/bin/bash

# check-project.sh - Comprehensive project documentation checker
# Usage: ./check-project.sh [options]
# Run from project root or docs directory. Checks all documentation files for completeness and traceability.

# Detect if running from docs directory or project root
resolve_docs_dir() {
    local current_dir="$(pwd)"

    # Check if current directory is "docs"
    if [[ "$(basename "$current_dir")" == "docs" && -f "$current_dir/product-requirements.yaml" ]]; then
        echo "$current_dir"
        return 0
    fi

    # Check if docs directory exists in current location
    if [[ -d "$current_dir/docs" && -f "$current_dir/docs/product-requirements.yaml" ]]; then
        echo "$current_dir/docs"
        return 0
    fi

    # Default to docs (will fail gracefully if not found)
    echo "docs"
    return 1
}

# Default values
DOCS_DIR="$(resolve_docs_dir)"
CHECK_LINKS=true
VERBOSE=false
FORMAT="summary"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Counters
total_errors=0
total_warnings=0
total_checks=0

# Help text
show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Check project documentation for completeness, consistency, and traceability.

OPTIONS:
    -h, --help              Show this help message
    -d, --dir DIR           Documentation directory (default: docs)
    -v, --verbose           Show verbose output
    --no-links              Skip checking cross-references
    --format FORMAT         Output format: summary|detailed|json (default: summary)

CHECKS PERFORMED:
    • PRD (Product Requirements) completeness
    • Feature specifications status
    • User stories coverage
    • User flows definition
    • API contracts presence
    • Data plan completeness
    • System design documentation
    • Design specifications
    • Cross-reference validation (feature IDs, story IDs)

EXAMPLES:
    $(basename "$0")                          # Check all documentation
    $(basename "$0") -v                       # Verbose output
    $(basename "$0") --no-links               # Skip link checking
    $(basename "$0") --format detailed        # Detailed report

EOF
}

# Logging functions
log_check() {
    ((total_checks++))
    [[ "$VERBOSE" == true ]] && echo -e "${CYAN}[CHECK]${NC} $1"
}

log_pass() {
    [[ "$VERBOSE" == true ]] && echo -e "${GREEN}[PASS]${NC} $1"
}

log_warn() {
    ((total_warnings++))
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    ((total_errors++))
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info() {
    [[ "$VERBOSE" == true ]] && echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if file exists
check_file_exists() {
    local file="$1"
    local label="$2"
    
    log_check "Checking for $label"
    
    if [[ -f "$file" ]]; then
        log_pass "$label found"
        return 0
    else
        log_error "$label missing: $file"
        return 1
    fi
}

# Check YAML field
check_yaml_field() {
    local file="$1"
    local field="$2"
    local label="$3"

    if [[ ! -f "$file" ]]; then
        return 1
    fi

    # Match field at any indentation level
    local value=$(awk -v field="$field" '
        $0 ~ "^[ \t]*" field ":" {
            # Extract value after field name and colon
            sub("^[ \t]*" field ":[ \t]*", "")
            # Remove surrounding quotes if present
            gsub(/^"/, ""); gsub(/"$/, "")
            # Trim whitespace
            gsub(/^[ \t]+/, ""); gsub(/[ \t]+$/, "")
            print
            exit
        }
    ' "$file")

    if [[ -z "$value" || "$value" == '""' ]]; then
        log_warn "$label: '$field' is empty in $(basename "$file")"
        return 1
    fi

    return 0
}

# Check PRD
check_prd() {
    local prd_file="$DOCS_DIR/product-requirements.yaml"
    
    echo -e "\n${BLUE}━━━ Product Requirements Document ━━━${NC}"
    
    if ! check_file_exists "$prd_file" "Product Requirements Document"; then
        return
    fi
    
    # Check required fields
    check_yaml_field "$prd_file" "project_name" "PRD"
    check_yaml_field "$prd_file" "summary" "PRD"
    check_yaml_field "$prd_file" "goal" "PRD"
    
    # Count features
    local feature_count=$(grep -c "^  - id:" "$prd_file" 2>/dev/null || echo "0")
    log_info "Features defined in PRD: $feature_count"
    
    if [[ $feature_count -eq 0 ]]; then
        log_warn "No features defined in PRD"
    fi
}

# Check User Flows
check_user_flows() {
    local flows_dir="$DOCS_DIR/user-flows"
    
    echo -e "\n${BLUE}━━━ User Flows ━━━${NC}"
    
    if [[ ! -d "$flows_dir" ]]; then
        log_error "User flows directory missing: $flows_dir"
        return
    fi
    
    local flow_files=$(find "$flows_dir" -name "*.yaml" -o -name "*.yml" 2>/dev/null)
    local flow_count=$(echo "$flow_files" | grep -c . || echo "0")
    
    log_info "User flow files found: $flow_count"
    
    if [[ $flow_count -eq 0 ]]; then
        log_warn "No user flow files found"
        return
    fi
    
    # Check each flow file
    while IFS= read -r flow_file; do
        [[ -z "$flow_file" ]] && continue
        
        local flow_name=$(basename "$flow_file" .yaml)
        log_check "Checking flow: $flow_name"
        
        local primary_count=$(grep -c "^  - name:" "$flow_file" 2>/dev/null || echo "0")
        if [[ $primary_count -eq 0 ]]; then
            log_warn "No flows defined in $flow_name"
        fi
    done <<< "$flow_files"
}

# Check User Stories
check_user_stories() {
    local stories_dir="$DOCS_DIR/user-stories"
    
    echo -e "\n${BLUE}━━━ User Stories ━━━${NC}"
    
    if [[ ! -d "$stories_dir" ]]; then
        log_error "User stories directory missing: $stories_dir"
        return
    fi
    
    local story_files=$(find "$stories_dir" -name "*.yaml" -o -name "*.yml" 2>/dev/null)
    local story_count=$(echo "$story_files" | grep -c . || echo "0")
    
    log_info "User story files found: $story_count"
    
    if [[ $story_count -eq 0 ]]; then
        log_warn "No user story files found"
        return
    fi
    
    local incomplete_count=0
    local complete_count=0
    
    # Check each story
    while IFS= read -r story_file; do
        [[ -z "$story_file" ]] && continue
        
        local story_id=$(awk '/^story_id:/ {print $2}' "$story_file")
        local status=$(awk '/^status:/ {print $2}' "$story_file")
        
        case "$status" in
            complete) ((complete_count++)) ;;
            *) ((incomplete_count++)) ;;
        esac
        
        # Check for empty user story fields
        local as_a=$(awk '/^  as_a:/ {print $2}' "$story_file")
        if [[ -z "$as_a" || "$as_a" == '""' || "$as_a" == '"[type' ]]; then
            log_warn "Story $story_id has incomplete user story definition"
        fi
    done <<< "$story_files"
    
    log_info "Complete stories: $complete_count"
    log_info "Incomplete stories: $incomplete_count"
}

# Check Feature Specs
check_feature_specs() {
    local features_dir="$DOCS_DIR/feature-specs"
    
    echo -e "\n${BLUE}━━━ Feature Specifications ━━━${NC}"
    
    if [[ ! -d "$features_dir" ]]; then
        log_error "Feature specs directory missing: $features_dir"
        return
    fi
    
    local feature_files=$(find "$features_dir" -name "*.yaml" -o -name "*.yml" 2>/dev/null)
    local feature_count=$(echo "$feature_files" | grep -c . || echo "0")
    
    log_info "Feature spec files found: $feature_count"
    
    if [[ $feature_count -eq 0 ]]; then
        log_warn "No feature spec files found"
        return
    fi
    
    local incomplete_count=0
    local complete_count=0
    
    # Check each feature
    while IFS= read -r feature_file; do
        [[ -z "$feature_file" ]] && continue
        
        local feature_id=$(awk '/^feature_id:/ {print $2}' "$feature_file")
        local status=$(awk '/^status:/ {print $2}' "$feature_file")
        
        case "$status" in
            complete) ((complete_count++)) ;;
            *) ((incomplete_count++)) ;;
        esac
        
        # Check for summary
        check_yaml_field "$feature_file" "summary" "Feature $feature_id"
    done <<< "$feature_files"
    
    log_info "Complete features: $complete_count"
    log_info "Incomplete features: $incomplete_count"
}

# Check System Design
check_system_design() {
    local system_file="$DOCS_DIR/system-design.yaml"
    
    echo -e "\n${BLUE}━━━ System Design ━━━${NC}"
    
    if ! check_file_exists "$system_file" "System Design"; then
        return
    fi
    
    check_yaml_field "$system_file" "goal" "System Design"
    
    # Check for tech stack
    local has_tech_stack=$(grep -c "^tech_stack:" "$system_file" 2>/dev/null || echo "0")
    if [[ $has_tech_stack -eq 0 ]]; then
        log_warn "No tech stack defined in system design"
    fi
}

# Check API Contracts
check_api_contracts() {
    local api_file="$DOCS_DIR/api-contracts.yaml"
    
    echo -e "\n${BLUE}━━━ API Contracts ━━━${NC}"
    
    if ! check_file_exists "$api_file" "API Contracts"; then
        return
    fi
    
    # Count endpoints
    local endpoint_count=$(grep -c "^  /.*:$" "$api_file" 2>/dev/null || echo "0")
    log_info "API endpoints defined: $endpoint_count"
    
    if [[ $endpoint_count -eq 0 ]]; then
        log_warn "No API endpoints defined"
    fi
}

# Check Data Plan
check_data_plan() {
    local data_file="$DOCS_DIR/data-plan.yaml"
    
    echo -e "\n${BLUE}━━━ Data Plan ━━━${NC}"
    
    if ! check_file_exists "$data_file" "Data Plan"; then
        return
    fi
    
    # Check for data sources
    local has_sources=$(grep -c "^data_sources:" "$data_file" 2>/dev/null || echo "0")
    if [[ $has_sources -gt 0 ]]; then
        local source_count=$(grep -c "^  - source:" "$data_file" 2>/dev/null || echo "0")
        log_info "Data sources defined: $source_count"
    fi
}

# Check Design Spec
check_design_spec() {
    local design_file="$DOCS_DIR/design-spec.yaml"
    
    echo -e "\n${BLUE}━━━ Design Specification ━━━${NC}"
    
    if ! check_file_exists "$design_file" "Design Specification"; then
        return
    fi
    
    check_yaml_field "$design_file" "design_goals" "Design Spec"
}

# Check cross-references
check_cross_references() {
    if [[ "$CHECK_LINKS" != true ]]; then
        return
    fi
    
    echo -e "\n${BLUE}━━━ Cross-Reference Validation ━━━${NC}"
    
    # Get all feature IDs from PRD
    local prd_features=$(grep "^  - id:" "$DOCS_DIR/product-requirements.yaml" 2>/dev/null | awk '{print $3}' | tr -d '"')
    
    if [[ -z "$prd_features" ]]; then
        log_warn "No features in PRD to cross-reference"
        return
    fi
    
    # Check if features have specs
    while IFS= read -r feature_id; do
        [[ -z "$feature_id" ]] && continue
        
        log_check "Checking if $feature_id has specification"
        
        local feature_file=$(grep -l "^feature_id: $feature_id" "$DOCS_DIR/feature-specs"/*.yaml 2>/dev/null | head -1)
        
        if [[ -z "$feature_file" ]]; then
            log_warn "Feature $feature_id (in PRD) has no specification file"
        else
            log_pass "Feature $feature_id has specification"
        fi
    done <<< "$prd_features"
    
    # Check if stories reference valid features
    if [[ -d "$DOCS_DIR/user-stories" ]]; then
        local story_files=$(find "$DOCS_DIR/user-stories" -name "*.yaml" 2>/dev/null)
        
        while IFS= read -r story_file; do
            [[ -z "$story_file" ]] && continue
            
            local story_id=$(awk '/^story_id:/ {print $2}' "$story_file")
            local feature_ref=$(awk '/^feature_id:/ {print $2}' "$story_file")
            
            if [[ -n "$feature_ref" && "$feature_ref" != "F-##" ]]; then
                if ! echo "$prd_features" | grep -q "^$feature_ref$"; then
                    log_warn "Story $story_id references unknown feature: $feature_ref"
                fi
            fi
        done <<< "$story_files"
    fi
}

# Generate summary
generate_summary() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Summary${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo -e "\n${YELLOW}Checks performed:${NC} $total_checks"
    
    if [[ $total_errors -eq 0 ]]; then
        echo -e "${GREEN}Errors:${NC} 0 ✓"
    else
        echo -e "${RED}Errors:${NC} $total_errors"
    fi
    
    if [[ $total_warnings -eq 0 ]]; then
        echo -e "${GREEN}Warnings:${NC} 0 ✓"
    else
        echo -e "${YELLOW}Warnings:${NC} $total_warnings"
    fi
    
    echo ""
    
    if [[ $total_errors -eq 0 && $total_warnings -eq 0 ]]; then
        echo -e "${GREEN}✓ All checks passed!${NC}"
        return 0
    elif [[ $total_errors -eq 0 ]]; then
        echo -e "${YELLOW}⚠ All checks passed with warnings${NC}"
        return 0
    else
        echo -e "${RED}✗ Some checks failed${NC}"
        return 1
    fi
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
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --no-links)
            CHECK_LINKS=false
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

# Main execution
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Project Documentation Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Documentation directory:${NC} $DOCS_DIR"
echo ""

# Check if docs directory exists
if [[ ! -d "$DOCS_DIR" ]]; then
    log_error "Documentation directory not found: $DOCS_DIR"
    log_error "Ensure you run this script from either:"
    log_error "  • Project root: cd /path/to/project && ./docs/check-project.sh"
    log_error "  • Docs directory: cd /path/to/project/docs && ./check-project.sh"
    exit 1
fi

# Run all checks
check_prd
check_user_flows
check_user_stories
check_feature_specs
check_system_design
check_api_contracts
check_data_plan
check_design_spec
check_cross_references

# Generate summary and exit
generate_summary
exit $?

