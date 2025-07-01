import {Result} from 'neverthrow';
import {KeymapSchema} from './dsl/schemas.js';
import {check} from './checker/checker.js';
import {emit} from './emitter/emitter.js';
import {safeParse} from './utils/safeParse.js';

export type TranspileError = {
  path?: string[];
  message: string;
};

/**
 * Transpiles a keymap configuration to ZMK devicetree format
 *
 * @param input - The input keymap configuration object
 * @returns The transpilation result with either the output or errors
 */
export function transpile(input: unknown): Result<string, TranspileError[]> {
  return safeParse(KeymapSchema)(input)
    .andThen(check)
    .map(emit);
}