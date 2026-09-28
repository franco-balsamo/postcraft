import { createError } from './errorHandler.js';

/**
 * Validates req[source] (default: body) against a zod schema. On success,
 * req[source] is replaced with the parsed (and coerced/defaulted) data. On
 * failure, responds 400 with a message naming every offending field.
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.') || source}: ${issue.message}`)
        .join('; ');
      return next(createError(400, message, result.error.issues));
    }

    req[source] = result.data;
    next();
  };
}
