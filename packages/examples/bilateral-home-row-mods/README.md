# Bilateral Home Row Mods

This example demonstrates proper bilateral home row mods for the Glove80 keyboard, based on the implementation in tailorkey.json.

## Implementation Components

### 1. Hold-Tap Behaviors (`hold-tap.ts`)
- Base hold-tap definitions for each finger
- Configured with `holdTriggerKeyPositions` to only activate when pressing keys on the opposite hand
- Uses `holdTriggerOnRelease: true` for better timing control

### 2. Combination Hold-Taps (`hold-tap-combos.ts`)
- Special hold-tap behaviors used within per-finger layers
- Allow combining multiple modifiers on the same hand
- Example: While holding left index (GUI), you can tap left ring to get GUI+Ctrl

### 3. Macros (`macros.ts`)
- **Hold macros**: Press modifier + activate layer, wait for release, then release both
- **Tap macros**: Release all modifiers before tapping the key (ensures clean key presses)

### 4. Layer Structure (`hrm-proper.ts`)

#### Base Layer
- Home row positions have hold-tap behaviors
- Hold action triggers a macro that activates both modifier and layer
- Tap action triggers a macro that releases modifiers then taps the key

#### Per-Finger Layers (e.g., LeftIndex)
- Activated when holding a home row key
- The held position becomes `&none` (disabled)
- Other same-hand positions get special hold-taps for modifier combinations
- Opposite hand has plain keys for typing

## How It Works

1. **Single Modifier + Typing**: Hold left index (F) → activates GUI + LeftIndex layer → type with right hand
2. **Multiple Modifiers**: Hold left index (F) → tap left ring (S) → get GUI+Ctrl+S
3. **Bilateral Enforcement**: `holdTriggerKeyPositions` ensures modifiers only activate for opposite-hand keys

## Current Limitations

Our DSL doesn't yet support:
- Macros as hold/tap behaviors in hold-tap definitions (would need `&macro` support)
- Parameter passing to macros (the real implementation uses parameterized macros)

The example in `hrm-proper.ts` shows the correct structure but would need these DSL enhancements to work fully.