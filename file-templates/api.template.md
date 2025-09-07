# API Documentation: [API/Endpoint Name]

## Overview
[Brief description of what this API/endpoint does]

## Endpoint Details
- **Path**: `/api/[endpoint]`
- **Method**: `[GET/POST/PUT/DELETE]`
- **Authentication**: [Required/Optional/Public]
- **Rate Limiting**: [If applicable]

## Request

### Headers
```http
Content-Type: application/json
Authorization: Bearer [token]
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| [param1] | [type] | [Yes/No] | [Description] |
| [param2] | [type] | [Yes/No] | [Description] |

### Body Schema
```typescript
interface RequestBody {
  [field]: [type];
  // ...
}
```

### Example Request
```typescript
const response = await fetch('/api/[endpoint]', {
  method: '[METHOD]',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    // request data
  })
});
```

## Response

### Success Response (200 OK)
```typescript
interface SuccessResponse {
  [field]: [type];
  // ...
}
```

### Error Responses
| Status Code | Description | Response Body |
|-------------|-------------|---------------|
| 400 | Bad Request | `{ error: "Invalid input" }` |
| 401 | Unauthorized | `{ error: "Authentication required" }` |
| 404 | Not Found | `{ error: "Resource not found" }` |
| 500 | Server Error | `{ error: "Internal server error" }` |

## Implementation Files
- Handler: `src/app/api/[endpoint]/route.ts`
- Service: `src/lib/services/[service].ts`
- Repository: `src/lib/repositories/[repo].ts`

## Database Operations
- Tables accessed: `[table_name]`
- RPC functions: `[function_name]()`

## Usage Examples

### Client-Side Usage
```typescript
// Using from a React component
[code example]
```

### Server Action Alternative
```typescript
// If available as server action
import { [actionName] } from '@/actions/[action]';
[usage example]
```

## Notes
- [Any special considerations]
- [Performance implications]
- [Security notes]