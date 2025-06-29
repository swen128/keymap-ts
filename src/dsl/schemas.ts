import {z} from 'zod/v4';

export const PlainKeyCodeSchema = z.string();
export type PlainKeyCode = z.infer<typeof PlainKeyCodeSchema>;

// Common enums used across multiple schemas
export const MouseButtonTypeSchema = z.enum(['MB1', 'MB2', 'MB3', 'MB4', 'MB5', 'LCLK', 'RCLK', 'MCLK']);
export type MouseButtonType = z.infer<typeof MouseButtonTypeSchema>;

export const BluetoothActionTypeSchema = z.enum(['BT_SEL', 'BT_CLR', 'BT_NXT', 'BT_PRV', 'BT_DISC', 'BT_CLR_ALL']);
export type BluetoothActionType = z.infer<typeof BluetoothActionTypeSchema>;

export const OutputTargetTypeSchema = z.enum(['OUT_USB', 'OUT_BLE', 'OUT_TOG']);
export type OutputTargetType = z.infer<typeof OutputTargetTypeSchema>;

export const RgbActionTypeSchema = z.enum(['RGB_ON', 'RGB_OFF', 'RGB_TOG', 'RGB_HUI', 'RGB_HUD', 'RGB_SAI', 'RGB_SAD', 'RGB_BRI', 'RGB_BRD', 'RGB_SPI', 'RGB_SPD', 'RGB_EFF', 'RGB_EFR', 'RGB_COLOR_HSB', 'RGB_STATUS']);
export type RgbActionType = z.infer<typeof RgbActionTypeSchema>;

export const BacklightActionTypeSchema = z.enum(['BL_ON', 'BL_OFF', 'BL_TOG', 'BL_INC', 'BL_DEC', 'BL_CYCLE', 'BL_SET']);
export type BacklightActionType = z.infer<typeof BacklightActionTypeSchema>;

export const ExtPowerActionTypeSchema = z.enum(['EP_ON', 'EP_OFF', 'EP_TOG']);
export type ExtPowerActionType = z.infer<typeof ExtPowerActionTypeSchema>;

export const ModifierKeySchema = z.enum(['LS', 'LC', 'LA', 'LG', 'RS', 'RC', 'RA', 'RG']);
export type ModifierKey = z.infer<typeof ModifierKeySchema>;

export const KeyWithModifiersSchema = z.object({
  modifiers: z.array(ModifierKeySchema),
  key: PlainKeyCodeSchema,
});
export type KeyWithModifiers = z.infer<typeof KeyWithModifiersSchema>;

export const KeyPressSchema = z.object({
  behavior: z.literal('keyPress'),
  code: KeyWithModifiersSchema,
});
export type KeyPress = z.infer<typeof KeyPressSchema>;

export const ModTapSchema = z.object({
  behavior: z.literal('modTap'),
  mod: KeyWithModifiersSchema,
  tap: KeyWithModifiersSchema,
});
export type ModTap = z.infer<typeof ModTapSchema>;

export const LayerTapSchema = z.object({
  behavior: z.literal('layerTap'),
  layer: z.string(),
  tap: KeyWithModifiersSchema,
});
export type LayerTap = z.infer<typeof LayerTapSchema>;

export const ToLayerSchema = z.object({
  behavior: z.literal('toLayer'),
  layer: z.string(),
});
export type ToLayer = z.infer<typeof ToLayerSchema>;

export const TransparentSchema = z.object({
  behavior: z.literal('transparent'),
});
export type Transparent = z.infer<typeof TransparentSchema>;

export const NoneSchema = z.object({
  behavior: z.literal('none'),
});
export type None = z.infer<typeof NoneSchema>;

export const KeyToggleSchema = z.object({
  behavior: z.literal('keyToggle'),
  code: KeyWithModifiersSchema,
});
export type KeyToggle = z.infer<typeof KeyToggleSchema>;

// Custom behavior definition schemas
export const StickyKeyDefinitionSchema = z.object({
  compatible: z.literal('zmk,behavior-sticky-key'),
  name: z.string(),
  releaseAfterMs: z.number().optional(),
  quickRelease: z.boolean().optional(),
  lazy: z.boolean().optional(),
  ignoreModifiers: z.boolean().optional(),
});
export type StickyKeyDefinition = z.infer<typeof StickyKeyDefinitionSchema>;

