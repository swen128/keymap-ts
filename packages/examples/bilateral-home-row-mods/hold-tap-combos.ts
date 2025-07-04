import {type HoldTapDefinition} from "keymap-ts";
import {allRightHandPositions, allLeftHandPositions, comboSupportPositions} from "./key-positions.js";

const leftHandComboTriggerPositions = [
  ...allRightHandPositions,
  ...comboSupportPositions
];

const rightHandComboTriggerPositions = [
  ...allLeftHandPositions,
  ...comboSupportPositions
];

function createHoldTapCombo(
  name: string,
  holdTriggerKeyPositions: number[]
): HoldTapDefinition {
  return {
    name,
    compatible: 'zmk,behavior-hold-tap',
    tappingTermMs: 190,
    quickTapMs: 300,
    flavor: 'tap-preferred',
    requirePriorIdleMs: 100,
    holdTriggerOnRelease: true,
    holdTriggerKeyPositions
  };
}

// Left hand combinations
export const hmlIndexRing = createHoldTapCombo('hml_index_ring', leftHandComboTriggerPositions);
export const hmlIndexMiddle = createHoldTapCombo('hml_index_middle', leftHandComboTriggerPositions);
export const hmlIndexPinky = createHoldTapCombo('hml_index_pinky', leftHandComboTriggerPositions);

export const hmlMiddleIndex = createHoldTapCombo('hml_middle_index', leftHandComboTriggerPositions);
export const hmlMiddleRing = createHoldTapCombo('hml_middle_ring', leftHandComboTriggerPositions);
export const hmlMiddlePinky = createHoldTapCombo('hml_middle_pinky', leftHandComboTriggerPositions);

export const hmlRingIndex = createHoldTapCombo('hml_ring_index', leftHandComboTriggerPositions);
export const hmlRingMiddle = createHoldTapCombo('hml_ring_middle', leftHandComboTriggerPositions);
export const hmlRingPinky = createHoldTapCombo('hml_ring_pinky', leftHandComboTriggerPositions);

export const hmlPinkyIndex = createHoldTapCombo('hml_pinky_index', leftHandComboTriggerPositions);
export const hmlPinkyMiddle = createHoldTapCombo('hml_pinky_middle', leftHandComboTriggerPositions);
export const hmlPinkyRing = createHoldTapCombo('hml_pinky_ring', leftHandComboTriggerPositions);

// Right hand combinations
export const hmrIndexMiddle = createHoldTapCombo('hmr_index_middle', rightHandComboTriggerPositions);
export const hmrIndexRing = createHoldTapCombo('hmr_index_ring', rightHandComboTriggerPositions);
export const hmrIndexPinky = createHoldTapCombo('hmr_index_pinky', rightHandComboTriggerPositions);

export const hmrMiddleIndex = createHoldTapCombo('hmr_middle_index', rightHandComboTriggerPositions);
export const hmrMiddleRing = createHoldTapCombo('hmr_middle_ring', rightHandComboTriggerPositions);
export const hmrMiddlePinky = createHoldTapCombo('hmr_middle_pinky', rightHandComboTriggerPositions);

export const hmrRingIndex = createHoldTapCombo('hmr_ring_index', rightHandComboTriggerPositions);
export const hmrRingMiddle = createHoldTapCombo('hmr_ring_middle', rightHandComboTriggerPositions);
export const hmrRingPinky = createHoldTapCombo('hmr_ring_pinky', rightHandComboTriggerPositions);

export const hmrPinkyIndex = createHoldTapCombo('hmr_pinky_index', rightHandComboTriggerPositions);
export const hmrPinkyMiddle = createHoldTapCombo('hmr_pinky_middle', rightHandComboTriggerPositions);
export const hmrPinkyRing = createHoldTapCombo('hmr_pinky_ring', rightHandComboTriggerPositions);