import {type HoldTapDefinition} from "../../src/index.js";
import {notLeftFingerPositions, notRightFingerPositions} from "./key-positions.js";

export const hmlPinky: HoldTapDefinition = {
  name: 'hml_pinky',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 200,
  quickTapMs: 150,
  flavor: 'tap-preferred',
  requirePriorIdleMs: 125,
  holdTriggerOnRelease: true,
  holdTriggerKeyPositions: notLeftFingerPositions
};

export const hmlRing: HoldTapDefinition = {
  name: 'hml_ring',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 200,
  quickTapMs: 150,
  flavor: 'tap-preferred',
  requirePriorIdleMs: 125,
  holdTriggerOnRelease: true,
  holdTriggerKeyPositions: notLeftFingerPositions
};

export const hmlMiddle: HoldTapDefinition = {
  name: 'hml_middle',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 200,
  quickTapMs: 150,
  flavor: 'tap-preferred',
  requirePriorIdleMs: 125,
  holdTriggerOnRelease: true,
  holdTriggerKeyPositions: notLeftFingerPositions
};

export const hmlIndex: HoldTapDefinition = {
  name: 'hml_index',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 180,
  quickTapMs: 150,
  flavor: 'tap-preferred',
  requirePriorIdleMs: 125,
  holdTriggerOnRelease: true,
  holdTriggerKeyPositions: notLeftFingerPositions
};

export const hmrIndex: HoldTapDefinition = {
  name: 'hmr_index',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 180,
  quickTapMs: 150,
  flavor: 'tap-preferred',
  requirePriorIdleMs: 125,
  holdTriggerOnRelease: true,
  holdTriggerKeyPositions: notRightFingerPositions
};

export const hmrMiddle: HoldTapDefinition = {
  name: 'hmr_middle',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 200,
  quickTapMs: 150,
  flavor: 'tap-preferred',
  requirePriorIdleMs: 125,
  holdTriggerOnRelease: true,
  holdTriggerKeyPositions: notRightFingerPositions
};

export const hmrRing: HoldTapDefinition = {
  name: 'hmr_ring',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 200,
  quickTapMs: 150,
  flavor: 'tap-preferred',
  requirePriorIdleMs: 125,
  holdTriggerOnRelease: true,
  holdTriggerKeyPositions: notRightFingerPositions
};

export const hmrPinky: HoldTapDefinition = {
  name: 'hmr_pinky',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 200,
  quickTapMs: 150,
  flavor: 'tap-preferred',
  requirePriorIdleMs: 125,
  holdTriggerOnRelease: true,
  holdTriggerKeyPositions: notRightFingerPositions
};
