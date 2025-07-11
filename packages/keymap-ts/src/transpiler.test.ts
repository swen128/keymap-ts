import { describe, it, expect } from 'bun:test';
import { transpile } from './transpiler.js';
import type { Keymap } from './dsl/schemas.js';

describe('transpiler', () => {
  it('should transpile a simple keymap successfully', () => {
    const keymap: Keymap = {
      layers: [
        {
          name: 'default',
          bindings: [
            { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
            { behavior: 'keyPress', code: { key: 'B', modifiers: ['LC'] } },
            { behavior: 'transparent' },
            { behavior: 'momentaryLayer', layer: 'nav' }
          ]
        },
        {
          name: 'nav',
          bindings: []
        }
      ]
    };
    
    const expected = `/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &kp A &kp LC(B) &trans &mo 1
        >;
    };

    nav_layer {
        bindings = <
        >;
    };

  };
};`;
    
    const result = transpile(keymap);
    
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(expected);
    }
  });

  it('should return validation errors for invalid input', () => {
    const result = transpile({ invalid: 'data' });
    
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.length).toBeGreaterThan(0);
      // The exact error message depends on Zod's validation
      expect(result.error[0]?.message).toBeTruthy();
    }
  });

  it('should return validation errors for invalid schema', () => {
    const keymap = {
      layers: [{
        name: 'default',
        bindings: [
          { behavior: 'invalidBehavior' }
        ]
      }]
    };
    
    const result = transpile(keymap);
    
    expect(result.isErr()).toBe(true);
  });

  it('should handle checker errors', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: [
          // Conflicting behavior definition
          { 
            behavior: 'holdTap',
            definition: {
              name: 'hm',
              compatible: 'zmk,behavior-hold-tap',
              tappingTermMs: 200
            },
            holdBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
            tapBinding: { behavior: 'keyPress', code: { key: 'B', modifiers: [] } }
          },
          // Same name but different definition
          { 
            behavior: 'holdTap',
            definition: {
              name: 'hm',
              compatible: 'zmk,behavior-hold-tap',
              tappingTermMs: 300 // Different value
            },
            holdBinding: { behavior: 'keyPress', code: { key: 'C', modifiers: [] } },
            tapBinding: { behavior: 'keyPress', code: { key: 'D', modifiers: [] } }
          }
        ]
      }]
    };
    
    const result = transpile(keymap);
    
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.length).toBeGreaterThan(0);
      expect(result.error[0]?.message).toContain('conflicting definitions');
    }
  });

  it('should transpile a complex keymap with all features', () => {
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
          name: 'nav',
          bindings: [
            { behavior: 'keyPress', code: { key: 'UP', modifiers: [] } }
          ]
        },
        {
          name: 'lower',
          bindings: []
        },
        {
          name: 'raise',
          bindings: []
        },
        {
          name: 'adjust',
          bindings: []
        }
      ],
      combos: [{
        name: 'ctrl_z',
        keyPositions: ['10', '11'],
        binding: { behavior: 'keyPress', code: { key: 'Z', modifiers: ['LC'] } }
      }],
      conditionalLayers: [{
        name: 'adjust',
        ifLayers: ['lower', 'raise'],
        thenLayer: 'adjust'
      }]
    };
    
    const expected = `#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>

/ {
  macros {
    test_macro: test_macro {
        compatible = "zmk,behavior-macro";
        #binding-cells = <0>;
        bindings = <&kp H>
            , <&kp I>;
    };

  };

  combos {
    compatible = "zmk,combos";
    combo_ctrl_z {
        key-positions = <10 11>;
        bindings = <&kp LC(Z)>;
    };

  };

  conditional_layers {
    compatible = "zmk,conditional-layers";
    tri_layer_0 {
        if-layers = <lower raise>;
        then-layer = <adjust>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &kp A &test_macro
        >;
    };

    nav_layer {
        bindings = <
            &kp UP
        >;
    };

    lower_layer {
        bindings = <
        >;
    };

    raise_layer {
        bindings = <
        >;
    };

    adjust_layer {
        bindings = <
        >;
    };

  };
};`;
    
    const result = transpile(keymap);
    
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(expected);
    }
  });

  it('should handle complex behaviors that need macro synthesis', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: [
          { 
            behavior: 'holdTap',
            definition: {
              name: 'hm',
              compatible: 'zmk,behavior-hold-tap',
              tappingTermMs: 200
            },
            holdBinding: { behavior: 'bluetooth', action: 'BT_CLR' },
            tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
          }
        ]
      }]
    };
    
    const expected = `/ {
  behaviors {
    hm: hm {
        compatible = "zmk,behavior-hold-tap";
        label = "HM";
        #binding-cells = <2>;
        bindings = <&__synthetic_bluetooth_1>, <&kp>;
        tapping-term-ms = <200>;
    };

  };

  macros {
    __synthetic_bluetooth_0: __synthetic_bluetooth_0 {
        compatible = "zmk,behavior-macro";
        #binding-cells = <0>;
        bindings = <&bt BT_CLR>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &hm 0 A
        >;
    };

  };
};`;
    
    const result = transpile(keymap);
    
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(expected);
    }
  });

  it('should validate includes for invalid characters', () => {
    const keymap = {
      layers: [{
        name: 'default',
        bindings: []
      }],
      includes: [
        'behaviors.dtsi',
        'file\nwith\nnewlines.h',
        'file with trailing space ',
        ' file with leading space',
        'file"with"quotes.h',
      ]
    };
    
    const result = transpile(keymap);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Verify we have the expected number of errors
      expect(result.error.length).toBe(2);
      
      // Verify error paths
      const errorPaths = result.error.map(e => e.path || []);
      expect(errorPaths).toContainEqual(['includes[1]']); // file with newlines
      expect(errorPaths).toContainEqual(['includes[4]']); // file with quotes
      
      // Verify all errors are about the pattern validation
      const errorMessages = result.error.map(e => e.message);
      errorMessages.forEach(msg => {
        expect(msg).toMatch(/string & Pattern<".*">/);
        // The pattern should exclude newlines, quotes, etc.
        expect(msg).toContain(String.raw`^[^\\n\\r\"'` + '`]+$');
      });
    }
  });

  it('should accept valid includes', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: []
      }],
      includes: [
        'behaviors.dtsi',
        'dt-bindings/zmk/keys.h',
        'dt-bindings/zmk/bt.h',
        'custom/behaviors.dtsi',
        '../shared/macros.dtsi'
      ]
    };
    
    const result = transpile(keymap);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toContain('#include <behaviors.dtsi>');
      expect(result.value).toContain('#include <dt-bindings/zmk/keys.h>');
      expect(result.value).toContain('#include <dt-bindings/zmk/bt.h>');
      expect(result.value).toContain('#include <custom/behaviors.dtsi>');
      expect(result.value).toContain('#include <../shared/macros.dtsi>');
    }
  });
});