export const StickyLayerDefinitionSchema = z.object({
  compatible: z.literal('zmk,behavior-sticky-layer'),
  name: z.string(),
  releaseAfterMs: z.number().optional(),
  quickRelease: z.boolean().optional(),
  ignoreModifiers: z.boolean().optional(),
});
export type StickyLayerDefinition = z.infer<typeof StickyLayerDefinitionSchema>;

export const HoldTapDefinitionSchema = z.object({
  compatible: z.literal('zmk,behavior-hold-tap'),
  name: z.string(),
  tappingTermMs: z.number().optional(),
  quickTapMs: z.number().optional(),
  retro: z.boolean().optional(),
  holdWhileUndecided: z.boolean().optional(),
  flavor: z.enum(['hold-preferred', 'balanced', 'tap-preferred', 'tap-unless-interrupted']).optional(),
  requirePriorIdleMs: z.number().optional(),
  holdTriggerKeyPositions: z.array(z.number()).optional(),
});
export type HoldTapDefinition = z.infer<typeof HoldTapDefinitionSchema>;

export const TapDanceDefinitionSchema = z.object({
  compatible: z.literal('zmk,behavior-tap-dance'),
  name: z.string(),
  tappingTermMs: z.number().optional(),
});
export type TapDanceDefinition = z.infer<typeof TapDanceDefinitionSchema>;

export const ModMorphDefinitionSchema = z.object({
  compatible: z.literal('zmk,behavior-mod-morph'),
  name: z.string(),
  keepMods: z.boolean().optional(),
});
export type ModMorphDefinition = z.infer<typeof ModMorphDefinitionSchema>;

export const StickyKeySchema = z.object({
  behavior: z.literal('stickyKey'),
  code: KeyWithModifiersSchema,
});
export type StickyKey = z.infer<typeof StickyKeySchema>;

export const CustomStickyKeySchema = z.object({
  behavior: z.literal('customStickyKey'),
  definition: StickyKeyDefinitionSchema,
  code: KeyWithModifiersSchema,
});
export type CustomStickyKey = z.infer<typeof CustomStickyKeySchema>;

export const CapsWordSchema = z.object({
  behavior: z.literal('capsWord'),
  continueList: z.array(KeyWithModifiersSchema).optional(),
  applyToNumbers: z.boolean().optional(),
});
export type CapsWord = z.infer<typeof CapsWordSchema>;

export const KeyRepeatSchema = z.object({
  behavior: z.literal('keyRepeat'),
});
export type KeyRepeat = z.infer<typeof KeyRepeatSchema>;

export const MomentaryLayerSchema = z.object({
  behavior: z.literal('momentaryLayer'),
  layer: z.string(),
});
export type MomentaryLayer = z.infer<typeof MomentaryLayerSchema>;

export const ToggleLayerSchema = z.object({
  behavior: z.literal('toggleLayer'),
  layer: z.string(),
});
export type ToggleLayer = z.infer<typeof ToggleLayerSchema>;

export const StickyLayerSchema = z.object({
  behavior: z.literal('stickyLayer'),
  layer: z.string(),
});
export type StickyLayer = z.infer<typeof StickyLayerSchema>;

export const CustomStickyLayerSchema = z.object({
  behavior: z.literal('customStickyLayer'),
  definition: StickyLayerDefinitionSchema,
  layer: z.string(),
});
export type CustomStickyLayer = z.infer<typeof CustomStickyLayerSchema>;

export const MouseButtonSchema = z.object({
  behavior: z.literal('mouseButton'),
  button: MouseButtonTypeSchema,
});
export type MouseButton = z.infer<typeof MouseButtonSchema>;

export const MouseMoveSchema = z.object({
  behavior: z.literal('mouseMove'),
  x: z.number().optional(),
  y: z.number().optional(),
  delay: z.number().optional(),
  acceleration: z.number().optional(),
});
export type MouseMove = z.infer<typeof MouseMoveSchema>;

export const MouseScrollSchema = z.object({
  behavior: z.literal('mouseScroll'),
  x: z.number().optional(),
  y: z.number().optional(),
  continuousScroll: z.boolean().optional(),
  delay: z.number().optional(),
  acceleration: z.number().optional(),
});
export type MouseScroll = z.infer<typeof MouseScrollSchema>;

