import {tags} from 'typia';

export type PlainKeyCode = string;

// Common enums used across multiple schemas
export type MouseButtonType = 'MB1' | 'MB2' | 'MB3' | 'MB4' | 'MB5' | 'LCLK' | 'RCLK' | 'MCLK';

export type BluetoothActionType = 'BT_SEL' | 'BT_CLR' | 'BT_NXT' | 'BT_PRV' | 'BT_DISC' | 'BT_CLR_ALL';

export type OutputTargetType = 'OUT_USB' | 'OUT_BLE' | 'OUT_TOG';

export type RgbActionType = 'RGB_ON' | 'RGB_OFF' | 'RGB_TOG' | 'RGB_HUI' | 'RGB_HUD' | 'RGB_SAI' | 'RGB_SAD' | 'RGB_BRI' | 'RGB_BRD' | 'RGB_SPI' | 'RGB_SPD' | 'RGB_EFF' | 'RGB_EFR' | 'RGB_COLOR_HSB' | 'RGB_STATUS';

export type BacklightActionType = 'BL_ON' | 'BL_OFF' | 'BL_TOG' | 'BL_INC' | 'BL_DEC' | 'BL_CYCLE' | 'BL_SET';

export type ExtPowerActionType = 'EP_ON' | 'EP_OFF' | 'EP_TOG';

export type ModifierKey = 'LS' | 'LC' | 'LA' | 'LG' | 'RS' | 'RC' | 'RA' | 'RG';

export interface KeyWithModifiers {
  modifiers: ModifierKey[];
  key: PlainKeyCode;
}

export interface KeyPress {
  behavior: 'keyPress';
  code: KeyWithModifiers;
}

export interface ModTap {
  behavior: 'modTap';
  mod: KeyWithModifiers;
  tap: KeyWithModifiers;
}

export interface LayerTap {
  behavior: 'layerTap';
  layer: string;
  tap: KeyWithModifiers;
}

export interface ToLayer {
  behavior: 'toLayer';
  layer: string;
}

export interface Transparent {
  behavior: 'transparent';
}

export interface None {
  behavior: 'none';
}

export interface KeyToggle {
  behavior: 'keyToggle';
  code: KeyWithModifiers;
}

// Custom behavior definition schemas
export interface StickyKeyDefinition {
  compatible: 'zmk,behavior-sticky-key';
  name: string;
  releaseAfterMs?: number;
  quickRelease?: boolean;
  lazy?: boolean;
  ignoreModifiers?: boolean;
}

export interface StickyLayerDefinition {
  compatible: 'zmk,behavior-sticky-layer';
  name: string;
  releaseAfterMs?: number;
  quickRelease?: boolean;
  ignoreModifiers?: boolean;
}

export interface HoldTapDefinition {
  compatible: 'zmk,behavior-hold-tap';
  name: string;
  tappingTermMs?: number;
  quickTapMs?: number;
  retro?: boolean;
  holdWhileUndecided?: boolean;
  flavor?: 'hold-preferred' | 'balanced' | 'tap-preferred' | 'tap-unless-interrupted';
  requirePriorIdleMs?: number;
  holdTriggerKeyPositions?: number[];
  holdTriggerOnRelease?: boolean;
}

export interface TapDanceDefinition {
  compatible: 'zmk,behavior-tap-dance';
  name: string;
  tappingTermMs?: number;
}

export interface ModMorphDefinition {
  compatible: 'zmk,behavior-mod-morph';
  name: string;
  keepMods?: boolean;
}

export interface StickyKey {
  behavior: 'stickyKey';
  code: KeyWithModifiers;
}

export interface CustomStickyKey {
  behavior: 'customStickyKey';
  definition: StickyKeyDefinition;
  code: KeyWithModifiers;
}

export interface CapsWord {
  behavior: 'capsWord';
  continueList?: KeyWithModifiers[];
  applyToNumbers?: boolean;
}

export interface KeyRepeat {
  behavior: 'keyRepeat';
}

export interface MomentaryLayer {
  behavior: 'momentaryLayer';
  layer: string;
}

export interface ToggleLayer {
  behavior: 'toggleLayer';
  layer: string;
}

export interface StickyLayer {
  behavior: 'stickyLayer';
  layer: string;
}

export interface CustomStickyLayer {
  behavior: 'customStickyLayer';
  definition: StickyLayerDefinition;
  layer: string;
}

export interface MouseButton {
  behavior: 'mouseButton';
  button: MouseButtonType;
}

export interface MouseMove {
  behavior: 'mouseMove';
  x?: number;
  y?: number;
  delay?: number;
  acceleration?: number;
}

export interface MouseScroll {
  behavior: 'mouseScroll';
  x?: number;
  y?: number;
  continuousScroll?: boolean;
  delay?: number;
  acceleration?: number;
}

export interface SystemReset {
  behavior: 'systemReset';
}

export interface Bootloader {
  behavior: 'bootloader';
}

export interface BluetoothAction {
  behavior: 'bluetooth';
  action: BluetoothActionType;
  profile?: number;
}

export interface OutputSelection {
  behavior: 'output';
  target: OutputTargetType;
}

export interface RgbUnderglow {
  behavior: 'rgbUnderglow';
  action: RgbActionType;
  hue?: number;
  saturation?: number;
  brightness?: number;
}

export interface Backlight {
  behavior: 'backlight';
  action: BacklightActionType;
  brightness?: number;
}

export interface ExtPower {
  behavior: 'extPower';
  action: ExtPowerActionType;
}

