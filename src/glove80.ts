/**
 * Glove80-specific exports
 * 
 * Import these types and functions when working with Glove80 keyboards:
 * ```typescript
 * import { glove80Layer, type Glove80Layout } from "keymap-ts/glove80";
 * ```
 */

export { 
  glove80Layer,
  type Glove80Layer,
  type Glove80Layout,
  type Glove80HalfLayout,
  type Glove80FingerLayout,
  type Glove80ThumbLayout 
} from './dsl/keyboards/glove80.js';