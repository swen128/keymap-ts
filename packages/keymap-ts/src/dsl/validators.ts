import typia from 'typia';
import type {Keymap} from './schemas.js';

/**
 * Validates a Keymap object using Typia
 */
export const validateKeymap = typia.createValidate<Keymap>();

interface ModuleWithDefault {
  default: unknown;
}

/**
 * Validates a module with default export
 */
export const validateModule = typia.createValidate<ModuleWithDefault>();