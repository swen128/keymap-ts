import { Result, ok, err } from 'neverthrow';
import type {
  Keymap,
  Behavior,
  MacroDefinition,
  Layer,
  StickyKeyDefinition,
  StickyLayerDefinition,
  HoldTapDefinition,
  TapDanceDefinition,
  ModMorphDefinition
} from '../dsl/schemas.js';
import type {
  CheckedBinding,
  CheckedLayer,
  SimpleBinding,
  CheckedMacroDefinition,
  CheckedMacroAction,
  ExtendedMacroAction,
  BehaviorMacroAction,
  ValidationError,
  BehaviorDefinition,
  CheckedHoldTapDefinition,
  CheckedTapDanceDefinition,
  CheckedModMorphDefinition,
  CheckedKeymap
} from './types.js';
import {syntheticMacroCounter} from "./syntheticMacroCounter.js";

type BehaviorName = string;
type LayerName = string;
type LayerIndex = number;
type BehaviorUsageMap = Map<BehaviorName, Set<BehaviorName>>;
type LayerNameToIndexMap = Map<LayerName, LayerIndex>;

// Validation helper functions
function validateTimingParameter(
  value: number | undefined,
  paramName: string,
  min: number,
  max: number,
  path: string[],
  errors: ValidationError[]
): void {
  if (value !== undefined && (value < min || value > max)) {
    errors.push({
      path: [...path, paramName],
      message: `${paramName} must be between ${min}ms and ${max}ms, got ${value}ms`
    });
  }
}

function validateIdentifierName(
  name: string,
  type: string,
  path: string[],
  errors: ValidationError[]
): void {
  const identifierPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!identifierPattern.test(name)) {
    errors.push({
      path,
      message: `${type} name '${name}' contains invalid characters. Use only letters, numbers, and underscores`
    });
  }
}

function validateArrayLength(
  array: unknown[],
  type: string,
  min: number | undefined,
  max: number | undefined,
  path: string[],
  errors: ValidationError[]
): void {
  if (min !== undefined && array.length < min) {
    errors.push({
      path,
      message: `${type} must have at least ${min} items, got ${array.length}`
    });
  }
  if (max !== undefined && array.length > max) {
    errors.push({
      path,
      message: `${type} must have at most ${max} items, got ${array.length}`
    });
  }
}

type BaseBehaviorDef =
  StickyKeyDefinition
  | StickyLayerDefinition
  | HoldTapDefinition
  | TapDanceDefinition
  | ModMorphDefinition;

