import type { 
  Keymap, 
  Binding, 
  MacroDefinition, 
  Layer,
  StickyKeyDefinition,
  StickyLayerDefinition,
  HoldTapDefinition,
  TapDanceDefinition,
  ModMorphDefinition
} from '../dsl/schemas';
import type { 
  CheckedBinding, 
  CheckedLayer,
  SimpleBinding,
  SynthesizedMacro,
  ExtendedMacroAction,
  BehaviorMacroAction,
  ValidationError,
  CheckResult,
  BehaviorDefinition,
  CheckedHoldTapDefinition,
  CheckedTapDanceDefinition,
  CheckedModMorphDefinition
} from './types';

const syntheticMacroCounter = { value: 0 };

function resetSyntheticMacroCounter(): void {
  syntheticMacroCounter.value = 0;
}

// Get the ZMK behavior name for a checked simple binding
function getCheckedBindingBehaviorName(binding: SimpleBinding): string {
  switch (binding.behavior) {
    case 'keyPress': return 'kp';
    case 'keyToggle': return 'kt';
    case 'stickyKey': return 'sk';
    case 'customStickyKey': return binding.name;
    case 'modTap': return 'mt';
    case 'layerTap': return 'lt';
    case 'toLayer': return 'to';
    case 'momentaryLayer': return 'mo';
    case 'toggleLayer': return 'tog';
    case 'stickyLayer': return 'sl';
    case 'customStickyLayer': return binding.name;
    case 'transparent': return 'trans';
    case 'none': return 'none';
    case 'capsWord': return 'caps_word';
    case 'keyRepeat': return 'key_repeat';
    case 'macro': return binding.macroName;
    case 'mouseButton': return 'mkp';
    case 'systemReset': return 'sys_reset';
    case 'bootloader': return 'bootloader';
    case 'studioUnlock': return 'studio_unlock';
  }
}


function bindingToMacroActions(binding: Binding): ExtendedMacroAction[] {
  const action: BehaviorMacroAction = {
    type: 'behavior',
    binding
  };
  return [action];
}

function createSyntheticMacro(binding: Binding): SynthesizedMacro {
  const currentCount = syntheticMacroCounter.value;
  syntheticMacroCounter.value += 1;
  const name: `__synthetic_${string}_${number}` = `__synthetic_${binding.behavior}_${currentCount}`;
  const actions = bindingToMacroActions(binding);
  
  return {
    name,
    bindings: actions,
  };
}

