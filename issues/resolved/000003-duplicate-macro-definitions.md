# Issue: Duplicate Macro Definitions in Output

## Description
When a macro is used multiple times in different bindings (e.g., in different hold-tap behaviors), it gets emitted multiple times in the output keymap. This creates invalid devicetree syntax with duplicate node names.

## Example

### Input:
```typescript
const rgbUgStatusMacro = macro('rgb_ug_status_macro', [
  behavior(rgb_ug('RGB_STATUS'))
]);

// Used in two different hold-tap behaviors:
ht(magicBehavior, mo('Magic'), rgbUgStatusMacro)  // First usage
ht(magicBehavior, mo('Magic'), rgbUgStatusMacro)  // Second usage
```

### Current Output:
```
macros {
    rgb_ug_status_macro: rgb_ug_status_macro {
        compatible = "zmk,behavior-macro";
        #binding-cells = <0>;
        bindings = <&rgb_ug RGB_STATUS>;
    };

    rgb_ug_status_macro: rgb_ug_status_macro {  // DUPLICATE!
        compatible = "zmk,behavior-macro";
        #binding-cells = <0>;
        bindings = <&rgb_ug RGB_STATUS>;
    };
}
```

### Expected Output:
```
macros {
    rgb_ug_status_macro: rgb_ug_status_macro {
        compatible = "zmk,behavior-macro";
        #binding-cells = <0>;
        bindings = <&rgb_ug RGB_STATUS>;
    };
}
```

## Root Cause
The `extractMacros` function in `/src/checker/checker.ts` pushes every macro it finds without checking if it has already been extracted. When the same macro is used in multiple places, it gets added to the list multiple times.

## Impact
- Invalid devicetree syntax with duplicate node names
- ZMK compilation errors
- Larger than necessary output files

## Proposed Solution
Deduplicate macros by name before adding them to the final macro list. This can be done either:
1. During extraction - check if a macro with the same name already exists
2. After extraction - use a Map or filter to remove duplicates