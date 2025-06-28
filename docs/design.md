# Keymap Editor Design

This document outlines the design decisions and architecture for the ZMK keymap editor and transpiler.

## Architecture Overview

The transpiler follows a three-stage pipeline:

1. **Input (User Config)**: TypeScript files written by users using our DSL
2. **Validation (Checked Keymap)**: Validated intermediate representation with extracted definitions
3. **Output (Device Tree)**: ZMK-compatible `.keymap` files in devicetree format

### Terminology

- **User-facing types** (`Keymap`, `Layer`, `Binding`): The TypeScript types that users interact with directly. Features:
  - Inline macro definitions at binding sites
  - Type-safe keyboard layout helpers
  - Direct behavior references
  - Clean, intuitive naming
  - Example: `{ behavior: 'macro', macro: { name: 'email', bindings: [...] } }`

- **Checked types** (`CheckedKeymap`, `CheckedLayer`, `CheckedBinding`): The validated intermediate representation produced by the checker. Features:
  - Extracted macro and custom behavior definitions
  - Validated layer references
  - Resolved binding parameters
  - All errors caught at this stage
  - Example: Separate `macros` field with macro definitions, bindings reference by name

- **Device tree types** (`DeviceTreeNode`, `DeviceTreeProperty`): The final ZMK keymap format (`.keymap` files)
  - Devicetree syntax with nodes and properties
  - Compatible with ZMK firmware
  - Direct representation of the output format

### Design Principles

1. **User-Friendly DSL**: The user config should be ergonomic to write with TypeScript tooling support
2. **Complete Validation**: The checker must catch all errors - no errors should occur during emission
3. **Clean Separation**: Each stage has clear responsibilities and data structures

## Error Handling Strategy

Since the transpiler imports TypeScript files directly, we don't have access to source code spans for traditional error reporting. Instead, we use a **structural path-based approach** that leverages the physical keyboard layout.

### Path-Based Error Location

Errors reference the structural path through the keymap, which maps directly to the physical keyboard:

```
Error in layer "base" > left hand > row middle > key 3: Invalid key code "INVALID_KEY"
Error in combo "copy_combo": Key position 45 is out of range for Glove80 (max: 79)
```
