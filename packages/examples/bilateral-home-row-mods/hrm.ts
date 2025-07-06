import {
  type Behavior,
  behaviors,
  type KeyPress,
  type MacroBehavior,
} from 'keymap-ts';
import type {
  Glove80Layout,
  Glove80ThumbLayout
} from "keymap-ts/glove80";
import {hmlIndex, hmlMiddle, hmlRing, hmlPinky, hmrIndex, hmrMiddle, hmrRing, hmrPinky} from "./hold-tap.js";
import {
  hmlIndexRing, hmlIndexMiddle, hmlIndexPinky,
  hmlMiddleIndex, hmlMiddleRing, hmlMiddlePinky,
  hmlRingIndex, hmlRingMiddle, hmlRingPinky,
  hmlPinkyIndex, hmlPinkyMiddle, hmlPinkyRing,
  hmrIndexMiddle, hmrIndexRing, hmrIndexPinky,
  hmrMiddleIndex, hmrMiddleRing, hmrMiddlePinky,
  hmrRingIndex, hmrRingMiddle, hmrRingPinky,
  hmrPinkyIndex, hmrPinkyMiddle, hmrPinkyRing,
} from "./hold-tap-combos.js";

type Mods = {
  index: KeyPress,
  middle: KeyPress,
  ring: KeyPress,
  pinky: KeyPress,
}

const {ht, trans, none, mo, macro} = behaviors;

const transThumb: Glove80ThumbLayout = [
  [trans, trans, trans],
  [trans, trans, trans],
];

type Glove80Layer = {
  name: string
  layout: Glove80Layout
}

/**
 * Creates bilateral home row mods layers for a given base layer.
 * @param baseLayer - The base layer to add home row mods to
 * @param mods - The modifier keys to use for each finger position (index, middle, ring, pinky)
 */
