# Discovery Questions for Correctness Checks Enhancement

## Q1: Will the new correctness checks need to run during the user's normal keymap compilation process?
**Default if unknown:** Yes (validation should happen automatically as part of the normal workflow)

## Q2: Should the correctness checks produce warnings (non-fatal) as well as errors (fatal)?
**Default if unknown:** Yes (some issues might be problematic but not necessarily deal-breakers)

## Q3: Will the checker need to validate against ZMK's built-in behavior constraints and limits?
**Default if unknown:** Yes (ensuring compatibility with the target firmware is important)

## Q4: Do users currently encounter runtime errors that could have been caught by better compile-time checks?
**Default if unknown:** Yes (static validation can prevent many runtime issues)

## Q5: Should the checker validate cross-references between different parts of the keymap (e.g., behaviors used in combos)?
**Default if unknown:** Yes (consistency across the entire configuration is important)