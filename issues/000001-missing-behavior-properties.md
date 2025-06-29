# Issue: Missing Behavior Properties in Transpiler Output

## Description
The transpiler is not including several important properties when generating behavior definitions. These properties are present in the DSL input but are not being emitted in the final keymap output.

## Missing Properties

### 1. `flavor` property
- Affects the timing behavior of hold-tap behaviors
- Common values: `tap-preferred`, `balanced`, `hold-preferred`

### 2. `hold-trigger-key-positions` property  
- Defines which key positions trigger the hold behavior
- Used for home row mods to prevent accidental triggers

### 3. `require-prior-idle-ms` property
- Requires a certain idle time before the hold behavior can trigger
- Helps prevent accidental holds during fast typing

## Example

### Input (DSL):
```typescript
const ltNumBehavior: HoldTapDefinition = {
  name: 'lt_num',
  compatible: 'zmk,behavior-hold-tap',
  tappingTermMs: 170,
  flavor: 'tap-preferred',
  quickTapMs: 300,
  requirePriorIdleMs: 100,
  holdTriggerKeyPositions: [60, 59, 41, 42, 43, 61, 31, 30, 29, 44, 62]
};
```

### Current Output:
```
lt_num: lt_num {
    compatible = "zmk,behavior-hold-tap";
    label = "LT_NUM";
    #binding-cells = <2>;
    bindings = <&mo>, <&kp>;
    tapping-term-ms = <170>;
    quick-tap-ms = <300>;
};
```

### Expected Output:
```
lt_num: lt_num {
    compatible = "zmk,behavior-hold-tap";
    label = "LT_NUM";
    #binding-cells = <2>;
    bindings = <&mo>, <&kp>;
    tapping-term-ms = <170>;
    quick-tap-ms = <300>;
    flavor = "tap-preferred";
    require-prior-idle-ms = <100>;
    hold-trigger-key-positions = <60 59 41 42 43 61 31 30 29 44 62>;
};
```

## Impact
Without these properties, hold-tap behaviors may not function as intended:
- Missing `flavor` can cause unexpected tap/hold detection
- Missing `hold-trigger-key-positions` can cause accidental hold activations
- Missing `require-prior-idle-ms` can trigger holds during fast typing

## Affected Files
- `/src/emitter/emitter.ts` - Need to add emission of these properties in `emitBehaviorDefinition`
- `/src/checker/types.ts` - May need to ensure these properties are preserved in checked types
- `/src/dsl/schemas.ts` - Verify schema includes these properties