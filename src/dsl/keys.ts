import { kp } from './behaviors.js';
import type { ModifierKey, KeyPress } from './schemas.js';

// Letter keys
export const A = kp('A');
export const B = kp('B');
export const C = kp('C');
export const D = kp('D');
export const E = kp('E');
export const F = kp('F');
export const G = kp('G');
export const H = kp('H');
export const I = kp('I');
export const J = kp('J');
export const K = kp('K');
export const L = kp('L');
export const M = kp('M');
export const N = kp('N');
export const O = kp('O');
export const P = kp('P');
export const Q = kp('Q');
export const R = kp('R');
export const S = kp('S');
export const T = kp('T');
export const U = kp('U');
export const V = kp('V');
export const W = kp('W');
export const X = kp('X');
export const Y = kp('Y');
export const Z = kp('Z');

// Number keys
export const N0 = kp('N0');
export const N1 = kp('N1');
export const N2 = kp('N2');
export const N3 = kp('N3');
export const N4 = kp('N4');
export const N5 = kp('N5');
export const N6 = kp('N6');
export const N7 = kp('N7');
export const N8 = kp('N8');
export const N9 = kp('N9');

// Function keys
export const F1 = kp('F1');
export const F2 = kp('F2');
export const F3 = kp('F3');
export const F4 = kp('F4');
export const F5 = kp('F5');
export const F6 = kp('F6');
export const F7 = kp('F7');
export const F8 = kp('F8');
export const F9 = kp('F9');
export const F10 = kp('F10');
export const F11 = kp('F11');
export const F12 = kp('F12');
export const F13 = kp('F13');
export const F14 = kp('F14');
export const F15 = kp('F15');
export const F16 = kp('F16');
export const F17 = kp('F17');
export const F18 = kp('F18');
export const F19 = kp('F19');
export const F20 = kp('F20');
export const F21 = kp('F21');
export const F22 = kp('F22');
export const F23 = kp('F23');
export const F24 = kp('F24');

// Navigation keys
export const UP = kp('UP');
export const DOWN = kp('DOWN');
export const LEFT = kp('LEFT');
export const RIGHT = kp('RIGHT');
export const HOME = kp('HOME');
export const END = kp('END');
export const PAGE_UP = kp('PAGE_UP');
export const PAGE_DOWN = kp('PAGE_DOWN');

// Special keys
export const TAB = kp('TAB');
export const RET = kp('RET');
export const SPACE = kp('SPACE');
export const BSPC = kp('BSPC');
export const DEL = kp('DEL');
export const INS = kp('INS');
export const ESC = kp('ESC');

// Modifiers
export const LSHFT = kp('LSHIFT');
export const RSHFT = kp('RSHIFT');
export const LCTRL = kp('LCTRL');
export const RCTRL = kp('RCTRL');
export const LALT = kp('LALT');
export const RALT = kp('RALT');
export const LGUI = kp('LGUI');
export const RGUI = kp('RGUI');

// Punctuation
export const COMMA = kp('COMMA');
export const DOT = kp('DOT');
export const SEMI = kp('SEMI');
export const SQT = kp('SQT');
export const GRAVE = kp('GRAVE');
export const MINUS = kp('MINUS');
export const EQUAL = kp('EQUAL');
export const LBKT = kp('LBKT');
export const RBKT = kp('RBKT');
export const BSLH = kp('BSLH');
export const FSLH = kp('FSLH');

// Media keys
export const C_PP = kp('C_PP');
export const C_NEXT = kp('C_NEXT');
export const C_PREV = kp('C_PREV');
export const C_PLAY = kp('C_PLAY');
export const C_STOP = kp('C_STOP');
export const C_EJECT = kp('C_EJECT');
export const C_MEDIA_HOME = kp('C_MEDIA_HOME');
export const C_VOL_UP = kp('C_VOL_UP');
export const C_VOL_DN = kp('C_VOL_DN');
export const C_MUTE = kp('C_MUTE');

// Helper function to add a modifier
const modify = (input: string | KeyPress, modifier: ModifierKey): KeyPress => {
  if (typeof input === 'string') {
    return kp(input, [modifier]);
  }
  return kp(input.code.key, [...input.code.modifiers, modifier]);
};

// Modifier helpers
export const LC = (input: string | KeyPress): KeyPress => modify(input, 'LC');
export const LS = (input: string | KeyPress): KeyPress => modify(input, 'LS');
export const LA = (input: string | KeyPress): KeyPress => modify(input, 'LA');
export const LG = (input: string | KeyPress): KeyPress => modify(input, 'LG');
export const RC = (input: string | KeyPress): KeyPress => modify(input, 'RC');
export const RS = (input: string | KeyPress): KeyPress => modify(input, 'RS');
export const RA = (input: string | KeyPress): KeyPress => modify(input, 'RA');
export const RG = (input: string | KeyPress): KeyPress => modify(input, 'RG');

// Additional symbols
export const EXCL = kp('EXCL');
export const AT = kp('AT');
export const HASH = kp('HASH');
export const DLLR = kp('DLLR');
export const PRCNT = kp('PRCNT');
export const CARET = kp('CARET');
export const AMPS = kp('AMPS');
export const STAR = kp('STAR');
export const LPAR = kp('LPAR');
export const RPAR = kp('RPAR');
export const LBRC = kp('LBRC');
export const RBRC = kp('RBRC');