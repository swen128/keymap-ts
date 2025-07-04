import {
  behaviors, keys,
  type KeyPress,
} from '../../src/index.js';
import type {
  Glove80Layout,
  Glove80ThumbLayout
} from "../../src/glove80.js";
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
import {
  hrmLeftPinkyHold, hrmLeftRingHold, hrmLeftMiddleHold, hrmLeftIndexHold,
  hrmRightIndexHold, hrmRightMiddleHold, hrmRightRingHold, hrmRightPinkyHold,
  hrmLeftPinkyTap, hrmLeftRingTap, hrmLeftMiddleTap, hrmLeftIndexTap,
  hrmRightIndexTap, hrmRightMiddleTap, hrmRightRingTap, hrmRightPinkyTap,
  bilateralHrmMacros
} from "./macros.js";

type Mods = {
  index: KeyPress,
  middle: KeyPress,
  ring: KeyPress,
  pinky: KeyPress,
}

const {ht, trans, none} = behaviors;
const {LCTRL, LALT, LGUI, LSHFT, RCTRL, RALT, RGUI, RSHFT} = keys;

const transThumb: Glove80ThumbLayout = [
  [trans, trans, trans],
  [trans, trans, trans],
];

type Glove80Layer = {
  name: string
  layout: Glove80Layout
}

export const bilateralHomeRowMods = (baseLayer: Glove80Layer, _mods: Mods): Glove80Layer[] => {
  const {name: baseLayerName, layout: baseLayout} = baseLayer;

  const leftHomeRow = baseLayout.left.finger[3];
  const rightHomeRow = baseLayout.right.finger[3];
  const [outerL, pinkyL, ringL, middleL, indexL, innerL] = leftHomeRow;
  const [innerR, indexR, middleR, ringR, pinkyR, outerR] = rightHomeRow;

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
            ht(hmlIndexPinky, LCTRL, hrmLeftPinkyTap),
            ht(hmlIndexRing, LALT, hrmLeftRingTap),
            ht(hmlIndexMiddle, LGUI, hrmLeftMiddleTap),
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
            ht(hmlMiddlePinky, LCTRL, hrmLeftPinkyTap),
            ht(hmlMiddleRing, LALT, hrmLeftRingTap),
            none,
            ht(hmlMiddleIndex, LGUI, hrmLeftIndexTap),
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
            ht(hmlRingPinky, LSHFT, hrmLeftPinkyTap),
            none,
            ht(hmlRingMiddle, LALT, hrmLeftMiddleTap),
            ht(hmlRingIndex, LGUI, hrmLeftIndexTap),
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
            ht(hmlPinkyRing, LCTRL, hrmLeftRingTap),
            ht(hmlPinkyMiddle, LALT, hrmLeftMiddleTap),
            ht(hmlPinkyIndex, LGUI, hrmLeftIndexTap),
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
            ht(hmrIndexMiddle, RGUI, hrmRightMiddleTap),
            ht(hmrIndexRing, RALT, hrmRightRingTap),
            ht(hmrIndexPinky, RCTRL, hrmRightPinkyTap),
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
            ht(hmrMiddleIndex, RGUI, hrmRightIndexTap),
            none,
            ht(hmrMiddleRing, RALT, hrmRightRingTap),
            ht(hmrMiddlePinky, RCTRL, hrmRightPinkyTap),
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
            ht(hmrRingIndex, RGUI, hrmRightIndexTap),
            ht(hmrRingMiddle, RALT, hrmRightMiddleTap),
            none,
            ht(hmrRingPinky, RSHFT, hrmRightPinkyTap),
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
            ht(hmrPinkyIndex, RGUI, hrmRightIndexTap),
            ht(hmrPinkyMiddle, RALT, hrmRightMiddleTap),
            ht(hmrPinkyRing, RCTRL, hrmRightRingTap),
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

export {bilateralHrmMacros};