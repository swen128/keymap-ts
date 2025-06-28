// Example keymap configuration for ZMK
export default {
  layers: [
    {
      name: 'default',
      bindings: [
        // First row
        { behavior: 'keyPress', code: { key: 'Q', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'W', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'E', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'R', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'T', modifiers: [] } },
        
        // Second row with home row mods
        {
          behavior: 'holdTap',
          definition: { compatible: 'zmk,behavior-hold-tap', name: 'hm' },
          holdBinding: { behavior: 'keyPress', code: { key: 'LSHFT', modifiers: [] } },
          tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
        },
        { behavior: 'keyPress', code: { key: 'S', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'D', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'F', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'G', modifiers: [] } },
        
        // Third row - layer access
        { behavior: 'momentaryLayer', layer: 'nav' },
        { behavior: 'keyPress', code: { key: 'Z', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'X', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'C', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'V', modifiers: [] } },
      ]
    },
    {
      name: 'nav',
      bindings: [
        // Navigation layer
        { behavior: 'keyPress', code: { key: 'LEFT', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'DOWN', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'UP', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'RIGHT', modifiers: [] } },
        { behavior: 'transparent' },
        
        // More navigation
        { behavior: 'keyPress', code: { key: 'HOME', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'PG_DN', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'PG_UP', modifiers: [] } },
        { behavior: 'keyPress', code: { key: 'END', modifiers: [] } },
        { behavior: 'transparent' },
        
        // Bottom row
        { behavior: 'transparent' },
        { behavior: 'transparent' },
        { behavior: 'transparent' },
        { behavior: 'transparent' },
        { behavior: 'transparent' },
      ]
    }
  ],
  
  // Optional: Add combos
  combos: [
    {
      name: 'escape',
      keyPositions: ['0', '1'], // Q + W
      binding: { behavior: 'keyPress', code: { key: 'ESC', modifiers: [] } }
    }
  ],
  
  // Optional: Add includes for the generated devicetree
  includes: [
    'behaviors.dtsi',
    'dt-bindings/zmk/keys.h',
    'dt-bindings/zmk/bt.h'
  ]
};