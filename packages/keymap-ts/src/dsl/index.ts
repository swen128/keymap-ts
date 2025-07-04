/**
 * DSL (Domain Specific Language) for ZMK Keymap Configuration
 * 
 * This module provides the user-facing API for defining keymaps
 * in TypeScript with full type safety.
 */

// Re-export all user-facing schemas and types
export * from './schemas.js';

// Re-export keycodes
export { type KC } from './keycodes.js';

// Re-export behavior functions
export * as behaviors from './behaviors.js';

// Re-export key constants
export * as keys from './keys.js';