export function check(keymap: Keymap): Result<CheckedKeymap, ValidationError[]> {
  syntheticMacroCounter.reset();

  const errors: ValidationError[] = [];
  const allCheckedMacroDefinitions: CheckedMacroDefinition[] = [];
  const checkedLayers: CheckedLayer[] = [];
  // Map to track behavior definitions and their used behaviors
  const behaviorUsageMap: BehaviorUsageMap = new Map();
  const collectedBehaviorDefs = new Map<string, BaseBehaviorDef>();

  // Create a set of valid layer names for validation
  const validLayerNames = new Set<LayerName>(keymap.layers.map(l => l.name));

  // Create a map from layer names to indices
  const layerNameToIndex: LayerNameToIndexMap = new Map();
  keymap.layers.forEach((layer, index) => {
    layerNameToIndex.set(layer.name, index);
  });

  // Validate layer references in a binding
  function validateLayerReferences(binding: Behavior, path: string[]): void {
    switch (binding.behavior) {
      case 'momentaryLayer':
      case 'toggleLayer':
      case 'stickyLayer':
      case 'toLayer':
        if (!validLayerNames.has(binding.layer)) {
          errors.push({
            path,
            message: `Layer "${binding.layer}" does not exist`
          });
        }
        break;
      case 'customStickyLayer':
        if (!validLayerNames.has(binding.layer)) {
          errors.push({
            path,
            message: `Layer "${binding.layer}" does not exist`
          });
        }
        break;
      case 'layerTap':
        if (!validLayerNames.has(binding.layer)) {
          errors.push({
            path,
            message: `Layer "${binding.layer}" does not exist`
          });
        }
        break;
      case 'holdTap':
        validateLayerReferences(binding.holdBinding, [...path, 'holdBinding']);
        validateLayerReferences(binding.tapBinding, [...path, 'tapBinding']);
        break;
      case 'tapDance':
        binding.bindings.forEach((b, i) => validateLayerReferences(b, [...path, 'bindings', i.toString()]));
        break;
      case 'modMorph':
        validateLayerReferences(binding.defaultBinding, [...path, 'defaultBinding']);
        validateLayerReferences(binding.morphedBinding, [...path, 'morphedBinding']);
        break;
      // Other behaviors don't have layer references
      case 'keyPress':
      case 'modTap':
      case 'macro':
      case 'transparent':
      case 'none':
      case 'keyToggle':
      case 'stickyKey':
      case 'customStickyKey':
      case 'capsWord':
      case 'keyRepeat':
      case 'mouseButton':
      case 'mouseMove':
      case 'mouseScroll':
      case 'systemReset':
      case 'bootloader':
      case 'bluetooth':
      case 'output':
      case 'rgbUnderglow':
      case 'backlight':
      case 'extPower':
      case 'softOff':
      case 'studioUnlock':
        break;
    }
    
    // Additional validations for specific behaviors
    switch (binding.behavior) {
      case 'bluetooth':
        if (binding.action === 'BT_SEL' && binding.profile !== undefined) {
          if (binding.profile < 0 || binding.profile > 4) {
            errors.push({
              path: [...path, 'profile'],
              message: `Bluetooth profile must be between 0 and 4, got ${binding.profile}`
            });
          }
        }
        break;
      case 'rgbUnderglow':
        if (binding.action === 'RGB_COLOR_HSB') {
          if (binding.hue !== undefined && (binding.hue < 0 || binding.hue > 360)) {
            errors.push({
              path: [...path, 'hue'],
              message: `RGB hue must be between 0 and 360, got ${binding.hue}`
            });
          }
          if (binding.saturation !== undefined && (binding.saturation < 0 || binding.saturation > 100)) {
            errors.push({
              path: [...path, 'saturation'],
              message: `RGB saturation must be between 0 and 100, got ${binding.saturation}`
            });
          }
          if (binding.brightness !== undefined && (binding.brightness < 0 || binding.brightness > 100)) {
            errors.push({
              path: [...path, 'brightness'],
              message: `RGB brightness must be between 0 and 100, got ${binding.brightness}`
            });
          }
        }
        break;
      case 'backlight':
        if (binding.action === 'BL_SET' && binding.brightness !== undefined) {
          if (binding.brightness < 0 || binding.brightness > 100) {
            errors.push({
              path: [...path, 'brightness'],
              message: `Backlight brightness must be between 0 and 100, got ${binding.brightness}`
            });
          }
        }
        break;
      case 'softOff':
        validateTimingParameter(binding.holdTimeMs, 'holdTimeMs', 100, 10000, path, errors);
        break;
      // No additional validation needed for these behaviors
      case 'keyPress':
      case 'stickyKey':
      case 'keyToggle':
      case 'momentaryLayer':
      case 'toLayer':
      case 'toggleLayer':
      case 'stickyLayer':
      case 'layerTap':
      case 'modTap':
      case 'holdTap':
      case 'tapDance':
      case 'modMorph':
      case 'customStickyKey':
      case 'customStickyLayer':
      case 'output':
      case 'extPower':
      case 'mouseButton':
      case 'mouseMove':
      case 'mouseScroll':
      case 'transparent':
      case 'none':
      case 'bootloader':
      case 'systemReset':
      case 'capsWord':
      case 'keyRepeat':
      case 'studioUnlock':
      case 'macro':
        break;
    }
  }

  // Collect behavior definitions from bindings
  function collectBehaviorDefinitions(binding: Behavior): void {
    switch (binding.behavior) {
      case 'customStickyKey':
      case 'customStickyLayer': {
        const existing = collectedBehaviorDefs.get(binding.definition.name);
        if (existing && JSON.stringify(existing) !== JSON.stringify(binding.definition)) {
          errors.push({
            path: ['behaviors'],
            message: `Behavior "${binding.definition.name}" has conflicting definitions`
          });
        } else {
          // Validate timing parameters
          validateTimingParameter(binding.definition.releaseAfterMs, 'releaseAfterMs', 100, 10000, ['behaviors', binding.definition.name], errors);
          validateIdentifierName(binding.definition.name, 'Behavior', ['behaviors', binding.definition.name], errors);
          collectedBehaviorDefs.set(binding.definition.name, binding.definition);
        }
        break;
      }
      case 'holdTap': {
        const existing = collectedBehaviorDefs.get(binding.definition.name);
        if (existing && JSON.stringify(existing) !== JSON.stringify(binding.definition)) {
          errors.push({
            path: ['behaviors'],
            message: `Behavior "${binding.definition.name}" has conflicting definitions`
          });
        } else {
          // Validate timing parameters
          validateTimingParameter(binding.definition.tappingTermMs, 'tappingTermMs', 50, 1000, ['behaviors', binding.definition.name], errors);
          validateTimingParameter(binding.definition.quickTapMs, 'quickTapMs', 50, 500, ['behaviors', binding.definition.name], errors);
          validateTimingParameter(binding.definition.requirePriorIdleMs, 'requirePriorIdleMs', 50, 500, ['behaviors', binding.definition.name], errors);
          validateIdentifierName(binding.definition.name, 'Behavior', ['behaviors', binding.definition.name], errors);
          collectedBehaviorDefs.set(binding.definition.name, binding.definition);
        }
        collectBehaviorDefinitions(binding.tapBinding);
        collectBehaviorDefinitions(binding.holdBinding);
        break;
      }
      case 'tapDance': {
        const existing = collectedBehaviorDefs.get(binding.definition.name);
        if (existing && JSON.stringify(existing) !== JSON.stringify(binding.definition)) {
          errors.push({
            path: ['behaviors'],
            message: `Behavior "${binding.definition.name}" has conflicting definitions`
          });
        } else {
          // Validate timing parameters
          validateTimingParameter(binding.definition.tappingTermMs, 'tappingTermMs', 50, 1000, ['behaviors', binding.definition.name], errors);
          validateIdentifierName(binding.definition.name, 'Behavior', ['behaviors', binding.definition.name], errors);
          collectedBehaviorDefs.set(binding.definition.name, binding.definition);
        }
        binding.bindings.forEach((b: Behavior) => collectBehaviorDefinitions(b));
        break;
      }
      case 'modMorph': {
        const existing = collectedBehaviorDefs.get(binding.definition.name);
        if (existing && JSON.stringify(existing) !== JSON.stringify(binding.definition)) {
          errors.push({
            path: ['behaviors'],
            message: `Behavior "${binding.definition.name}" has conflicting definitions`
          });
        } else {
          // Validate name
          validateIdentifierName(binding.definition.name, 'Behavior', ['behaviors', binding.definition.name], errors);
          collectedBehaviorDefs.set(binding.definition.name, binding.definition);
        }
        collectBehaviorDefinitions(binding.defaultBinding);
        collectBehaviorDefinitions(binding.morphedBinding);
        break;
      }
      // Simple bindings don't have definitions
      case 'keyPress':
      case 'keyToggle':
      case 'stickyKey':
      case 'modTap':
      case 'layerTap':
      case 'toLayer':
      case 'transparent':
      case 'none':
      case 'capsWord':
      case 'keyRepeat':
      case 'momentaryLayer':
      case 'toggleLayer':
      case 'stickyLayer':
        break;
      case 'macro': {
        // Process behavior actions within the macro
        binding.macro.bindings.forEach((action) => {
          if (action.type === 'behavior') {
            collectBehaviorDefinitions(action.binding);
          }
        });
        break;
      }
      case 'mouseButton':
      case 'mouseMove':
      case 'mouseScroll':
      case 'systemReset':
      case 'bootloader':
      case 'bluetooth':
      case 'output':
      case 'rgbUnderglow':
      case 'backlight':
      case 'extPower':
      case 'softOff':
      case 'studioUnlock':
        break;
    }
  }

  // Process layers
  keymap.layers.forEach((layer, layerIndex) => {
    layer.bindings.forEach((binding, bindingIndex) => {
      const path = ['layers', layerIndex.toString(), 'bindings', bindingIndex.toString()];
      validateLayerReferences(binding, path);
      collectBehaviorDefinitions(binding);
    });
    const result = checkLayer(layer, allCheckedMacroDefinitions, errors, behaviorUsageMap, layerNameToIndex);
    allCheckedMacroDefinitions.push(...result.synthesizedMacros);
    checkedLayers.push(result.layer);
  });

  // Process combos
  keymap.combos?.forEach((combo, comboIndex) => {
    const path = ['combos', comboIndex.toString(), 'binding'];
    validateLayerReferences(combo.binding, path);
    collectBehaviorDefinitions(combo.binding);
    
    // Validate key positions
    const keyPosPath = ['combos', comboIndex.toString(), 'keyPositions'];
    validateArrayLength(combo.keyPositions, 'Combo key positions', 2, 8, keyPosPath, errors);
    
    // Validate each key position is numeric
    combo.keyPositions.forEach((pos, posIndex) => {
      if (!/^\d+$/.test(pos)) {
        errors.push({
          path: [...keyPosPath, posIndex.toString()],
          message: `Key position must be a numeric string, got "${pos}"`
        });
      }
    });
  });
  // Extract user-defined macros from macro bindings
  const extractedMacros: MacroDefinition[] = [];
  const processedMacros: CheckedMacroDefinition[] = [];

  // Process macro behavior actions to track usage and convert layer names
  function processMacroBehaviorActions(macro: MacroDefinition): CheckedMacroDefinition {
    const processedBindings: CheckedMacroAction[] = [];
    
    // Validate macro name
    validateIdentifierName(macro.name, 'Macro', ['macros', macro.name], errors);
    
    // Validate timing parameters
    validateTimingParameter(macro.waitMs, 'waitMs', 1, 10000, ['macros', macro.name], errors);
    validateTimingParameter(macro.tapMs, 'tapMs', 1, 10000, ['macros', macro.name], errors);
    
    // Validate array length
    validateArrayLength(macro.bindings, 'Macro bindings', undefined, 256, ['macros', macro.name, 'bindings'], errors);

    macro.bindings.forEach((action, actionIndex) => {
      if (action.type === 'behavior') {
        // Process the behavior action to track usage and convert layer names
        const result = checkBinding(
          action.binding,
          [...allCheckedMacroDefinitions, ...processedMacros],
          errors,
          ['macros', macro.name],
          behaviorUsageMap,
          layerNameToIndex
        );
        processedMacros.push(...result.synthesizedMacros);
        collectBehaviorDefinitions(action.binding);

        // Store the processed binding with converted layer indices
        processedBindings.push({
          type: 'behavior',
          binding: result.binding
        });
      } else if (action.type === 'wait') {
        // Validate wait action timing
        validateTimingParameter(action.ms, 'ms', 1, 10000, ['macros', macro.name, 'bindings', actionIndex.toString()], errors);
        processedBindings.push(action);
      } else {
        // Keep other action types as-is (they're already in checked format)
        processedBindings.push(action);
      }
    });

    // Return a new macro with processed bindings
    return {
      name: macro.name,
      bindings: processedBindings,
      ...(macro.waitMs !== undefined ? {waitMs: macro.waitMs} : {}),
      ...(macro.tapMs !== undefined ? {tapMs: macro.tapMs} : {})
    };
  }

  function extractMacros(binding: Behavior): void {
    switch (binding.behavior) {
      case 'macro':
        extractedMacros.push(binding.macro);
        break;
      case 'holdTap':
        extractMacros(binding.holdBinding);
        extractMacros(binding.tapBinding);
        break;
      case 'tapDance':
        binding.bindings.forEach(extractMacros);
        break;
      case 'modMorph':
        extractMacros(binding.defaultBinding);
        extractMacros(binding.morphedBinding);
        break;
      // All other binding types don't contain nested macros
      case 'keyPress':
      case 'output':
      case 'modTap':
      case 'layerTap':
      case 'toLayer':
      case 'transparent':
      case 'none':
      case 'keyToggle':
      case 'stickyKey':
      case 'customStickyKey':
      case 'capsWord':
      case 'keyRepeat':
      case 'momentaryLayer':
      case 'toggleLayer':
      case 'stickyLayer':
      case 'customStickyLayer':
      case 'mouseButton':
      case 'mouseMove':
      case 'mouseScroll':
      case 'systemReset':
      case 'bootloader':
      case 'bluetooth':
      case 'rgbUnderglow':
      case 'backlight':
      case 'extPower':
      case 'softOff':
      case 'studioUnlock':
        break;
    }
  }

  // Extract macros from all bindings
  keymap.layers.forEach(layer => {
    layer.bindings.forEach(extractMacros);
  });
  keymap.combos?.forEach(combo => {
    extractMacros(combo.binding);
  });

  // Deduplicate extracted macros by name
  const deduplicatedMacros = new Map<string, MacroDefinition>();
  extractedMacros.forEach(macro => {
    if (!deduplicatedMacros.has(macro.name)) {
      deduplicatedMacros.set(macro.name, macro);
    }
  });

  // Process macro behavior actions to track usage and convert layer names
  const processedUserMacros: CheckedMacroDefinition[] = [];
  deduplicatedMacros.forEach(macro => {
    const processedMacro = processMacroBehaviorActions(macro);
    processedUserMacros.push(processedMacro);
  });

  const allMacros = [...processedUserMacros, ...allCheckedMacroDefinitions, ...processedMacros];

  // Convert collected behavior definitions to final format with bindings field
  const behaviorDefinitions: BehaviorDefinition[] = [];

  collectedBehaviorDefs.forEach((def, name) => {
    const usedBehaviors = behaviorUsageMap.get(name);
    const bindingsArray = usedBehaviors ? Array.from(usedBehaviors).sort() : [];

    switch (def.compatible) {
      case 'zmk,behavior-hold-tap': {
        // For hold-tap, we need to ensure exactly 2 behaviors in the bindings array
        // Find the first instance to get the order - check layers first, then macros
        const firstUsageFromLayers = keymap.layers
          .flatMap(layer => layer.bindings)
          .find(binding => binding.behavior === 'holdTap' && binding.definition?.name === name);

        // If not found in layers, search in macros
        const firstUsage = firstUsageFromLayers || ((): Behavior | undefined => {
          for (const macro of deduplicatedMacros.values()) {
            for (const action of macro.bindings) {
              if (action.type === 'behavior' && action.binding.behavior === 'holdTap' &&
                action.binding.definition?.name === name) {
                return action.binding;
              }
            }
          }
          return undefined;
        })();

        const finalBindings = firstUsage && firstUsage.behavior === 'holdTap'
          ? [
            getCheckedBindingBehaviorName(checkBindingForNesting(firstUsage.holdBinding, [], new Map(), layerNameToIndex).binding),
            getCheckedBindingBehaviorName(checkBindingForNesting(firstUsage.tapBinding, [], new Map(), layerNameToIndex).binding)
          ]
          : bindingsArray; // Fallback

        const extendedDef: CheckedHoldTapDefinition = {...def, bindings: finalBindings};
        behaviorDefinitions.push(extendedDef);
        return;
      }
      case 'zmk,behavior-tap-dance': {
        const extendedDef: CheckedTapDanceDefinition = {...def, bindings: bindingsArray};
        behaviorDefinitions.push(extendedDef);
        return;
      }
      case 'zmk,behavior-mod-morph': {
        const extendedDef: CheckedModMorphDefinition = {...def, bindings: bindingsArray};
        behaviorDefinitions.push(extendedDef);
        return;
      }
      case 'zmk,behavior-sticky-key':
      case 'zmk,behavior-sticky-layer':
      default:
        behaviorDefinitions.push(def);
        return;
    }
  });
  
  // Cross-reference validations
  
  // Create a set of all macro names for validation
  const allMacroNames = new Set<string>(allMacros.map(m => m.name));
  
  // Validate macro references in bindings
  function validateMacroReferences(binding: CheckedBinding, path: string[]): void {
    switch (binding.behavior) {
      case 'macro':
        if (!allMacroNames.has(binding.macroName)) {
          errors.push({
            path: [...path, 'macroName'],
            message: `Macro "${binding.macroName}" is not defined`
          });
        }
        break;
      case 'holdTap':
        validateMacroReferences(binding.holdBinding, [...path, 'holdBinding']);
        validateMacroReferences(binding.tapBinding, [...path, 'tapBinding']);
        break;
      case 'tapDance':
        binding.bindings.forEach((b, i) => 
          validateMacroReferences(b, [...path, 'bindings', i.toString()]));
        break;
      case 'modMorph':
        validateMacroReferences(binding.defaultBinding, [...path, 'defaultBinding']);
        validateMacroReferences(binding.morphedBinding, [...path, 'morphedBinding']);
        break;
      // Other binding types don't have macro references
      case 'keyPress':
      case 'modTap':
      case 'layerTap':
      case 'toLayer':
      case 'transparent':
      case 'none':
      case 'keyToggle':
      case 'stickyKey':
      case 'customStickyKey':
      case 'capsWord':
      case 'keyRepeat':
      case 'momentaryLayer':
      case 'toggleLayer':
      case 'stickyLayer':
      case 'customStickyLayer':
      case 'mouseButton':
      case 'mouseMove':
      case 'mouseScroll':
      case 'systemReset':
      case 'bootloader':
      case 'bluetooth':
      case 'output':
      case 'rgbUnderglow':
      case 'backlight':
      case 'extPower':
      case 'softOff':
      case 'studioUnlock':
        break;
    }
  }
  
  // Validate macro references in all layers
  checkedLayers.forEach((layer, layerIndex) => {
    layer.bindings.forEach((binding, bindingIndex) => {
      validateMacroReferences(binding, ['layers', layerIndex.toString(), 'bindings', bindingIndex.toString()]);
    });
  });
  
  // Validate macro references in combos
  keymap.combos?.forEach((combo, comboIndex) => {
    // Note: combos still have unchecked bindings, need to check the binding first
    const checkedBinding = checkBinding(combo.binding, allCheckedMacroDefinitions, [], ['combos', comboIndex.toString(), 'binding'], new Map(), layerNameToIndex);
    validateMacroReferences(checkedBinding.binding, ['combos', comboIndex.toString(), 'binding']);
  });
  
  // Validate conditional layers
  keymap.conditionalLayers?.forEach((condLayer, index) => {
    const path = ['conditionalLayers', index.toString()];
    
    // Validate ifLayers
    condLayer.ifLayers.forEach((layerName, layerIndex) => {
      if (!validLayerNames.has(layerName)) {
        errors.push({
          path: [...path, 'ifLayers', layerIndex.toString()],
          message: `Layer "${layerName}" in conditional layer does not exist`
        });
      }
    });
    
    // Validate thenLayer
    if (!validLayerNames.has(condLayer.thenLayer)) {
      errors.push({
        path: [...path, 'thenLayer'],
        message: `Layer "${condLayer.thenLayer}" in conditional layer does not exist`
      });
    }
  });

  if (errors.length > 0) {
    return err(errors);
  }

  return ok({
    layers: checkedLayers,
    macros: allMacros,
    behaviors: behaviorDefinitions,
    combos: keymap.combos ?? [],
    conditionalLayers: keymap.conditionalLayers ?? [],
    includes: keymap.includes,
    globalBehaviorConfig: keymap.globalBehaviorConfig
  });
}

