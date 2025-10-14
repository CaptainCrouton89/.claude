# Claude CLI OAuth Unified Authentication Changes

## Summary

Modified the Claude CLI to use OAuth authentication for all modes instead of requiring API keys for print mode (`-p`) and SDK usage. This provides unified authentication across interactive mode, print mode, and the TypeScript SDK.

## Problem

The CLI had inconsistent authentication:
- **Interactive mode** (`claude`): Used OAuth from keychain
- **Print mode** (`claude -p`): Required `ANTHROPIC_API_KEY` environment variable  
- **TypeScript SDK**: Also required API key since it spawns CLI in print-like mode

## Solution Overview

Modified the header generation function in `/Users/silasrhyneer/.claude/claude-cli/cli.js` to detect print mode and SDK usage, then prioritize OAuth tokens over API keys.

## How to Find and Modify the Function After CLI Updates

Since function names and line numbers change with CLI updates, use these contextual clues to locate the authentication function:

### Finding the Header Generation Function

**Search Pattern**: Look for a function that:
1. Has a single parameter 
2. Contains OAuth eligibility check (`if(someFunction())`)
3. Returns objects with `{headers: {...}}` structure
4. Contains both `Authorization: Bearer` and `"x-api-key"` header logic
5. Has `"anthropic-beta"` header generation

**Context Clues**:
- Contains OAuth token retrieval calls
- Has both OAuth and API key authentication branches
- Located near other authentication helper functions
- Contains Bearer token and x-api-key header generation

**Function Pattern**:
```javascript
function someFunction(A){
  if(oauthEligibilityFunction()){
    let Q=oauthTokenFunction();
    if(!Q?.accessToken)return{headers:{},error:"No OAuth token available"};
    return{headers:{Authorization:`Bearer ${Q.accessToken}`,"anthropic-beta":betaConstant}}
  }
  let B=apiKeyFunction(A);
  if(!B)return{headers:{},error:"No API key available"};
  return{headers:{"x-api-key":B}}
}
```

**Modification**: Add this logic at the **beginning** of the function:
```javascript
let isPrintMode=process.argv.includes("-p")||process.argv.includes("--print");
let isSDKMode=process.env.CLAUDE_CODE_ENTRYPOINT==="sdk-ts";
if(isPrintMode||isSDKMode){
  let oauthData=oauthTokenFunction(); // Use whatever the OAuth retrieval function is called
  if(oauthData&&oauthData.accessToken){
    return{headers:{Authorization:`Bearer ${oauthData.accessToken}`,"anthropic-beta":betaConstant}};
  }
}
```

## Key Principles for Future Updates

1. **Add at Function Beginning**: Always add the print/SDK mode detection at the start of the function
2. **Preserve Original Logic**: Keep all existing authentication logic intact
3. **Environment Variables**: `CLAUDE_CODE_ENTRYPOINT === "sdk-ts"` is set by the SDK
4. **Process Arguments**: `-p` and `--print` flags indicate print mode
5. **Return Early**: When OAuth is found for print/SDK mode, return immediately to avoid fallback logic

## How It Works

### Detection Logic

1. **Print Mode Detection**: `process.argv.includes("-p") || process.argv.includes("--print")`
2. **SDK Mode Detection**: `process.env.CLAUDE_CODE_ENTRYPOINT === "sdk-ts"`
   - The SDK sets this environment variable when spawning the CLI process

### Authentication Flow

When print mode or SDK mode is detected:

1. Function detects print/SDK mode at function start
2. Retrieves OAuth token from keychain 
3. Returns OAuth headers directly: `{headers: {Authorization: Bearer {token}, "anthropic-beta": constant}}`

## Files Modified

- **Primary File**: `/Users/silasrhyneer/.claude/claude-cli/cli.js`
- **Lines Added**: 4 lines of print/SDK mode detection logic
- **Approach**: Single function modification for unified authentication

## Testing Results

### Before Changes
```bash
$ node /Users/silasrhyneer/.claude/claude-cli/cli.js -p "what's 2+2?"
Error: Invalid API key · Fix external API key

$ node test-sdk-oauth.js
Error: Invalid API key
```

### After Changes
```bash
$ node /Users/silasrhyneer/.claude/claude-cli/cli.js -p "what's 2+2?"
4

$ node test-sdk-oauth.js
✅ SDK OAuth test completed successfully!
```

## Benefits

1. **Unified Authentication**: All CLI modes now use OAuth from keychain
2. **No API Key Management**: Users don't need to set/manage `ANTHROPIC_API_KEY`
3. **Enhanced Security**: Tokens stored in encrypted keychain vs plain text environment variables
4. **Consistent Experience**: Same authentication across interactive, print, and SDK modes
5. **Backward Compatibility**: Interactive mode continues working unchanged

## Token Details

**OAuth Access Token**:
- Format: `sk-ant-oat01-...` (108 characters)
- Storage: macOS Keychain (`Claude Code-credentials` service)
- Headers: `Authorization: Bearer {token}`
- Expires: September 19, 2025
- Scopes: `user:inference`, `user:profile`

## Implementation Notes

- **Minimal Changes**: Only 4 lines added to one function
- **No Breaking Changes**: All existing functionality preserved
- **Error Handling**: Maintained existing error handling patterns
- **Code Style**: Followed existing minified code conventions