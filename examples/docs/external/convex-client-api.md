# Convex Client API LLM Reference

## Client Initialization

### JavaScript/TypeScript ConvexClient (Reactive)
```typescript
new ConvexClient(address: string, options?: ConvexClientOptions)
// Immediately initiates WebSocket connection
```

### JavaScript/TypeScript ConvexHttpClient (Stateless)
```typescript
new ConvexHttpClient(
  address: string,
  options?: {
    skipConvexDeploymentUrlCheck?: boolean,
    logger?: boolean | Logger,
    auth?: string
  }
)
```

### Swift ConvexClient
```swift
let convex = ConvexClient(deploymentUrl: "https://<domain>.convex.cloud")
// Single instance for application lifetime
```

### React ConvexReactClient
```typescript
new ConvexReactClient(deploymentUrl: string, options?: {
  expectAuth?: boolean  // Pause queries until user authenticated
})
```

## Query Operations

### JavaScript - One-time Query
```typescript
// ConvexClient
const result = await client.query(api.functionName, args)

// ConvexHttpClient
const result = await client.query(api.functionName, args)
```

### Swift - No direct one-time query method
Swift client only supports subscriptions and mutations/actions, no one-off queries.

### JavaScript - Query Subscription
```typescript
client.onUpdate(
  api.functionName,
  args,
  callback: (result) => void,
  onError?: (error) => void
)
```

### Swift - Query Subscription
```swift
func subscribe<T: Decodable>(
  to functionName: String,
  with args: [String: Any] = [:],
  yielding type: T.Type
) -> Publisher<T, Error>

// Usage
let publisher = convex.subscribe(
  to: "queryName",
  with: ["param": value],
  yielding: [MyType].self
)
```

## Mutation Operations

### JavaScript
```typescript
// ConvexClient & ConvexHttpClient
const result = await client.mutation(api.functionName, args, options?)
```

### Swift
```swift
func mutation<T>(
  _ functionName: String,
  with args: [String: Any] = [:]
) async throws -> T

// Usage
let result: Bool = try await convex.mutation(
  "mutationName",
  with: ["param": value]
)
```

## Action Operations

### JavaScript
```typescript
const result = await client.action(api.functionName, args)
```

### Swift
```swift
func action<T>(
  _ functionName: String,
  with args: [String: Any] = [:]
) async throws -> T
```

## Real-time Subscriptions

### JavaScript Subscription Lifecycle
```typescript
// Subscribe
const unsubscribe = client.onUpdate(query, args, callback, onError)

// Cleanup
unsubscribe()

// Connection state monitoring
client.subscribeToConnectionState(callback)
const state = client.connectionState()
```

### Swift Subscription Lifecycle
```swift
// In SwiftUI View
.task {
  let publisher = convex.subscribe(to: "query", yielding: [Type].self)
    .replaceError(with: [])
    .values

  for await result in publisher {
    self.data = result
  }
}
// Automatic cleanup when View/ObservableObject destroyed
```

## Swift-Specific Patterns

### SwiftUI Integration
```swift
struct MyView: View {
  @State private var data: [MyType] = []

  var body: some View {
    List(data, id: \.id) { item in
      Text(item.name)
    }
    .task {
      let stream = convex.subscribe(to: "query", yielding: [MyType].self)
        .replaceError(with: [])
        .values

      for await newData in stream {
        self.data = newData
      }
    }
  }
}
```

### Custom Types with Property Wrappers
```swift
struct BaseballTeam: Decodable {
  let name: String
  let uniformColors: [String]
  @ConvexInt var wins: Int        // For JavaScript BigInt
  @ConvexFloat var batting_avg: Double
  @OptionalConvexInt var losses: Int?

  // Handle field name conflicts
  enum CodingKeys: String, CodingKey {
    case name, uniformColors
    case wins, batting_avg = "battingAverage", losses
  }
}
```

## Authentication Patterns

### JavaScript Client Auth
```typescript
// Set auth token
client.setAuth(
  fetchToken: () => Promise<string>,
  onChange?: (isAuthenticated: boolean) => void
)

// Get current auth
const { token, claims } = client.getAuth()

// Clear auth
client.setAuth(null)
```

### HTTP Client Auth
```typescript
// Set token
httpClient.setAuth("jwt_token_string")

// Clear token
httpClient.clearAuth()
```

### React Client with Auth
```typescript
const convex = new ConvexReactClient(url, {
  expectAuth: true  // Pauses queries until authenticated
})
```

## Error Handling

### JavaScript Error Types
- Standard Promise rejections for async methods
- Optional error callback in `onUpdate`
- Connection state errors via `subscribeToConnectionState`

### Swift Error Types
```swift
do {
  try await convex.mutation("function", with: args)
} catch ClientError.ConvexError(let data) {
  let errorMessage = try! JSONDecoder().decode(String.self, from: Data(data.utf8))
} catch {
  // Handle other errors (ServerError, network errors)
}
```

## Critical Constraints

### Connection Management
- **ConvexClient**: Single WebSocket connection, automatically managed
- **ConvexHttpClient**: Stateful but not for long-lived sessions, don't share between server requests
- **Swift**: Connection managed by Rust client underneath, safe for main actor

### Type System Constraints
- **JavaScript**: Supports typed API generation via `api` object
- **Swift**: All custom types must conform to `Decodable`
- **Swift**: Numeric property wrappers must be declared as `var`, not `let`
- **Swift**: JavaScript `BigInt` requires `@ConvexInt` wrapper

### Payload Limitations
- No explicit payload size limits documented
- WebSocket connection required for real-time subscriptions
- HTTP client doesn't support subscriptions

### Platform Differences
- **Swift**: No one-time query method, only subscriptions
- **Swift**: Built on Rust client with Tokio runtime
- **JavaScript**: Multiple client types for different use cases
- **React**: Dedicated client with authentication flow integration

### Deployment URL Format
```
https://<deployment-name>.convex.cloud
```

### Version Information
Based on 2024 documentation. Swift client is newer addition to ecosystem.

## Type System Integration

### JavaScript Type Safety
```typescript
// Generated API object provides type safety
import { api } from "./_generated/api"

const result: MyType = await client.query(api.myFunction, args)
```

### Swift Generics Usage
```swift
// Type specified at call site
let data = convex.subscribe(to: "function", yielding: [CustomType].self)

// Return type inferred from async context
let success: Bool = try await convex.mutation("update", with: args)
```

### Cross-Platform Type Mapping
- **String**: Direct mapping
- **Number**: JavaScript → Swift Double (use @ConvexFloat)
- **BigInt**: JavaScript → Swift Int (use @ConvexInt)
- **Boolean**: Direct mapping
- **Arrays**: Direct mapping with element type conversion
- **Objects**: JavaScript Object → Swift Decodable struct