// Get the ZMK behavior name for a checked simple binding
function getCheckedBindingBehaviorName(binding: SimpleBinding): string {
  switch (binding.behavior) {
    case 'keyPress':
      return 'kp';
    case 'keyToggle':
      return 'kt';
    case 'stickyKey':
      return 'sk';
    case 'customStickyKey':
      return binding.name;
    case 'modTap':
      return 'mt';
    case 'layerTap':
      return 'lt';
    case 'toLayer':
      return 'to';
    case 'momentaryLayer':
      return 'mo';
    case 'toggleLayer':
      return 'tog';
    case 'stickyLayer':
      return 'sl';
    case 'customStickyLayer':
      return binding.name;
    case 'transparent':
      return 'trans';
    case 'none':
      return 'none';
    case 'capsWord':
      return 'caps_word';
    case 'keyRepeat':
      return 'key_repeat';
    case 'macro':
      return binding.macroName;
    case 'mouseButton':
      return 'mkp';
    case 'systemReset':
      return 'sys_reset';
    case 'bootloader':
      return 'bootloader';
    case 'studioUnlock':
      return 'studio_unlock';
  }
}


function bindingToMacroActions(binding: Behavior): ExtendedMacroAction[] {
  const action: BehaviorMacroAction = {
    type: 'behavior',
    binding
  };
  return [action];
}

