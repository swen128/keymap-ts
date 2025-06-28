import { describe, it, expect } from 'bun:test';
import { transpile } from './transpiler';
import type { Keymap } from './dsl/schemas';

describe('transpiler', () => {
  it('should transpile a simple keymap successfully', () => {
    const keymap: Keymap = {
      layers: [{
        name: 'default',
        bindings: [
          { behavior: 'keyPress', code: { key: 'A', modifiers: [] } },
          { behavior: 'keyPress', code: { key: 'B', modifiers: ['LC'] } },
          { behavior: 'transparent' },
          { behavior: 'momentaryLayer', layer: 'nav' }
        ]
      }]
    };
    
    const result = transpile(keymap);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toContain('&kp A');
      expect(result.output).toContain('&kp LC(B)');
      expect(result.output).toContain('&trans');
      expect(result.output).toContain('&mo nav');
    }
  });

  it('should return validation errors for invalid input', () => {
    const result = transpile({ invalid: 'data' });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
      // The exact error message depends on Zod's validation
      expect(result.errors[0]?.message).toBeTruthy();
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
    
    expect(result.success).toBe(false);
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
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.message).toContain('conflicting definitions');
    }
  });

  it('should transpile a complex keymap with all features', () => {
    const keymap: Keymap = {
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
    
    const result = transpile(keymap);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toContain('test_macro');
      expect(result.output).toContain('combo_ctrl_z');
      expect(result.output).toContain('conditional_layers');
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
    
    const result = transpile(keymap);
    
    expect(result.success).toBe(true);
    if (result.success) {
      // Should contain the synthesized macro for bluetooth
      expect(result.output).toContain('__synthetic_bluetooth_');
      expect(result.output).toContain('&bt BT_CLR');
      // Should contain the hold-tap behavior
      expect(result.output).toContain('hm: hm');
      expect(result.output).toContain('zmk,behavior-hold-tap');
    }
  });
});