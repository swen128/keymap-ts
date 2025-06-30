# keymap-ts

A TypeScript DSL for creating ZMK keyboard firmware keymaps with type safety and validation.

## Features

- **Type-safe DSL** for ZMK keymaps with full TypeScript support
- **Validation** of keymap configurations at compile time
- **Helper functions** for common patterns (mod-tap, layer-tap, macros, etc.)
- **Support for all ZMK features** including hold-tap, tap-dance, combos, and more
- **Keyboard-specific layouts** (currently supports Glove80)
- **CLI and library usage** for maximum flexibility

## Installation

```bash
npm install keymap-ts
# or
bun add keymap-ts
```

## Usage

### CLI Usage

```bash
# Build a keymap file
npx kts build keymap.ts

# Output to a specific file
npx kts build keymap.ts output.keymap

# Show help
npx kts --help
```

### Library Usage

Create a keymap configuration file (e.g., `keymap.config.ts`):

```typescript
import { 
  glove80Keymap,
  kp, mt, lt, mo, to, tog, 
  macro, ht, td, mm,
  bt, out, rgb_ug, 
  tap, press, release, wait, behavior 
} from 'keymap-ts';

// Define custom behaviors
const homeRowMods = {
  name: 'hrm',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 200,
  flavor: 'tap-preferred',
  quickTapMs: 150,
};

// Create a macro
const copyPasteMacro = macro('copy_paste', [
  tap('C', ['LG']),  // Cmd+C
  wait(50),
  tap('V', ['LG']),  // Cmd+V
]);

export default glove80Keymap({
  includes: ['behaviors.dtsi', 'dt-bindings/zmk/keys.h'],
  layers: [
    {
      name: 'default',
      layout: {
        left: {
          finger: [
            // Row 0 - Numbers
            [kp('ESC'), kp('N1'), kp('N2'), kp('N3'), kp('N4'), kp('N5')],
            // Row 1 - Top letters
            [kp('TAB'), kp('Q'), kp('W'), kp('E'), kp('R'), kp('T')],
            // Row 2 - Home row with mods
            [kp('CAPS'), 
             ht(homeRowMods, kp('LGUI'), kp('A')),
             ht(homeRowMods, kp('LALT'), kp('S')),
             ht(homeRowMods, kp('LCTRL'), kp('D')),
             ht(homeRowMods, kp('LSHFT'), kp('F')),
             kp('G')],
            // ... more rows
          ],
          thumb: [
            [lt('NAV', 'ESC'), kp('SPACE'), kp('TAB')],
            // ... more thumb keys
          ],
        },
        right: {
          // ... right hand layout
        },
      },
    },
    {
      name: 'NAV',
      layout: {
        // ... navigation layer
      },
    },
  ],
  combos: [
    {
      name: 'caps_word',
      keyPositions: ['31', '46'],
      binding: caps_word,
      timeout: 50,
    },
  ],
});
```

### Helper Functions

The library provides convenient helper functions for all ZMK behaviors:

```typescript
// Basic keys
kp('A')                  // Key press
kp('TAB', ['LC'])        // Ctrl+Tab
sk('LSHFT')              // Sticky key
kt('F1')                 // Key toggle

// Layers
mo('NAV')                // Momentary layer
to('BASE')               // To layer
tog('NUM')               // Toggle layer
sl('FUN')                // Sticky layer
lt('NAV', 'SPACE')       // Layer-tap

// Modifiers
mt('LCTRL', [], 'A')     // Mod-tap: Ctrl on hold, A on tap

// Hold-tap behavior
ht(behaviorDef, holdBinding, tapBinding)

// Tap-dance
td(behaviorDef, binding1, binding2, ...)

// Mod-morph
mm(behaviorDef, defaultBinding, morphedBinding, ['LSHFT'])

// System controls
bt('BT_SEL', 0)          // Bluetooth select profile 0
bt('BT_CLR')             // Clear bluetooth
out('OUT_TOG')           // Toggle output
rgb_ug('RGB_TOG')        // Toggle RGB underglow

// Macros
macro('my_macro', [
  tap('A'),
  press('LSHFT'),
  tap('B'),
  release('LSHFT'),
  wait(100),
  behavior(to('BASE'))   // Behaviors in macros
])

// Special keys
trans                    // Transparent
none                     // None
bootloader               // Bootloader
sys_reset                // System reset
caps_word                // Caps word
key_repeat               // Key repeat
```

## Advanced Features

### Custom Hold-Tap Behaviors

```typescript
const spaceBackspace = {
  name: 'spc_bspc',
  compatible: 'zmk,behavior-hold-tap',
  flavor: 'balanced',
  tappingTermMs: 200,
  // Only activate hold on specific positions
  holdTriggerKeyPositions: [5, 6, 7, 8, 9, 15, 16, 17, 18, 19],
};

// Usage
ht(spaceBackspace, kp('BSPC'), kp('SPACE'))
```

### Macros with Behaviors

```typescript
const btProfile0 = macro('bt_0', [
  behavior(out('OUT_BLE')),     // Switch to Bluetooth
  behavior(bt('BT_SEL', 0))      // Select profile 0
]);
```

### Conditional Layers

```typescript
conditionalLayers: [
  {
    name: 'adjust',
    ifLayers: ['lower', 'raise'],
    thenLayer: 'adjust'
  }
]
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun typecheck

# Lint
bun lint

# Run all checks
bun check
```

## License

MIT