function checkedBindingToMacroActions(binding: CheckedBinding): CheckedMacroAction[] {
  const action: CheckedMacroAction = {
    type: 'behavior',
    binding
  };
  return [action];
}

function createSyntheticMacro(binding: CheckedBinding, behaviorName: string): CheckedMacroDefinition {

  const currentCount = syntheticMacroCounter.next();
  const name = `__synthetic_${behaviorName}_${currentCount}`;
  const actions = checkedBindingToMacroActions(binding);

  return {
    name,
    bindings: actions,
  };
}

function checkBinding(
  binding: Behavior,
  synthesizedMacros: CheckedMacroDefinition[],
  errors: ValidationError[],
  path: string[],
  behaviorUsageMap: BehaviorUsageMap,
  layerNameToIndex: LayerNameToIndexMap
): { binding: CheckedBinding; synthesizedMacros: CheckedMacroDefinition[] } {
  const newCheckedMacroDefinitions: CheckedMacroDefinition[] = [];

  const simpleBinding = checkSimpleBinding(binding, layerNameToIndex);
  if (simpleBinding) {
    return {
      binding: simpleBinding,
      synthesizedMacros: []
    };
  }
  switch (binding.behavior) {
    case 'keyPress':
    case 'keyToggle':
    case 'stickyKey':
    case 'customStickyKey':
    case 'modTap':
    case 'layerTap':
    case 'toLayer':
    case 'momentaryLayer':
    case 'toggleLayer':
    case 'stickyLayer':
    case 'customStickyLayer':
    case 'transparent':
    case 'none':
    case 'capsWord':
    case 'keyRepeat':
    case 'mouseButton':
    case 'systemReset':
    case 'bootloader':
    case 'studioUnlock':
    case 'macro':
      return {
        binding: {behavior: 'transparent'},
        synthesizedMacros: []
      };
    case 'bluetooth':
    case 'output':
    case 'rgbUnderglow':
    case 'backlight':
    case 'extPower':
    case 'softOff':
    case 'mouseMove':
    case 'mouseScroll':
      return {
        binding,
        synthesizedMacros: []
      };
    case 'holdTap': {
      const holdResult = checkBindingForNesting(binding.holdBinding, [...synthesizedMacros, ...newCheckedMacroDefinitions], behaviorUsageMap, layerNameToIndex);
      newCheckedMacroDefinitions.push(...holdResult.synthesizedMacros);

      const tapResult = checkBindingForNesting(binding.tapBinding, [...synthesizedMacros, ...newCheckedMacroDefinitions], behaviorUsageMap, layerNameToIndex);
      newCheckedMacroDefinitions.push(...tapResult.synthesizedMacros);

      // Track which behaviors this hold-tap uses
      const usedBehaviors = behaviorUsageMap.get(binding.definition.name) || new Set();
      usedBehaviors.add(getCheckedBindingBehaviorName(holdResult.binding));
      usedBehaviors.add(getCheckedBindingBehaviorName(tapResult.binding));
      behaviorUsageMap.set(binding.definition.name, usedBehaviors);

      return {
        binding: {
          behavior: 'holdTap',
          name: binding.definition.name,
          holdBinding: holdResult.binding,
          tapBinding: tapResult.binding
        },
        synthesizedMacros: newCheckedMacroDefinitions
      };
    }
    case 'tapDance': {
      const checkedBindings: SimpleBinding[] = [];
      
      // Validate tap-dance has at least 2 bindings
      validateArrayLength(binding.bindings, 'Tap-dance bindings', 2, 10, [...path, 'bindings'], errors);

      const usedBehaviors = behaviorUsageMap.get(binding.definition.name) || new Set();

      binding.bindings.forEach((b: Behavior) => {
        const result = checkBindingForNesting(b, [...synthesizedMacros, ...newCheckedMacroDefinitions], behaviorUsageMap, layerNameToIndex);
        newCheckedMacroDefinitions.push(...result.synthesizedMacros);
        checkedBindings.push(result.binding);
        usedBehaviors.add(getCheckedBindingBehaviorName(result.binding));
      });

      behaviorUsageMap.set(binding.definition.name, usedBehaviors);

      return {
        binding: {
          behavior: 'tapDance',
          name: binding.definition.name,
          bindings: checkedBindings
        },
        synthesizedMacros: newCheckedMacroDefinitions
      };
    }
    case 'modMorph': {
      const defaultResult = checkBindingForNesting(binding.defaultBinding, [...synthesizedMacros, ...newCheckedMacroDefinitions], behaviorUsageMap, layerNameToIndex);
      newCheckedMacroDefinitions.push(...defaultResult.synthesizedMacros);

      const morphedResult = checkBindingForNesting(binding.morphedBinding, [...synthesizedMacros, ...newCheckedMacroDefinitions], behaviorUsageMap, layerNameToIndex);
      newCheckedMacroDefinitions.push(...morphedResult.synthesizedMacros);

      // Track which behaviors this mod-morph uses
      const usedBehaviors = behaviorUsageMap.get(binding.definition.name) || new Set();
      usedBehaviors.add(getCheckedBindingBehaviorName(defaultResult.binding));
      usedBehaviors.add(getCheckedBindingBehaviorName(morphedResult.binding));
      behaviorUsageMap.set(binding.definition.name, usedBehaviors);

      return {
        binding: {
          behavior: 'modMorph',
          name: binding.definition.name,
          defaultBinding: defaultResult.binding,
          morphedBinding: morphedResult.binding,
          mods: binding.mods
        },
        synthesizedMacros: newCheckedMacroDefinitions
      };
    }

    default:
      errors.push({
        path,
        message: `Unknown binding behavior`
      });
      return {
        binding: {behavior: 'transparent'},
        synthesizedMacros: []
      };
  }
}

