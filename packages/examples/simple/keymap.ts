import {behaviors, keys, type Keymap} from 'keymap-ts';

const {mo, ht, macro, trans, none} = behaviors;
const {
  Q, W, E, R, T, Y, U, I, O, P,
  A, S, D, F, G, H, J, K, L, SEMI,
  Z, X, C, V, B, N, M, COMMA, DOT, FSLH,
  N1, N2, N3, N4, N5, N6, N7, N8, N9, N0,
  F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12,
  LSHFT, LCTRL, LALT, LGUI, RSHFT, RCTRL, RALT, RGUI,
  SPACE, RET, BSPC, DEL,
  LEFT, DOWN, UP, RIGHT, HOME, END,
  TAB, ESC, GRAVE, MINUS, EQUAL, BSLH, SQT,
  LBKT, RBKT, PAGE_UP, PAGE_DOWN,
} = keys;

const navBspc = ht({
  name: 'nav_bspc',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 200,
  quickTapMs: 150,
  flavor: 'hold-preferred',
}, mo('nav'), BSPC);

const selectLine = macro('select_line')
  .tap(HOME)
  .press(LSHFT)
  .tap(END)
  .release(LSHFT)
  .build();

const keymap: Keymap = {
  includes: ['behaviors.dtsi', 'dt-bindings/zmk/keys.h'],
  layers: [
    {
      name: 'base',
      bindings: [
        F1, F2, F3, F4, F5, F6, F7, F8, F9, F10,
        EQUAL, N1, N2, N3, N4, N5, N6, N7, N8, N9, N0, MINUS,
        TAB, Q, W, E, R, T, Y, U, I, O, P, BSLH,
        ESC, A, S, D, F, G, H, J, K, L, SEMI, SQT,
        GRAVE, Z, X, C, V, B, LSHFT, LCTRL, LGUI, RGUI, RCTRL, RSHFT, N, M, COMMA, DOT, FSLH, PAGE_UP,
        HOME, END, LEFT, RIGHT, navBspc, DEL, LALT, RALT, RET, SPACE, UP, DOWN, LBKT, RBKT, PAGE_DOWN
      ],
    },
    {
      name: 'nav',
      bindings: [
        trans, trans, trans, trans, trans, trans, trans, trans, trans, trans,
        trans, none, none, none, none, HOME, none, none, none, none, none, trans,
        trans, none, none, UP, none, END, none, none, none, none, none, trans,
        trans, none, LEFT, DOWN, RIGHT, PAGE_UP, LEFT, DOWN, UP, RIGHT, none, none,
        trans, none, none, F11, F12, PAGE_DOWN, trans, trans, trans, trans, trans, trans, none, none, none, none, selectLine, trans,
        trans, none, none, F11, F12, trans, trans, trans, trans, trans, trans, none, none, none, none, trans
      ],
    }
  ]
};

export default keymap;
