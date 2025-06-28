# ZMK Keymap Editor

A TypeScript DSL for creating ZMK keyboard firmware keymaps with type safety and validation.

## Getting Started

### Installation

```bash
npm install zmk-keymap-editor
# or
bun add zmk-keymap-editor
```

### Basic Usage

Create a keymap configuration file (e.g., `keymap.config.js`):

```typescript
import { glove80Keymap } from 'zmk-keymap-editor';

const homeRowMods = {
  leftPinky: { behavior: 'modTap', mod: { key: 'LGUI', modifiers: [] }, tap: { key: 'A', modifiers: [] } },
  leftRing: { behavior: 'modTap', mod: { key: 'LALT', modifiers: [] }, tap: { key: 'S', modifiers: [] } },
  leftMiddle: { behavior: 'modTap', mod: { key: 'LCTRL', modifiers: [] }, tap: { key: 'D', modifiers: [] } },
  leftIndex: { behavior: 'modTap', mod: { key: 'LSHFT', modifiers: [] }, tap: { key: 'F', modifiers: [] } },
};

export default glove80Keymap({
  includes: ['behaviors.dtsi', 'dt-bindings/zmk/keys.h'],
  layers: [
    {
      name: 'default',
      layout: {
        left: {
          finger: [
            [{ behavior: 'keyPress', code: { key: 'ESC', modifiers: [] } }, /** ... */],
            // ... more rows
          ],
          thumb: [
            [{ behavior: 'keyPress', code: { key: 'SPACE', modifiers: [] } }, /** ... */],
            // ... more thumb keys
          ],
        },
        right: {
          // ... right hand layout
        },
      },
    },
  ],
  combos: [
    {
      name: 'caps_word',
      keyPositions: ['31', '46'],
      binding: { behavior: 'capsWord' },
      timeout: 50,
    },
  ],
});
```

### Transpile to ZMK Devicetree

```bash
# Output to stdout
npx zmk-keymap-editor keymap.ts

# Output to file
npx zmk-keymap-editor keymap.ts output.keymap
```

