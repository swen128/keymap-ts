import {describe, it, expect} from 'bun:test';
import type {HoldTapDefinition} from './schemas.js';

describe('HoldTapDefinition', () => {
  it('should support holdTriggerOnRelease property', () => {
    const definition: HoldTapDefinition = {
      name: 'home_row_mod',
      compatible: 'zmk,behavior-hold-tap',
      tappingTermMs: 280,
      flavor: 'balanced',
      requirePriorIdleMs: 150,
      quickTapMs: 175,
      holdTriggerKeyPositions: [10, 11, 12, 13, 14, 15],
      holdTriggerOnRelease: true
    };
    
    expect(definition.holdTriggerOnRelease).toBe(true);
  });

  it('should allow holdTriggerOnRelease to be undefined', () => {
    const definition: HoldTapDefinition = {
      name: 'simple_hold_tap',
      compatible: 'zmk,behavior-hold-tap',
      tappingTermMs: 200
    };
    
    expect(definition.holdTriggerOnRelease).toBeUndefined();
  });

  it('should allow holdTriggerOnRelease to be false', () => {
    const definition: HoldTapDefinition = {
      name: 'hold_tap_no_release',
      compatible: 'zmk,behavior-hold-tap',
      holdTriggerKeyPositions: [1, 2, 3],
      holdTriggerOnRelease: false
    };
    
    expect(definition.holdTriggerOnRelease).toBe(false);
  });
});