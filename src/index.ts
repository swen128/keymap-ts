/**
 * ZMK Keymap Editor - Main library exports
 */

// Re-export everything from the DSL
export * from './dsl/index.js';

// Also export transpile for programmatic use
export { transpile } from './transpiler.js';
export type { TranspileResult, TranspileOutput } from './transpiler.js';