function checkBinding(
  binding: Binding, 
  synthesizedMacros: SynthesizedMacro[],
  errors: ValidationError[],
  path: string[],
  behaviorUsageMap: Map<string, Set<string>>
): { binding: CheckedBinding; synthesizedMacros: SynthesizedMacro[] } {
  const newSynthesizedMacros: SynthesizedMacro[] = [];

  const simpleBinding = checkSimpleBinding(binding);
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
        binding: { behavior: 'transparent' },
        synthesizedMacros: []
      };
    case 'bluetooth':
      return {
        binding: {
          behavior: 'bluetooth',
          action: binding.action,
          ...(binding.profile !== undefined && { profile: binding.profile })
        },
        synthesizedMacros: []
      };
    case 'output':
      return {
        binding: {
          behavior: 'output',
          target: binding.target
        },
        synthesizedMacros: []
      };
    case 'rgbUnderglow':
      return {
        binding: {
          behavior: 'rgbUnderglow',
          action: binding.action,
          ...(binding.hue !== undefined && { hue: binding.hue }),
          ...(binding.saturation !== undefined && { saturation: binding.saturation }),
          ...(binding.brightness !== undefined && { brightness: binding.brightness })
        },
        synthesizedMacros: []
      };
    case 'backlight':
      return {
        binding: {
          behavior: 'backlight',
          action: binding.action,
          ...(binding.brightness !== undefined && { brightness: binding.brightness })
        },
        synthesizedMacros: []
      };
    case 'extPower':
      return {
        binding: {
          behavior: 'extPower',
          action: binding.action
        },
        synthesizedMacros: []
      };
    case 'softOff':
      return {
        binding: {
          behavior: 'softOff',
          ...(binding.holdTimeMs !== undefined && { holdTimeMs: binding.holdTimeMs })
        },
        synthesizedMacros: []
      };
    case 'mouseMove':
      return {
        binding: {
          behavior: 'mouseMove',
          ...(binding.x !== undefined && { x: binding.x }),
          ...(binding.y !== undefined && { y: binding.y }),
          ...(binding.delay !== undefined && { delay: binding.delay }),
          ...(binding.acceleration !== undefined && { acceleration: binding.acceleration })
        },
        synthesizedMacros: []
      };
    case 'mouseScroll':
      return {
        binding: {
          behavior: 'mouseScroll',
          ...(binding.x !== undefined && { x: binding.x }),
          ...(binding.y !== undefined && { y: binding.y }),
          ...(binding.continuousScroll !== undefined && { continuousScroll: binding.continuousScroll }),
          ...(binding.delay !== undefined && { delay: binding.delay }),
          ...(binding.acceleration !== undefined && { acceleration: binding.acceleration })
        },
        synthesizedMacros: []
      };
    case 'holdTap': {
      const holdResult = checkBindingForNesting(binding.holdBinding, [...synthesizedMacros, ...newSynthesizedMacros], behaviorUsageMap);
      newSynthesizedMacros.push(...holdResult.synthesizedMacros);
      
      const tapResult = checkBindingForNesting(binding.tapBinding, [...synthesizedMacros, ...newSynthesizedMacros], behaviorUsageMap);
      newSynthesizedMacros.push(...tapResult.synthesizedMacros);
      
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
        synthesizedMacros: newSynthesizedMacros
      };
    }
    case 'tapDance': {
      const checkedBindings: SimpleBinding[] = [];
      
      const usedBehaviors = behaviorUsageMap.get(binding.definition.name) || new Set();
      
      binding.bindings.forEach((b: Binding) => {
        const result = checkBindingForNesting(b, [...synthesizedMacros, ...newSynthesizedMacros], behaviorUsageMap);
        newSynthesizedMacros.push(...result.synthesizedMacros);
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
        synthesizedMacros: newSynthesizedMacros
      };
    }
    case 'modMorph': {
      const defaultResult = checkBindingForNesting(binding.defaultBinding, [...synthesizedMacros, ...newSynthesizedMacros], behaviorUsageMap);
      newSynthesizedMacros.push(...defaultResult.synthesizedMacros);
      
      const morphedResult = checkBindingForNesting(binding.morphedBinding, [...synthesizedMacros, ...newSynthesizedMacros], behaviorUsageMap);
      newSynthesizedMacros.push(...morphedResult.synthesizedMacros);
      
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
        synthesizedMacros: newSynthesizedMacros
      };
    }
    
    default:
      errors.push({
        path,
        message: `Unknown binding behavior`
      });
      return {
        binding: { behavior: 'transparent' },
        synthesizedMacros: []
      };
  }
}

