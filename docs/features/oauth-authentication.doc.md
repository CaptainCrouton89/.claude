# OAuth Authentication

## Overview
Unified OAuth authentication system for Claude CLI that enables OAuth token usage across all modes (interactive, print, and SDK) instead of requiring API keys. This provides consistent authentication through encrypted keychain storage.

## User Perspective
Users can now run all Claude CLI commands using OAuth authentication without managing API keys:
- Interactive mode (`claude`) continues using OAuth seamlessly
- Print mode (`claude -p`) now uses OAuth instead of requiring `ANTHROPIC_API_KEY`
- TypeScript SDK calls automatically use OAuth when available
- All authentication credentials are stored securely in macOS Keychain

## Data Flow
1. User initiates CLI command (interactive, print mode, or SDK call)
2. CLI detects execution mode (interactive, print `-p`, or SDK environment)
3. Authentication function retrieves OAuth tokens from keychain storage
4. System validates OAuth tokens and throws errors if invalid or missing
5. Requests are sent with OAuth Bearer authorization headers
6. Response handling remains unchanged across all modes

## Implementation

### Key Files
- `claude-cli/cli.js` - Modified header generation function for unified OAuth support
- `test-sdk-oauth.js` - Testing script validating SDK OAuth functionality
- `test-custom-system-prompt.js` - Testing script for SDK custom prompts with OAuth
- `guides/cli-changes/oauth-unified-authentication.md` - Technical implementation guide
- `claude-cli-oauth-modification-guide.md` - Detailed modification documentation

### Authentication System
- OAuth tokens stored in macOS Keychain under service `Claude Code-credentials`
- Secondary storage at `~/.claude/.credentials.json` with 0600 permissions
- Access token format: `sk-ant-oat01-...` (108 characters)
- Refresh token format: `sk-ant-ort01-...` (108 characters)
- Token scopes: `user:inference`, `user:profile`
- System throws errors immediately if tokens are missing or invalid

## Configuration
- Environment variables: No configuration needed (removed `ANTHROPIC_API_KEY` requirement)
- Mode detection: Automatic based on CLI flags (`-p`, `--print`) and SDK environment variable
- Token retrieval: Automatic from keychain or JSON storage

## Usage Example
```bash
# Interactive mode (unchanged)
claude

# Print mode (now uses OAuth instead of API key)
claude -p "What's 2+2?"

# SDK usage (now uses OAuth)
node test-sdk-oauth.js
```

```javascript
// SDK usage with OAuth
import { query } from "./claude-cli/sdk.mjs";

const response = query({
  prompt: "Hello world",
  options: {
    pathToClaudeCodeExecutable: "/path/to/cli.js"
  }
});
```

## Testing
- Manual test: Run `claude -p "test query"` without setting `ANTHROPIC_API_KEY`
- Expected behavior: Command succeeds using OAuth authentication from keychain
- SDK test: Run `node test-sdk-oauth.js` to verify SDK OAuth integration
- Token validation: Access tokens should have `user:inference` scope and valid expiration

## Related Documentation
- Implementation guide: `guides/cli-changes/oauth-unified-authentication.md`
- Detailed modification: `claude-cli-oauth-modification-guide.md`
- Token extraction: `extracted-tokens.md`