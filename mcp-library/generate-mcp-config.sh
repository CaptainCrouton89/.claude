#!/bin/bash

# Path to the master MCP configuration
MASTER_CONFIG="/Users/silasrhyneer/.claude/mcp-library/.mcp.json"

# Check if master config exists
if [ ! -f "$MASTER_CONFIG" ]; then
    echo "Error: Master MCP config not found at $MASTER_CONFIG"
    exit 1
fi

# Check if arguments provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <mcp-name1> <mcp-name2> ..."
    echo "Available MCPs:"
    jq -r '.mcpServers | keys[]' "$MASTER_CONFIG" | sed 's/^/  - /'
    exit 1
fi

# Create output JSON with mcpServers object
echo '{"mcpServers":{}}' > .mcp.json

# Process each argument
for mcp_name in "$@"; do
    # Check if MCP exists in master config
    if jq -e ".mcpServers.\"$mcp_name\"" "$MASTER_CONFIG" > /dev/null 2>&1; then
        # Extract the MCP config and add it to output
        jq --arg name "$mcp_name" --argjson config "$(jq ".mcpServers.\"$mcp_name\"" "$MASTER_CONFIG")" \
           '.mcpServers[$name] = $config' .mcp.json > .mcp.json.tmp && mv .mcp.json.tmp .mcp.json
        echo "Added: $mcp_name"
    else
        echo "Warning: MCP '$mcp_name' not found in master config"
    fi
done

echo "Generated .mcp.json in current directory with $(jq '.mcpServers | length' .mcp.json) MCP server(s)"