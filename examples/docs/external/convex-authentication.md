# Convex Authentication LLM Reference

## Critical Function Signatures

### Authentication Context Access
```typescript
// In mutations, queries, actions
const identity = await ctx.auth.getUserIdentity();
// Returns: UserIdentity | null
// UserIdentity guaranteed fields: tokenIdentifier, subject, issuer
// Common additional fields: familyName, givenName, nickname, pictureUrl, email

// Helper pattern for user ID extraction
const userId = await getAuthUserId(ctx);
if (!userId) {
  throw new Error("Unauthenticated");
}
```

### HTTP Actions Authentication
```typescript
// Authorization header required: "Bearer <JWT_TOKEN>"
export const httpAction = httpAction(async (ctx, request) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return new Response("Unauthorized", { status: 401 });
  }
  // identity.tokenIdentifier, identity.subject available
});
```

## Configuration Shapes

### Auth0 Integration
```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.AUTH0_DOMAIN!,           // Required: your-tenant.auth0.com
      applicationID: process.env.AUTH0_CLIENT_ID!, // Required: Auth0 app client ID
    },
  ]
} satisfies AuthConfig;

// Required environment variables
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
```

### Swift Client Authentication
```swift
// Use ConvexClientWithAuth instead of ConvexClient
import ConvexAuth0

let convex = ConvexClientWithAuth(
    deploymentUrl: "https://your-deployment.convex.cloud",
    authProvider: Auth0Provider(/* Auth0 config */)
)

// AuthProvider protocol for custom OIDC providers
protocol AuthProvider {
    // Implementation details in convex-swift repo
}
```

### Convex Auth (Beta) Configuration
```typescript
// For React/React Native without external providers
// Supports: OAuth (GitHub, Google, Apple), Magic Links, Passwords
// No built-in UI components - copy from examples
// Next.js server components: under development
```

## Non-Obvious Behaviors

### Authentication State Management
- **Token Validation**: Convex validates JWT tokens on every function call
- **Session Persistence**: Client libraries handle token refresh automatically
- **WebSocket Authentication**: Tokens authenticate both HTTP and WebSocket connections
- **Unauthenticated Calls**: Functions receive `null` identity, don't throw by default

### Authorization Patterns
```typescript
// Manual authorization required - no automatic role checks
export const sensitiveOperation = mutation({
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return; // Fail silently or throw - your choice
    }

    // Resource ownership check
    const resource = await ctx.db.get(args.resourceId);
    if (resource?.userId !== userId) {
      throw new Error("Forbidden");
    }

    // Proceed with operation
  },
});
```

### Environment Variable Constraints
- **Development**: Use `.env.local` in project root
- **Production**: Set in Convex dashboard or hosting platform
- **Sync Requirement**: Run `npx convex dev` after auth config changes
- **Domain Format**: Auth0 domain must include `.auth0.com` suffix

### React Client Integration
```typescript
// ConvexProviderWithAuth0 replaces ConvexProvider
import { ConvexProviderWithAuth0 } from "convex/react-auth0";

// Authentication hooks
const { isLoading, isAuthenticated } = useConvexAuth();
// isLoading: true during initial auth check
// isAuthenticated: boolean after loading completes

// Conditional rendering components
<Authenticated>
  <App />
</Authenticated>
<Unauthenticated>
  <LoginButton />
</Unauthenticated>
```

### Swift Client Limitations
- **Auth0 Primary**: Most documented provider for Swift
- **Custom OIDC**: Possible via AuthProvider protocol
- **Library Dependency**: Requires separate `convex-swift-auth0` package
- **Example App**: Reference implementation in ios-convex-workout repo

### JWT Token Specifics
- **OpenID Connect**: Standard JWT format required
- **Token Claims**: Access via dot-notation for nested fields (Clerk custom claims)
- **Token Refresh**: Handled automatically by client libraries
- **Expiration**: Functions fail with authentication error on expired tokens

### Common Pitfalls
- **Missing Environment Variables**: Auth config fails silently in development
- **Role-Based Access**: No built-in RBAC - implement manually in functions
- **Error Handling**: Unauthenticated calls don't auto-throw - check explicitly
- **Production Deployment**: Separate Auth0 tenants recommended for dev/prod
- **HTTP vs WebSocket**: Same token authenticates both connection types

## Security Considerations

### Function-Level Security
```typescript
// Always check authentication first
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Authentication required");
}

// Validate resource ownership
const userId = identity.subject; // Use subject, not tokenIdentifier
if (resource.ownerId !== userId) {
  throw new Error("Access denied");
}
```

### Token Storage
- **Client-side**: Tokens stored in secure browser/app storage
- **Server-side**: Convex validates tokens, doesn't store them
- **Refresh Flow**: Handled by Auth0/provider, transparent to Convex

### Authorization Architecture
- **Three-tier**: Client → Convex Functions → Database
- **Manual Checks**: No automatic authorization framework
- **Granular Control**: Check permissions per resource/operation
- **Debugging**: Use `ctx.auth.getUserIdentity()` to inspect token claims

## Version: Beta (Convex Auth), Stable (Auth0/External Providers)

**Last Updated**: Based on docs.convex.dev as of 2024