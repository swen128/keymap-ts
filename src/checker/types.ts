/**
 * Checked Keymap Types (Intermediate Representation)
 * 
 * These types represent the validated intermediate representation
 * produced by the checker from the user's keymap configuration.
 * 
 * Key differences from user-facing types:
 * - Macro definitions are extracted to a separate field
 * - All references are validated (layer names, key positions, etc.)
 * - Ready for direct emission to devicetree format
 */

import type { 
  Binding, 
  Combo, 
  ConditionalLayer, 
  MacroAction,
  KeyWithModifiers,
  MouseButtonType,
  BluetoothActionType,
  OutputTargetType
} from '../dsl/schemas.js';

/**
 * Bindings that can be used inside hold-tap, tap-dance, etc.
 * These must have arity 0 or 1.
 */
export type SimpleBinding = 
  | { behavior: 'keyPress'; code: KeyWithModifiers }
  | { behavior: 'modTap'; mod: KeyWithModifiers; tap: KeyWithModifiers }
  | { behavior: 'layerTap'; layer: number; tap: KeyWithModifiers }
  | { behavior: 'toLayer'; layer: number }
  | { behavior: 'transparent' }
  | { behavior: 'none' }
  | { behavior: 'keyToggle'; code: KeyWithModifiers }
  | { behavior: 'stickyKey'; code: KeyWithModifiers }
  | { behavior: 'customStickyKey'; name: string; code: KeyWithModifiers }
  | { behavior: 'capsWord' }
  | { behavior: 'keyRepeat' }
  | { behavior: 'momentaryLayer'; layer: number }
  | { behavior: 'toggleLayer'; layer: number }
  | { behavior: 'stickyLayer'; layer: number }
  | { behavior: 'customStickyLayer'; name: string; layer: number }
  | { behavior: 'macro'; macroName: string }
  | { behavior: 'mouseButton'; button: MouseButtonType }
  | { behavior: 'systemReset' }
  | { behavior: 'bootloader' }
  | { behavior: 'studioUnlock' };

/**
 * A checked binding references behaviors by name
 */
export type CheckedBinding = 
  | SimpleBinding
  | { behavior: 'holdTap'; name: string; tapBinding: SimpleBinding; holdBinding: SimpleBinding }
  | { behavior: 'tapDance'; name: string; bindings: SimpleBinding[] }
  | { behavior: 'modMorph'; name: string; defaultBinding: SimpleBinding; morphedBinding: SimpleBinding; mods: string[] }
  | { behavior: 'mouseButton'; button: MouseButtonType }
  | { behavior: 'mouseMove'; x?: number; y?: number; delay?: number; acceleration?: number }
  | { behavior: 'mouseScroll'; x?: number; y?: number; continuousScroll?: boolean; delay?: number; acceleration?: number }
  | { behavior: 'systemReset' }
  | { behavior: 'bootloader' }
  | { behavior: 'bluetooth'; action: BluetoothActionType; profile?: number }
  | { behavior: 'output'; target: OutputTargetType }
  | { behavior: 'rgbUnderglow'; action: string; hue?: number; saturation?: number; brightness?: number }
  | { behavior: 'backlight'; action: string; brightness?: number }
  | { behavior: 'extPower'; action: string }
  | { behavior: 'softOff'; holdTimeMs?: number }
  | { behavior: 'studioUnlock' };

/**
 * A validated layer with checked bindings
 */
export interface CheckedLayer {
  name: string;
  bindings: CheckedBinding[];
}

/**
 * Import base definitions from schemas
 */
import type { 
  StickyKeyDefinition,
  StickyLayerDefinition,
  HoldTapDefinition as BaseHoldTapDefinition,
  TapDanceDefinition as BaseTapDanceDefinition,
  ModMorphDefinition as BaseModMorphDefinition
} from '../dsl/schemas.js';

/**
 * Extended behavior definitions with bindings field for ZMK emission
 */
export interface CheckedHoldTapDefinition extends BaseHoldTapDefinition {
  bindings: string[];
}

export interface CheckedTapDanceDefinition extends BaseTapDanceDefinition {
  bindings: string[];
}

export interface CheckedModMorphDefinition extends BaseModMorphDefinition {
  bindings: string[];
  mods?: string[];
}

/**
 * Re-export unchanged definitions
 */
export type { StickyKeyDefinition, StickyLayerDefinition } from '../dsl/schemas.js';

/**
 * Union type for all custom behavior definitions
 */
export type BehaviorDefinition =
  | StickyKeyDefinition
  | StickyLayerDefinition
  | CheckedHoldTapDefinition
  | CheckedTapDanceDefinition
  | CheckedModMorphDefinition;

/**
 * The complete checked keymap ready for emission
 */
export interface CheckedKeymap {
  layers: CheckedLayer[];
  macros: CheckedMacroDefinition[];
  behaviors: BehaviorDefinition[];
  combos: Combo[];
  conditionalLayers: ConditionalLayer[];
  includes?: string[];
}

/**
 * A checked macro definition with layer indices converted
 */
export interface CheckedMacroDefinition {
  name: string;
  label?: string;
  bindings: CheckedMacroAction[];
  waitMs?: number;
  tapMs?: number;
}


/**
 * Checked version of macro tap action
 */
export interface CheckedMacroTapAction {
  type: 'tap';
  code: KeyWithModifiers;
}

/**
 * Checked version of macro press action
 */
export interface CheckedMacroPressAction {
  type: 'press';
  code: KeyWithModifiers;
}

/**
 * Checked version of macro release action
 */
export interface CheckedMacroReleaseAction {
  type: 'release';
  code: KeyWithModifiers;
}

/**
 * Checked version of macro wait action
 */
export interface CheckedMacroWaitAction {
  type: 'wait';
  ms: number;
}

/**
 * Checked version of macro control actions
 */
export type CheckedMacroControlAction = 
  | { type: 'pauseForRelease' }
  | { type: 'tapTime'; ms: number }
  | { type: 'waitTime'; ms: number };

/**
 * Checked version of macro behavior action
 */
export interface CheckedMacroBehaviorAction {
  type: 'behavior';
  binding: CheckedBinding;
}

/**
 * A checked macro action
 */
export type CheckedMacroAction = 
  | CheckedMacroTapAction
  | CheckedMacroPressAction
  | CheckedMacroReleaseAction
  | CheckedMacroWaitAction
  | CheckedMacroControlAction
  | CheckedMacroBehaviorAction;

/**
 * Macro action for behaviors that need to be wrapped (input type)
 */
export interface BehaviorMacroAction {
  type: 'behavior';
  binding: Binding;
}

/**
 * Extended macro action that includes behavior wrapping (input type)
 */
export type ExtendedMacroAction = MacroAction | BehaviorMacroAction;

/**
 * Validation error with structural path information
 */
export interface ValidationError {
  path: string[];
  message: string;
}

/**
 * Result of the checking phase
 */
export type CheckResult = 
  | { success: true; keymap: CheckedKeymap }
  | { success: false; errors: ValidationError[] };