export const bilateralHomeRowMods = (baseLayer: Glove80Layer, mods: Mods): Glove80Layer[] => {
  const {name: baseLayerName, layout: baseLayout} = baseLayer;

  const leftHomeRow = baseLayout.left.finger[3];
  const rightHomeRow = baseLayout.right.finger[3];
  const [outerL, pinkyL, ringL, middleL, indexL, innerL] = leftHomeRow;
  const [innerR, indexR, middleR, ringR, pinkyR, outerR] = rightHomeRow;

  // Create hold macros for each finger
  const hrmLeftPinkyHold = macro('hrm_left_pinky_hold')
    .press(mods.pinky)
    .behavior(mo('LeftPinky'))
    .pauseForRelease()
    .release(mods.pinky)
    .behavior(mo('LeftPinky'))
    .build();

  const hrmLeftRingHold = macro('hrm_left_ring_hold')
    .press(mods.ring)
    .behavior(mo('LeftRing'))
    .pauseForRelease()
    .release(mods.ring)
    .behavior(mo('LeftRing'))
    .build();

  const hrmLeftMiddleHold = macro('hrm_left_middle_hold')
    .press(mods.middle)
    .behavior(mo('LeftMiddle'))
    .pauseForRelease()
    .release(mods.middle)
    .behavior(mo('LeftMiddle'))
    .build();

  const hrmLeftIndexHold = macro('hrm_left_index_hold')
    .press(mods.index)
    .behavior(mo('LeftIndex'))
    .pauseForRelease()
    .release(mods.index)
    .behavior(mo('LeftIndex'))
    .build();

  const hrmRightIndexHold = macro('hrm_right_index_hold')
    .press(mods.index)
    .behavior(mo('RightIndex'))
    .pauseForRelease()
    .release(mods.index)
    .behavior(mo('RightIndex'))
    .build();

  const hrmRightMiddleHold = macro('hrm_right_middle_hold')
    .press(mods.middle)
    .behavior(mo('RightMiddle'))
    .pauseForRelease()
    .release(mods.middle)
    .behavior(mo('RightMiddle'))
    .build();

  const hrmRightRingHold = macro('hrm_right_ring_hold')
    .press(mods.ring)
    .behavior(mo('RightRing'))
    .pauseForRelease()
    .release(mods.ring)
    .behavior(mo('RightRing'))
    .build();

  const hrmRightPinkyHold = macro('hrm_right_pinky_hold')
    .press(mods.pinky)
    .behavior(mo('RightPinky'))
    .pauseForRelease()
    .release(mods.pinky)
    .behavior(mo('RightPinky'))
    .build();

  // Create tap macros that release all modifiers and tap the key
  const allModifiers = [mods.pinky, mods.ring, mods.middle, mods.index];
  
  const createTapMacro = (name: string, behavior: Behavior): MacroBehavior => {
    const builder = allModifiers.reduce(
      (acc, mod) => acc.release(mod),
      macro(name)
    );
    return builder.behavior(behavior).build();
  };

  const hrmLeftPinkyTap = createTapMacro('hrm_left_pinky_tap', pinkyL);
  const hrmLeftRingTap = createTapMacro('hrm_left_ring_tap', ringL);
  const hrmLeftMiddleTap = createTapMacro('hrm_left_middle_tap', middleL);
  const hrmLeftIndexTap = createTapMacro('hrm_left_index_tap', indexL);

  const hrmRightIndexTap = createTapMacro('hrm_right_index_tap', indexR);
  const hrmRightMiddleTap = createTapMacro('hrm_right_middle_tap', middleR);
  const hrmRightRingTap = createTapMacro('hrm_right_ring_tap', ringR);
  const hrmRightPinkyTap = createTapMacro('hrm_right_pinky_tap', pinkyR);

  const pinkyLHT = ht(hmlPinky, hrmLeftPinkyHold, hrmLeftPinkyTap);
  const ringLHT = ht(hmlRing, hrmLeftRingHold, hrmLeftRingTap);
  const middleLHT = ht(hmlMiddle, hrmLeftMiddleHold, hrmLeftMiddleTap);
  const indexLHT = ht(hmlIndex, hrmLeftIndexHold, hrmLeftIndexTap);

  const indexRHT = ht(hmrIndex, hrmRightIndexHold, hrmRightIndexTap);
  const middleRHT = ht(hmrMiddle, hrmRightMiddleHold, hrmRightMiddleTap);
  const ringRHT = ht(hmrRing, hrmRightRingHold, hrmRightRingTap);
  const pinkyRHT = ht(hmrPinky, hrmRightPinkyHold, hrmRightPinkyTap);

  const baseLayerWithHRM: Glove80Layer = {
    name: baseLayerName,
    layout: {
      ...baseLayout,
      left: {
        ...baseLayout.left,
        finger: [
          baseLayout.left.finger[0],
          baseLayout.left.finger[1],
          baseLayout.left.finger[2],
          [outerL, pinkyLHT, ringLHT, middleLHT, indexLHT, innerL],
          baseLayout.left.finger[4],
          baseLayout.left.finger[5]
        ],
      },
      right: {
        ...baseLayout.right,
        finger: [
          baseLayout.right.finger[0],
          baseLayout.right.finger[1],
          baseLayout.right.finger[2],
          [innerR, indexRHT, middleRHT, ringRHT, pinkyRHT, outerR],
          baseLayout.right.finger[4],
          baseLayout.right.finger[5]
        ],
      }
    }
  };

  const leftIndexLayer: Glove80Layer = {
    name: 'LeftIndex',
    layout: {
      left: {
        finger: [
          baseLayout.left.finger[0],
          baseLayout.left.finger[1],
          baseLayout.left.finger[2],
          [
            outerL,
            ht(hmlIndexPinky, mods.pinky, hrmLeftPinkyTap),
            ht(hmlIndexRing, mods.ring, hrmLeftRingTap),
            ht(hmlIndexMiddle, mods.middle, hrmLeftMiddleTap),
            none,
            innerL
          ],
          baseLayout.left.finger[4],
          baseLayout.left.finger[5]
        ],
        thumb: transThumb
      },
      right: {
        finger: [
          baseLayout.right.finger[0],
          baseLayout.right.finger[1],
          baseLayout.right.finger[2],
          [innerR, indexR, middleR, ringR, pinkyR, outerR],
          baseLayout.right.finger[4],
          baseLayout.right.finger[5]
        ],
        thumb: baseLayout.right.thumb
      }
    }
  };


  const leftMiddleLayer: Glove80Layer = {
    name: 'LeftMiddle',
    layout: {
      left: {
        finger: [
          baseLayout.left.finger[0],
          baseLayout.left.finger[1],
          baseLayout.left.finger[2],
          [
            outerL,
            ht(hmlMiddlePinky, mods.pinky, hrmLeftPinkyTap),
            ht(hmlMiddleRing, mods.ring, hrmLeftRingTap),
            none,
            ht(hmlMiddleIndex, mods.index, hrmLeftIndexTap),
            innerL
          ],
          baseLayout.left.finger[4],
          baseLayout.left.finger[5]
        ],
        thumb: transThumb
      },
      right: {
        finger: [
          baseLayout.right.finger[0],
          baseLayout.right.finger[1],
          baseLayout.right.finger[2],
          [innerR, indexR, middleR, ringR, pinkyR, outerR],
          baseLayout.right.finger[4],
          baseLayout.right.finger[5]
        ],
        thumb: baseLayout.right.thumb
      }
    }
  };

  const leftRingLayer: Glove80Layer = {
    name: 'LeftRing',
    layout: {
      left: {
        finger: [
          baseLayout.left.finger[0],
          baseLayout.left.finger[1],
          baseLayout.left.finger[2],
          [
            outerL,
            ht(hmlRingPinky, mods.pinky, hrmLeftPinkyTap),
            none,
            ht(hmlRingMiddle, mods.middle, hrmLeftMiddleTap),
            ht(hmlRingIndex, mods.index, hrmLeftIndexTap),
            innerL
          ],
          baseLayout.left.finger[4],
          baseLayout.left.finger[5]
        ],
        thumb: transThumb
      },
      right: {
        finger: [
          baseLayout.right.finger[0],
          baseLayout.right.finger[1],
          baseLayout.right.finger[2],
          [innerR, indexR, middleR, ringR, pinkyR, outerR],
          baseLayout.right.finger[4],
          baseLayout.right.finger[5]
        ],
        thumb: baseLayout.right.thumb
      }
    }
  };


  const leftPinkyLayer: Glove80Layer = {
    name: 'LeftPinky',
    layout: {
      left: {
        finger: [
          baseLayout.left.finger[0],
          baseLayout.left.finger[1],
          baseLayout.left.finger[2],
          [
            outerL,
            none,
            ht(hmlPinkyRing, mods.ring, hrmLeftRingTap),
            ht(hmlPinkyMiddle, mods.middle, hrmLeftMiddleTap),
            ht(hmlPinkyIndex, mods.index, hrmLeftIndexTap),
            innerL
          ],
          baseLayout.left.finger[4],
          baseLayout.left.finger[5]
        ],
        thumb: transThumb
      },
      right: {
        finger: [
          baseLayout.right.finger[0],
          baseLayout.right.finger[1],
          baseLayout.right.finger[2],
          [innerR, indexR, middleR, ringR, pinkyR, outerR],
          baseLayout.right.finger[4],
          baseLayout.right.finger[5]
        ],
        thumb: baseLayout.right.thumb
      }
    }
  };

  const rightIndexLayer: Glove80Layer = {
    name: 'RightIndex',
    layout: {
      left: {
        finger: [
          baseLayout.left.finger[0],
          baseLayout.left.finger[1],
          baseLayout.left.finger[2],
          [outerL, pinkyL, ringL, middleL, indexL, innerL],
          baseLayout.left.finger[4],
          baseLayout.left.finger[5]
        ],
        thumb: baseLayout.left.thumb
      },
      right: {
        finger: [
          baseLayout.right.finger[0],
          baseLayout.right.finger[1],
          baseLayout.right.finger[2],
          [
            innerR,
            none,
            ht(hmrIndexMiddle, mods.middle, hrmRightMiddleTap),
            ht(hmrIndexRing, mods.ring, hrmRightRingTap),
            ht(hmrIndexPinky, mods.pinky, hrmRightPinkyTap),
            outerR
          ],
          baseLayout.right.finger[4],
          baseLayout.right.finger[5]
        ],
        thumb: transThumb
      }
    }
  };

  const rightMiddleLayer: Glove80Layer = {
    name: 'RightMiddle',
    layout: {
      left: {
        finger: [
          baseLayout.left.finger[0],
          baseLayout.left.finger[1],
          baseLayout.left.finger[2],
          [outerL, pinkyL, ringL, middleL, indexL, innerL],
          baseLayout.left.finger[4],
          baseLayout.left.finger[5]
        ],
        thumb: baseLayout.left.thumb
      },
      right: {
        finger: [
          baseLayout.right.finger[0],
          baseLayout.right.finger[1],
          baseLayout.right.finger[2],
          [
            innerR,
            ht(hmrMiddleIndex, mods.index, hrmRightIndexTap),
            none,
            ht(hmrMiddleRing, mods.ring, hrmRightRingTap),
            ht(hmrMiddlePinky, mods.pinky, hrmRightPinkyTap),
            outerR
          ],
          baseLayout.right.finger[4],
          baseLayout.right.finger[5]
        ],
        thumb: transThumb
      }
    }
  };


  const rightRingLayer: Glove80Layer = {
    name: 'RightRing',
    layout: {
      left: {
        finger: [
          baseLayout.left.finger[0],
          baseLayout.left.finger[1],
          baseLayout.left.finger[2],
          [outerL, pinkyL, ringL, middleL, indexL, innerL],
          baseLayout.left.finger[4],
          baseLayout.left.finger[5]
        ],
        thumb: baseLayout.left.thumb
      },
      right: {
        finger: [
          baseLayout.right.finger[0],
          baseLayout.right.finger[1],
          baseLayout.right.finger[2],
          [
            innerR,
            ht(hmrRingIndex, mods.index, hrmRightIndexTap),
            ht(hmrRingMiddle, mods.middle, hrmRightMiddleTap),
            none,
            ht(hmrRingPinky, mods.pinky, hrmRightPinkyTap),
            outerR
          ],
          baseLayout.right.finger[4],
          baseLayout.right.finger[5]
        ],
        thumb: transThumb
      }
    }
  };

  const rightPinkyLayer: Glove80Layer = {
    name: 'RightPinky',
    layout: {
      left: {
        finger: [
          baseLayout.left.finger[0],
          baseLayout.left.finger[1],
          baseLayout.left.finger[2],
          [outerL, pinkyL, ringL, middleL, indexL, innerL],
          baseLayout.left.finger[4],
          baseLayout.left.finger[5]
        ],
        thumb: baseLayout.left.thumb
      },
      right: {
        finger: [
          baseLayout.right.finger[0],
          baseLayout.right.finger[1],
          baseLayout.right.finger[2],
          [
            innerR,
            ht(hmrPinkyIndex, mods.index, hrmRightIndexTap),
            ht(hmrPinkyMiddle, mods.middle, hrmRightMiddleTap),
            ht(hmrPinkyRing, mods.ring, hrmRightRingTap),
            none,
            outerR
          ],
          baseLayout.right.finger[4],
          baseLayout.right.finger[5]
        ],
        thumb: transThumb
      }
    }
  };

  return [
    baseLayerWithHRM,
    leftIndexLayer,
    leftMiddleLayer,
    leftRingLayer,
    leftPinkyLayer,
    rightIndexLayer,
    rightMiddleLayer,
    rightRingLayer,
    rightPinkyLayer
  ];
};