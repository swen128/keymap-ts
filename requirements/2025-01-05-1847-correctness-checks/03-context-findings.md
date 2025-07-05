# Context Findings

## Current Validation Implementation

### Existing Validation Patterns in checker.ts

1. **Layer Reference Validation** (lines 63-128)
   - Validates layer names exist before converting to indices
   - Applied to behaviors: `momentaryLayer`, `toggleLayer`, `stickyLayer`, `toLayer`, `layerTap`, `customStickyLayer`
   - Uses `validLayerNames` Set for O(1) lookup

2. **Behavior Definition Conflict Detection** (lines 131-226)
   - Prevents multiple definitions of same behavior with different properties
   - Uses JSON.stringify for deep equality check
   - Tracks all collected behavior definitions in a Map

3. **Error Accumulation Pattern**
   - Uses `ValidationError[]` array to collect all errors
   - Includes structured path information for precise error location
   - Returns `Result<CheckedKeymap, ValidationError[]>` using neverthrow

### Missing Validations Identified

1. **Numeric Range Validations**
   - No validation for timing parameters (should be positive and within ZMK limits)
   - No validation for Bluetooth profile range (0-4)
   - No validation for RGB/backlight values
   - No validation for mouse movement parameters

2. **Array Length Validations**
   - Combo `keyPositions` - no minimum (should be ≥2) or maximum validation
   - Tap-dance `bindings` - no minimum (should be ≥2) validation
   - Macro `bindings` - no maximum (ZMK limit is 256) validation

3. **Key Position Validations**
   - Combo `keyPositions` are strings but not validated as numeric
   - No validation against keyboard matrix size
   - `holdTriggerKeyPositions` not validated

4. **Cross-Reference Validations**
   - Behaviors used in `bindings` arrays not validated to exist
   - Macro names in bindings not validated to exist
   - Conditional layer references not validated

## ZMK Firmware Constraints

Based on ZMK documentation and firmware analysis:

### Hard Limits
- **Macro bindings**: Maximum 256 behaviors per macro
- **Bluetooth profiles**: 0-4 (5 profiles total)
- **Behavior name length**: Maximum 8 characters for non-central behaviors
- **Mouse buttons**: MB1-MB5 (5 buttons)

### Recommended Ranges
- **tappingTermMs**: 50-1000ms (typical: 150-300ms)
- **releaseAfterMs**: 100-10000ms (typical: 500-2000ms)
- **quickTapMs**: 50-500ms (typical: 100-200ms)
- **requirePriorIdleMs**: 50-500ms (typical: 100-250ms)
- **RGB hue**: 0-360
- **RGB saturation/brightness**: 0-100
- **Backlight brightness**: 0-100

## Files Requiring Modification

### Primary Files
1. **packages/keymap-ts/src/checker/checker.ts**
   - Add numeric range validations
   - Add array length validations
   - Add cross-reference validations
   - Enhance existing validation functions

2. **packages/keymap-ts/src/dsl/schemas.ts**
   - Add Typia validation tags for constraints
   - Document valid ranges in types

3. **packages/keymap-ts/src/checker/checker.test.ts**
   - Add tests for new validation rules
   - Test edge cases and error messages

### Similar Features Analyzed

1. **Layer validation pattern** (good to follow):
   - Pre-compute valid set for O(1) lookup
   - Validate during binding processing
   - Clear error messages with paths

2. **Behavior definition collection**:
   - Already tracks all definitions
   - Can extend to validate references

3. **Error handling pattern**:
   - Accumulate all errors before returning
   - Include precise location information
   - Use Result type for safety

## Technical Constraints

1. **Performance**: Validations should remain O(1) or O(n) where possible
2. **Backwards compatibility**: New validations should not break existing valid keymaps
3. **Error clarity**: Messages should guide users to fix issues
4. **Functional style**: Follow project's functional programming approach