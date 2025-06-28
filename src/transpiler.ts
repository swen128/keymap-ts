import { KeymapSchema } from './dsl/schemas';
import { check } from './checker/checker';
import { emit } from './emitter/emitter';

export interface TranspileResult {
  success: true;
  output: string;
}

export interface TranspileError {
  success: false;
  errors: Array<{
    path?: string[];
    message: string;
  }>;
}

export type TranspileOutput = TranspileResult | TranspileError;

/**
 * Transpiles a keymap configuration to ZMK devicetree format
 * 
 * @param input - The input keymap configuration object
 * @returns The transpilation result with either the output or errors
 */
export function transpile(input: unknown): TranspileOutput {
  // Validate against schema
  const parseResult = KeymapSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      success: false,
      errors: parseResult.error.issues.map(issue => ({
        path: issue.path.map(p => String(p)),
        message: issue.message
      }))
    };
  }
  
  // Check the keymap
  const checkResult = check(parseResult.data);
  if (!checkResult.success) {
    return {
      success: false,
      errors: checkResult.errors
    };
  }
  
  // Emit the devicetree
  const output = emit(checkResult.keymap);
  
  return {
    success: true,
    output
  };
}