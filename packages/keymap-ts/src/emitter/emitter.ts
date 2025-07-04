import type {
  BehaviorDefinition,
  CheckedBinding,
  CheckedKeymap,
  CheckedLayer,
  CheckedMacroDefinition,
  CheckedMacroAction
} from '../checker/types.js';
import type {Behavior, Combo, ConditionalLayer, KeyWithModifiers} from '../dsl/schemas.js';

/**
 * Emits ZMK devicetree format from a checked keymap
 */

function formatKeyWithModifiers(code: KeyWithModifiers): string {
  if (code.modifiers.length === 0) {
    return code.key;
  }
  // Sort modifiers for consistent output
  const sortedModifiers = [...code.modifiers].sort();
  // Nest modifiers in reverse order: LC(LS(A))
  return sortedModifiers.reduceRight((acc, mod) => `${mod}(${acc})`, code.key);
}

function emitBehaviorReference(behaviorBinding: CheckedBinding): string {
  switch (behaviorBinding.behavior) {
    case 'keyPress':
      return `&kp ${formatKeyWithModifiers(behaviorBinding.code)}`;
    
    case 'keyToggle':
      return `&kt ${formatKeyWithModifiers(behaviorBinding.code)}`;
    
    case 'stickyKey':
      return `&sk ${formatKeyWithModifiers(behaviorBinding.code)}`;
    
    case 'customStickyKey':
      return `&${behaviorBinding.name} ${formatKeyWithModifiers(behaviorBinding.code)}`;
    
    case 'modTap': {
      const mod = formatKeyWithModifiers(behaviorBinding.mod);
      const tap = formatKeyWithModifiers(behaviorBinding.tap);
      return `&mt ${mod} ${tap}`;
    }
    
    case 'layerTap': {
      const tap = formatKeyWithModifiers(behaviorBinding.tap);
      return `&lt ${behaviorBinding.layer} ${tap}`;
    }
    
    case 'toLayer':
      return `&to ${behaviorBinding.layer}`;
    
    case 'momentaryLayer':
      return `&mo ${behaviorBinding.layer}`;
    
    case 'toggleLayer':
      return `&tog ${behaviorBinding.layer}`;
    
    case 'stickyLayer':
      return `&sl ${behaviorBinding.layer}`;
    
    case 'customStickyLayer':
      return `&${behaviorBinding.name} ${behaviorBinding.layer}`;
    
    case 'transparent':
      return '&trans';
    
    case 'none':
      return '&none';
    
    case 'capsWord':
      return '&caps_word';
    
    case 'keyRepeat':
      return '&key_repeat';
    
    case 'macro':
      return `&${behaviorBinding.macroName}`;
    
    case 'holdTap': {
      const hold = emitBehaviorReference(behaviorBinding.holdBinding);
      const tap = emitBehaviorReference(behaviorBinding.tapBinding);
      // Extract parameters from the behavior references
      // For behaviors like &kp A, we want just "A"
      // For behaviors that don't take params (like macros, caps_word), we want "0"
      const extractParam = (ref: string): string => {
        if (ref.startsWith('&')) {
          const parts = ref.split(' ');
          if (parts.length === 1) {
            // It's a behavior without params (like macro, caps_word, etc)
            // These should be represented as 0 in hold-tap parameters
            return '0';
          } else {
            // It's a behavior with params like &kp A or &mo 1
            return parts.slice(1).join(' ');
          }
        }
        return ref;
      };
      
      const holdParam = extractParam(hold);
      const tapParam = extractParam(tap);
      return `&${behaviorBinding.name} ${holdParam} ${tapParam}`;
    }
    
    case 'tapDance': {
      const params = behaviorBinding.bindings.map(b => {
        const ref = emitBehaviorReference(b);
        // For keyPress behaviors, we need just the key code without &kp
        return ref.startsWith('&kp ') ? ref.slice(4) : ref.slice(1);
      }).join(' ');
      return `&${behaviorBinding.name} ${params}`;
    }
    
    case 'modMorph': {
      const defaultRef = emitBehaviorReference(behaviorBinding.defaultBinding);
      const morphedRef = emitBehaviorReference(behaviorBinding.morphedBinding);
      
      // Extract parameters from behavior references
      const extractParam = (ref: string): string => {
        if (ref.startsWith('&kp ')) {
          // For keyPress behaviors, we need just the key code without &kp
          return ref.slice(4);
        } else if (ref.includes(' ')) {
          // For behaviors with params, extract everything after the behavior name
          return ref.slice(ref.indexOf(' ') + 1);
        } else {
          // For behaviors without params (like &caps_word), use 0
          return '0';
        }
      };
      
      const defaultParam = extractParam(defaultRef);
      const morphedParam = extractParam(morphedRef);
      return `&${behaviorBinding.name} ${defaultParam} ${morphedParam}`;
    }
    
    case 'mouseButton':
      return `&mkp ${behaviorBinding.button}`;
    
    case 'mouseMove':
      return `&mmv MOVE_X(${behaviorBinding.x ?? 0}) MOVE_Y(${behaviorBinding.y ?? 0})`;
    
    case 'mouseScroll':
      return `&msc SCRL_X(${behaviorBinding.x ?? 0}) SCRL_Y(${behaviorBinding.y ?? 0})`;
    
    case 'systemReset':
      return '&sys_reset';
    
    case 'bootloader':
      return '&bootloader';
    
    case 'bluetooth': {
      if (behaviorBinding.action === 'BT_SEL' && behaviorBinding.profile !== undefined) {
        return `&bt BT_SEL ${behaviorBinding.profile}`;
      }
      return `&bt ${behaviorBinding.action}`;
    }
    
    case 'output':
      return `&out ${behaviorBinding.target}`;
    
    case 'rgbUnderglow': {
      const params = behaviorBinding.action === 'RGB_COLOR_HSB' && behaviorBinding.hue !== undefined
        ? `${behaviorBinding.action} ${behaviorBinding.hue} ${behaviorBinding.saturation ?? 100} ${behaviorBinding.brightness ?? 100}`
        : behaviorBinding.action;
      return `&rgb_ug ${params}`;
    }
    
    case 'backlight': {
      const params = behaviorBinding.action === 'BL_SET' && behaviorBinding.brightness !== undefined
        ? `${behaviorBinding.action} ${behaviorBinding.brightness}`
        : behaviorBinding.action;
      return `&bl ${params}`;
    }
    
    case 'extPower':
      return `&ext_power ${behaviorBinding.action}`;
    
    case 'softOff':
      return behaviorBinding.holdTimeMs !== undefined ? `&soft_off ${behaviorBinding.holdTimeMs}` : '&soft_off';
    
    case 'studioUnlock':
      return '&studio_unlock';
  }
}

