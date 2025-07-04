import type {Behavior as B, GenericKeyboardLayout, Layer} from '../schemas.js';

export type Glove80FingerLayout = [
  [B, B, B, B, B],
  [B, B, B, B, B, B],
  [B, B, B, B, B, B],
  [B, B, B, B, B, B],
  [B, B, B, B, B, B],
  [B, B, B, B, B]
];

export type Glove80ThumbLayout = [
  [B, B, B],
  [B, B, B]
]

export type Glove80HalfLayout = {
  finger: Glove80FingerLayout;
  thumb: Glove80ThumbLayout;
};

export type Glove80Layout = {
  left: Glove80HalfLayout;
  right: Glove80HalfLayout;
};

export type Glove80Layer = {
  name: string
  layout: Glove80Layout
}

function glove80Layout(
  layout: Glove80Layout,
): GenericKeyboardLayout {
  const {left, right} = layout;

  return [
    // Row 0: 5 left, 5 right
    ...left.finger[0], ...right.finger[0],

    // Row 1: 6 left, 6 right
    ...left.finger[1], ...right.finger[1],

    // Row 2: 6 left, 6 right
    ...left.finger[2], ...right.finger[2],

    // Row 3: 6 left, 6 right
    ...left.finger[3], ...right.finger[3],

    // Row 4: 6 left + 3 thumb (upper), 3 thumb (upper) + 6 right
    ...left.finger[4],
    ...left.thumb[0],
    ...right.thumb[0],
    ...right.finger[4],

    // Row 5: 5 left + 3 thumb (lower), 3 thumb (lower) + 5 right
    ...left.finger[5],
    ...left.thumb[1],
    ...right.thumb[1],
    ...right.finger[5]
  ];
}

export function glove80Layer({name, layout}: Glove80Layer): Layer {
  return {
    name,
    bindings: glove80Layout(layout)
  };
}
