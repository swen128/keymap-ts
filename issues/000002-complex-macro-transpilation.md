# Issue: Complex Macros Containing Behaviors Are Incorrectly Transpiled

## Description
Macros that contain behavior references (especially hold-tap behaviors) are not being transpiled correctly. The transpiler outputs `<&none>` instead of the actual behavior content.

## Problem Details

### Example 1: smart_left macro

#### Input (DSL):
```typescript
const smartLeftMacro = macro('smart_left', [
  behavior(ht(smartMoveBehavior, kp('HOME', ['LG']), kp('LEFT', ['LA'])))
]);
```

#### Current Output:
```
smart_left: smart_left {
    compatible = "zmk,behavior-macro";
    #binding-cells = <0>;
    bindings = <&none>;
};
```

#### Expected Output:
Should contain a reference to a hold-tap behavior or synthesize the behavior inline.

### Example 2: smart_right macro

#### Input (DSL):
```typescript
const smartRightMacro = macro('smart_right', [
  behavior(ht(smartMoveBehavior, kp('RIGHT', ['LG']), kp('RIGHT', ['LA'])))
]);
```

#### Current Output:
```
smart_right: smart_right {
    compatible = "zmk,behavior-macro";
    #binding-cells = <0>;
    bindings = <&none>;
};
```

## Root Cause
The transpiler's macro handling in the checker phase doesn't properly handle behaviors that are nested within macro definitions. When it encounters a hold-tap behavior inside a macro's behavior action, it fails to:

1. Synthesize the hold-tap behavior definition
2. Create the proper reference to that behavior
3. Include the behavior parameters in the macro binding

## Impact
- Macros that should execute complex behaviors instead do nothing (`&none`)
- Loss of functionality for smart navigation macros
- Users cannot create macros that use hold-tap or other complex behaviors

## Affected Code

### `/src/checker/checker.ts`
- The `extractMacros` function may not be handling nested behaviors within macros
- The macro synthesis logic needs to handle behavior actions that contain complex behaviors

### `/src/emitter/emitter.ts`
- The `emitMacroAction` function returns `<&none>` for certain complex behavior patterns
- Line 123 shows the hardcoded `<&none>` output for unhandled cases

## Proposed Solution
1. Update the checker to properly handle behavior definitions within macros
2. Ensure complex behaviors within macros are either:
   - Synthesized as separate behaviors and referenced
   - Or properly inline-expanded within the macro
3. Update the emitter to handle all behavior types within macro actions