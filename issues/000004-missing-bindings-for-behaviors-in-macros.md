# Issue: Missing Bindings Property for Behaviors Used Within Macros

## Description
When a hold-tap behavior is used within a macro (via a behavior action), the bindings property is not being generated in the behavior definition. This property is required by ZMK to know which behaviors the hold-tap uses.

## Example

### Input:
```typescript
const smartMoveBehavior: HoldTapDefinition = {
  name: 'smart_move',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 150,
  flavor: 'tap-preferred',
  quickTapMs: 500
};

const smartLeftMacro = macro('smart_left', [
  behavior(ht(smartMoveBehavior, kp('HOME', ['LG']), kp('LEFT', ['LA'])))
]);
```

### Current Output:
```
smart_move: smart_move {
    compatible = "zmk,behavior-hold-tap";
    label = "SMART_MOVE";
    #binding-cells = <2>;
    tapping-term-ms = <150>;
    quick-tap-ms = <500>;
    flavor = "tap-preferred";
    // MISSING: bindings = <&kp>, <&kp>;
};
```

### Expected Output:
```
smart_move: smart_move {
    compatible = "zmk,behavior-hold-tap";
    label = "SMART_MOVE";
    #binding-cells = <2>;
    bindings = <&kp>, <&kp>;
    tapping-term-ms = <150>;
    quick-tap-ms = <500>;
    flavor = "tap-preferred";
};
```

## Root Cause
The behavior usage tracking in the checker only tracks behaviors used directly in layers. When a hold-tap behavior is used within a macro's behavior action, the tracking doesn't capture which behaviors (kp, mo, etc.) are used by that hold-tap.

## Impact
- ZMK may not compile correctly without the bindings property
- The hold-tap behavior won't know which sub-behaviors to use

## Affected Code
- `/src/checker/checker.ts` - The behavior usage tracking doesn't process behaviors within macro actions deeply enough
- The `checkBinding` function processes the macro but doesn't track the usage when it's inside a behavior action