function checkSimpleBinding(
  binding: Behavior,
  layerNameToIndex: LayerNameToIndexMap
): SimpleBinding | null {
  switch (binding.behavior) {
    case 'keyPress':
      return {
        behavior: 'keyPress',
        code: {key: binding.code.key, modifiers: [...binding.code.modifiers]}
      };

    case 'keyToggle':
      return {
        behavior: 'keyToggle',
        code: {key: binding.code.key, modifiers: [...binding.code.modifiers]}
      };

    case 'stickyKey':
      return {
        behavior: 'stickyKey',
        code: {key: binding.code.key, modifiers: [...binding.code.modifiers]}
      };

    case 'customStickyKey':
      return {
        behavior: 'customStickyKey',
        name: binding.definition.name,
        code: {key: binding.code.key, modifiers: [...binding.code.modifiers]}
      };

    case 'modTap':
      return {
        behavior: 'modTap',
        mod: {key: binding.mod.key, modifiers: [...binding.mod.modifiers]},
        tap: {key: binding.tap.key, modifiers: [...binding.tap.modifiers]}
      };

    case 'layerTap': {
      const layerIndex = layerNameToIndex.get(binding.layer);
      if (layerIndex === undefined) return null;
      return {
        behavior: 'layerTap',
        layer: layerIndex,
        tap: {key: binding.tap.key, modifiers: [...binding.tap.modifiers]}
      };
    }

    case 'toLayer': {
      const layerIndex = layerNameToIndex.get(binding.layer);
      if (layerIndex === undefined) return null;
      return {
        behavior: 'toLayer',
        layer: layerIndex
      };
    }

    case 'momentaryLayer': {
      const layerIndex = layerNameToIndex.get(binding.layer);
      if (layerIndex === undefined) return null;
      return {
        behavior: 'momentaryLayer',
        layer: layerIndex
      };
    }

    case 'toggleLayer': {
      const layerIndex = layerNameToIndex.get(binding.layer);
      if (layerIndex === undefined) return null;
      return {
        behavior: 'toggleLayer',
        layer: layerIndex
      };
    }

    case 'stickyLayer': {
      const layerIndex = layerNameToIndex.get(binding.layer);
      if (layerIndex === undefined) return null;
      return {
        behavior: 'stickyLayer',
        layer: layerIndex
      };
    }

    case 'customStickyLayer': {
      const layerIndex = layerNameToIndex.get(binding.layer);
      if (layerIndex === undefined) return null;
      return {
        behavior: 'customStickyLayer',
        name: binding.definition.name,
        layer: layerIndex
      };
    }

    case 'transparent':
    case 'none':
    case 'capsWord':
    case 'keyRepeat':
    case 'systemReset':
    case 'bootloader':
    case 'studioUnlock':
      return {behavior: binding.behavior};

    case 'mouseButton':
      return {
        behavior: 'mouseButton',
        button: binding.button
      };

    case 'macro':
      return {
        behavior: 'macro',
        macroName: binding.macro.name
      };

    case 'bluetooth':
    case 'output':
    case 'rgbUnderglow':
    case 'backlight':
    case 'extPower':
    case 'softOff':
    case 'mouseMove':
    case 'mouseScroll':
    case 'holdTap':
    case 'tapDance':
    case 'modMorph':
      return null;
  }
}