function emitLayer(layer: CheckedLayer, indent: string = '    '): string {
  const lines: string[] = [];
  lines.push(`${indent}${layer.name}_layer {`);
  lines.push(`${indent}    bindings = <`);
  
  // Emit bindings in rows of 10 (typical for split keyboards)
  const bindingsPerRow = 10;
  const bindingRows = Array.from(
    { length: Math.ceil(layer.bindings.length / bindingsPerRow) },
    (_, i) => layer.bindings.slice(i * bindingsPerRow, (i + 1) * bindingsPerRow)
  );
  
  bindingRows.forEach(row => {
    const rowStr = row.map(b => emitBehaviorReference(b)).join(' ');
    lines.push(`${indent}        ${rowStr}`);
  });
  
  lines.push(`${indent}    >;`);
  lines.push(`${indent}};`);
  
  return lines.join('\n');
}

// Helper to convert a Binding to the format expected by emitBehaviorReference
function emitBindingReference(behaviorBinding: Behavior): string {
  // For macro actions, we need to handle the original binding format
  // The checker has already validated these, so we can safely emit them
  switch (behaviorBinding.behavior) {
    case 'bluetooth':
      return `&bt ${behaviorBinding.action}${behaviorBinding.action === 'BT_SEL' && behaviorBinding.profile !== undefined ? ` ${behaviorBinding.profile}` : ''}`;
    case 'output':
      return `&out ${behaviorBinding.target}`;
    case 'rgbUnderglow': {
      const params = behaviorBinding.action === 'RGB_COLOR_HSB' && behaviorBinding.hue !== undefined
        ? `${behaviorBinding.action} ${behaviorBinding.hue} ${behaviorBinding.saturation ?? 100} ${behaviorBinding.brightness ?? 100}`
        : behaviorBinding.action;
      return `&rgb_ug ${params}`;
    }
    case 'backlight': {
      const params = behaviorBinding.action === 'BL_SET' && behaviorBinding.brightness !== undefined
        ? `${behaviorBinding.action} ${behaviorBinding.brightness}`
        : behaviorBinding.action;
      return `&bl ${params}`;
    }
    case 'extPower':
      return `&ext_power ${behaviorBinding.action}`;
    case 'softOff':
      return behaviorBinding.holdTimeMs !== undefined ? `&soft_off ${behaviorBinding.holdTimeMs}` : '&soft_off';
    case 'mouseMove':
      return `&mmv MOVE_X(${behaviorBinding.x ?? 0}) MOVE_Y(${behaviorBinding.y ?? 0})`;
    case 'mouseScroll':
      return `&msc SCRL_X(${behaviorBinding.x ?? 0}) SCRL_Y(${behaviorBinding.y ?? 0})`;
    case 'keyPress':
      return `&kp ${formatKeyWithModifiers(behaviorBinding.code)}`;
    case 'transparent':
      return '&trans';
    case 'none':
      return '&none';
    case 'systemReset':
      return '&sys_reset';
    case 'bootloader':
      return '&bootloader';
    case 'mouseButton':
      return `&mkp ${behaviorBinding.button}`;
    case 'studioUnlock':
      return '&studio_unlock';
    case 'keyToggle':
      return `&kt ${formatKeyWithModifiers(behaviorBinding.code)}`;
    case 'stickyKey':
      return `&sk ${formatKeyWithModifiers(behaviorBinding.code)}`;
    case 'customStickyKey':
      return `&${behaviorBinding.definition.name} ${formatKeyWithModifiers(behaviorBinding.code)}`;
    case 'modTap': {
      const mod = formatKeyWithModifiers(behaviorBinding.mod);
      const tap = formatKeyWithModifiers(behaviorBinding.tap);
      return `&mt ${mod} ${tap}`;
    }
    case 'layerTap': {
      const tap = formatKeyWithModifiers(behaviorBinding.tap);
      return `&lt ${behaviorBinding.layer} ${tap}`;
    }
    case 'toLayer':
      return `&to ${behaviorBinding.layer}`;
    case 'momentaryLayer':
      return `&mo ${behaviorBinding.layer}`;
    case 'toggleLayer':
      return `&tog ${behaviorBinding.layer}`;
    case 'stickyLayer':
      return `&sl ${behaviorBinding.layer}`;
    case 'customStickyLayer':
      return `&${behaviorBinding.definition.name} ${behaviorBinding.layer}`;
    case 'capsWord':
      return '&caps_word';
    case 'keyRepeat':
      return '&key_repeat';
    case 'macro':
      // Should not appear here, but handle it
      return `&${behaviorBinding.macro.name}`;
    case 'holdTap': {
      // Extract parameters for the hold-tap behavior
      const holdRef = emitBindingReference(behaviorBinding.holdBinding);
      const tapRef = emitBindingReference(behaviorBinding.tapBinding);
      
      // Extract just the parameter part (after the behavior name)
      const extractParam = (ref: string): string => {
        const parts = ref.split(' ');
        return parts.length > 1 ? parts.slice(1).join(' ') : parts[0]?.substring(1) ?? '';
      };
      
      const holdParam = extractParam(holdRef);
      const tapParam = extractParam(tapRef);
      
      return `&${behaviorBinding.definition.name} ${holdParam} ${tapParam}`;
    }
    case 'tapDance':
    case 'modMorph':
      // These complex behaviors should have been synthesized into macros by the checker
      // Return a placeholder
      return '&none';
  }
}