function checkSimpleBinding(
  binding: Binding
): SimpleBinding | null {
  switch (binding.behavior) {
    case 'keyPress':
      return { 
        behavior: 'keyPress', 
        code: { key: binding.code.key, modifiers: [...binding.code.modifiers] }
      };
    
    case 'keyToggle':
      return {
        behavior: 'keyToggle',
        code: { key: binding.code.key, modifiers: [...binding.code.modifiers] }
      };
    
    case 'stickyKey':
      return {
        behavior: 'stickyKey',
        code: { key: binding.code.key, modifiers: [...binding.code.modifiers] }
      };
    
    case 'customStickyKey':
      return {
        behavior: 'customStickyKey',
        name: binding.definition.name,
        code: { key: binding.code.key, modifiers: [...binding.code.modifiers] }
      };
    
    case 'modTap':
      return {
        behavior: 'modTap',
        mod: { key: binding.mod.key, modifiers: [...binding.mod.modifiers] },
        tap: { key: binding.tap.key, modifiers: [...binding.tap.modifiers] }
      };
    
    case 'layerTap':
      return {
        behavior: 'layerTap',
        layer: binding.layer,
        tap: { key: binding.tap.key, modifiers: [...binding.tap.modifiers] }
      };
    
    case 'toLayer':
      return {
        behavior: 'toLayer',
        layer: binding.layer
      };
    
    case 'momentaryLayer':
      return {
        behavior: 'momentaryLayer',
        layer: binding.layer
      };
    
    case 'toggleLayer':
      return {
        behavior: 'toggleLayer',
        layer: binding.layer
      };
    
    case 'stickyLayer':
      return {
        behavior: 'stickyLayer',
        layer: binding.layer
      };
    
    case 'customStickyLayer':
      return {
        behavior: 'customStickyLayer',
        name: binding.definition.name,
        layer: binding.layer
      };
    
    case 'transparent':
    case 'none':
    case 'capsWord':
    case 'keyRepeat':
    case 'systemReset':
    case 'bootloader':
    case 'studioUnlock':
      return { behavior: binding.behavior };
    
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
  binding: Binding,
  existingMacros: SynthesizedMacro[],
  behaviorUsageMap: Map<string, Set<string>>
): { binding: SimpleBinding; synthesizedMacros: SynthesizedMacro[] } {
  const simpleBinding = checkSimpleBinding(binding);
  
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
      const result = checkBinding(binding, existingMacros, errors, [], behaviorUsageMap);
      // The binding will be wrapped in a synthetic macro
      const syntheticMacro = createSyntheticMacro(binding);
      return {
        binding: { behavior: 'macro', macroName: syntheticMacro.name },
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
          binding: { behavior: 'macro', macroName: existingMacro.name },
          synthesizedMacros: []
        };
      }
      const syntheticMacro = createSyntheticMacro(binding);
      return {
        binding: { behavior: 'macro', macroName: syntheticMacro.name },
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
        binding: { behavior: 'transparent' },
        synthesizedMacros: []
      };
  }
}

function findExistingSyntheticMacro(
  binding: Binding,
  existingMacros: SynthesizedMacro[]
): SynthesizedMacro | undefined {
  const actions = bindingToMacroActions(binding);
  
  return existingMacros.find(macro => {
    if (!macro.name.startsWith('__synthetic_')) return false;
    if (macro.bindings.length !== actions.length) return false;
    
    return JSON.stringify(macro.bindings) === JSON.stringify(actions);
  });
}

function checkLayer(
  layer: Layer,
  synthesizedMacros: SynthesizedMacro[],
  errors: ValidationError[],
  behaviorUsageMap: Map<string, Set<string>>
): { layer: CheckedLayer; synthesizedMacros: SynthesizedMacro[] } {
  const newSynthesizedMacros: SynthesizedMacro[] = [];
  const checkedBindings: CheckedBinding[] = [];
  
  layer.bindings.forEach((binding, index) => {
    const path = ['layers', layer.name, 'bindings', index.toString()];
    const result = checkBinding(binding, [...synthesizedMacros, ...newSynthesizedMacros], errors, path, behaviorUsageMap);
    newSynthesizedMacros.push(...result.synthesizedMacros);
    checkedBindings.push(result.binding);
  });
  
  return {
    layer: {
      name: layer.name,
      bindings: checkedBindings
    },
    synthesizedMacros: newSynthesizedMacros
  };
}

