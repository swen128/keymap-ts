import type {Behavior, KeyPress, MacroAction, MacroBinding} from './schemas.js';

// Example usage:
//   macro('copy_all')
//     .tap(LC(A))
//     .tap(LC(C))
//     .build()
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
