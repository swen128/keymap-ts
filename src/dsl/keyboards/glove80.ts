import type {Binding as B, GenericKeyboardLayout, Keymap} from '../schemas.js';

type HalfLayout = {
  finger: [
    [B, B, B, B, B],
    [B, B, B, B, B, B],
    [B, B, B, B, B, B],
    [B, B, B, B, B, B],
    [B, B, B, B, B, B],
    [B, B, B, B, B]
  ];
  thumb: [
    [B, B, B],
    [B, B, B]
  ];
};

type Glove80Layout = {
  left: HalfLayout;
  right: HalfLayout;
};

export function glove80Layout(
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

export function glove80Keymap(config: {
  layers: ReadonlyArray<{ name: string; layout: Glove80Layout }>;
  combos?: Keymap['combos'];
  conditionalLayers?: Keymap['conditionalLayers'];
  includes?: Keymap['includes'];
}): Keymap {
  return {
    layers: config.layers.map(({name, layout}) => ({
      name,
      bindings: glove80Layout(layout)
    })),
    combos: config.combos,
    conditionalLayers: config.conditionalLayers,
    includes: config.includes
  };
}