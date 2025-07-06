import {behaviors, type Keymap, keys} from "keymap-ts";
import {type Glove80Layer, glove80Layer} from "keymap-ts/glove80";
import {bilateralHomeRowMods} from "./hrm.js";

const {mo, none, sk} = behaviors;

const {
  F1, F2, F3, F4, F5, F6, F7, F8, F9, F10,
  EQUAL, N1, N2, N3, N4, N5, N6, N7, N8, N9, N0,
  BSPC, DEL, TAB, ESC, GRAVE, END, LEFT, RIGHT,
  LSHFT, LCTRL, LALT, LGUI, RSHFT,
  Q, W, E, R, T, Y, U, I, O, P,
  A, S, D, F, G, H, J, K, L, SEMI,
  Z, X, C, V, B, N, M, COMMA, DOT, FSLH,
  MINUS, BSLH, SQT, UP, DOWN, LBKT, RBKT,
  PAGE_UP, PAGE_DOWN, RET, SPACE, INS,
  EXCL, AT, HASH, DLLR, PRCNT, CARET, AMPS, STAR,
  LPAR, RPAR, LBRC, RBRC, HOME,
  PIPE, LT, GT, UNDER, PLUS, QMARK, COLON, DQT, TILDE,
  LS
} = keys;

const baseLayer: Glove80Layer = {
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

const mods = {
  index: LGUI,
  middle: LALT,
  ring: LCTRL,
  pinky: LSHFT
}
const bhrmLayers = bilateralHomeRowMods(baseLayer, mods);

const keymap: Keymap = {
  includes: [
    'behaviors.dtsi',
    'dt-bindings/zmk/keys.h'
  ],
  layers: [
    ...bhrmLayers.map(glove80Layer),

    glove80Layer({
      name: 'Sym',
      layout: {
        left: {
          finger: [
            [none, none, none, none, none],
            [GRAVE, RBKT, LPAR, RPAR, COMMA, DOT],
            [LBKT, EXCL, LBRC, RBRC, SEMI, QMARK],
            [HASH, CARET, EQUAL, UNDER, DLLR, STAR],
            [TILDE, LT, PIPE, MINUS, GT, FSLH],
            [none, AMPS, SQT, DQT, PLUS]
          ],
          thumb: [
            [BSLH, DOT, STAR],
            [PRCNT, COLON, AT]
          ]
        },
        right: {
          finger: [
            [none, none, none, none, none],
            [none, none, none, none, none, none],
            [GRAVE, sk(mods.pinky), sk(mods.index), sk(mods.middle), sk(mods.ring), none],
            [DQT, BSPC, TAB, SPACE, RET, none],
            [SQT, DEL, LS(TAB), INS, ESC, none],
            [none, none, none, none, none]
          ],
          thumb: [
            [none, none, none],
            [none, none, none]
          ]
        }
      }
    })
  ]
};

export default keymap;
