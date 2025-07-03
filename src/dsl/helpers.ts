import type {
  Behavior,
  ModifierKey,
  HoldTapDefinition,
  TapDanceDefinition,
  StickyKeyDefinition,
  StickyLayerDefinition,
  ModMorphDefinition,
  MouseButtonType,
  BluetoothActionType,
  OutputTargetType,
  RgbActionType,
  BacklightActionType,
  ExtPowerActionType,
  KeyPress,
  StickyKey,
  KeyToggle,
  MomentaryLayer,
  ToLayer,
  ToggleLayer,
  StickyLayer,
  LayerTap,
  ModTap,
  HoldTap,
  TapDance,
  ModMorph,
  CustomStickyKey,
  CustomStickyLayer,
  BluetoothAction,
  OutputSelection,
  RgbUnderglow,
  Backlight,
  ExtPower,
  MouseButton,
  MouseMove,
  MouseScroll,
  SoftOff,
  Transparent,
  None,
  Bootloader,
  SystemReset,
  CapsWord,
  KeyRepeat,
  StudioUnlock
} from './schemas.js';

// Type alias for cleaner code
export type Mod = ModifierKey;

// Re-export KeyPress for external use
export type { KeyPress };

// Basic key behaviors
export const kp = (key: string, modifiers: Mod[] = []): KeyPress => ({
  behavior: 'keyPress',
  code: { key, modifiers }
});

export const sk = (input: KeyPress): StickyKey => ({
  behavior: 'stickyKey',
  code: input.code
});

export const kt = (input: KeyPress): KeyToggle => ({
  behavior: 'keyToggle',
  code: input.code
});

// Layer behaviors
export const mo = (layer: string): MomentaryLayer => ({
  behavior: 'momentaryLayer',
  layer
});

export const to = (layer: string): ToLayer => ({
  behavior: 'toLayer',
  layer
});

export const tog = (layer: string): ToggleLayer => ({
  behavior: 'toggleLayer',
  layer
});

export const sl = (layer: string): StickyLayer => ({
  behavior: 'stickyLayer',
  layer
});

export const lt = (layer: string, tap: KeyPress): LayerTap => ({
  behavior: 'layerTap',
  layer,
  tap: tap.code
});

// Mod-tap
export const mt = (mod: KeyPress, tap: KeyPress): ModTap => ({
  behavior: 'modTap',
  mod: mod.code,
  tap: tap.code
});

// Hold-tap
export const ht = (definition: HoldTapDefinition, hold: Behavior, tap: Behavior): HoldTap => ({
  behavior: 'holdTap',
  definition,
  holdBinding: hold,
  tapBinding: tap
});

// Tap-dance
export const td = (definition: TapDanceDefinition, ...bindings: Behavior[]): TapDance => ({
  behavior: 'tapDance',
  definition,
  bindings
});

// Mod-morph
export const mm = (definition: ModMorphDefinition, defaultBinding: Behavior, morphedBinding: Behavior, mods: Mod[]): ModMorph => ({
  behavior: 'modMorph',
  definition,
  defaultBinding,
  morphedBinding,
  mods
});

// Custom sticky key
export const csk = (definition: StickyKeyDefinition, input: KeyPress): CustomStickyKey => ({
  behavior: 'customStickyKey',
  definition,
  code: input.code
});

// Custom sticky layer
export const csl = (definition: StickyLayerDefinition, layer: string): CustomStickyLayer => ({
  behavior: 'customStickyLayer',
  definition,
  layer
});


// System behaviors
export const bt = (action: BluetoothActionType, profile?: number): BluetoothAction => ({
  behavior: 'bluetooth',
  action,
  ...(profile !== undefined && { profile })
});

export const out = (target: OutputTargetType): OutputSelection => ({
  behavior: 'output',
  target
});

export const rgb_ug = (
  action: RgbActionType,
  hue?: number,
  saturation?: number,
  brightness?: number
): RgbUnderglow => ({
  behavior: 'rgbUnderglow',
  action,
  ...(hue !== undefined && { hue }),
  ...(saturation !== undefined && { saturation }),
  ...(brightness !== undefined && { brightness })
});

export const bl = (
  action: BacklightActionType,
  brightness?: number
): Backlight => ({
  behavior: 'backlight',
  action,
  ...(brightness !== undefined && { brightness })
});

export const ext_power = (action: ExtPowerActionType): ExtPower => ({
  behavior: 'extPower',
  action
});

// Mouse behaviors
export const mkp = (button: MouseButtonType): MouseButton => ({
  behavior: 'mouseButton',
  button
});

export const mmv = (x?: number, y?: number): MouseMove => ({
  behavior: 'mouseMove',
  ...(x !== undefined && { x }),
  ...(y !== undefined && { y })
});

export const msc = (x?: number, y?: number): MouseScroll => ({
  behavior: 'mouseScroll',
  ...(x !== undefined && { x }),
  ...(y !== undefined && { y })
});

// Soft off
export const soft_off = (holdTimeMs?: number): SoftOff => ({
  behavior: 'softOff',
  ...(holdTimeMs !== undefined && { holdTimeMs })
});

// Special behaviors - constants
export const trans: Transparent = { behavior: 'transparent' };
export const none: None = { behavior: 'none' };
export const bootloader: Bootloader = { behavior: 'bootloader' };
export const sys_reset: SystemReset = { behavior: 'systemReset' };
export const caps_word: CapsWord = { behavior: 'capsWord' };
export const key_repeat: KeyRepeat = { behavior: 'keyRepeat' };
export const studio_unlock: StudioUnlock = { behavior: 'studioUnlock' };

// Helper to create key codes
export const key = (k: string, mods: Mod[] = []): { key: string; modifiers: Mod[] } => ({ 
  key: k, 
  modifiers: mods 
});

// Mouse button constants
export const MB1: MouseButtonType = 'MB1';
export const MB2: MouseButtonType = 'MB2';
export const MB3: MouseButtonType = 'MB3';
export const MB4: MouseButtonType = 'MB4';
export const MB5: MouseButtonType = 'MB5';
export const LCLK: MouseButtonType = 'LCLK';
export const RCLK: MouseButtonType = 'RCLK';
export const MCLK: MouseButtonType = 'MCLK';

