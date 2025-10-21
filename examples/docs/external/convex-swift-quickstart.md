# Convex Swift Quickstart Reference

## Prerequisites

- Mac with Xcode installed
- Node.js and npm installed on development machine

## Installation & Setup

### 1. Create iOS Project
```swift
// Create new iOS project in Xcode:
// - iOS > App
// - Interface: SwiftUI
// - Language: Swift
```

### 2. Add Convex Swift Package
```
Package URL: https://github.com/get-convex/convex-swift
```
Add via Xcode: File → Add Package Dependencies

### 3. Backend Setup
```bash
# In project root directory
npm init -y
npm install convex

# Start Convex development server
npx convex dev
```

## Backend Configuration

### Sample Data Import
```bash
# Create sampleData.jsonl with todo items
echo '{"text": "Learn Convex", "isCompleted": false}
{"text": "Build an app", "isCompleted": false}' > sampleData.jsonl

# Import to tasks table
npx convex import --table tasks sampleData.jsonl
```

### Query Function (convex/tasks.ts)
```typescript
import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});
```

## Swift Implementation

### Data Model
```swift
struct Todo: Decodable {
    let _id: String
    let text: String
    let isCompleted: Bool
}
```

### ConvexClient Initialization
```swift
import Convex

let convex = ConvexClient(deploymentUrl: "YOUR_CONVEX_DEPLOYMENT_URL")
```

### Real-time SwiftUI View
```swift
struct ContentView: View {
    @State private var todos: [Todo] = []

    var body: some View {
        NavigationView {
            List {
                ForEach(todos, id: \._id) { todo in
                    HStack {
                        Text(todo.text)
                        Spacer()
                        if todo.isCompleted {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                        }
                    }
                }
            }
            .navigationTitle("Todos")
        }
        .task {
            // Real-time subscription to Convex query
            for await todos: [Todo] in convex.subscribe(to: "tasks:get")
                .replaceError(with: []).values {
                self.todos = todos
            }
        }
        .padding()
    }
}
```

## Critical Configuration Details

### Deployment URL Format
```swift
// Format: https://<team>-<project>-<id>.convex.cloud
let convex = ConvexClient(deploymentUrl: "https://your-deployment-url.convex.cloud")
```

### Error Handling Pattern
```swift
// Always include error handling for subscriptions
for await result: [Todo] in convex.subscribe(to: "tasks:get")
    .replaceError(with: []).values {
    // Handle successful result
}
```

### Async Task Usage
```swift
// Use .task modifier for SwiftUI lifecycle management
.task {
    // Subscription code here
    // Automatically cancelled when view disappears
}
```

## Non-Obvious Behaviors

1. **Automatic Reconnection**: ConvexClient handles network reconnection automatically
2. **SwiftUI Integration**: Use `.task` modifier, not `.onAppear` for subscriptions
3. **Error Replacement**: `.replaceError(with: [])` prevents subscription from terminating on network errors
4. **Real-time Updates**: Changes in Convex dashboard immediately reflect in Swift app
5. **Deployment URL**: Must match exact format from `npx convex dev` output

## Development Workflow

1. Run `npx convex dev` in terminal
2. Build and run iOS app in Xcode (⌘+R)
3. Test real-time updates via Convex dashboard
4. Changes to backend functions auto-reload

## Common Gotchas

- **Case Sensitivity**: Swift struct properties must match Convex schema exactly
- **Deployment URL**: Copy exact URL from `npx convex dev` output
- **Package Import**: Must import `Convex` module in Swift files
- **Subscription Lifecycle**: Use `.task` for proper cleanup, not `.onAppear`

## Version Compatibility

- Requires iOS 15.0+ (for `.task` modifier)
- Convex Swift package compatible with Xcode 13+
- Node.js 16+ recommended for backend development