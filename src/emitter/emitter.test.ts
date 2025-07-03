import { describe, it, expect } from 'bun:test';
import { emit } from './emitter.js';
import type { CheckedKeymap, CheckedBinding, CheckedHoldTapDefinition } from '../checker/types.js';

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

  it('should emit macros with hold-tap behaviors correctly', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: []
      }],
      macros: [{
        name: 'smart_left',
        bindings: [{
          type: 'behavior',
          binding: {
            behavior: 'holdTap',
            name: 'smart_move',
            holdBinding: { behavior: 'keyPress', code: { key: 'HOME', modifiers: ['LG'] } },
            tapBinding: { behavior: 'keyPress', code: { key: 'LEFT', modifiers: ['LA'] } }
          }
        }]
      }],
      behaviors: [{
        compatible: 'zmk,behavior-hold-tap',
        name: 'smart_move',
        tappingTermMs: 150,
        flavor: 'tap-preferred',
        bindings: ['kp', 'kp']
      } satisfies CheckedHoldTapDefinition],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  behaviors {
    smart_move: smart_move {
        compatible = "zmk,behavior-hold-tap";
        label = "SMART_MOVE";
        #binding-cells = <2>;
        bindings = <&kp>, <&kp>;
        tapping-term-ms = <150>;
        flavor = "tap-preferred";
    };

  };

  macros {
    smart_left: smart_left {
        compatible = "zmk,behavior-macro";
        #binding-cells = <0>;
        bindings = <&smart_move LG(HOME) LA(LEFT)>;
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

  it('should convert layer names to indices in macro actions', () => {
    const keymap: CheckedKeymap = {
      layers: [
        { name: 'base', bindings: [] },
        { name: 'nav', bindings: [] }
      ],
      macros: [{
        name: 'layer_macro',
        bindings: [
          { type: 'tap', code: { key: 'A', modifiers: [] } },
          { type: 'behavior', binding: { behavior: 'toLayer', layer: 0 } },
          { type: 'behavior', binding: { behavior: 'momentaryLayer', layer: 1 } },
          { type: 'behavior', binding: { behavior: 'toggleLayer', layer: 1 } },
          { type: 'behavior', binding: { behavior: 'stickyLayer', layer: 0 } },
          { type: 'behavior', binding: { behavior: 'layerTap', layer: 1, tap: { key: 'B', modifiers: [] } } }
        ]
      }],
      behaviors: [],
      combos: [],
      conditionalLayers: []
    };

    const result = emit(keymap);
    
    expect(result).toContain('layer_macro: layer_macro {');
    expect(result).toContain('bindings = <&kp A>');
    expect(result).toContain(', <&to 0>');
    expect(result).toContain(', <&mo 1>');
    expect(result).toContain(', <&tog 1>');
    expect(result).toContain(', <&sl 0>');
    expect(result).toContain(', <&lt 1 B>');
  });

  it('should emit hold-tap with all properties including flavor, requirePriorIdleMs, and holdTriggerKeyPositions', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          {
            behavior: 'holdTap',
            name: 'lt_num',
            holdBinding: { behavior: 'momentaryLayer', layer: 1 },
            tapBinding: { behavior: 'keyPress', code: { key: 'D', modifiers: [] } }
          }
        ]
      }, {
        name: 'number',
        bindings: []
      }],
      macros: [],
      behaviors: [{
        compatible: 'zmk,behavior-hold-tap',
        name: 'lt_num',
        tappingTermMs: 170,
        quickTapMs: 300,
        flavor: 'tap-preferred',
        requirePriorIdleMs: 100,
        holdTriggerKeyPositions: [60, 59, 41, 42, 43, 61, 31, 30, 29, 44, 62],
        bindings: ['mo', 'kp']
      } satisfies CheckedHoldTapDefinition],
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
        quick-tap-ms = <300>;
        flavor = "tap-preferred";
        require-prior-idle-ms = <100>;
        hold-trigger-key-positions = <60 59 41 42 43 61 31 30 29 44 62>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &lt_num 1 D
        >;
    };

    number_layer {
        bindings = <
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit hold-tap with holdTriggerOnRelease property', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          {
            behavior: 'holdTap',
            name: 'hmr',
            holdBinding: { behavior: 'keyPress', code: { key: 'LSHFT', modifiers: [] } },
            tapBinding: { behavior: 'keyPress', code: { key: 'F', modifiers: [] } }
          }
        ]
      }],
      macros: [],
      behaviors: [{
        compatible: 'zmk,behavior-hold-tap',
        name: 'hmr',
        tappingTermMs: 280,
        quickTapMs: 175,
        flavor: 'balanced',
        requirePriorIdleMs: 150,
        holdTriggerKeyPositions: [10, 11, 12, 13, 14, 15],
        holdTriggerOnRelease: true,
        bindings: ['kp', 'kp']
      } satisfies CheckedHoldTapDefinition],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  behaviors {
    hmr: hmr {
        compatible = "zmk,behavior-hold-tap";
        label = "HMR";
        #binding-cells = <2>;
        bindings = <&kp>, <&kp>;
        tapping-term-ms = <280>;
        quick-tap-ms = <175>;
        flavor = "balanced";
        require-prior-idle-ms = <150>;
        hold-trigger-key-positions = <10 11 12 13 14 15>;
        hold-trigger-on-release;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &hmr LSHFT F
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit mod-morph behavior with behavior parameters as 0', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          {
            behavior: 'modMorph',
            name: 'mod_caps_word',
            mods: ['MOD_LALT'],
            defaultBinding: { behavior: 'capsWord' },
            morphedBinding: { behavior: 'capsWord' }
          }
        ]
      }],
      macros: [],
      behaviors: [{
        compatible: 'zmk,behavior-mod-morph',
        name: 'mod_caps_word',
        mods: ['MOD_LALT'],
        bindings: ['caps_word', 'caps_word']
      }],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  behaviors {
    mod_caps_word: mod_caps_word {
        compatible = "zmk,behavior-mod-morph";
        label = "MOD_CAPS_WORD";
        #binding-cells = <2>;
        bindings = <&caps_word>, <&caps_word>;
        mods = <(MOD_LALT)>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &mod_caps_word 0 0
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit hold-tap behavior with macro parameters as 0', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: [
          {
            behavior: 'holdTap',
            name: 'smart_select',
            holdBinding: { behavior: 'macro', macroName: 'select_line' },
            tapBinding: { behavior: 'macro', macroName: 'select_word' }
          }
        ]
      }],
      macros: [
        {
          name: 'select_line',
          bindings: [{ type: 'tap', code: { key: 'HOME', modifiers: [] } }]
        },
        {
          name: 'select_word',
          bindings: [{ type: 'tap', code: { key: 'W', modifiers: ['LC'] } }]
        }
      ],
      behaviors: [{
        compatible: 'zmk,behavior-hold-tap',
        name: 'smart_select',
        tappingTermMs: 200,
        bindings: ['macro', 'macro']
      }],
      combos: [],
      conditionalLayers: []
    };
    
    const expected = `/ {
  behaviors {
    smart_select: smart_select {
        compatible = "zmk,behavior-hold-tap";
        label = "SMART_SELECT";
        #binding-cells = <2>;
        bindings = <&macro>, <&macro>;
        tapping-term-ms = <200>;
    };

  };

  macros {
    select_line: select_line {
        compatible = "zmk,behavior-macro";
        #binding-cells = <0>;
        bindings = <&kp HOME>;
    };

    select_word: select_word {
        compatible = "zmk,behavior-macro";
        #binding-cells = <0>;
        bindings = <&kp LC(W)>;
    };

  };

  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
            &smart_select 0 0
        >;
    };

  };
};`;
    
    const output = emit(keymap);
    expect(output).toBe(expected);
  });

  it('should emit global mt configuration', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: []
      }],
      macros: [],
      behaviors: [],
      combos: [],
      conditionalLayers: [],
      globalBehaviorConfig: {
        mt: {
          tappingTermMs: 280,
          flavor: 'balanced',
          quickTapMs: 175,
          requirePriorIdleMs: 150,
          holdTriggerKeyPositions: [10, 11, 12, 13],
          holdTriggerOnRelease: true,
          holdWhileUndecided: true,
          holdWhileUndecidedLinger: true,
          retro: true
        }
      }
    };
    
    const expected = `&mt {
    tapping-term-ms = <280>;
    flavor = "balanced";
    quick-tap-ms = <175>;
    require-prior-idle-ms = <150>;
    hold-trigger-key-positions = <10 11 12 13>;
    hold-trigger-on-release;
    hold-while-undecided;
    hold-while-undecided-linger;
    retro-tap;
};

/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
        >;
    };

  };
};`;
    
    const result = emit(keymap);
    expect(result).toBe(expected);
  });

  it('should emit global sk configuration with ignore-modifiers disabled', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: []
      }],
      macros: [],
      behaviors: [],
      combos: [],
      conditionalLayers: [],
      globalBehaviorConfig: {
        sk: {
          releaseAfterMs: 2000,
          quickRelease: true,
          lazy: true,
          ignoreModifiers: false
        }
      }
    };
    
    const expected = `&sk {
    release-after-ms = <2000>;
    quick-release;
    lazy;
    /delete-property/ ignore-modifiers;
};

/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
        >;
    };

  };
};`;
    
    const result = emit(keymap);
    expect(result).toBe(expected);
  });

  it('should emit global caps_word configuration', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: []
      }],
      macros: [],
      behaviors: [],
      combos: [],
      conditionalLayers: [],
      globalBehaviorConfig: {
        capsWord: {
          continueList: [
            'UNDERSCORE',
            'MINUS',
            'BSPC',
            'DEL'
          ],
          mods: ['LS', 'LA']
        }
      }
    };
    
    const expected = `&caps_word {
    continue-list = <UNDERSCORE MINUS BSPC DEL>;
    mods = <(MOD_LSFT | MOD_LALT)>;
};

/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
        >;
    };

  };
};`;
    
    const result = emit(keymap);
    expect(result).toBe(expected);
  });

  it('should emit multiple global behavior configurations', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: []
      }],
      macros: [],
      behaviors: [],
      combos: [],
      conditionalLayers: [],
      globalBehaviorConfig: {
        mt: {
          tappingTermMs: 200
        },
        lt: {
          flavor: 'tap-preferred',
          quickTapMs: 150
        },
        sk: {
          releaseAfterMs: 1500
        }
      }
    };
    
    const expected = `&mt {
    tapping-term-ms = <200>;
};

&lt {
    flavor = "tap-preferred";
    quick-tap-ms = <150>;
};

&sk {
    release-after-ms = <1500>;
};

/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
        >;
    };

  };
};`;
    
    const result = emit(keymap);
    expect(result).toBe(expected);
  });

  it('should emit global mouse and other behavior configurations', () => {
    const keymap: CheckedKeymap = {
      layers: [{
        name: 'default',
        bindings: []
      }],
      macros: [],
      behaviors: [],
      combos: [],
      conditionalLayers: [],
      globalBehaviorConfig: {
        keyRepeat: {
          usagePages: ['HID_USAGE_KEY', 'HID_USAGE_CONSUMER']
        },
        softOff: {
          holdTimeMs: 5000,
          splitPeripheralOffOnPress: true
        },
        mouseMove: {
          timeToMaxSpeedMs: 500,
          accelerationExponent: 2
        }
      }
    };
    
    const expected = `&key_repeat {
    usage-pages = <HID_USAGE_KEY HID_USAGE_CONSUMER>;
};

&soft_off {
    hold-time-ms = <5000>;
    split-peripheral-off-on-press;
};

&mmv {
    time-to-max-speed-ms = <500>;
    acceleration-exponent = <2>;
};

/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
        bindings = <
        >;
    };

  };
};`;
    
    const result = emit(keymap);
    expect(result).toBe(expected);
  });
});