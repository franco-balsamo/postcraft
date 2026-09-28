import rateLimit from 'express-rate-limit';

/**
 * Thin wrapper around express-rate-limit with the response shape
 * already used across the app ({ error: message }).
 */
export function createRateLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  });
}