function checkBindingForNesting(
  binding: Behavior,
  existingMacros: CheckedMacroDefinition[],
  behaviorUsageMap: BehaviorUsageMap,
  layerNameToIndex: LayerNameToIndexMap
): { binding: SimpleBinding; synthesizedMacros: CheckedMacroDefinition[] } {
  const simpleBinding = checkSimpleBinding(binding, layerNameToIndex);

  if (simpleBinding) {
    return {
      binding: simpleBinding,
      synthesizedMacros: []
    };
  }

  // Handle complex bindings that need to be wrapped in synthetic macros
  // But first, if this is a behavior that tracks usage, we need to process it
  switch (binding.behavior) {
    case 'holdTap':
    case 'tapDance':
    case 'modMorph': {
      const errors: ValidationError[] = [];
      const result = checkBinding(binding, existingMacros, errors, [], behaviorUsageMap, layerNameToIndex);
      // The binding will be wrapped in a synthetic macro
      const syntheticMacro = createSyntheticMacro(result.binding, binding.behavior);
      return {
        binding: {behavior: 'macro', macroName: syntheticMacro.name},
        synthesizedMacros: [syntheticMacro, ...result.synthesizedMacros]
      };
    }
    case 'bluetooth':
    case 'output':
    case 'rgbUnderglow':
    case 'backlight':
    case 'extPower':
    case 'softOff':
    case 'mouseMove':
    case 'mouseScroll': {
      // Regular handling for other complex bindings
      const existingMacro = findExistingSyntheticMacro(binding, existingMacros);

      if (existingMacro) {
        return {
          binding: {behavior: 'macro', macroName: existingMacro.name},
          synthesizedMacros: []
        };
      }
      // These bindings are already valid CheckedBindings (no layer references to convert)
      const syntheticMacro = createSyntheticMacro(binding, binding.behavior);
      return {
        binding: {behavior: 'macro', macroName: syntheticMacro.name},
        synthesizedMacros: [syntheticMacro]
      };
    }
    // These cases should never be reached because checkSimpleBinding handles them
    case 'keyPress':
    case 'modTap':
    case 'layerTap':
    case 'toLayer':
    case 'transparent':
    case 'none':
    case 'keyToggle':
    case 'stickyKey':
    case 'customStickyKey':
    case 'capsWord':
    case 'keyRepeat':
    case 'momentaryLayer':
    case 'toggleLayer':
    case 'stickyLayer':
    case 'customStickyLayer':
    case 'macro':
    case 'mouseButton':
    case 'systemReset':
    case 'bootloader':
    case 'studioUnlock':
      // This should never happen as these are simple bindings
      // Return a transparent binding as a fallback
      return {
        binding: {behavior: 'transparent'},
        synthesizedMacros: []
      };
  }
}

