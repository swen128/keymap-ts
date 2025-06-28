/**
 * ZMK Keymap Editor - Main library exports
 */

// Re-export everything from the DSL
export * from './dsl';

// Also export transpile for programmatic use
export { transpile } from './transpiler';
export type { TranspileResult, TranspileOutput } from './transpiler';