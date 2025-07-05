# Expert Requirements Questions

## Q6: Should the checker validate that custom behavior names follow ZMK's 8-character limit for non-central behaviors?
**Default if unknown:** Yes (this is a hard ZMK constraint that causes runtime failures)

## Q7: Should numeric range validations use strict ZMK firmware limits or allow wider ranges for future compatibility?
**Default if unknown:** No (use reasonable ranges but not strict firmware limits to allow flexibility)

## Q8: Should the checker validate that key positions in combos and hold-trigger-key-positions match the actual keyboard matrix size?
**Default if unknown:** No (keyboard matrix size varies per board and isn't known at compile time)

## Q9: Should validation of macro names include checking for ZMK naming conventions (alphanumeric and underscores only)?
**Default if unknown:** Yes (invalid characters in macro names cause compilation failures)

## Q10: Should the checker validate that conditional layer references use valid layer indices in both "if" and "then" fields?
**Default if unknown:** Yes (invalid conditional layers cause runtime issues)