export function check(keymap: Keymap): CheckResult {
  resetSyntheticMacroCounter();
  
  const errors: ValidationError[] = [];
  const allSynthesizedMacros: SynthesizedMacro[] = [];
  const checkedLayers: CheckedLayer[] = [];
  // Map to track behavior definitions and their used behaviors
  const behaviorUsageMap = new Map<string, Set<string>>();
  type BaseBehaviorDef = StickyKeyDefinition | StickyLayerDefinition | HoldTapDefinition | TapDanceDefinition | ModMorphDefinition;
  const collectedBehaviorDefs = new Map<string, BaseBehaviorDef>();
  
  // Collect behavior definitions from bindings
  function collectBehaviorDefinitions(binding: Binding): void {
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
          collectedBehaviorDefs.set(binding.definition.name, binding.definition);
        }
        binding.bindings.forEach((b: Binding) => collectBehaviorDefinitions(b));
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
      case 'macro':
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
  keymap.layers.forEach((layer) => {
    layer.bindings.forEach(binding => collectBehaviorDefinitions(binding));
    const result = checkLayer(layer, allSynthesizedMacros, errors, behaviorUsageMap);
    allSynthesizedMacros.push(...result.synthesizedMacros);
    checkedLayers.push(result.layer);
  });
  
  // Process combos
  keymap.combos?.forEach((combo) => {
    collectBehaviorDefinitions(combo.binding);
  });
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  // Extract user-defined macros from macro bindings
  const extractedMacros: MacroDefinition[] = [];
  
  function extractMacros(binding: Binding): void {
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
  
  const allMacros = [...extractedMacros, ...allSynthesizedMacros];
  
  // Convert collected behavior definitions to final format with bindings field
  const behaviorDefinitions: BehaviorDefinition[] = [];
  
  collectedBehaviorDefs.forEach((def, name) => {
    const usedBehaviors = behaviorUsageMap.get(name);
    const bindingsArray = usedBehaviors ? Array.from(usedBehaviors).sort() : [];
    
    switch (def.compatible) {
      case 'zmk,behavior-hold-tap': {
        // For hold-tap, we need to get the behaviors in the correct order
        // Find the first instance to get the order
        let holdBehavior: string | undefined;
        let tapBehavior: string | undefined;
        
        keymap.layers.some(layer => {
          return layer.bindings.some(binding => {
            if (binding.behavior === 'holdTap' && binding.definition?.name === name) {
              const holdBinding = checkBindingForNesting(binding.holdBinding, [], new Map()).binding;
              const tapBinding = checkBindingForNesting(binding.tapBinding, [], new Map()).binding;
              holdBehavior = getCheckedBindingBehaviorName(holdBinding);
              tapBehavior = getCheckedBindingBehaviorName(tapBinding);
              return true; // Stop searching
            }
            return false;
          });
        });
        
        // Use the ordered behaviors if found, otherwise fall back to sorted array
        const orderedBindings = holdBehavior && tapBehavior && bindingsArray.includes(holdBehavior) && bindingsArray.includes(tapBehavior)
          ? [holdBehavior, tapBehavior, ...bindingsArray.filter(b => b !== holdBehavior && b !== tapBehavior)]
          : bindingsArray;
          
        const extendedDef: CheckedHoldTapDefinition = { ...def, bindings: orderedBindings };
        behaviorDefinitions.push(extendedDef);
        return;
      }
      case 'zmk,behavior-tap-dance': {
        const extendedDef: CheckedTapDanceDefinition = { ...def, bindings: bindingsArray };
        behaviorDefinitions.push(extendedDef);
        return;
      }
      case 'zmk,behavior-mod-morph': {
        const extendedDef: CheckedModMorphDefinition = { ...def, bindings: bindingsArray };
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
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return {
    success: true,
    keymap: {
      layers: checkedLayers,
      macros: allMacros,
      behaviors: behaviorDefinitions,
      combos: keymap.combos ?? [],
      conditionalLayers: keymap.conditionalLayers ?? [],
      includes: keymap.includes
    }
  };
}