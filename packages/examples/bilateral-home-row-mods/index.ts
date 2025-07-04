import {behaviors, type Keymap, keys} from "keymap-ts";
import {glove80Layer, type Glove80Layout} from "keymap-ts/glove80";
import {bilateralHomeRowMods} from "./hrm.js";

const {mo, trans, none} = behaviors;

const {
  F1, F2, F3, F4, F5, F6, F7, F8, F9, F10,
  EQUAL, N1, N2, N3, N4, N5, N6, N7, N8, N9, N0,
  BSPC, DEL, TAB, ESC, GRAVE, END, LEFT, RIGHT,
  LSHFT, LCTRL, LALT, LGUI,
  Q, W, E, R, T, Y, U, I, O, P,
  A, S, D, F, G, H, J, K, L, SEMI,
  Z, X, C, V, B, N, M, COMMA, DOT, FSLH,
  MINUS, BSLH, SQT, RSHFT, UP, DOWN, LBKT, RBKT,
  PAGE_UP, PAGE_DOWN, RET, SPACE,
  EXCL, AT, HASH, DLLR, PRCNT, CARET, AMPS, STAR,
  LPAR, RPAR, LBRC, RBRC, HOME
} = keys;

const baseLayer: { name: string; layout: Glove80Layout } = {
  name: 'Base',
  layout: {
    left: {
      finger: [
        [F1, F2, F3, F4, F5],
        [EQUAL, N1, N2, N3, N4, N5],
        [TAB, Q, W, E, R, T],
        [ESC, A, S, D, F, G],
        [GRAVE, Z, X, C, V, B],
        [none, HOME, END, LEFT, RIGHT]
      ],
      thumb: [
        [LSHFT, LCTRL, none],
        [BSPC, DEL, LALT]
      ]
    },
    right: {
      finger: [
        [F6, F7, F8, F9, F10],
        [N6, N7, N8, N9, N0, MINUS],
        [Y, U, I, O, P, BSLH],
        [H, J, K, L, SEMI, SQT],
        [N, M, COMMA, DOT, FSLH, RSHFT],
        [mo('Sym'), UP, DOWN, LBKT, RBKT]
      ],
      thumb: [
        [PAGE_UP, PAGE_DOWN, END],
        [RET, SPACE, DEL]
      ]
    }
  }
};

const bhrmLayers = bilateralHomeRowMods(baseLayer, {
  index: LGUI,
  middle: LALT,
  ring: LCTRL,
  pinky: LSHFT
}).map(glove80Layer);

const keymap: Keymap = {
  includes: [
    'behaviors.dtsi',
    'dt-bindings/zmk/keys.h'
  ],
  layers: [
    ...bhrmLayers,

    glove80Layer({
      name: 'Sym',
      layout: {
        left: {
          finger: [
            [trans, trans, trans, trans, trans],
            [trans, EXCL, AT, HASH, DLLR, PRCNT],
            [trans, trans, LBKT, RBKT, trans, trans],
            [trans, trans, LPAR, RPAR, trans, trans],
            [trans, trans, LBRC, RBRC, trans, trans],
            [trans, trans, trans, trans, trans]
          ],
          thumb: [
            [trans, trans, trans],
            [trans, trans, trans]
          ]
        },
        right: {
          finger: [
            [trans, trans, trans, trans, trans],
            [CARET, AMPS, STAR, MINUS, EQUAL, trans],
            [trans, trans, trans, trans, trans, trans],
            [trans, trans, trans, trans, trans, trans],
            [trans, trans, trans, trans, trans, trans],
            [trans, trans, trans, trans, trans]
          ],
          thumb: [
            [trans, trans, trans],
            [trans, trans, trans]
          ]
        }
      }
    })
  ]
};

export default keymap;