function emitMacroAction(action: CheckedMacroAction): string {
  switch (action.type) {
    case 'behavior':
      // This is a CheckedMacroBehaviorAction with CheckedBinding
      return `<${emitBehaviorReference(action.binding)}>`;
    
    case 'tap':
      return `<&kp ${formatKeyWithModifiers(action.code)}>`;
    
    case 'press':
      return `<&macro_press &kp ${formatKeyWithModifiers(action.code)}>`;
    
    case 'release':
      return `<&macro_release &kp ${formatKeyWithModifiers(action.code)}>`;
    
    case 'wait':
      return `<&macro_wait_time ${action.ms}>`;
    
    case 'pauseForRelease':
      return '<&macro_pause_for_release>';
    
    case 'tapTime':
      return `<&macro_tap_time ${action.ms}>`;
    
    case 'waitTime':
      return `<&macro_wait_time ${action.ms}>`;
  }
}

function emitMacro(macro: CheckedMacroDefinition, indent: string = '    '): string {
  const lines: string[] = [];
  lines.push(`${indent}${macro.name}: ${macro.name} {`);
  
  if (macro.label !== undefined) {
    lines.push(`${indent}    label = "${macro.label}";`);
  }
  
  lines.push(`${indent}    compatible = "zmk,behavior-macro";`);
  lines.push(`${indent}    #binding-cells = <0>;`);
  
  if (macro.waitMs !== undefined) {
    lines.push(`${indent}    wait-ms = <${macro.waitMs}>;`);
  }
  
  if (macro.tapMs !== undefined) {
    lines.push(`${indent}    tap-ms = <${macro.tapMs}>;`);
  }
  
  const bindingActions = macro.bindings.map(action => emitMacroAction(action)).join('\n            , ');
  lines.push(`${indent}    bindings = ${bindingActions};`);
  
  lines.push(`${indent}};`);
  
  return lines.join('\n');
}

