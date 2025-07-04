import {behaviors, keys, type KeyPress} from '../../src/index.js';

const {mo, macro} = behaviors;
const { 
  LSHFT, LCTRL, LALT, LGUI, RSHFT, RCTRL, RALT, RGUI,
  A, S, D, F, J, K, L, SEMI
} = keys;

const createHoldMacro = (name: string, modifierKey: KeyPress, layerName: string) => 
  macro(name)
    .press(modifierKey)
    .behavior(mo(layerName))
    .pauseForRelease()
    .release(modifierKey)
    .behavior(mo(layerName))
    .build();

const createTapMacro = (name: string, key: KeyPress) => {
  const modifiers = [LSHFT, LCTRL, LALT, LGUI, RSHFT, RCTRL, RALT, RGUI];
  
  const builder = modifiers.reduce(
    (acc, mod) => acc.release(mod),
    macro(name)
  );
  
  return builder.tap(key).build();
};

export const hrmLeftPinkyHold = createHoldMacro('hrm_left_pinky_hold', LSHFT, 'LeftPinky');
export const hrmLeftRingHold = createHoldMacro('hrm_left_ring_hold', LCTRL, 'LeftRing');
export const hrmLeftMiddleHold = createHoldMacro('hrm_left_middle_hold', LALT, 'LeftMiddle');
export const hrmLeftIndexHold = createHoldMacro('hrm_left_index_hold', LGUI, 'LeftIndex');

export const hrmRightIndexHold = createHoldMacro('hrm_right_index_hold', RGUI, 'RightIndex');
export const hrmRightMiddleHold = createHoldMacro('hrm_right_middle_hold', RALT, 'RightMiddle');
export const hrmRightRingHold = createHoldMacro('hrm_right_ring_hold', RCTRL, 'RightRing');
export const hrmRightPinkyHold = createHoldMacro('hrm_right_pinky_hold', RSHFT, 'RightPinky');

export const hrmLeftPinkyTap = createTapMacro('hrm_left_pinky_tap', A);
export const hrmLeftRingTap = createTapMacro('hrm_left_ring_tap', S);
export const hrmLeftMiddleTap = createTapMacro('hrm_left_middle_tap', D);
export const hrmLeftIndexTap = createTapMacro('hrm_left_index_tap', F);

export const hrmRightIndexTap = createTapMacro('hrm_right_index_tap', J);
export const hrmRightMiddleTap = createTapMacro('hrm_right_middle_tap', K);
export const hrmRightRingTap = createTapMacro('hrm_right_ring_tap', L);
export const hrmRightPinkyTap = createTapMacro('hrm_right_pinky_tap', SEMI);

export const bilateralHrmMacros = [
  hrmLeftPinkyHold,
  hrmLeftRingHold,
  hrmLeftMiddleHold,
  hrmLeftIndexHold,
  hrmRightIndexHold,
  hrmRightMiddleHold,
  hrmRightRingHold,
  hrmRightPinkyHold,
  
  hrmLeftPinkyTap,
  hrmLeftRingTap,
  hrmLeftMiddleTap,
  hrmLeftIndexTap,
  hrmRightIndexTap,
  hrmRightMiddleTap,
  hrmRightRingTap,
  hrmRightPinkyTap
];