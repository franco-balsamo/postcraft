/**
 * Global Express error handler.
 * Must be registered LAST (after all routes) with 4 parameters.
 *
 * Usage: app.use(errorHandler)
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Log the full stack in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
  }

  // Handle known error types
  const status = err.status || err.statusCode || 500;

  const body = {
    error: err.message || 'Internal server error',
  };

  // Append validation details when present (e.g. from express-validator)
  if (err.details) {
    body.details = err.details;
  }

  // Never leak stack traces to clients in production
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.stack = err.stack;
  }

  return res.status(status).json(body);
}

/**
 * Tiny helper to create HTTP errors with a status code.
 * Usage: throw createError(404, 'Post not found')
 */
export function createError(status, message, details) {
  const err = new Error(message);
  err.status = status;
  if (details) err.details = details;
  return err;
}
