import {Result, ok, err} from 'neverthrow';
import type {z} from 'zod/v4';

export type ParseError = {
  path: string[];
  message: string;
};

/**
 * Creates a safe parser function from a Zod schema that returns a neverthrow Result
 */
export const safeParse = <T>(schema: z.ZodSchema<T>) =>
  (input: unknown): Result<T, ParseError[]> => {
    const parseResult = schema.safeParse(input);

    if (parseResult.success) {
      return ok(parseResult.data);
    }

    const errors: ParseError[] = parseResult.error.issues.map(issue => ({
      path: issue.path.map(p => String(p)),
      message: issue.message
    }));

    return err(errors);
  };