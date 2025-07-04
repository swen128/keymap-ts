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
npx kts build keymap.ts output.keymap
```

### Library Usage

Create a keymap configuration file (e.g., `keymap.config.ts`):

```typescript
import { behaviors, keys, type Keymap } from 'keymap-ts';
import { glove80Layer } from 'keymap-ts/glove80';

const { mo, mt, ht, macro } = behaviors;
const { 
  ESC, N1, N2, N3, N4, N5,
  TAB, Q, W, E, R, T,
  CAPS, A, S, D, F, G,
  SPACE, ENTER,
  LGUI, LALT, LCTRL, LSHFT
} = keys;

// Define custom behaviors
const homeRowMods = {
  name: 'hrm',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 200,
  flavor: 'tap-preferred',
  quickTapMs: 150,
};

// Create a macro
const copyPasteMacro = macro('copy_paste')
  .tap(keys.C, keys.LGUI)  // Cmd+C
  .wait(50)
  .tap(keys.V, keys.LGUI)  // Cmd+V
  .build();

const keymap: Keymap = {
  name: 'my_keymap',
  includes: ['behaviors.dtsi', 'dt-bindings/zmk/keys.h'],
  layers: [
    glove80Layer({
      name: 'default',
      layout: {
        left: {
          finger: [
            // Row 0 - Numbers
            [ESC, N1, N2, N3, N4, N5],
            // Row 1 - Top letters
            [TAB, Q, W, E, R, T],
            // Row 2 - Home row with mods
            [CAPS, 
             ht(homeRowMods, LGUI, A),
             ht(homeRowMods, LALT, S),
             ht(homeRowMods, LCTRL, D),
             ht(homeRowMods, LSHFT, F),
             G],
            // ... more rows
          ],
          thumb: [
            [mo('nav'), SPACE, TAB],
            // ... more thumb keys
          ],
        },
        right: {
          // ... right hand layout
        },
      },
    }),
    glove80Layer({
      name: 'nav',
      layout: {
        // ... navigation layer
      },
    }),
  ],
  combos: [
    {
      name: 'caps_word',
      keyPositions: [31, 46],
      binding: behaviors.caps_word,
      timeout: 50,
    },
  ],
  macros: [copyPasteMacro],
  behaviors: [homeRowMods],
};

export default keymap;
```

## License

MIT