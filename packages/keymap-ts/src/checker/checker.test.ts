import { describe, it, expect } from 'bun:test';
import type { Keymap } from '../dsl/schemas.js';
import type { CheckedBinding } from './types.js';
import { check } from './checker.js';

describe('checker', () => {
  it('should convert simple bindings correctly', () => {
    const keymap: Keymap = {
      layers: [
        {
          name: 'default',
          bindings: [
            { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
            { behavior: 'keyPress', code: { key: 'B', modifiers: ['LC', 'LS'] } },
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
    
    const result = check(keymap);
    
    if (result.isErr()) {
      throw new Error('Check failed: ' + JSON.stringify(result.error));
    }
    
    expect(result.value.layers[0]?.bindings).toEqual([
      { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
      { behavior: 'keyPress', code: { key: 'B', modifiers: ['LC', 'LS'] } },
      { behavior: 'transparent' },
      { behavior: 'momentaryLayer', layer: 1 }  // nav is at index 1
    ]);
    
    expect(result.value.macros).toHaveLength(0);
  });

  it('should synthesize macros for complex bindings inside hold-tap and collect behavior definitions', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: [
          {
            behavior: 'holdTap',
            definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'my_ht' },
            holdBinding: { behavior: 'bluetooth', action: 'BT_SEL', profile: 0 },
            tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
          }
        ]
      }]
    };
    
    const result = check(keymap);
    
    if (result.isErr()) {
      throw new Error('Check failed: ' + JSON.stringify(result.error));
    }
    
    // Check that the hold-tap was converted correctly
    const binding = result.value.layers[0]?.bindings[0];
    expect(binding).toEqual({
      behavior: 'holdTap',
      name: 'my_ht',
      holdBinding: { behavior: 'macro', macroName: '__synthetic_bluetooth_0' },
      tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
    });
    
    // Check that a synthetic macro was created
    expect(result.value.macros).toHaveLength(1);
    expect(result.value.macros[0]).toEqual({
      name: '__synthetic_bluetooth_0',
      bindings: [{
        type: 'behavior',
        binding: { behavior: 'bluetooth', action: 'BT_SEL', profile: 0 }
      }]
    });
    
    // Check that the hold-tap behavior definition was collected with bindings
    expect(result.value.behaviors).toHaveLength(1);
    expect(result.value.behaviors[0]).toEqual({
      compatible: 'zmk,behavior-hold-tap',
      name: 'my_ht',
      bindings: ['__synthetic_bluetooth_1', 'kp']  // bluetooth wrapped in macro, kp for keyPress
    });
  });

  it('should synthesize macros for complex bindings inside tap-dance and collect behavior definitions', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: [
          {
            behavior: 'tapDance',
            definition: { compatible: 'zmk,behavior-tap-dance' as const, name: 'my_td' },
            bindings: [
              { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
              { behavior: 'output', target: 'OUT_TOG' },
              { behavior: 'bluetooth', action: 'BT_CLR' }
            ]
          }
        ]
      }]
    };
    
    const result = check(keymap);
    
    if (result.isErr()) {
      throw new Error('Check failed: ' + JSON.stringify(result.error));
    }
    
    // Check that the tap-dance was converted correctly
    const binding = result.value.layers[0]?.bindings[0];
    expect(binding).toEqual({
      behavior: 'tapDance',
      name: 'my_td',
      bindings: [
        { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
        { behavior: 'macro', macroName: '__synthetic_output_0' },
        { behavior: 'macro', macroName: '__synthetic_bluetooth_1' }
      ]
    });
    
    // Check that synthetic macros were created
    expect(result.value.macros).toHaveLength(2);
    
    // Check that the tap-dance behavior definition was collected with bindings
    expect(result.value.behaviors).toHaveLength(1);
    expect(result.value.behaviors[0]).toEqual({
      compatible: 'zmk,behavior-tap-dance',
      name: 'my_td',
      bindings: ['__synthetic_bluetooth_1', '__synthetic_output_0', 'kp']  // complex behaviors wrapped in macros
    });
  });

  it('should reuse synthetic macros for identical bindings and deduplicate behavior definitions', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: [
          {
            behavior: 'holdTap',
            definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'ht1' },
            holdBinding: { behavior: 'bluetooth', action: 'BT_SEL', profile: 0 },
            tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
          },
          {
            behavior: 'holdTap',
            definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'ht2' },
            holdBinding: { behavior: 'bluetooth', action: 'BT_SEL', profile: 0 },
            tapBinding: { behavior: 'keyPress', code: { key: 'B', modifiers: [] } }
          }
        ]
      }]
    };
    
    const result = check(keymap);
    
    if (result.isErr()) {
      throw new Error('Check failed: ' + JSON.stringify(result.error));
    }
    
    // Both hold-taps should reference the same synthetic macro
    const binding1 = result.value.layers[0]?.bindings[0];
    const binding2 = result.value.layers[0]?.bindings[1];
    
    if (binding1?.behavior !== 'holdTap' || binding2?.behavior !== 'holdTap') {
      throw new Error('Expected hold-tap bindings');
    }
    
    expect(binding1.holdBinding).toEqual({ behavior: 'macro', macroName: '__synthetic_bluetooth_0' });
    expect(binding2.holdBinding).toEqual({ behavior: 'macro', macroName: '__synthetic_bluetooth_0' });
    
    // Only one synthetic macro should be created
    expect(result.value.macros).toHaveLength(1);
    
    // Should have collected both hold-tap definitions (they have different names)
    expect(result.value.behaviors).toHaveLength(2);
    const behaviorNames = result.value.behaviors.map(b => b.name);
    expect(behaviorNames).toContain('ht1');
    expect(behaviorNames).toContain('ht2');
  });

  it('should handle nested hold-taps correctly and collect nested behavior definitions', () => {
    const keymap: Keymap = {
      layers: [
        {
          name: 'default',
          bindings: [
            {
              behavior: 'holdTap',
              definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'outer_ht' },
              holdBinding: {
                behavior: 'holdTap',
                definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'inner_ht' },
                holdBinding: { behavior: 'momentaryLayer', layer: 'nav' },
                tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
              },
              tapBinding: { behavior: 'keyPress', code: { key: 'B', modifiers: [] } }
            }
          ]
        },
        {
          name: 'nav',
          bindings: []
        }
      ]
    };
    
    const result = check(keymap);
    
    if (result.isErr()) {
      throw new Error('Check failed: ' + JSON.stringify(result.error));
    }
    
    // The inner hold-tap should be wrapped in a synthetic macro
    const binding = result.value.layers[0]?.bindings[0];
    expect(binding).toEqual({
      behavior: 'holdTap',
      name: 'outer_ht',
      holdBinding: { behavior: 'macro', macroName: '__synthetic_holdTap_0' },
      tapBinding: { behavior: 'keyPress', code: { key: 'B', modifiers: [] } }
    });
    
    // Check the synthetic macro contains the inner hold-tap
    expect(result.value.macros).toHaveLength(1);
    expect(result.value.macros[0]?.name).toBe('__synthetic_holdTap_0');
    
    // Should have collected both hold-tap definitions
    expect(result.value.behaviors).toHaveLength(2);
    const behaviorNames = result.value.behaviors.map(b => b.name);
    expect(behaviorNames).toContain('outer_ht');
    expect(behaviorNames).toContain('inner_ht');
  });

  it('should not wrap complex behaviors at the top level', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: [
          { behavior: 'bluetooth', action: 'BT_SEL', profile: 0 },
          { behavior: 'output', target: 'OUT_USB' },
          { behavior: 'rgbUnderglow', action: 'RGB_TOG' }
        ]
      }]
    };
    
    const result = check(keymap);
    
    if (result.isErr()) {
      throw new Error('Check failed: ' + JSON.stringify(result.error));
    }
    
    // Complex behaviors should remain as-is at the top level
    expect(result.value.layers[0]?.bindings).toEqual([
      { behavior: 'bluetooth', action: 'BT_SEL', profile: 0 },
      { behavior: 'output', target: 'OUT_USB' },
      { behavior: 'rgbUnderglow', action: 'RGB_TOG' }
    ]);
    
    // No synthetic macros should be created
    expect(result.value.macros).toHaveLength(0);
  });

  it('should handle mod-morph with complex bindings and collect behavior definitions', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: [
          {
            behavior: 'modMorph',
            definition: { compatible: 'zmk,behavior-mod-morph' as const, name: 'my_mm' },
            defaultBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
            morphedBinding: { behavior: 'bluetooth', action: 'BT_NXT' },
            mods: ['LC', 'LS']
          }
        ]
      }]
    };
    
    const result = check(keymap);
    
    if (result.isErr()) {
      throw new Error('Check failed: ' + JSON.stringify(result.error));
    }
    
    // Check that the mod-morph was converted correctly
    const binding = result.value.layers[0]?.bindings[0];
    expect(binding).toEqual({
      behavior: 'modMorph',
      name: 'my_mm',
      defaultBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
      morphedBinding: { behavior: 'macro', macroName: '__synthetic_bluetooth_0' },
      mods: ['LC', 'LS']
    });
    
    // Check that a synthetic macro was created
    expect(result.value.macros).toHaveLength(1);
    
    // Check that the mod-morph behavior definition was collected with bindings
    expect(result.value.behaviors).toHaveLength(1);
    expect(result.value.behaviors[0]).toEqual({
      compatible: 'zmk,behavior-mod-morph',
      name: 'my_mm',
      bindings: ['__synthetic_bluetooth_0', 'kp']  // bluetooth wrapped in macro, kp for keyPress
    });
  });

  it('should collect behavior definitions correctly', () => {
    const keymap: Keymap = {
      layers: [
        {
          name: 'default',
          bindings: [
            {
              behavior: 'holdTap',
              definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'ht1', tappingTermMs: 200 },
              holdBinding: { behavior: 'momentaryLayer', layer: 'nav' },
              tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
            },
            {
              behavior: 'customStickyKey',
              definition: { compatible: 'zmk,behavior-sticky-key' as const, name: 'my_sk', releaseAfterMs: 1000 },
              code: { key: 'LS', modifiers: [] }
            },
            {
              behavior: 'tapDance',
              definition: { compatible: 'zmk,behavior-tap-dance' as const, name: 'td1', tappingTermMs: 250 },
              bindings: [
                { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
                { behavior: 'keyPress', code: { key: 'B', modifiers: [] } },
                {
                  behavior: 'customStickyLayer',
                  definition: { compatible: 'zmk,behavior-sticky-layer' as const, name: 'my_sl' },
                  layer: 'nav'
                }
              ]
            }
          ]
        },
        {
          name: 'nav',
          bindings: []
        }
      ],
      combos: [{
        name: 'test_combo',
        keyPositions: ['0', '1'],
        binding: {
          behavior: 'modMorph',
          definition: { compatible: 'zmk,behavior-mod-morph' as const, name: 'mm1' },
          defaultBinding: { behavior: 'keyPress', code: { key: 'C', modifiers: [] } },
          morphedBinding: { behavior: 'keyPress', code: { key: 'D', modifiers: [] } },
          mods: ['LC']
        }
      }]
    };
    
    const result = check(keymap);
    
    if (result.isErr()) {
      throw new Error('Check failed: ' + JSON.stringify(result.error));
    }
    
    // Should have collected 5 unique behavior definitions:
    // 1. ht1 (hold-tap)
    // 2. my_sk (custom sticky key)
    // 3. td1 (tap-dance)
    // 4. my_sl (custom sticky layer nested in tap-dance)
    // 5. mm1 (mod-morph from combo)
    expect(result.value.behaviors).toHaveLength(5);
    
    const behaviorNames = result.value.behaviors.map(b => b.name);
    expect(behaviorNames).toContain('ht1');
    expect(behaviorNames).toContain('my_sk');
    expect(behaviorNames).toContain('td1');
    expect(behaviorNames).toContain('my_sl');
    expect(behaviorNames).toContain('mm1');
  });

  it('should deduplicate identical behavior definitions', () => {
    const keymap: Keymap = {
      layers: [
        {
          name: 'default',
          bindings: [
            // First usage of ht1 with definition
            {
              behavior: 'holdTap',
              definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'ht1', tappingTermMs: 200 },
              holdBinding: { behavior: 'momentaryLayer', layer: 'nav' },
              tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
            },
            // Second usage of ht1 with same definition - should be deduplicated
            {
              behavior: 'holdTap',
              definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'ht1', tappingTermMs: 200 },
              holdBinding: { behavior: 'keyPress', code: { key: 'C', modifiers: [] } },
              tapBinding: { behavior: 'keyPress', code: { key: 'D', modifiers: [] } }
            }
          ]
        },
        {
          name: 'nav',
          bindings: []
        }
      ]
    };
    
    const result = check(keymap);
    
    if (result.isErr()) {
      throw new Error('Check failed: ' + JSON.stringify(result.error));
    }
    
    // Should only have one ht1 definition after deduplication
    expect(result.value.behaviors.filter(b => b.name === 'ht1')).toHaveLength(1);
    expect(result.value.behaviors[0]).toEqual({
      compatible: 'zmk,behavior-hold-tap',
      name: 'ht1',
      tappingTermMs: 200,
      bindings: ['mo', 'kp']  // hold behavior (mo) first, tap behavior (kp) second
    });
  });
  
  it('should fail when behavior definitions conflict', () => {
    const keymap: Keymap = {
      layers: [
        {
          name: 'default',
          bindings: [
            // First usage of ht1 with tappingTermMs: 200
            {
              behavior: 'holdTap',
              definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'ht1', tappingTermMs: 200 },
              holdBinding: { behavior: 'momentaryLayer', layer: 'nav' },
              tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
            },
            // Second usage with different tappingTermMs - this is an error
            {
              behavior: 'holdTap',
              definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'ht1', tappingTermMs: 300 },
              holdBinding: { behavior: 'keyPress', code: { key: 'E', modifiers: [] } },
              tapBinding: { behavior: 'keyPress', code: { key: 'F', modifiers: [] } }
            }
          ]
        },
        {
          name: 'nav',
          bindings: []
        }
      ]
    };
    
    const result = check(keymap);
    
    expect(result.isErr()).toBe(true);
    if (result.isOk()) {
      throw new Error('Expected check to fail');
    }
    
    expect(result.error).toHaveLength(1);
    expect(result.error[0]?.message).toContain('Behavior "ht1" has conflicting definitions');
  });

  it('should validate layer references exist', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: [
          { behavior: 'momentaryLayer', layer: 'NonExistent' }
        ]
      }]
    };
    
    const result = check(keymap);
    
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]?.message).toContain('Layer "NonExistent" does not exist');
    }
  });

  it('should deduplicate macros that are used multiple times', () => {
    const macro1 = { 
      name: 'test_macro', 
      bindings: [{ type: 'tap' as const, code: { key: 'A', modifiers: [] } }] 
    };
    
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: [
          { behavior: 'macro', macro: macro1 },
          { behavior: 'macro', macro: macro1 },  // Same macro used twice
          {
            behavior: 'holdTap',
            definition: {
              compatible: 'zmk,behavior-hold-tap' as const,
              name: 'ht1',
              tappingTermMs: 200
            },
            tapBinding: { behavior: 'macro', macro: macro1 },  // Same macro in hold-tap
            holdBinding: { behavior: 'keyPress', code: { key: 'LSHFT', modifiers: [] } }
          }
        ]
      }]
    };
    
    const result = check(keymap);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      // Should only have one instance of test_macro
      const testMacros = result.value.macros.filter(m => m.name === 'test_macro');
      expect(testMacros).toHaveLength(1);
    }
  });

  it('should track behavior usage for behaviors used within macros', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: [
          {
            behavior: 'macro',
            macro: {
              name: 'test_macro',
              bindings: [{
                type: 'behavior',
                binding: {
                  behavior: 'holdTap',
                  definition: {
                    compatible: 'zmk,behavior-hold-tap' as const,
                    name: 'ht_in_macro',
                    tappingTermMs: 200
                  },
                  tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
                  holdBinding: { behavior: 'momentaryLayer', layer: 'default' }
                }
              }]
            }
          }
        ]
      }]
    };
    
    const result = check(keymap);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      // Find the ht_in_macro behavior definition
      const htBehavior = result.value.behaviors.find(b => b.name === 'ht_in_macro');
      expect(htBehavior).toBeDefined();
      if (htBehavior && htBehavior.compatible === 'zmk,behavior-hold-tap') {
        // Should have bindings array with kp and mo
        expect(htBehavior.bindings).toEqual(['mo', 'kp']);
      } else {
        throw new Error('Hold-tap behavior should have bindings property');
      }
    }
  });

  it('should convert layer names to indices in macro actions', () => {
    const keymap: Keymap = {
      layers: [
        {
          name: 'Base',
          bindings: [
            {
              behavior: 'macro',
              macro: {
                name: 'copy_selection',
                bindings: [
                  { type: 'tap', code: { key: 'C', modifiers: ['LG'] } },
                  { type: 'behavior', binding: { behavior: 'toLayer', layer: 'Base' } }
                ]
              }
            }
          ]
        }
      ]
    };
    
    const result = check(keymap);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      // Find the copy_selection macro
      const macro = result.value.macros.find(m => m.name === 'copy_selection');
      expect(macro).toBeDefined();
      if (macro) {
        // The behavior action should have the layer converted to index 0
        const behaviorAction = macro.bindings.find(b => b.type === 'behavior');
        expect(behaviorAction).toBeDefined();
        if (behaviorAction && behaviorAction.type === 'behavior') {
          const expectedBinding: CheckedBinding = { behavior: 'toLayer', layer: 0 };
          expect(behaviorAction.binding).toEqual(expectedBinding);
        }
      }
    }
  });

  it('should pass through global behavior config', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: []
      }],
      globalBehaviorConfig: {
        mt: {
          tappingTermMs: 280,
          flavor: 'balanced'
        },
        sk: {
          releaseAfterMs: 2000,
          ignoreModifiers: false
        }
      }
    };

    const result = check(keymap);
    
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.globalBehaviorConfig).toEqual({
        mt: {
          tappingTermMs: 280,
          flavor: 'balanced'
        },
        sk: {
          releaseAfterMs: 2000,
          ignoreModifiers: false
        }
      });
    }
  });

  it('should collect unique bindings for behaviors used in multiple contexts', () => {
    const keymap: Keymap = {
      layers: [
        {
          name: 'default',
          bindings: [
            {
              behavior: 'holdTap',
              definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'ht_multi' },
              holdBinding: { behavior: 'momentaryLayer', layer: 'nav' },
              tapBinding: { behavior: 'keyPress', code: { key: 'A', modifiers: [] } }
            },
            {
              behavior: 'holdTap',
              definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'ht_multi' },
              holdBinding: { behavior: 'toggleLayer', layer: 'fn' },
              tapBinding: { behavior: 'modTap', mod: { key: 'LC', modifiers: [] }, tap: { key: 'B', modifiers: [] } }
            },
            {
              behavior: 'tapDance',
              definition: { compatible: 'zmk,behavior-tap-dance' as const, name: 'td_complex' },
              bindings: [
                { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
                { behavior: 'stickyKey', code: { key: 'LS', modifiers: [] } },
                { behavior: 'toLayer', layer: 'base' },
                {
                  behavior: 'holdTap',
                  definition: { compatible: 'zmk,behavior-hold-tap' as const, name: 'ht_nested' },
                  holdBinding: { behavior: 'capsWord' },
                  tapBinding: { behavior: 'keyRepeat' }
                }
              ]
            }
          ]
        },
        {
          name: 'nav',
          bindings: []
        },
        {
          name: 'fn',
          bindings: []
        },
        {
          name: 'base',
          bindings: []
        }
      ]
    };
    
    const result = check(keymap);
    
    if (result.isErr()) {
      throw new Error('Check failed: ' + JSON.stringify(result.error));
    }
    
    // Find each behavior definition
    const htMulti = result.value.behaviors.find(b => b.name === 'ht_multi');
    const tdComplex = result.value.behaviors.find(b => b.name === 'td_complex');
    const htNested = result.value.behaviors.find(b => b.name === 'ht_nested');
    
    // ht_multi should have exactly 2 behaviors (hold-tap always has exactly 2)
    expect(htMulti).toBeDefined();
    if (htMulti && htMulti.compatible === 'zmk,behavior-hold-tap') {
      expect(htMulti.bindings).toHaveLength(2);
      expect(htMulti.bindings[0]).toBe('mo');  // First usage: hold is momentaryLayer
      expect(htMulti.bindings[1]).toBe('kp');  // First usage: tap is keyPress
    }
    
    // td_complex should have all behaviors used in tap-dance
    expect(tdComplex).toBeDefined();
    if (tdComplex && tdComplex.compatible === 'zmk,behavior-tap-dance') {
      expect(tdComplex.bindings).toContain('kp');      // keyPress
      expect(tdComplex.bindings).toContain('sk');      // stickyKey
      expect(tdComplex.bindings).toContain('to');      // toLayer
      expect(tdComplex.bindings).toContain('__synthetic_holdTap_0'); // nested hold-tap wrapped in macro
    }
    
    // ht_nested should have its own bindings
    expect(htNested).toBeDefined();
    if (htNested && htNested.compatible === 'zmk,behavior-hold-tap') {
      // ht_nested is defined inline within a tap-dance, so its bindings are collected
      expect(htNested.bindings.sort()).toEqual(['caps_word', 'key_repeat']);
    }
  });
});