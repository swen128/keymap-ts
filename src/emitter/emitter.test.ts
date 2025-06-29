import { describe, it, expect } from 'bun:test';
import { emit } from './emitter';
import type { CheckedKeymap, CheckedBinding } from '../checker/types';

describe('emitter', () => {
  it('should emit includes when specified', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
        ]
      }],
      macros: [],
      behaviors: [],
      combos: [],
      conditionalLayers: [],
      includes: [
        'behaviors.dtsi',
        'dt-bindings/zmk/keys.h',
        'custom-behaviors.dtsi'
      ]
    };
    
    const expected = `#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>
#include <custom-behaviors.dtsi>

/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &kp A
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });
  it('should emit a simple keymap with basic bindings', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
          { behavior: 'keyPress', code: { key: 'B', modifiers: ['LC', 'LS'] } },
          { behavior: 'transparent' },
          { behavior: 'momentaryLayer', layer: 1 }
        ]
      }],
      macros: [],
      behaviors: [],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &kp A &kp LC(LS(B)) &trans &mo 1
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit macros correctly', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          { behavior: 'macro', macroName: 'test_macro' }
        ]
      }],
      macros: [{
        name: 'test_macro',
        label: 'Test Macro',
        bindings: [
          { type: 'tap', code: { key: 'H', modifiers: [] } },
          { type: 'tap', code: { key: 'E', modifiers: [] } },
          { type: 'tap', code: { key: 'L', modifiers: [] } },
          { type: 'tap', code: { key: 'L', modifiers: [] } },
          { type: 'tap', code: { key: 'O', modifiers: [] } }
        ],
        waitMs: 30,
        tapMs: 40
      }],
      behaviors: [],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  macros {
    test_macro: test_macro {
        label = "Test Macro";
        compatible = "zmk,behavior-macro";
        #binding-cells = <0>;
        wait-ms = <30>;
        tap-ms = <40>;
        bindings = <&kp H>
            , <&kp E>
            , <&kp L>
            , <&kp L>
            , <&kp O>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &test_macro
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit synthesized macros with behavior actions', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          { behavior: 'macro', macroName: '__synthetic_bluetooth_0' }
        ]
      }],
      macros: [{
        name: '__synthetic_bluetooth_0',
        bindings: [{
          type: 'behavior',
          binding: { behavior: 'bluetooth', action: 'BT_SEL', profile: 0 }
        }]
      }],
      behaviors: [],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  macros {
    __synthetic_bluetooth_0: __synthetic_bluetooth_0 {
        compatible = "zmk,behavior-macro";
        #binding-cells = <0>;
        bindings = <&bt BT_SEL 0>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &__synthetic_bluetooth_0
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit hold-tap behavior definitions with bindings', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          {
            behavior: 'holdTap',
            name: 'hm',
            holdBinding: { behavior: 'keyPress', code: { key: 'LSHFT', modifiers: [] } },
            tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
          }
        ]
      }],
      macros: [],
      behaviors: [{
        compatible: 'zmk,behavior-hold-tap',
        name: 'hm',
        tappingTermMs: 200,
        quickTapMs: 150,
        bindings: ['kp']
      }],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  behaviors {
    hm: hm {
        compatible = "zmk,behavior-hold-tap";
        label = "HM";
        #binding-cells = <2>;
        bindings = <&kp>;
        tapping-term-ms = <200>;
        quick-tap-ms = <150>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &hm LSHFT A
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit hold-tap with momentary layer correctly', () => {
    const keymap: CheckedKeymap = {
      layers: [
        {
          name: 'default',
          bindings: [
            {
              behavior: 'holdTap',
              name: 'lt_num',
              holdBinding: { behavior: 'momentaryLayer', layer: 1 },
              tapBinding: { behavior: 'keyPress', code: { key: 'D', modifiers: [] } }
            }
          ]
        },
        {
          name: 'Number',
          bindings: []
        }
      ],
      macros: [],
      behaviors: [{
        compatible: 'zmk,behavior-hold-tap',
        name: 'lt_num',
        tappingTermMs: 170,
        bindings: ['mo', 'kp']
      }],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  behaviors {
    lt_num: lt_num {
        compatible = "zmk,behavior-hold-tap";
        label = "LT_NUM";
        #binding-cells = <2>;
        bindings = <&mo>, <&kp>;
        tapping-term-ms = <170>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &lt_num 1 D
        >;
    };

    Number_layer {
        bindings = <
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should convert layer names to indices for all layer behaviors', () => {
    const keymap: CheckedKeymap = {
      layers: [
        {
          name: 'base',
          bindings: [
            { behavior: 'momentaryLayer', layer: 1 },
            { behavior: 'toggleLayer', layer: 2 },
            { behavior: 'stickyLayer', layer: 3 },
            { behavior: 'toLayer', layer: 0 },
            { behavior: 'layerTap', layer: 1, tap: { key: 'SPACE', modifiers: [] } }
          ]
        },
        { name: 'nav', bindings: [] },
        { name: 'num', bindings: [] },
        { name: 'sym', bindings: [] }
      ],
      macros: [],
      behaviors: [],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  keymap {
    compatible = "zmk,keymap";

    base_layer {
        bindings = <
            &mo 1 &tog 2 &sl 3 &to 0 &lt 1 SPACE
        >;
    };

    nav_layer {
        bindings = <
        >;
    };

    num_layer {
        bindings = <
        >;
    };

    sym_layer {
        bindings = <
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit tap-dance behavior definitions', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          {
            behavior: 'tapDance',
            name: 'td_q_esc',
            bindings: [
              { behavior: 'keyPress', code: { key: 'Q', modifiers: [] } },
              { behavior: 'keyPress', code: { key: 'ESC', modifiers: [] } }
            ]
          }
        ]
      }],
      macros: [],
      behaviors: [{
        compatible: 'zmk,behavior-tap-dance',
        name: 'td_q_esc',
        tappingTermMs: 250,
        bindings: ['kp']
      }],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  behaviors {
    td_q_esc: td_q_esc {
        compatible = "zmk,behavior-tap-dance";
        label = "TD_Q_ESC";
        #binding-cells = <2>;
        bindings = <&kp>;
        tapping-term-ms = <250>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &td_q_esc Q ESC
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit combos correctly', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: []
      }],
      macros: [],
      behaviors: [],
      combos: [{
        name: 'ctrl_z',
        timeout: 50,
        keyPositions: ['10', '11'],
        binding: { behavior: 'keyPress', code: { key: 'Z', modifiers: ['LC'] } },
        layers: ['default', 'nav'],
        slowRelease: true,
        requirePriorIdleMs: 125
      }],
      conditionalLayers: []
    };
    
    const expected = `/ {
  combos {
    compatible = "zmk,combos";
    combo_ctrl_z {
        timeout-ms = <50>;
        key-positions = <10 11>;
        bindings = <&kp LC(Z)>;
        layers = <default nav>;
        slow-release;
        require-prior-idle-ms = <125>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit conditional layers correctly', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: []
      }],
      macros: [],
      behaviors: [],
      combos: [],
      conditionalLayers: [{
        name: 'adjust',
        ifLayers: ['lower', 'raise'],
        thenLayer: 'adjust'
      }]
    };
    
    const expected = `/ {
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
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should format nested modifiers correctly', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          { behavior: 'keyPress', code: { key: 'A', modifiers: ['LC', 'LS', 'LA'] } }
        ]
      }],
      macros: [],
      behaviors: [],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &kp LA(LC(LS(A)))
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit multiple layers with proper formatting', () => {
    const keymap: CheckedKeymap = {
      layers: [
        {
          name: 'default',
          bindings: Array.from({ length: 20 }, (): CheckedBinding => ({ 
            behavior: 'keyPress', 
            code: { key: 'A', modifiers: [] } 
          }))
        },
        {
          name: 'nav',
          bindings: [
            { behavior: 'keyPress', code: { key: 'UP', modifiers: [] } },
            { behavior: 'keyPress', code: { key: 'DOWN', modifiers: [] } }
          ]
        }
      ],
      macros: [],
      behaviors: [],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &kp A &kp A &kp A &kp A &kp A &kp A &kp A &kp A &kp A &kp A
            &kp A &kp A &kp A &kp A &kp A &kp A &kp A &kp A &kp A &kp A
        >;
    };

    nav_layer {
        bindings = <
            &kp UP &kp DOWN
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit all behavior types in a complex keymap', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          { behavior: 'keyToggle', code: { key: 'CAPS', modifiers: [] } },
          { behavior: 'stickyKey', code: { key: 'LSHFT', modifiers: [] } },
          { behavior: 'modTap', mod: { key: 'LCTRL', modifiers: [] }, tap: { key: 'ESC', modifiers: [] } },
          { behavior: 'layerTap', layer: 1, tap: { key: 'SPC', modifiers: [] } },
          { behavior: 'toLayer', layer: 2 },
          { behavior: 'toggleLayer', layer: 3 },
          { behavior: 'stickyLayer', layer: 4 },
          { behavior: 'none' },
          { behavior: 'capsWord' },
          { behavior: 'keyRepeat' },
          { behavior: 'mouseButton', button: 'MB1' },
          { behavior: 'mouseMove', x: 10, y: -5 },
          { behavior: 'mouseScroll', x: 0, y: 1 },
          { behavior: 'systemReset' },
          { behavior: 'bootloader' },
          { behavior: 'bluetooth', action: 'BT_CLR' },
          { behavior: 'output', target: 'OUT_TOG' },
          { behavior: 'rgbUnderglow', action: 'RGB_COLOR_HSB', hue: 128, saturation: 100, brightness: 50 },
          { behavior: 'backlight', action: 'BL_SET', brightness: 75 },
          { behavior: 'extPower', action: 'EP_TOG' },
          { behavior: 'softOff', holdTimeMs: 5000 },
          { behavior: 'studioUnlock' }
        ]
      }],
      macros: [],
      behaviors: [
        {
          compatible: 'zmk,behavior-sticky-key',
          name: 'sk_mo',
          releaseAfterMs: 1000,
          quickRelease: true,
          lazy: true,
          ignoreModifiers: true
        },
        {
          compatible: 'zmk,behavior-sticky-layer',
          name: 'sl_nav',
          releaseAfterMs: 2000,
          quickRelease: true,
          ignoreModifiers: true
        },
        {
          compatible: 'zmk,behavior-mod-morph',
          name: 'mm_test',
          keepMods: true,
          bindings: ['kp']
        }
      ],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  behaviors {
    sk_mo: sk_mo {
        compatible = "zmk,behavior-sticky-key";
        label = "SK_MO";
        #binding-cells = <2>;
        release-after-ms = <1000>;
        quick-release;
        lazy;
        ignore-modifiers;
    };

    sl_nav: sl_nav {
        compatible = "zmk,behavior-sticky-layer";
        label = "SL_NAV";
        #binding-cells = <2>;
        release-after-ms = <2000>;
        quick-release;
        ignore-modifiers;
    };

    mm_test: mm_test {
        compatible = "zmk,behavior-mod-morph";
        label = "MM_TEST";
        #binding-cells = <2>;
        bindings = <&kp>;
        keep-mods = <(MOD_LSFT|MOD_RSFT)>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &kt CAPS &sk LSHFT &mt LCTRL ESC &lt 1 SPC &to 2 &tog 3 &sl 4 &none &caps_word &key_repeat
            &mkp MB1 &mmv MOVE_X(10) MOVE_Y(-5) &msc SCRL_X(0) SCRL_Y(1) &sys_reset &bootloader &bt BT_CLR &out OUT_TOG &rgb_ug RGB_COLOR_HSB 128 100 50 &bl BL_SET 75 &ext_power EP_TOG
            &soft_off 5000 &studio_unlock
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });
});