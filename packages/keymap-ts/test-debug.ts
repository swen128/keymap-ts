import { transpile } from './src/transpiler.js';
import type { Keymap } from './src/dsl/schemas.js';

const keymap: Keymap = {
  includes: ['behaviors.dtsi', 'dt-bindings/zmk/keys.h'],
  layers: [
    {
      name: 'default',
      bindings: [
        { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
        { behavior: 'macro', macro: { name: 'test_macro', bindings: [
          { type: 'tap', code: { key: 'H', modifiers: [] } },
          { type: 'tap', code: { key: 'I', modifiers: [] } }
        ]}}
      ]
    },
    {
      name: 'nav_layer',
      bindings: [
        { behavior: 'keyPress', code: { key: 'UP', modifiers: [] } }
      ]
    }
  ],
  combos: [{
    name: 'test_combo',
    keyPositions: ['0', '1'],
    binding: { behavior: 'keyPress', code: { key: 'ESC', modifiers: [] } }
  }],
  conditionalLayers: [{
    ifLayers: ['default'],
    thenLayer: 'nav_layer'
  }],
  globalBehaviorConfig: {
    mt: {
      tappingTermMs: 200,
      flavor: 'tap-preferred'
    }
  }
};

const result = transpile(keymap);

if (result.isErr()) {
  console.log('Validation errors:', JSON.stringify(result.error, null, 2));
} else {
  console.log('Success\!');
}
