import {Result, ok, err} from 'neverthrow';
import type {IValidation} from 'typia';

export type ParseError = {
  path: string[];
  message: string;
};

/**
 * Creates a safe parser function from a Typia validator that returns a neverthrow Result
 */
export const safeParse = <T>(validator: (input: unknown) => IValidation<T>) =>
  (input: unknown): Result<T, ParseError[]> => {
    const validationResult = validator(input);

    if (validationResult.success) {
      return ok(validationResult.data);
    }

    const errors: ParseError[] = validationResult.errors.map(error => ({
      path: error.path.split('.').filter(p => p !== '$input'),
      message: error.expected
    }));

    return err(errors);
  };