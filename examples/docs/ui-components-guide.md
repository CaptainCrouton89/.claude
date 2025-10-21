# Mystica UI Components Guide

## Overview

This guide provides comprehensive documentation for all reusable UI components in the Mystica app. Use this as a reference when building complex views and maintaining design consistency.

## File Structure

```
New-Mystica/New-Mystica/
├── UI/
│   ├── Colors/
│   │   └── Colors.swift              # Color extensions and palette
│   ├── Components/
│   │   ├── TextComponents.swift      # TitleText, NormalText, SmallText
│   │   └── ButtonComponents.swift    # IconButton, TextButton, BackButton
│   └── Previews/
│       └── UIComponentsPreview.swift # Live preview of all components
├── ContentView.swift
├── Item.swift
└── New_MysticaApp.swift
```

## Color System

### Primary Colors

All colors are defined in `UI/Colors/Colors.swift` as static extensions:

```swift
// Core Colors
.primary              // #1A1A1A - Primary background
.secondary            // #2F2F2F - Secondary backgrounds
.tertiary             // #E5E5E5 - Primary text

// Accent Colors
.accent               // #FF1493 - Primary accent
.accentSecondary      // #00BFFF - Secondary accent
.accentInteractive    // #FF69B4 - Interactive states
.accentSecondaryInteractive // #1E90FF - Secondary interactive states

// Text Colors
.textPrimary          // #FFFFFF - High contrast text
.textSecondary        // #B0B0B0 - Secondary text

// Semantic Colors
.alert                // #FF1493 - Alert/Error states
.success              // #00BFFF - Success states
.warning              // #FF69B4 - Warning states
.info                 // #1E90FF - Info states

// Background Colors
.backgroundPrimary    // #1A1A1A - Primary background
.backgroundSecondary  // #2F2F2F - Secondary background
.backgroundCard       // #2F2F2F - Card backgrounds

// Border Colors
.borderPrimary        // #FF1493 - Primary borders
.borderSecondary      // #00BFFF - Secondary borders
.borderSubtle         // #B0B0B0 - Subtle borders
```

### Usage Pattern

```swift
VStack {
    // Primary background
    .background(Color.backgroundPrimary)

    // Text hierarchy
    TitleText("Title")           // .textPrimary
    NormalText("Body text")      // .textSecondary
    SmallText("Caption")         // .textSecondary
}
```

## Text Components

### TitleText

**File**: `UI/Components/TextComponents.swift`  
**Purpose**: Main headings and page titles

```swift
TitleText("Welcome to Mystica")
TitleText("Smaller Title", size: 24)
```

**Properties**:

- Default size: 30pt
- Font: Impact (Bold Arcade/Retro)
- Color: `.textPrimary`
- Features: Text shadow, kerning, multi-line support

### NormalText

**File**: `UI/Components/TextComponents.swift`  
**Purpose**: Body text, descriptions, content

```swift
NormalText("Your adventure begins here")
NormalText("Smaller body text", size: 15)
```

**Properties**:

- Default size: 17pt
- Font: Impact (Bold Arcade/Retro)
- Color: `.mysticaSoftBrown`
- Features: Line spacing, kerning, multi-line support

### SmallText

**File**: `UI/Components/TextComponents.swift`  
**Purpose**: Captions, secondary info, labels

```swift
SmallText("Tap to continue")
SmallText("Very small text", size: 11)
```

**Properties**:

- Default size: 13pt
- Font: Impact (Bold Arcade/Retro)
- Color: `.mysticaLightBrown`
- Features: Compact spacing, multi-line support

## Button Components

### IconButton

**File**: `UI/Components/ButtonComponents.swift`  
**Purpose**: Action buttons with SF Symbols

```swift
IconButton(icon: "heart.fill") {
    // Action
}

IconButton(icon: "star.fill", size: 56, isDisabled: true) {
    // Action
}
```

**Properties**:

- Default size: 44x44pt (minimum touch target)
- Icon size: 20pt
- Border radius: 8pt
- States: Default, Pressed (scale 0.95), Disabled

**Visual States**:

- Default: Dark brown background, light brown border
- Pressed: Dark gray background, warm brown border
- Disabled: Charcoal background, dark gray border

### TextButton

**File**: `UI/Components/ButtonComponents.swift`  
**Purpose**: Primary action buttons

```swift
TextButton("Start Adventure") {
    // Action
}

TextButton("Continue", height: 40, isDisabled: false) {
    // Action
}
```

**Properties**:

- Default height: 48pt
- Font: Impact (Bold Arcade/Retro), 17pt
- Border radius: 12pt
- States: Default, Pressed (scale 0.98), Disabled

**Visual States**:

- Default: Light brown background, light gray text
- Pressed: Warm brown background
- Disabled: Charcoal background, light brown text

### BackButton

**File**: `UI/Components/ButtonComponents.swift`  
**Purpose**: Navigation back button

