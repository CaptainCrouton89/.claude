# MCP Library

MCP (Model Context Protocol) servers extend Claude's capabilities by providing access to external tools, APIs, and data sources.

## Usage

Generate a custom .mcp.json file with selected MCP servers:

```bash
./generate-mcp-config.sh <mcp-name1> <mcp-name2> ...
```

Available MCPs:

- `boilerplate` - Basic MCP server template
- `maps-mcp` - Google Maps integration
- `google-image-search-mcp` - Image search via SERP API
- `mcp-reddit` - Reddit integration
- `images` - Image generation and editing
- `videos` - Video generation and editing
- `speech` - Speech synthesis and transcription
- `sql` - Supabase database integration
- `scrape` - Web scraping
- `perplexity` - Perplexity API integration for search
- `static-analysis` - Code analysis and linting tools
- `zen` - Multi-model AI collaboration platform
- `context7` - Documentation search tool
