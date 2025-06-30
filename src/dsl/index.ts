/**
 * DSL (Domain Specific Language) for ZMK Keymap Configuration
 * 
 * This module provides the user-facing API for defining keymaps
 * in TypeScript with full type safety.
 */

// Re-export all user-facing schemas and types
export * from './schemas.js';

// Re-export keyboard helpers
export { glove80Layout, glove80Keymap } from './keyboards/glove80.js';

// Re-export keycodes
export { type KC } from './keycodes.js';

// Re-export helper functions
export * from './helpers.js';