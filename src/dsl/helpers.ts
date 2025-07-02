import type { 
  Behavior, 
  ModifierKey, 
  HoldTapDefinition, 
  TapDanceDefinition, 
  MacroDefinition, 
  StickyKeyDefinition, 
  StickyLayerDefinition, 
  ModMorphDefinition,
  MouseButtonType,
  BluetoothActionType,
  OutputTargetType,
  RgbActionType,
  BacklightActionType,
  ExtPowerActionType
} from './schemas.js';

// Type alias for cleaner code
export type Mod = ModifierKey;

// Basic key behaviors
export const kp = (key: string, modifiers: Mod[] = []): Behavior => ({
  behavior: 'keyPress',
  code: { key, modifiers }
});

export const sk = (key: string, modifiers: Mod[] = []): Behavior => ({
  behavior: 'stickyKey',
  code: { key, modifiers }
});

export const kt = (key: string, modifiers: Mod[] = []): Behavior => ({
  behavior: 'keyToggle',
  code: { key, modifiers }
});

// Layer behaviors
export const mo = (layer: string): Behavior => ({
  behavior: 'momentaryLayer',
  layer
});

export const to = (layer: string): Behavior => ({
  behavior: 'toLayer',
  layer
});

export const tog = (layer: string): Behavior => ({
  behavior: 'toggleLayer',
  layer
});

export const sl = (layer: string): Behavior => ({
  behavior: 'stickyLayer',
  layer
});

export const lt = (layer: string, key: string, modifiers: Mod[] = []): Behavior => ({
  behavior: 'layerTap',
  layer,
  tap: { key, modifiers }
});

// Mod-tap
export const mt = (modKey: string, modMods: Mod[], tapKey: string, tapMods: Mod[] = []): Behavior => ({
  behavior: 'modTap',
  mod: { key: modKey, modifiers: modMods },
  tap: { key: tapKey, modifiers: tapMods }
});

// Hold-tap
export const ht = (definition: HoldTapDefinition, hold: Behavior, tap: Behavior): Behavior => ({
  behavior: 'holdTap',
  definition,
  holdBinding: hold,
  tapBinding: tap
});

// Tap-dance
export const td = (definition: TapDanceDefinition, ...bindings: Behavior[]): Behavior => ({
  behavior: 'tapDance',
  definition,
  bindings
});

// Mod-morph
export const mm = (definition: ModMorphDefinition, defaultBinding: Behavior, morphedBinding: Behavior, mods: Mod[]): Behavior => ({
  behavior: 'modMorph',
  definition,
  defaultBinding,
  morphedBinding,
  mods
});

// Custom sticky key
export const csk = (definition: StickyKeyDefinition, key: string, modifiers: Mod[] = []): Behavior => ({
  behavior: 'customStickyKey',
  definition,
  code: { key, modifiers }
});

// Custom sticky layer
export const csl = (definition: StickyLayerDefinition, layer: string): Behavior => ({
  behavior: 'customStickyLayer',
  definition,
  layer
});

// Macro
export const macro = (name: string, bindings: MacroDefinition['bindings']): Behavior => ({
  behavior: 'macro',
  macro: { name, bindings }
});

// System behaviors
export const bt = (action: BluetoothActionType, profile?: number): Behavior => ({
  behavior: 'bluetooth',
  action,
  ...(profile !== undefined && { profile })
});

export const out = (target: OutputTargetType): Behavior => ({
  behavior: 'output',
  target
});

export const rgb_ug = (
  action: RgbActionType,
  hue?: number,
  saturation?: number,
  brightness?: number
): Behavior => ({
  behavior: 'rgbUnderglow',
  action,
  ...(hue !== undefined && { hue }),
  ...(saturation !== undefined && { saturation }),
  ...(brightness !== undefined && { brightness })
});

export const bl = (
  action: BacklightActionType,
  brightness?: number
): Behavior => ({
  behavior: 'backlight',
  action,
  ...(brightness !== undefined && { brightness })
});

export const ext_power = (action: ExtPowerActionType): Behavior => ({
  behavior: 'extPower',
  action
});

// Mouse behaviors
export const mkp = (button: MouseButtonType): Behavior => ({
  behavior: 'mouseButton',
  button
});

export const mmv = (x?: number, y?: number): Behavior => ({
  behavior: 'mouseMove',
  ...(x !== undefined && { x }),
  ...(y !== undefined && { y })
});

export const msc = (x?: number, y?: number): Behavior => ({
  behavior: 'mouseScroll',
  ...(x !== undefined && { x }),
  ...(y !== undefined && { y })
});

// Soft off
export const soft_off = (holdTimeMs?: number): Behavior => ({
  behavior: 'softOff',
  ...(holdTimeMs !== undefined && { holdTimeMs })
});

// Special behaviors - constants
export const trans: Behavior = { behavior: 'transparent' };
export const none: Behavior = { behavior: 'none' };
export const bootloader: Behavior = { behavior: 'bootloader' };
export const sys_reset: Behavior = { behavior: 'systemReset' };
export const caps_word: Behavior = { behavior: 'capsWord' };
export const key_repeat: Behavior = { behavior: 'keyRepeat' };
export const studio_unlock: Behavior = { behavior: 'studioUnlock' };

// Helper to create key codes
export const key = (k: string, mods: Mod[] = []): { key: string; modifiers: Mod[] } => ({ 
  key: k, 
  modifiers: mods 
});

// Common modifier combinations
export const C = (k: string): Behavior => kp(k, ['LC']);
export const S = (k: string): Behavior => kp(k, ['LS']);
export const A = (k: string): Behavior => kp(k, ['LA']);
export const G = (k: string): Behavior => kp(k, ['LG']);
export const CS = (k: string): Behavior => kp(k, ['LC', 'LS']);
export const CA = (k: string): Behavior => kp(k, ['LC', 'LA']);
export const CG = (k: string): Behavior => kp(k, ['LC', 'LG']);
export const CSA = (k: string): Behavior => kp(k, ['LC', 'LS', 'LA']);
export const CSG = (k: string): Behavior => kp(k, ['LC', 'LS', 'LG']);
export const CAG = (k: string): Behavior => kp(k, ['LC', 'LA', 'LG']);
export const CSAG = (k: string): Behavior => kp(k, ['LC', 'LS', 'LA', 'LG']);

// Mouse button constants
export const MB1: MouseButtonType = 'MB1';
export const MB2: MouseButtonType = 'MB2';
export const MB3: MouseButtonType = 'MB3';
export const MB4: MouseButtonType = 'MB4';
export const MB5: MouseButtonType = 'MB5';
export const LCLK: MouseButtonType = 'LCLK';
export const RCLK: MouseButtonType = 'RCLK';
export const MCLK: MouseButtonType = 'MCLK';

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

export const behavior = (binding: Behavior): MacroDefinition['bindings'][number] => ({
  type: 'behavior',
  binding
});