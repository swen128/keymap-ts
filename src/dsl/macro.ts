import type {Behavior, KeyPress, MacroAction, MacroBinding} from './schemas.js';

/**
 * Creates a macro builder for defining keyboard macros.
 * 
 * Macros allow you to define a sequence of key presses, releases, and other actions
 * that can be triggered by a single key press.
 * 
 * @param name - The name of the macro (must be unique within your keymap)
 * @returns A MacroBuilder instance for chaining macro actions
 * 
 * @example
 * ```typescript
 * // Create a copy-all macro
 * const copyAll = macro('copy_all')
 *   .tap(LC(A))  // Ctrl+A (select all)
 *   .tap(LC(C))  // Ctrl+C (copy)
 *   .build();
 * 
 * // Create a macro with delays
 * const delayedType = macro('delayed_type')
 *   .tap(H)
 *   .wait(100)   // Wait 100ms
 *   .tap(I)
 *   .build();
 * 
 * // Create a macro that holds a modifier
 * const shiftWord = macro('shift_word')
 *   .press(LSHFT)
 *   .tap(W)
 *   .tap(O)
 *   .tap(R)
 *   .tap(D)
 *   .release(LSHFT)
 *   .build();
 * ```
 */
export const macro = (name: string): MacroBuilder => MacroBuilder.create(name);

export class MacroBuilder {
  private constructor(
    private readonly name: string,
    private readonly actions: MacroAction[]
  ) {
  }

  static create(name: string): MacroBuilder {
    return new MacroBuilder(name, []);
  }

  tap(input: KeyPress): MacroBuilder {
    return new MacroBuilder(
      this.name,
      [...this.actions, {type: 'tap', code: input.code}]
    );
  }

  press(input: KeyPress): MacroBuilder {
    return new MacroBuilder(
      this.name,
      [...this.actions, {type: 'press', code: input.code}]
    );
  }

  release(input: KeyPress): MacroBuilder {
    return new MacroBuilder(
      this.name,
      [...this.actions, {type: 'release', code: input.code}]
    );
  }

  wait(ms: number): MacroBuilder {
    return new MacroBuilder(
      this.name,
      [...this.actions, {type: 'wait', ms}]
    );
  }

  pauseForRelease(): MacroBuilder {
    return new MacroBuilder(
      this.name,
      [...this.actions, {type: 'pauseForRelease'}]
    );
  }

  tapTime(ms: number): MacroBuilder {
    return new MacroBuilder(
      this.name,
      [...this.actions, {type: 'tapTime', ms}]
    );
  }

  waitTime(ms: number): MacroBuilder {
    return new MacroBuilder(
      this.name,
      [...this.actions, {type: 'waitTime', ms}]
    );
  }

  behavior(binding: Behavior): MacroBuilder {
    return new MacroBuilder(
      this.name,
      [...this.actions, {type: 'behavior', binding}]
    );
  }

  build(): MacroBinding {
    return {
      behavior: 'macro',
      macro: {
        name: this.name,
        bindings: this.actions
      }
    };
  }
}
