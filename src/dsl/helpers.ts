import type { Binding, ModifierKey, HoldTapDefinition, TapDanceDefinition, MacroDefinition, StickyKeyDefinition, StickyLayerDefinition, ModMorphDefinition } from './schemas';

// Type alias for cleaner code
export type Mod = ModifierKey;

// Basic key behaviors
export const kp = (key: string, modifiers: Mod[] = []): Binding => ({
  behavior: 'keyPress',
  code: { key, modifiers }
});

export const sk = (key: string, modifiers: Mod[] = []): Binding => ({
  behavior: 'stickyKey',
  code: { key, modifiers }
});

export const kt = (key: string, modifiers: Mod[] = []): Binding => ({
  behavior: 'keyToggle',
  code: { key, modifiers }
});

// Layer behaviors
export const mo = (layer: string): Binding => ({
  behavior: 'momentaryLayer',
  layer
});

export const to = (layer: string): Binding => ({
  behavior: 'toLayer',
  layer
});

export const tog = (layer: string): Binding => ({
  behavior: 'toggleLayer',
  layer
});

export const sl = (layer: string): Binding => ({
  behavior: 'stickyLayer',
  layer
});

export const lt = (layer: string, key: string, modifiers: Mod[] = []): Binding => ({
  behavior: 'layerTap',
  layer,
  tap: { key, modifiers }
});

// Mod-tap
export const mt = (modKey: string, modMods: Mod[], tapKey: string, tapMods: Mod[] = []): Binding => ({
  behavior: 'modTap',
  mod: { key: modKey, modifiers: modMods },
  tap: { key: tapKey, modifiers: tapMods }
});

// Hold-tap
export const ht = (definition: HoldTapDefinition, hold: Binding, tap: Binding): Binding => ({
  behavior: 'holdTap',
  definition,
  holdBinding: hold,
  tapBinding: tap
});

// Tap-dance
export const td = (definition: TapDanceDefinition, ...bindings: Binding[]): Binding => ({
  behavior: 'tapDance',
  definition,
  bindings
});

// Mod-morph
export const mm = (definition: ModMorphDefinition, defaultBinding: Binding, morphedBinding: Binding, mods: Mod[]): Binding => ({
  behavior: 'modMorph',
  definition,
  defaultBinding,
  morphedBinding,
  mods
});

// Custom sticky key
export const csk = (definition: StickyKeyDefinition, key: string, modifiers: Mod[] = []): Binding => ({
  behavior: 'customStickyKey',
  definition,
  code: { key, modifiers }
});

// Custom sticky layer
export const csl = (definition: StickyLayerDefinition, layer: string): Binding => ({
  behavior: 'customStickyLayer',
  definition,
  layer
});

// Macro
export const macro = (name: string, bindings: MacroDefinition['bindings']): Binding => ({
  behavior: 'macro',
  macro: { name, bindings }
});

// System behaviors
export const bt = (action: 'BT_CLR' | 'BT_SEL' | 'BT_NXT' | 'BT_PRV' | 'BT_DISC' | 'BT_CLR_ALL', profile?: number): Binding => ({
  behavior: 'bluetooth',
  action,
  ...(profile !== undefined && { profile })
});

export const out = (target: 'OUT_BLE' | 'OUT_USB' | 'OUT_TOG'): Binding => ({
  behavior: 'output',
  target
});

export const rgb_ug = (
  action: 'RGB_BRD' | 'RGB_BRI' | 'RGB_COLOR_HSB' | 'RGB_EFF' | 'RGB_EFR' | 'RGB_HUD' | 'RGB_HUI' | 
          'RGB_OFF' | 'RGB_ON' | 'RGB_SAD' | 'RGB_SAI' | 'RGB_SPD' | 'RGB_SPI' | 'RGB_TOG' | 'RGB_STATUS',
  hue?: number,
  saturation?: number,
  brightness?: number
): Binding => ({
  behavior: 'rgbUnderglow',
  action,
  ...(hue !== undefined && { hue }),
  ...(saturation !== undefined && { saturation }),
  ...(brightness !== undefined && { brightness })
});