export const SystemResetSchema = z.object({
  behavior: z.literal('systemReset'),
});
export type SystemReset = z.infer<typeof SystemResetSchema>;

export const BootloaderSchema = z.object({
  behavior: z.literal('bootloader'),
});
export type Bootloader = z.infer<typeof BootloaderSchema>;

export const BluetoothActionSchema = z.object({
  behavior: z.literal('bluetooth'),
  action: BluetoothActionTypeSchema,
  profile: z.number().optional(),
});
export type BluetoothAction = z.infer<typeof BluetoothActionSchema>;

export const OutputSelectionSchema = z.object({
  behavior: z.literal('output'),
  target: OutputTargetTypeSchema,
});
export type OutputSelection = z.infer<typeof OutputSelectionSchema>;

export const RgbUnderglowSchema = z.object({
  behavior: z.literal('rgbUnderglow'),
  action: RgbActionTypeSchema,
  hue: z.number().optional(),
  saturation: z.number().optional(),
  brightness: z.number().optional(),
});
export type RgbUnderglow = z.infer<typeof RgbUnderglowSchema>;

export const BacklightSchema = z.object({
  behavior: z.literal('backlight'),
  action: BacklightActionTypeSchema,
  brightness: z.number().optional(),
});
export type Backlight = z.infer<typeof BacklightSchema>;

export const ExtPowerSchema = z.object({
  behavior: z.literal('extPower'),
  action: ExtPowerActionTypeSchema,
});
export type ExtPower = z.infer<typeof ExtPowerSchema>;

export const SoftOffSchema = z.object({
  behavior: z.literal('softOff'),
  holdTimeMs: z.number().optional(),
});
export type SoftOff = z.infer<typeof SoftOffSchema>;

export const StudioUnlockSchema = z.object({
  behavior: z.literal('studioUnlock'),
});
export type StudioUnlock = z.infer<typeof StudioUnlockSchema>;

export type Binding =
  | KeyPress | ModTap | LayerTap | ToLayer | MacroBinding | Transparent | None
  | KeyToggle | StickyKey | CustomStickyKey | CapsWord | KeyRepeat
  | MomentaryLayer | ToggleLayer | StickyLayer | CustomStickyLayer
  | MouseButton | MouseMove | MouseScroll | SystemReset | Bootloader
  | BluetoothAction | OutputSelection | RgbUnderglow | Backlight
  | ExtPower | SoftOff | StudioUnlock | HoldTap | TapDance | ModMorph;

export const BindingSchema: z.ZodType<Binding> = z.lazy(() => z.discriminatedUnion('behavior', [
  KeyPressSchema,
  ModTapSchema,
  LayerTapSchema,
  ToLayerSchema,
  MacroBindingSchema,
  TransparentSchema,
  NoneSchema,
  KeyToggleSchema,
  StickyKeySchema,
  CustomStickyKeySchema,
  CapsWordSchema,
  KeyRepeatSchema,
  MomentaryLayerSchema,
  ToggleLayerSchema,
  StickyLayerSchema,
  CustomStickyLayerSchema,
  MouseButtonSchema,
  MouseMoveSchema,
  MouseScrollSchema,
  SystemResetSchema,
  BootloaderSchema,
  BluetoothActionSchema,
  OutputSelectionSchema,
  RgbUnderglowSchema,
  BacklightSchema,
  ExtPowerSchema,
  SoftOffSchema,
  StudioUnlockSchema,
  HoldTapSchema,
  TapDanceSchema,
  ModMorphSchema,
]));

export const HoldTapSchema = z.object({
  behavior: z.literal('holdTap'),
  definition: HoldTapDefinitionSchema,
  tapBinding: BindingSchema,
  holdBinding: BindingSchema,
});
export type HoldTap = {
  behavior: 'holdTap';
  definition: HoldTapDefinition;
  tapBinding: Binding;
  holdBinding: Binding;
}

export const TapDanceSchema = z.object({
  behavior: z.literal('tapDance'),
  definition: TapDanceDefinitionSchema,
  bindings: z.array(BindingSchema),
});
export type TapDance = {
  behavior: 'tapDance';
  definition: TapDanceDefinition;
  bindings: Binding[];
}

