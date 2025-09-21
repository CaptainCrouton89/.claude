# Claude CLI OAuth Modification Guide

## Problem Statement

The Claude CLI had two authentication modes:
- **Interactive mode** (`claude`): Used OAuth authentication from keychain
- **Print mode** (`claude -p`): Required `ANTHROPIC_API_KEY` environment variable

The user wanted to use OAuth authentication for both modes to avoid managing API keys.

## Investigation Process

### 1. Authentication Architecture Discovery

The CLI uses a sophisticated dual authentication system:

**Key Functions Identified:**
- `SF(A, B = {})`: Unified key/token resolution function
- `c3()`: OAuth token retrieval from keychain/storage
- `n2()`: OAuth eligibility checker
- `YS()`: Authentication source detection
- Header generation logic at line 371280

**Authentication Flow:**
```javascript
// OAuth Mode (interactive)
if (n2()) {
  // Use Bearer Authorization headers
  return {
    headers: {
      Authorization: `Bearer ${oauthData.accessToken}`,
      "anthropic-beta": ta,
    },
  };
}

// API Key Mode (print)
return { headers: { "x-api-key": apiKey } };
```

### 2. Token Storage Locations

**macOS (Primary):**
- **Location**: macOS Keychain 
- **Service**: `Claude Code-credentials`
- **Access**: `security find-generic-password -a $USER -w -s "Claude Code-credentials"`

**Fallback:**
- **Location**: `~/.claude/.credentials.json`
- **Format**: JSON with mode 0600 permissions

**Token Structure:**
```json
{
  "claudeAiOauth": {
    "accessToken": "sk-ant-oat01-...",
    "refreshToken": "sk-ant-ort01-...", 
    "expiresAt": 1758342764140,
    "scopes": ["user:inference", "user:profile"],
    "subscriptionType": "max"
  }
}
```

### 3. Root Cause Analysis

The issue was in two key functions:

**SF() Function (Line 371947):**
- Prioritized API keys over OAuth tokens
- No special handling for print mode
- Returned `{ key: null, source: "none" }` when no API key found

**n2() Function (Line 372279):**
- Only returned `true` for OAuth when `nU()` was `true`
- `nU()` returned `false` for print mode, blocking OAuth usage

## Solution Implementation

### 1. Modified SF() Function

Added print mode detection and OAuth prioritization:

```javascript
function SF(A, B = {}) {
  let isPrintMode = process.argv.includes("-p") || process.argv.includes("--print");
  
  // NEW: Prioritize OAuth for print mode
  if (isPrintMode) {
    let oauthData = c3();
    if (oauthData && oauthData.accessToken) {
      return { key: oauthData.accessToken, source: "claude.ai" };
    }
  }
  
  // Original logic continues...
}
```

### 2. Modified n2() Function

Added print mode OAuth eligibility check:

```javascript
function n2() {
  let isPrintMode = process.argv.includes("-p") || process.argv.includes("--print");
  
  // NEW: Enable OAuth for print mode
  if (isPrintMode) {
    let oauthData = c3();
    if (oauthData && oauthData.accessToken && uT(oauthData.scopes)) {
      return true;
    }
  }
  
  // Original logic continues...
}
```

### 3. Existing OAuth Header Logic

The header generation was already in place and worked correctly once the functions above were modified:

```javascript
if (n2()) {
  let Q = c3();
  if (!Q?.accessToken)
    return { headers: {}, error: "No OAuth token available" };
  return {
    headers: {
      Authorization: `Bearer ${Q.accessToken}`,
      "anthropic-beta": ta,
    },
  };
}
```

## Results

### Before Modification
```bash
# Failed - required API key
$ claude -p "test"
Error: Invalid API key · Fix external API key
```

### After Modification
```bash
# Success - uses OAuth
$ claude -p "test"
OAuth test successful!
```

## Authentication Flow Comparison

| Mode | Before | After |
|------|--------|--------|
| Interactive (`claude`) | OAuth from keychain | OAuth from keychain |
| Print (`claude -p`) | Required `ANTHROPIC_API_KEY` | OAuth from keychain |

## Token Security

**OAuth Access Token:**
- **Format**: `sk-ant-oat01-...` (108 characters)
- **Storage**: macOS Keychain (encrypted)
- **Headers**: `Authorization: Bearer {token}`
- **Expiration**: September 19, 2025
- **Scopes**: `user:inference`, `user:profile`

**vs API Key:**
- **Format**: `sk-ant-api03-...` (108 characters)  
- **Storage**: Environment variables (plain text)
- **Headers**: `x-api-key: {key}`
- **Expiration**: No automatic expiration

## Implementation Notes

### File Modifications
- **File**: `/Users/silasrhyneer/.claude/claude-cli/cli.js`
- **Lines Modified**: 371947-371976 (SF function), 372279-372290 (n2 function)
- **Backup Created**: `cli.js.backup-oauth-mod`

### Code Quality
- Maintained existing error handling
- Preserved all original functionality
- Added minimal code changes
- No breaking changes for interactive mode

### Testing Approach
1. Verified OAuth token extraction from keychain
2. Tested print mode with OAuth authentication
3. Confirmed interactive mode still works
4. Validated authentication headers

## Going Forward

The user can now:
1. Use `claude -p "query"` without setting `ANTHROPIC_API_KEY`
2. Remove API key environment variables
3. Rely entirely on OAuth authentication
4. Use the modified CLI by replacing the global `claude` command or creating aliases

This modification provides a unified authentication experience across both CLI modes while maintaining security through keychain storage.