export const bl = (
  action: 'BL_ON' | 'BL_OFF' | 'BL_TOG' | 'BL_INC' | 'BL_DEC' | 'BL_CYCLE' | 'BL_SET',
  brightness?: number
): Binding => ({
  behavior: 'backlight',
  action,
  ...(brightness !== undefined && { brightness })
});

export const ext_power = (action: 'EP_ON' | 'EP_OFF' | 'EP_TOG'): Binding => ({
  behavior: 'extPower',
  action
});

// Mouse behaviors
export const mkp = (button: 'MB1' | 'MB2' | 'MB3' | 'MB4' | 'MB5'): Binding => ({
  behavior: 'mouseButton',
  button
});

export const mmv = (x?: number, y?: number): Binding => ({
  behavior: 'mouseMove',
  ...(x !== undefined && { x }),
  ...(y !== undefined && { y })
});

export const msc = (x?: number, y?: number): Binding => ({
  behavior: 'mouseScroll',
  ...(x !== undefined && { x }),
  ...(y !== undefined && { y })
});

// Soft off
export const soft_off = (holdTimeMs?: number): Binding => ({
  behavior: 'softOff',
  ...(holdTimeMs !== undefined && { holdTimeMs })
});

// Special behaviors - constants
export const trans: Binding = { behavior: 'transparent' };
export const none: Binding = { behavior: 'none' };
export const bootloader: Binding = { behavior: 'bootloader' };
export const sys_reset: Binding = { behavior: 'systemReset' };
export const caps_word: Binding = { behavior: 'capsWord' };
export const key_repeat: Binding = { behavior: 'keyRepeat' };
export const studio_unlock: Binding = { behavior: 'studioUnlock' };

// Helper to create key codes
export const key = (k: string, mods: Mod[] = []): { key: string; modifiers: Mod[] } => ({ 
  key: k, 
  modifiers: mods 
});

// Common modifier combinations
export const C = (k: string): Binding => kp(k, ['LC']);
export const S = (k: string): Binding => kp(k, ['LS']);
export const A = (k: string): Binding => kp(k, ['LA']);
export const G = (k: string): Binding => kp(k, ['LG']);
export const CS = (k: string): Binding => kp(k, ['LC', 'LS']);
export const CA = (k: string): Binding => kp(k, ['LC', 'LA']);
export const CG = (k: string): Binding => kp(k, ['LC', 'LG']);
export const CSA = (k: string): Binding => kp(k, ['LC', 'LS', 'LA']);
export const CSG = (k: string): Binding => kp(k, ['LC', 'LS', 'LG']);
export const CAG = (k: string): Binding => kp(k, ['LC', 'LA', 'LG']);
export const CSAG = (k: string): Binding => kp(k, ['LC', 'LS', 'LA', 'LG']);

// Macro action helpers
export const tap = (k: string, modifiers: Mod[] = []): MacroDefinition['bindings'][number] => ({
  type: 'tap',
  code: { key: k, modifiers }
});

export const press = (k: string, modifiers: Mod[] = []): MacroDefinition['bindings'][number] => ({
  type: 'press',
  code: { key: k, modifiers }
});

export const release = (k: string, modifiers: Mod[] = []): MacroDefinition['bindings'][number] => ({
  type: 'release',
  code: { key: k, modifiers }
});

export const wait = (ms: number): MacroDefinition['bindings'][number] => ({
  type: 'wait',
  ms
});

export const pauseForRelease = (): MacroDefinition['bindings'][number] => ({
  type: 'pauseForRelease'
});

export const tapTime = (ms: number): MacroDefinition['bindings'][number] => ({
  type: 'tapTime',
  ms
});

export const waitTime = (ms: number): MacroDefinition['bindings'][number] => ({
  type: 'waitTime',
  ms
});

export const behavior = (binding: Binding): MacroDefinition['bindings'][number] => ({
  type: 'behavior',
  binding
});