export interface SoftOff {
  behavior: 'softOff';
  holdTimeMs?: number;
}

export interface StudioUnlock {
  behavior: 'studioUnlock';
}

export interface HoldTap {
  behavior: 'holdTap';
  definition: HoldTapDefinition;
  tapBinding: Behavior;
  holdBinding: Behavior;
}

export interface TapDance {
  behavior: 'tapDance';
  definition: TapDanceDefinition;
  bindings: Behavior[];
}

export interface ModMorph {
  behavior: 'modMorph';
  definition: ModMorphDefinition;
  defaultBinding: Behavior;
  morphedBinding: Behavior;
  mods: PlainKeyCode[];
}

export interface MacroTapAction {
  type: 'tap';
  code: KeyWithModifiers;
}

export interface MacroPressAction {
  type: 'press';
  code: KeyWithModifiers;
}

export interface MacroReleaseAction {
  type: 'release';
  code: KeyWithModifiers;
}

export interface MacroWaitAction {
  type: 'wait';
  ms: number;
}

export type MacroControlAction = 
  | {type: 'pauseForRelease'}
  | {type: 'tapTime'; ms: number}
  | {type: 'waitTime'; ms: number};

export interface MacroBehaviorAction {
  type: 'behavior';
  binding: Behavior;
}

export type MacroAction = 
  | MacroTapAction 
  | MacroPressAction 
  | MacroReleaseAction 
  | MacroWaitAction 
  | MacroControlAction
  | MacroBehaviorAction;

export interface MacroDefinition {
  name: string;
  label?: string;
  bindings: MacroAction[];
  waitMs?: number;
  tapMs?: number;
}

export interface MacroBinding {
  behavior: 'macro';
  macro: MacroDefinition;
}

export type Behavior =
  | KeyPress | ModTap | LayerTap | ToLayer | MacroBinding | Transparent | None
  | KeyToggle | StickyKey | CustomStickyKey | CapsWord | KeyRepeat
  | MomentaryLayer | ToggleLayer | StickyLayer | CustomStickyLayer
  | MouseButton | MouseMove | MouseScroll | SystemReset | Bootloader
  | BluetoothAction | OutputSelection | RgbUnderglow | Backlight
  | ExtPower | SoftOff | StudioUnlock | HoldTap | TapDance | ModMorph;

export interface Combo {
  name: string;
  timeout?: number;
  keyPositions: string[];
  binding: Behavior;
  layers?: string[];
  slowRelease?: boolean;
  requirePriorIdleMs?: number;
}

export interface ConditionalLayer {
  name: string;
  ifLayers: string[];
  thenLayer: string;
}

export type GenericKeyboardLayout = Behavior[];

export interface Layer {
  name: string;
  bindings: GenericKeyboardLayout;
}

// Include validation
export type Include = string & tags.Pattern<"^[^\\n\\r\"'`]+$"> & tags.MinLength<1>;

export interface GlobalBehaviorConfig {
  // Hold-tap behaviors (&mt, &lt)
  mt?: {
    tappingTermMs?: number;
    flavor?: 'hold-preferred' | 'balanced' | 'tap-preferred' | 'tap-unless-interrupted';
    quickTapMs?: number;
    requirePriorIdleMs?: number;
    holdTriggerKeyPositions?: number[];
    holdTriggerOnRelease?: boolean;
    holdWhileUndecided?: boolean;
    holdWhileUndecidedLinger?: boolean;
    retro?: boolean;
  };
  
  lt?: {
    tappingTermMs?: number;
    flavor?: 'hold-preferred' | 'balanced' | 'tap-preferred' | 'tap-unless-interrupted';
    quickTapMs?: number;
    requirePriorIdleMs?: number;
    holdTriggerKeyPositions?: number[];
    holdTriggerOnRelease?: boolean;
    holdWhileUndecided?: boolean;
    holdWhileUndecidedLinger?: boolean;
    retro?: boolean;
  };

  // Sticky key behavior (&sk)
  sk?: {
    releaseAfterMs?: number;
    quickRelease?: boolean;
    lazy?: boolean;
    ignoreModifiers?: boolean;
  };

  // Sticky layer behavior (&sl)
  sl?: {
    releaseAfterMs?: number;
    quickRelease?: boolean;
    ignoreModifiers?: boolean;
  };

  // Caps word behavior (&caps_word)
  capsWord?: {
    continueList?: string[];
    mods?: ModifierKey[];
  };

  // Key repeat behavior (&key_repeat)
  keyRepeat?: {
    usagePages?: Array<'HID_USAGE_KEY' | 'HID_USAGE_CONSUMER'>;
  };

  // Soft off behavior (&soft_off)
  softOff?: {
    holdTimeMs?: number;
    splitPeripheralOffOnPress?: boolean;
  };

  // Mouse move behavior (&mmv)
  mouseMove?: {
    xInputCode?: number;
    yInputCode?: number;
    timeToMaxSpeedMs?: number;
    accelerationExponent?: number;
  };

  // Mouse scroll behavior (&msc)
  mouseScroll?: {
    xInputCode?: number;
    yInputCode?: number;
    timeToMaxSpeedMs?: number;
    accelerationExponent?: number;
  };
}

export interface Keymap {
  layers: Layer[];
  combos?: Combo[];
  conditionalLayers?: ConditionalLayer[];
  includes?: Include[];
  globalBehaviorConfig?: GlobalBehaviorConfig;
}