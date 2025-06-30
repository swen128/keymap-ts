import { Result, ok, err } from 'neverthrow';
import { KeymapSchema } from './dsl/schemas.js';
import { check } from './checker/checker.js';
import { emit } from './emitter/emitter.js';

export type TranspileError = Array<{
  path?: string[];
  message: string;
}>;

/**
 * Transpiles a keymap configuration to ZMK devicetree format
 * 
 * @param input - The input keymap configuration object
 * @returns The transpilation result with either the output or errors
 */
export function transpile(input: unknown): Result<string, TranspileError> {
  // Validate against schema
  const parseResult = KeymapSchema.safeParse(input);
  if (!parseResult.success) {
    return err(
      parseResult.error.issues.map(issue => ({
        path: issue.path.map(p => String(p)),
        message: issue.message
      }))
    );
  }
  
  // Check the keymap
  const checkResult = check(parseResult.data);
  if (checkResult.isErr()) {
    return err(checkResult.error);
  }
  
  // Emit the devicetree
  const output = emit(checkResult.value);
  
  return ok(output);
}