# Issue: Layer Names Not Converted to Indices in Macro Actions

## Description
When layer behaviors (to, mo, tog, sl, lt) are used within macro actions, the layer names are not being converted to their corresponding indices. This results in invalid references like `&to Base` instead of `&to 0`.

## Example

### Input:
```typescript
const copySelectionMacro = macro('copy_selection', [
  tap('C', ['LG']),
  behavior(to('Base'))
]);
```

### Current Output:
```
copy_selection: copy_selection {
    compatible = "zmk,behavior-macro";
    #binding-cells = <0>;
    bindings = <&kp LG(C)>
        , <&to Base>;  // ERROR: Should be &to 0
};
```

### Expected Output:
```
copy_selection: copy_selection {
    compatible = "zmk,behavior-macro";
    #binding-cells = <0>;
    bindings = <&kp LG(C)>
        , <&to 0>;
};
```

## Root Cause
The layer name to index conversion happens in the checker phase for regular bindings, but macro actions that contain behavior bindings are not being processed for layer name conversion.

## Impact
- ZMK compilation errors due to invalid layer references
- Macros with layer switching behaviors will not work

## Affected Code
- `/src/emitter/emitter.ts` - The `emitBindingReference` function doesn't handle layer name conversion for behaviors within macros
- The behavior actions within macros still contain the original DSL binding with layer names