function emitBehaviorDefinition(def: BehaviorDefinition, indent: string = '    '): string {
  const lines: string[] = [];
  lines.push(`${indent}${def.name}: ${def.name} {`);
  lines.push(`${indent}    compatible = "${def.compatible}";`);
  lines.push(`${indent}    label = "${def.name.toUpperCase()}";`);
  lines.push(`${indent}    #binding-cells = <2>;`);
  
  // Add specific properties based on behavior type
  switch (def.compatible) {
    case 'zmk,behavior-hold-tap': {
      if (def.bindings.length > 0) {
        const bindingRefs = def.bindings.map(b => `<&${b}>`).join(', ');
        lines.push(`${indent}    bindings = ${bindingRefs};`);
      }
      if (def.tappingTermMs !== undefined) {
        lines.push(`${indent}    tapping-term-ms = <${def.tappingTermMs}>;`);
      }
      if (def.quickTapMs !== undefined) {
        lines.push(`${indent}    quick-tap-ms = <${def.quickTapMs}>;`);
      }
      if (def.retro !== undefined) {
        lines.push(`${indent}    retro-tap;`);
      }
      if (def.holdWhileUndecided !== undefined) {
        lines.push(`${indent}    hold-while-undecided;`);
      }
      if (def.flavor !== undefined) {
        lines.push(`${indent}    flavor = "${def.flavor}";`);
      }
      if (def.requirePriorIdleMs !== undefined) {
        lines.push(`${indent}    require-prior-idle-ms = <${def.requirePriorIdleMs}>;`);
      }
      if (def.holdTriggerKeyPositions !== undefined && def.holdTriggerKeyPositions.length > 0) {
        const positions = def.holdTriggerKeyPositions.join(' ');
        lines.push(`${indent}    hold-trigger-key-positions = <${positions}>;`);
      }
      if (def.holdTriggerOnRelease !== undefined && def.holdTriggerOnRelease) {
        lines.push(`${indent}    hold-trigger-on-release;`);
      }
      break;
    }
    
    case 'zmk,behavior-tap-dance': {
      if (def.bindings.length > 0) {
        const bindingRefs = def.bindings.map(b => `<&${b}>`).join(', ');
        lines.push(`${indent}    bindings = ${bindingRefs};`);
      }
      if (def.tappingTermMs !== undefined) {
        lines.push(`${indent}    tapping-term-ms = <${def.tappingTermMs}>;`);
      }
      break;
    }
    
    case 'zmk,behavior-mod-morph': {
      if (def.bindings.length > 0) {
        const bindingRefs = def.bindings.map(b => `<&${b}>`).join(', ');
        lines.push(`${indent}    bindings = ${bindingRefs};`);
      }
      if (def.mods !== undefined && def.mods.length > 0) {
        const modStr = def.mods.join('|');
        lines.push(`${indent}    mods = <(${modStr})>;`);
      }
      if (def.keepMods !== undefined && def.keepMods) {
        lines.push(`${indent}    keep-mods = <(MOD_LSFT|MOD_RSFT)>;`);
      }
      break;
    }
    
    case 'zmk,behavior-sticky-key': {
      if (def.releaseAfterMs !== undefined) {
        lines.push(`${indent}    release-after-ms = <${def.releaseAfterMs}>;`);
      }
      if (def.quickRelease !== undefined) {
        lines.push(`${indent}    quick-release;`);
      }
      if (def.lazy !== undefined) {
        lines.push(`${indent}    lazy;`);
      }
      if (def.ignoreModifiers !== undefined) {
        lines.push(`${indent}    ignore-modifiers;`);
      }
      break;
    }
    
    case 'zmk,behavior-sticky-layer': {
      if (def.releaseAfterMs !== undefined) {
        lines.push(`${indent}    release-after-ms = <${def.releaseAfterMs}>;`);
      }
      if (def.quickRelease !== undefined) {
        lines.push(`${indent}    quick-release;`);
      }
      if (def.ignoreModifiers !== undefined) {
        lines.push(`${indent}    ignore-modifiers;`);
      }
      break;
    }
  }
  
  lines.push(`${indent}};`);
  
  return lines.join('\n');
}

