# Issue: Behavior Parameters Using Names Instead of Numeric Values

## Description
When behaviors are used with other behaviors as parameters, the transpiler is outputting behavior names instead of the appropriate numeric parameters or proper references.

## Examples

### Example 1: mod_caps_word
**Current Output:**
```
&mod_caps_word LALT caps_word
```

**Expected:**
```
&mod_caps_word LALT 0
```
(Since caps_word behavior takes no parameters, it should be referenced as 0)

### Example 2: smart_select with macros
**Current Output:**
```
&smart_select select_line select_word
```

**Expected:**
This is a more complex case where macros are being used as hold/tap bindings. ZMK doesn't support using macros directly as parameters to behaviors.

## Root Cause
The transpiler is outputting the behavior/macro names directly when they're used as parameters to other behaviors, but ZMK expects numeric values or proper binding references.

## Impact
- ZMK compilation errors
- Behaviors won't function as intended

## Affected Code
- The emitter needs to handle behavior references differently when they're used as parameters