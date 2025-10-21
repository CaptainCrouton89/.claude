# Mystica UI Style Guide

## Color Palette

### Primary Colors

- **Dark Gray (Primary)**: `#1A1A1A` - Main background, primary containers
- **Charcoal Gray (Secondary)**: `#2F2F2F` - Secondary backgrounds, cards, depth layers
- **Light Gray (Tertiary)**: `#E5E5E5` - Primary text, borders

### Accent Colors

- **Neon Pink**: `#FF1493` - Primary accent, CTAs, active states, highlights
- **Neon Blue**: `#00BFFF` - Secondary accent, interactive elements, success states
- **Bright Pink**: `#FF69B4` - Interactive states, hover effects, pressed buttons
- **Bright Blue**: `#1E90FF` - Secondary interactive states, hover effects

### Text Colors

- **White**: `#FFFFFF` - High contrast text, primary headings
- **Light Gray**: `#E5E5E5` - Primary text, body content
- **Secondary Text**: `#B0B0B0` - Secondary text, captions, disabled states

### Semantic Colors

- **Error Pink**: `#FF1493` - Error states, warnings, negative feedback

## Typography

### Title Text

- **Font**: System font, bold weight
- **Size**: 28-32pt (iOS), 24-28px (Web)
- **Color**: `#FFFFFF` (White)
- **Line Height**: 1.2
- **Letter Spacing**: 0.5pt
- **Shadow**: `0 2px 4px rgba(0,0,0,0.5)`

### Normal Text

- **Font**: System font, regular weight
- **Size**: 16-18pt (iOS), 14-16px (Web)
- **Color**: `#E5E5E5` (Light Gray)
- **Line Height**: 1.4
- **Letter Spacing**: 0.2pt

### Small Text

- **Font**: System font, regular weight
- **Size**: 12-14pt (iOS), 12px (Web)
- **Color**: `#B0B0B0` (Secondary Text)
- **Line Height**: 1.3

## Button Styles

### Icon Button

- **Size**: 44x44pt (iOS), 44x44px (Web) minimum touch target
- **Background**: `#1A1A1A` (Dark Gray)
- **Border**: 1px solid `#FF1493` (Neon Pink)
- **Border Radius**: 8pt (iOS), 8px (Web)
- **Icon Color**: `#E5E5E5` (Light Gray)
- **Icon Size**: 20x20pt (iOS), 20x20px (Web)
- **Padding**: 12pt (iOS), 12px (Web)

**States:**

- **Default**: Background `#1A1A1A`, Border `#FF1493`
- **Pressed**: Background `#2F2F2F`, Border `#FF69B4`, Scale 0.95
- **Disabled**: Background `#2F2F2F`, Border `#B0B0B0`, Icon `#B0B0B0`

### Text Button

- **Height**: 48pt (iOS), 48px (Web)
- **Background**: `#FF1493` (Neon Pink)
- **Border**: None
- **Border Radius**: 12pt (iOS), 12px (Web)
- **Text Color**: `#FFFFFF` (White)
- **Font**: System font, semibold weight, 16-18pt (iOS), 14-16px (Web)
- **Padding**: 16pt horizontal, 12pt vertical (iOS), 16px horizontal, 12px vertical (Web)

**States:**

- **Default**: Background `#FF1493`, Text `#FFFFFF`
- **Pressed**: Background `#FF69B4`, Scale 0.98
- **Disabled**: Background `#2F2F2F`, Text `#B0B0B0`

### Back Button

- **Size**: 40x40pt (iOS), 40x40px (Web)
- **Background**: Transparent
- **Border**: 1px solid `#FF1493` (Neon Pink)
- **Border Radius**: 20pt (iOS), 20px (Web) (circular)
- **Icon**: Left-pointing chevron or arrow
- **Icon Color**: `#E5E5E5` (Light Gray)
- **Icon Size**: 16x16pt (iOS), 16x16px (Web)

**States:**

- **Default**: Transparent background, Border `#FF1493`
- **Pressed**: Background `#1A1A1A`, Border `#FF69B4`, Scale 0.95
- **Disabled**: Border `#B0B0B0`, Icon `#B0B0B0`

## Spacing System

### Base Unit

- **Base**: 8pt (iOS), 8px (Web)

### Spacing Scale

- **xs**: 4pt (iOS), 4px (Web)
- **sm**: 8pt (iOS), 8px (Web)
- **md**: 16pt (iOS), 16px (Web)
- **lg**: 24pt (iOS), 24px (Web)
- **xl**: 32pt (iOS), 32px (Web)
- **xxl**: 48pt (iOS), 48px (Web)

## Animation Guidelines

### Timing Functions

- **Ease Out**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` - For entrances
- **Ease In**: `cubic-bezier(0.55, 0.055, 0.675, 0.19)` - For exits
- **Ease In Out**: `cubic-bezier(0.645, 0.045, 0.355, 1)` - For state changes

### Duration Scale

- **Fast**: 150ms - Hover states, micro-interactions
- **Normal**: 250ms - Button presses, state changes
- **Slow**: 400ms - Page transitions, complex animations

### Common Animations

- **Button Press**: Scale to 0.95-0.98, duration 150ms, ease-out
- **Hover**: Slight scale increase (1.02), duration 200ms, ease-out
- **Page Transition**: Slide or fade, duration 300ms, ease-in-out
- **Loading**: Pulse or rotate, duration 1000ms, ease-in-out, infinite

## Responsive Design

### Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Scaling Rules

- **Mobile**: Base sizes as defined
- **Tablet**: Scale up by 1.2x
- **Desktop**: Scale up by 1.4x

### Touch Targets

- **Minimum**: 44x44pt (iOS), 44x44px (Web)
- **Recommended**: 48x48pt (iOS), 48x48px (Web)
- **Comfortable**: 56x56pt (iOS), 56x56px (Web)

## Accessibility

### Contrast Ratios

- **Normal Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **UI Components**: Minimum 3:1 contrast ratio

### Focus States

- **Focus Ring**: 2px solid `#FF1493` (Neon Pink)
- **Focus Background**: `#1A1A1A` with 20% opacity overlay

## Usage Examples

### Dark Theme Implementation

```css
:root {
  --color-primary: #1a1a1a;
  --color-secondary: #2f2f2f;
  --color-accent-pink: #ff1493;
  --color-accent-blue: #00bfff;
  --color-text-primary: #ffffff;
  --color-text-secondary: #e5e5e5;
  --color-text-tertiary: #b0b0b0;
}
```

### SwiftUI Color Extensions

```swift
extension Color {
    static let primary = Color(hex: "1A1A1A")
    static let secondary = Color(hex: "2F2F2F")
    static let accent = Color(hex: "FF1493")
    static let accentSecondary = Color(hex: "00BFFF")
    static let textPrimary = Color(hex: "FFFFFF")
    static let textSecondary = Color(hex: "E5E5E5")
}
```

## Design Principles

1. **Cyberpunk Aesthetic**: Colors evoke futuristic, high-tech feelings with neon accents
2. **Clear Hierarchy**: Strong contrast between text levels and interactive elements
3. **Consistent Spacing**: 8pt grid system for visual rhythm
4. **Smooth Interactions**: Subtle animations that feel natural
5. **Accessibility First**: High contrast ratios and proper touch targets
6. **Responsive**: Scales gracefully across all device sizes

## Notes

- All colors are tested for accessibility compliance
- Animation durations are optimized for perceived performance
- The neon color palette creates a futuristic, high-tech atmosphere
- High contrast ensures readability in various lighting conditions
- The design system supports both iOS and web implementations