function emitCombo(combo: Combo, indent: string = '    '): string {
  const lines: string[] = [];
  lines.push(`${indent}combo_${combo.name} {`);
  
  if (combo.timeout !== undefined) {
    lines.push(`${indent}    timeout-ms = <${combo.timeout}>;`);
  }
  
  const positions = combo.keyPositions.join(' ');
  lines.push(`${indent}    key-positions = <${positions}>;`);
  
  // Combos use unchecked bindings from the DSL
  lines.push(`${indent}    bindings = <${emitBindingReference(combo.binding)}>;`);
  
  if (combo.layers !== undefined && combo.layers.length > 0) {
    const layers = combo.layers.join(' ');
    lines.push(`${indent}    layers = <${layers}>;`);
  }
  
  if (combo.slowRelease !== undefined && combo.slowRelease) {
    lines.push(`${indent}    slow-release;`);
  }
  
  if (combo.requirePriorIdleMs !== undefined) {
    lines.push(`${indent}    require-prior-idle-ms = <${combo.requirePriorIdleMs}>;`);
  }
  
  lines.push(`${indent}};`);
  
  return lines.join('\n');
}

function emitConditionalLayer(condLayer: ConditionalLayer, index: number, indent: string = '    '): string {
  const lines: string[] = [];
  lines.push(`${indent}tri_layer_${index} {`);
  lines.push(`${indent}    if-layers = <${condLayer.ifLayers.join(' ')}>;`);
  lines.push(`${indent}    then-layer = <${condLayer.thenLayer}>;`);
  lines.push(`${indent}};`);
  
  return lines.join('\n');
}

