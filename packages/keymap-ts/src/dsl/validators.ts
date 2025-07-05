import typia from 'typia';
import type {Keymap} from './schemas.js';

/**
 * Validates a Keymap object using Typia
 */
export const validateKeymap = typia.createValidate<Keymap>();