```swift
BackButton {
    // Navigation action
}

BackButton(size: 32, isDisabled: false) {
    // Action
}
```

**Properties**:

- Default size: 40x40pt (circular)
- Icon: Chevron left, 16pt
- States: Default, Pressed (scale 0.95), Disabled

**Visual States**:

- Default: Transparent background, light brown border
- Pressed: Dark brown background, warm brown border
- Disabled: Dark gray border

## Animation System

### Press Animations

All buttons use consistent press animations:

- **Duration**: 150ms
- **Easing**: `.easeOut`
- **Scale**: 0.95-0.98 depending on component

### Implementation Pattern

```swift
@State private var isPressed = false

.onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
    withAnimation(.easeOut(duration: 0.15)) {
        isPressed = pressing
    }
}, perform: {})
```

## Layout Guidelines

### Spacing System

Use the 8pt grid system for consistent spacing:

```swift
VStack(spacing: 16) {  // 2x base unit
    TitleText("Title")
    NormalText("Content")
}
.padding(24)  // 3x base unit
```

### Common Layout Patterns

#### Header Section

```swift
VStack(alignment: .leading, spacing: 8) {
    TitleText("Page Title")
    NormalText("Page description")
}
.padding(.horizontal)
```

#### Action Section

```swift
VStack(spacing: 16) {
    TextButton("Primary Action") { }
    TextButton("Secondary Action") { }
}
.padding()
```

#### Navigation Header

```swift
HStack {
    BackButton { }
    Spacer()
    IconButton(icon: "gear") { }
}
.padding()
```

## Complex View Examples

### Settings Screen

```swift
struct SettingsView: View {
    var body: some View {
        VStack(spacing: 24) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                TitleText("Settings")
                NormalText("Customize your Mystica experience")
            }
            .padding(.horizontal)

            // Settings sections
            VStack(spacing: 16) {
                SettingRow(title: "Notifications", icon: "bell")
                SettingRow(title: "Privacy", icon: "lock")
                SettingRow(title: "About", icon: "info.circle")
            }
            .padding(.horizontal)

            Spacer()

            // Actions
            VStack(spacing: 12) {
                TextButton("Save Changes") { }
                TextButton("Reset to Default", isDisabled: true) { }
            }
            .padding()
        }
        .background(Color.mysticaDarkBrown)
    }
}
```

### Game Menu

```swift
struct GameMenuView: View {
    var body: some View {
        VStack(spacing: 32) {
            // Title
            TitleText("Mystica")

            // Menu options
            VStack(spacing: 16) {
                TextButton("Continue Adventure") { }
                TextButton("New Game") { }
                TextButton("Load Game") { }
            }

            // Bottom actions
            HStack(spacing: 24) {
                IconButton(icon: "gear") { }
                IconButton(icon: "questionmark.circle") { }
                IconButton(icon: "heart.fill") { }
            }
        }
        .padding()
        .background(Color.mysticaDarkBrown)
    }
}
```

## Accessibility Guidelines

### Touch Targets

- Minimum: 44x44pt (enforced by IconButton)
- Recommended: 48x48pt (TextButton default)
- Comfortable: 56x56pt (large IconButton)

### Color Contrast

- All text meets WCAG AA standards
- High contrast ratios maintained across all states
- Disabled states clearly distinguishable

### Focus States

- Focus rings use accent gold color
- Focus backgrounds have 20% opacity overlay
- All interactive elements support VoiceOver

## Best Practices

### Component Usage

1. **Consistency**: Always use these components instead of creating custom ones
2. **Hierarchy**: Use TitleText → NormalText → SmallText for information hierarchy
3. **Actions**: Use TextButton for primary actions, IconButton for secondary
4. **Navigation**: Always use BackButton for navigation

### Customization

1. **Sizes**: Adjust component sizes using the `size` parameter
2. **States**: Use `isDisabled` for conditional interactions
3. **Colors**: Stick to the defined color palette
4. **Spacing**: Follow the 8pt grid system

### Performance

1. **Animations**: All animations are optimized for 60fps
2. **Memory**: Components use efficient state management
3. **Rendering**: Minimal view updates with proper state handling

## Testing Components

Use `UI/Previews/UIComponentsPreview.swift` to:

- Test all component states
- Verify color consistency
- Check animation smoothness
- Validate accessibility

Run the preview in Xcode to see all components in action with different states and sizes.

## Troubleshooting

### Common Issues

1. **Colors not showing**: Ensure `UI/Colors/Colors.swift` is imported
2. **Animations not working**: Check that `@State` variables are properly declared
3. **Touch targets too small**: Use minimum 44pt size for IconButton
4. **Text not wrapping**: Components support multi-line by default

### Debug Tips

1. Use the preview to test component behavior
2. Check console for animation timing issues
3. Verify color hex values match style guide
4. Test on different device sizes

---

_This guide is maintained alongside the component files. Update both when making changes to ensure consistency._