function emitGlobalBehaviorConfig(config: import('../dsl/schemas.js').GlobalBehaviorConfig): string[] {
  const lines: string[] = [];
  
  // Hold-tap behaviors (&mt, &lt)
  if (config.mt) {
    lines.push('&mt {');
    if (config.mt.tappingTermMs !== undefined) {
      lines.push(`    tapping-term-ms = <${config.mt.tappingTermMs}>;`);
    }
    if (config.mt.flavor !== undefined) {
      lines.push(`    flavor = "${config.mt.flavor}";`);
    }
    if (config.mt.quickTapMs !== undefined) {
      lines.push(`    quick-tap-ms = <${config.mt.quickTapMs}>;`);
    }
    if (config.mt.requirePriorIdleMs !== undefined) {
      lines.push(`    require-prior-idle-ms = <${config.mt.requirePriorIdleMs}>;`);
    }
    if (config.mt.holdTriggerKeyPositions !== undefined && config.mt.holdTriggerKeyPositions.length > 0) {
      lines.push(`    hold-trigger-key-positions = <${config.mt.holdTriggerKeyPositions.join(' ')}>;`);
    }
    if (config.mt.holdTriggerOnRelease !== undefined && config.mt.holdTriggerOnRelease) {
      lines.push('    hold-trigger-on-release;');
    }
    if (config.mt.holdWhileUndecided !== undefined && config.mt.holdWhileUndecided) {
      lines.push('    hold-while-undecided;');
    }
    if (config.mt.holdWhileUndecidedLinger !== undefined && config.mt.holdWhileUndecidedLinger) {
      lines.push('    hold-while-undecided-linger;');
    }
    if (config.mt.retro !== undefined && config.mt.retro) {
      lines.push('    retro-tap;');
    }
    lines.push('};');
    lines.push('');
  }
  
  if (config.lt) {
    lines.push('&lt {');
    if (config.lt.tappingTermMs !== undefined) {
      lines.push(`    tapping-term-ms = <${config.lt.tappingTermMs}>;`);
    }
    if (config.lt.flavor !== undefined) {
      lines.push(`    flavor = "${config.lt.flavor}";`);
    }
    if (config.lt.quickTapMs !== undefined) {
      lines.push(`    quick-tap-ms = <${config.lt.quickTapMs}>;`);
    }
    if (config.lt.requirePriorIdleMs !== undefined) {
      lines.push(`    require-prior-idle-ms = <${config.lt.requirePriorIdleMs}>;`);
    }
    if (config.lt.holdTriggerKeyPositions !== undefined && config.lt.holdTriggerKeyPositions.length > 0) {
      lines.push(`    hold-trigger-key-positions = <${config.lt.holdTriggerKeyPositions.join(' ')}>;`);
    }
    if (config.lt.holdTriggerOnRelease !== undefined && config.lt.holdTriggerOnRelease) {
      lines.push('    hold-trigger-on-release;');
    }
    if (config.lt.holdWhileUndecided !== undefined && config.lt.holdWhileUndecided) {
      lines.push('    hold-while-undecided;');
    }
    if (config.lt.holdWhileUndecidedLinger !== undefined && config.lt.holdWhileUndecidedLinger) {
      lines.push('    hold-while-undecided-linger;');
    }
    if (config.lt.retro !== undefined && config.lt.retro) {
      lines.push('    retro-tap;');
    }
    lines.push('};');
    lines.push('');
  }
  
  // Sticky key behavior (&sk)
  if (config.sk) {
    lines.push('&sk {');
    if (config.sk.releaseAfterMs !== undefined) {
      lines.push(`    release-after-ms = <${config.sk.releaseAfterMs}>;`);
    }
    if (config.sk.quickRelease !== undefined && config.sk.quickRelease) {
      lines.push('    quick-release;');
    }
    if (config.sk.lazy !== undefined && config.sk.lazy) {
      lines.push('    lazy;');
    }
    if (config.sk.ignoreModifiers !== undefined && !config.sk.ignoreModifiers) {
      lines.push('    /delete-property/ ignore-modifiers;');
    }
    lines.push('};');
    lines.push('');
  }
  
  // Sticky layer behavior (&sl)
  if (config.sl) {
    lines.push('&sl {');
    if (config.sl.releaseAfterMs !== undefined) {
      lines.push(`    release-after-ms = <${config.sl.releaseAfterMs}>;`);
    }
    if (config.sl.quickRelease !== undefined && config.sl.quickRelease) {
      lines.push('    quick-release;');
    }
    if (config.sl.ignoreModifiers !== undefined && !config.sl.ignoreModifiers) {
      lines.push('    /delete-property/ ignore-modifiers;');
    }
    lines.push('};');
    lines.push('');
  }
  
  // Caps word behavior (&caps_word)
  if (config.capsWord) {
    lines.push('&caps_word {');
    if (config.capsWord.continueList !== undefined && config.capsWord.continueList.length > 0) {
      const keys = config.capsWord.continueList.join(' ');
      lines.push(`    continue-list = <${keys}>;`);
    }
    if (config.capsWord.mods !== undefined && config.capsWord.mods.length > 0) {
      const modStr = config.capsWord.mods.map(m => {
        // Convert our modifier names to ZMK's MOD_ format
        switch(m) {
          case 'LS': return 'MOD_LSFT';
          case 'LC': return 'MOD_LCTL';
          case 'LA': return 'MOD_LALT';
          case 'LG': return 'MOD_LGUI';
          case 'RS': return 'MOD_RSFT';
          case 'RC': return 'MOD_RCTL';
          case 'RA': return 'MOD_RALT';
          case 'RG': return 'MOD_RGUI';
          default: return m;
        }
      }).join(' | ');
      lines.push(`    mods = <(${modStr})>;`);
    }
    lines.push('};');
    lines.push('');
  }
  
  // Key repeat behavior (&key_repeat)
  if (config.keyRepeat) {
    lines.push('&key_repeat {');
    if (config.keyRepeat.usagePages !== undefined && config.keyRepeat.usagePages.length > 0) {
      const pages = config.keyRepeat.usagePages.join(' ');
      lines.push(`    usage-pages = <${pages}>;`);
    }
    lines.push('};');
    lines.push('');
  }
  
  // Soft off behavior (&soft_off)
  if (config.softOff) {
    lines.push('&soft_off {');
    if (config.softOff.holdTimeMs !== undefined) {
      lines.push(`    hold-time-ms = <${config.softOff.holdTimeMs}>;`);
    }
    if (config.softOff.splitPeripheralOffOnPress !== undefined && config.softOff.splitPeripheralOffOnPress) {
      lines.push('    split-peripheral-off-on-press;');
    }
    lines.push('};');
    lines.push('');
  }
  
  // Mouse move behavior (&mmv)
  if (config.mouseMove) {
    lines.push('&mmv {');
    if (config.mouseMove.xInputCode !== undefined) {
      lines.push(`    x-input-code = <${config.mouseMove.xInputCode}>;`);
    }
    if (config.mouseMove.yInputCode !== undefined) {
      lines.push(`    y-input-code = <${config.mouseMove.yInputCode}>;`);
    }
    if (config.mouseMove.timeToMaxSpeedMs !== undefined) {
      lines.push(`    time-to-max-speed-ms = <${config.mouseMove.timeToMaxSpeedMs}>;`);
    }
    if (config.mouseMove.accelerationExponent !== undefined) {
      lines.push(`    acceleration-exponent = <${config.mouseMove.accelerationExponent}>;`);
    }
    lines.push('};');
    lines.push('');
  }
  
  // Mouse scroll behavior (&msc)
  if (config.mouseScroll) {
    lines.push('&msc {');
    if (config.mouseScroll.xInputCode !== undefined) {
      lines.push(`    x-input-code = <${config.mouseScroll.xInputCode}>;`);
    }
    if (config.mouseScroll.yInputCode !== undefined) {
      lines.push(`    y-input-code = <${config.mouseScroll.yInputCode}>;`);
    }
    if (config.mouseScroll.timeToMaxSpeedMs !== undefined) {
      lines.push(`    time-to-max-speed-ms = <${config.mouseScroll.timeToMaxSpeedMs}>;`);
    }
    if (config.mouseScroll.accelerationExponent !== undefined) {
      lines.push(`    acceleration-exponent = <${config.mouseScroll.accelerationExponent}>;`);
    }
    lines.push('};');
    lines.push('');
  }
  
  return lines;
}