function findExistingSyntheticMacro(
  binding: Behavior,
  existingMacros: CheckedMacroDefinition[]
): CheckedMacroDefinition | undefined {
  const actions = bindingToMacroActions(binding);

  return existingMacros.find(macro => {
    if (!macro.name.startsWith('__synthetic_')) return false;
    if (macro.bindings.length !== actions.length) return false;

    return JSON.stringify(macro.bindings) === JSON.stringify(actions);
  });
}

function checkLayer(
  layer: Layer,
  synthesizedMacros: CheckedMacroDefinition[],
  errors: ValidationError[],
  behaviorUsageMap: BehaviorUsageMap,
  layerNameToIndex: LayerNameToIndexMap
): { layer: CheckedLayer; synthesizedMacros: CheckedMacroDefinition[] } {
  const newCheckedMacroDefinitions: CheckedMacroDefinition[] = [];
  const checkedBindings: CheckedBinding[] = [];

  layer.bindings.forEach((binding, index) => {
    const path = ['layers', layer.name, 'bindings', index.toString()];
    const result = checkBinding(binding, [...synthesizedMacros, ...newCheckedMacroDefinitions], errors, path, behaviorUsageMap, layerNameToIndex);
    newCheckedMacroDefinitions.push(...result.synthesizedMacros);
    checkedBindings.push(result.binding);
  });

  return {
    layer: {
      name: layer.name,
      bindings: checkedBindings
    },
    synthesizedMacros: newCheckedMacroDefinitions
  };
}
