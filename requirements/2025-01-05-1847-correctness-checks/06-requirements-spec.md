# Requirements Specification: Enhanced Correctness Checks for checker.ts

## Problem Statement

The current keymap checker validates basic structural correctness but misses many ZMK-specific constraints and edge cases. Users encounter runtime errors that could be caught at compile time with better validation. The checker needs additional validations to ensure keymaps will compile and run correctly on ZMK firmware.

## Solution Overview

Enhance the checker.ts module with additional validation rules covering:
- Numeric range validations using strict ZMK firmware limits
- Array length validations for behaviors
- Cross-reference validations for behaviors and macros
- Naming convention validations
- Conditional layer reference validation

All validations will produce errors (fatal) only, following the existing error accumulation pattern.

## Functional Requirements

### 1. Numeric Range Validations

#### 1.1 Timing Parameters
Validate all timing parameters against ZMK firmware limits:
- `tappingTermMs`: 50-1000ms
- `releaseAfterMs`: 100-10000ms  
- `quickTapMs`: 50-500ms
- `requirePriorIdleMs`: 50-500ms
- `holdTimeMs`: 100-10000ms
- Macro `waitMs`/`tapMs`: 1-10000ms
- Macro action `wait.ms`: 1-10000ms

#### 1.2 Bluetooth Profiles
- Validate profile number is between 0-4 (inclusive)
- Apply to `bluetooth` behavior with `BT_SEL` action

#### 1.3 RGB Values
- Hue: 0-360
- Saturation: 0-100
- Brightness: 0-100

#### 1.4 Backlight Values
- Brightness: 0-100

### 2. Array Length Validations

#### 2.1 Combo Key Positions
- Minimum: 2 positions
- Maximum: 8 positions (practical ZMK limit)
- Each position must be a numeric string

#### 2.2 Tap Dance Bindings
- Minimum: 2 bindings
- Maximum: 10 bindings (practical limit)

#### 2.3 Macro Bindings
- Maximum: 256 bindings (ZMK hard limit)

### 3. Cross-Reference Validations

#### 3.1 Macro Name References
- Validate that macro names referenced in `macro` behaviors exist
- Check both user-defined and synthetic macros

#### 3.2 Conditional Layer Validation
- Validate `ifLayers` array contains valid layer names
- Validate `thenLayer` is a valid layer name
- Convert to indices during checking

### 4. Naming Convention Validations

#### 4.1 Macro Names
- Must match pattern: `/^[a-zA-Z][a-zA-Z0-9_]*$/`
- First character must be alphabetic
- Remaining characters: alphanumeric or underscore

#### 4.2 Behavior Names
- Same pattern as macro names
- Apply to: `customStickyKey`, `customStickyLayer`, `holdTap`, `tapDance`, `modMorph`

## Technical Requirements

### 1. Implementation Approach

#### 1.1 Validation Functions
Create reusable validation functions:
```typescript
function validateTimingParameter(
  value: number | undefined,
  paramName: string,
  min: number,
  max: number,
  path: string[],
  errors: ValidationError[]
): void

function validateIdentifierName(
  name: string,
  type: string,
  path: string[],
  errors: ValidationError[]
): void
```

#### 1.2 Integration Points
- Add validations to existing `checkBinding` function
- Add validations to `checkLayer` function
- Add combo validation after line 246
- Add conditional layer validation at end of `check` function

### 2. Error Messages

Error messages should be specific and actionable:
- "Bluetooth profile must be between 0 and 4, got 5"
- "Tap-dance must have at least 2 bindings, got 1"
- "Macro name 'my-macro' contains invalid characters. Use only letters, numbers, and underscores"
- "Macro 'undefined_macro' is not defined"
- "Layer 'invalid_layer' in conditional layer does not exist"

### 3. Performance Considerations

- Pre-compute sets for O(1) lookups (macro names, layer names)
- Validate during single pass through bindings
- Maintain functional programming style

## Implementation Hints

### 1. File Modifications

#### packages/keymap-ts/src/checker/checker.ts
1. Add validation helper functions at top of file
2. Enhance `validateLayerReferences` to include conditional layers
3. Add numeric validations in `checkBinding` switch cases
4. Add array length validations where arrays are processed
5. Track all macro names (user + synthetic) for validation

#### packages/keymap-ts/src/dsl/schemas.ts
1. Add Typia validation tags for numeric constraints
2. Document valid ranges in type comments

#### packages/keymap-ts/src/checker/checker.test.ts
1. Add test cases for each new validation
2. Test boundary conditions
3. Test error message format

### 2. Validation Patterns to Follow

Use existing layer validation as template:
```typescript
// Pre-compute valid set
const validMacroNames = new Set<string>([
  ...userMacros.map(m => m.name),
  ...syntheticMacros.map(m => m.name)
]);

// Validate during processing
if (!validMacroNames.has(binding.macroName)) {
  errors.push({
    path: [...path, 'macroName'],
    message: `Macro "${binding.macroName}" is not defined`
  });
}
```

## Acceptance Criteria

1. All numeric parameters are validated against ZMK limits
2. Array lengths are validated with appropriate min/max
3. Cross-references (macros, layers) are validated
4. Invalid names produce clear error messages
5. All existing tests continue to pass
6. New tests cover all validation rules
7. Performance remains acceptable (< 100ms for typical keymap)
8. Error messages guide users to fix issues

## Assumptions

1. ZMK firmware limits are stable and well-documented
2. Strict validation is preferred over flexibility
3. Users want early error detection
4. Keyboard matrix size validation is out of scope
5. Behavior name length validation is out of scope