export function emit(keymap: CheckedKeymap): string {
  const lines: string[] = [];
  
  
  // Include headers - only if specified
  if (keymap.includes && keymap.includes.length > 0) {
    keymap.includes.forEach(include => {
      lines.push(`#include <${include}>`);
    });
    lines.push('');
  }
  
  // Global behavior configuration - before the root / block
  if (keymap.globalBehaviorConfig) {
    const globalConfigLines = emitGlobalBehaviorConfig(keymap.globalBehaviorConfig);
    lines.push(...globalConfigLines);
  }
  
  lines.push('/ {');
  
  // Behaviors
  if (keymap.behaviors.length > 0) {
    lines.push('  behaviors {');
    keymap.behaviors.forEach(def => {
      lines.push(emitBehaviorDefinition(def));
      lines.push('');
    });
    lines.push('  };');
    lines.push('');
  }
  
  // Macros
  if (keymap.macros.length > 0) {
    lines.push('  macros {');
    keymap.macros.forEach(macro => {
      lines.push(emitMacro(macro));
      lines.push('');
    });
    lines.push('  };');
    lines.push('');
  }
  
  // Combos
  if (keymap.combos.length > 0) {
    lines.push('  combos {');
    lines.push('    compatible = "zmk,combos";');
    keymap.combos.forEach(combo => {
      lines.push(emitCombo(combo));
      lines.push('');
    });
    lines.push('  };');
    lines.push('');
  }
  
  // Conditional layers
  if (keymap.conditionalLayers.length > 0) {
    lines.push('  conditional_layers {');
    lines.push('    compatible = "zmk,conditional-layers";');
    keymap.conditionalLayers.forEach((condLayer, index) => {
      lines.push(emitConditionalLayer(condLayer, index));
      lines.push('');
    });
    lines.push('  };');
    lines.push('');
  }
  
  // Keymap
  lines.push('  keymap {');
  lines.push('    compatible = "zmk,keymap";');
  lines.push('');
  
  keymap.layers.forEach(layer => {
    lines.push(emitLayer(layer));
    lines.push('');
  });
  
  lines.push('  };');
  lines.push('};');
  
  return lines.join('\n');
}