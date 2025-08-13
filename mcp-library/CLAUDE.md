# MCP Library

MCP (Model Context Protocol) servers extend Claude's capabilities by providing access to external tools, APIs, and data sources.

## Usage

Generate a custom .mcp.json file with selected MCP servers:

```bash
./generate-mcp-config.sh <mcp-name1> <mcp-name2> ...
```

Available MCPs:

- `boilerplate` - Basic MCP server template
- `google-mcp` - Google Maps, Finances, and Flights
- `mcp-reddit` - Reddit integration
- `images` - Image generation, google image search, and image editing
- `videos` - Video generation and editing
- `speech` - Speech synthesis and transcription
- `sql` - Supabase database integration
- `search` - Web search, scraping, and research tools
- `static-analysis` - Code analysis and linting tools
- `zen` - Multi-model AI collaboration platform
- `context7` - Documentation search tool
- `serena` - Powerful coding agent with semantic retrieval and editing capabilities
- `convex` - MCP for integrating with Convex data management
