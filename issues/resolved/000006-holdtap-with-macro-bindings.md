# Issue: Hold-Tap Behaviors with Macro Bindings Not Properly Referenced

## Description
When a hold-tap behavior uses macros as its hold/tap bindings, the transpiler is outputting the macro names directly instead of properly referencing them.

## Example

### Input:
```typescript
ht(smartSelectBehavior, selectLineMacro, selectWordMacro)
```

### Current Output:
```
&smart_select select_line select_word
```

### Expected Output:
```
&smart_select 0 0
```
or the macros should be wrapped in a way that makes them referenceable as parameters.

## Root Cause
The hold-tap behavior expects binding references that can be used as parameters (either layer indices or key codes), but macro names are being passed directly.

## Impact
- This will cause ZMK compilation errors
- The hold-tap behavior won't work as intended

## Possible Solutions
1. Wrap the macros in synthetic behaviors that can be referenced with indices
2. Use a different approach for referencing macros in hold-tap bindings