export const ModMorphSchema = z.object({
  behavior: z.literal('modMorph'),
  definition: ModMorphDefinitionSchema,
  defaultBinding: BindingSchema,
  morphedBinding: BindingSchema,
  mods: z.array(PlainKeyCodeSchema),
});
export type ModMorph = {
  behavior: 'modMorph';
  definition: ModMorphDefinition;
  defaultBinding: Binding;
  morphedBinding: Binding;
  mods: PlainKeyCode[];
}

export const MacroTapActionSchema = z.object({
  type: z.literal('tap'),
  code: KeyWithModifiersSchema,
});
export type MacroTapAction = z.infer<typeof MacroTapActionSchema>;

export const MacroPressActionSchema = z.object({
  type: z.literal('press'),
  code: KeyWithModifiersSchema,
});
export type MacroPressAction = z.infer<typeof MacroPressActionSchema>;

export const MacroReleaseActionSchema = z.object({
  type: z.literal('release'),
  code: KeyWithModifiersSchema,
});
export type MacroReleaseAction = z.infer<typeof MacroReleaseActionSchema>;

export const MacroWaitActionSchema = z.object({
  type: z.literal('wait'),
  ms: z.number(),
});
export type MacroWaitAction = z.infer<typeof MacroWaitActionSchema>;

export const MacroControlActionSchema = z.discriminatedUnion('type', [
  z.object({type: z.literal('pauseForRelease')}),
  z.object({type: z.literal('tapTime'), ms: z.number()}),
  z.object({type: z.literal('waitTime'), ms: z.number()}),
]);
export type MacroControlAction = z.infer<typeof MacroControlActionSchema>;

export type MacroBehaviorAction = {
  type: 'behavior';
  binding: Binding;
};

export const MacroBehaviorActionSchema: z.ZodType<MacroBehaviorAction> = z.object({
  type: z.literal('behavior'),
  binding: z.lazy(() => BindingSchema),
});

export type MacroAction = 
  | MacroTapAction 
  | MacroPressAction 
  | MacroReleaseAction 
  | MacroWaitAction 
  | MacroControlAction
  | MacroBehaviorAction;

export const MacroActionSchema: z.ZodType<MacroAction> = z.lazy(() => z.union([
  MacroTapActionSchema,
  MacroPressActionSchema,
  MacroReleaseActionSchema,
  MacroWaitActionSchema,
  MacroBehaviorActionSchema,
  ...MacroControlActionSchema.options,
]));

export const MacroDefinitionSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  bindings: z.array(z.lazy(() => MacroActionSchema)),
  waitMs: z.number().optional(),
  tapMs: z.number().optional(),
});
export type MacroDefinition = z.infer<typeof MacroDefinitionSchema>;

export const MacroBindingSchema = z.object({
  behavior: z.literal('macro'),
  macro: MacroDefinitionSchema,
});
export type MacroBinding = z.infer<typeof MacroBindingSchema>;

export const ComboSchema = z.object({
  name: z.string(),
  timeout: z.number().optional(),
  keyPositions: z.array(z.string()),
  binding: BindingSchema,
  layers: z.array(z.string()).optional(),
  slowRelease: z.boolean().optional(),
  requirePriorIdleMs: z.number().optional(),
});
export type Combo = z.infer<typeof ComboSchema>;

export const ConditionalLayerSchema = z.object({
  name: z.string(),
  ifLayers: z.array(z.string()),
  thenLayer: z.string(),
});
export type ConditionalLayer = z.infer<typeof ConditionalLayerSchema>;

export const KeyboardLayoutSchema = z.array(BindingSchema);
export type GenericKeyboardLayout = z.infer<typeof KeyboardLayoutSchema>;

export const LayerSchema = z.object({
  name: z.string(),
  bindings: KeyboardLayoutSchema,
});
export type Layer = z.infer<typeof LayerSchema>;

export const KeymapSchema = z.object({
  layers: z.array(LayerSchema),
  combos: z.array(ComboSchema).optional(),
  conditionalLayers: z.array(ConditionalLayerSchema).optional(),
  includes: z.array(z.string()).optional(),
});
export type Keymap = z.infer<typeof KeymapSchema>;
