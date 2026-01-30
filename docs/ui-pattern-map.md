# UI Pattern Map — Fit Check

> **Authority Document**: This is the source of truth for all UI/UX consistency.

---

## 1. Design Tokens

### Colors (`ui/tokens/color.tokens.ts`)
| Token | Value | Usage |
|-------|-------|-------|
| `VOID_BLACK` | `#000000` | Pure black, system |
| `DEEP_OBSIDIAN` | `#050508` | Native background |
| `CARBON_BLACK` | `#121212` | Cards, surfaces |
| `ELECTRIC_BLUE` | `#2E5CFF` | Primary accent |
| `ELECTRIC_COBALT` | `#304FFE` | FAB, selection |
| `ELECTRIC_VIOLET` | `#7D5FFF` | Glows, secondary |
| `SOFT_WHITE` | `#F5F5F7` | Primary text |
| `ASH_GRAY` | `#8E9199` | Muted text |
| `SUCCESS_MINT` | `#00D26A` | Success states |
| `ERROR_ROSE` | `#F43F5E` | Error states |
| `WARNING_GOLD` | `#F59E0B` | Warnings |
| `GLASS_SURFACE` | `rgba(18,18,25,0.4)` | Glass backgrounds |
| `GLASS_BORDER` | `rgba(255,255,255,0.08)` | Subtle borders |

### Spacing (`ui/tokens/spacing.tokens.ts`)
| Token | Value |
|-------|-------|
| `GUTTER` | 24px |
| `RADIUS.SMALL` | 8px |
| `RADIUS.MEDIUM` | 16px |
| `RADIUS.LARGE` | 24px |
| `RADIUS.PILL` | 999px |
| `STACK.TIGHT` | 8px |
| `STACK.NORMAL` | 16px |
| `STACK.LARGE` | 32px |
| `CARD.HORIZONTAL_PADDING` | 20px |

### Typography (`ui/foundation/typography.ts`)
| Style | Size | Weight |
|-------|------|--------|
| `display` | 64 | 200 |
| `hero` | 48 | 300 |
| `title` | 32 | 400 |
| `heading` | 24 | 500 |
| `body` | 16 | 400 |
| `label` | 12 | 700, uppercase |
| `micro` | 10 | 300 |

### Motion (`ui/tokens/motion.tokens.ts`)
| Duration | Value |
|----------|-------|
| `QUICK` | 150ms |
| `SNAPPY` | 300ms |
| `MEDIUM` | 500ms |
| `LONG` | 800ms |
| `CINEMATIC` | 1200ms |

| Easing | Curve |
|--------|-------|
| `EASE_OUT_EXPO` | `bezier(0.16, 1, 0.3, 1)` |
| `SMOOTH_FLOW` | `bezier(0.4, 0.0, 0.2, 1)` |

---

## 2. Canonical Components

### GlassCard (`ui/primitives/GlassCard.tsx`)
- **Radius**: 22px
- **Background**: `rgba(18, 18, 20, 0.9)` + BlurView
- **Overlay**: Linear gradient highlight
- **Padding**: `SPACING.CARD.HORIZONTAL_PADDING` (20px)

### LuxuryCard (`ui/primitives/LuxuryCard.tsx`)
- Wraps `GlassCard`
- **Press feedback**: scale 0.96
- **Selection border**: `ELECTRIC_COBALT`
- **Check badge**: 20px circle, top-right

### FloatingFAB (`ui/primitives/FloatingFAB.tsx`)
- **Size**: 60×60px
- **Radius**: 30px
- **Background**: `ELECTRIC_COBALT`
- **Shadow**: 10px blur, 0.4 opacity
- **Position**: bottom 30px, right 20px
- **Animation**: spring scale on press

### PersistentNav (`ui/primitives/PersistentNav.tsx`)
- **Height**: 85px (includes safe area)
- **Background**: `ABYSSAL_BLUE`
- **Border**: 1px `MATERIAL.BORDER`
- **Items**: Today, Closet, Circle, Insights
- **Icon size**: 24px
- **Label**: 10px uppercase

### SystemWhisper (`ui/primitives/SystemWhisper.tsx`)
- **Modes**: ID, WHISPER, LOCK
- **Usage**: System-level text annotations

---

## 3. Navigation Structure

### Stack Navigator (`ui/navigation/AppNavigator.tsx`)
- **Initial**: Void → Splash → Intro → Auth → Home
- **Animation**: `fade` default
- **Background**: transparent (for LivingBackground)

### Tab Navigator (`ui/navigation/MainTabs.tsx`)
- **Tabs**: RitualTab, WardrobeTab, ProfileTab
- **Bar hidden**: Uses custom `PersistentNav`

---

## 4. UI Patterns

### Loading States
- `ActivityIndicator` with `ELECTRIC_VIOLET` color
- Center-aligned in container

### Empty States
- Centered text with muted color
- Optional CTA button

### Error States
- Alert.alert() for blocking errors
- Toast for non-blocking (if implemented)

### Section Headers
- Label style: 12px, bold, uppercase, `ASH_GRAY`
- Margin bottom: 12px

### Buttons
| Variant | Background | Text | Radius |
|---------|------------|------|--------|
| Primary | `ELECTRIC_COBALT` | White | PILL |
| Secondary | `rgba(255,255,255,0.05)` | `ELECTRIC_VIOLET` | 20px |
| Destructive | transparent | `#FF0055` | - |

### Cards
- Use `GlassCard` or `LuxuryCard`
- Radius: 16-22px
- Border: `GLASS_BORDER`

---

## 5. Consistency Rules

1. **Always use tokens** — No hardcoded colors, spacing, or sizes
2. **Use canonical components** — GlassCard, LuxuryCard, FloatingFAB
3. **Match motion** — SNAPPY (300ms), EASE_OUT_EXPO
4. **Press feedback** — Scale 0.96, haptics on interactive elements
5. **Text hierarchy** — label → body → heading → title → hero
6. **Tap targets** — Minimum 44px
