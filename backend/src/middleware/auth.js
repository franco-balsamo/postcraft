import jwt from 'jsonwebtoken';
import 'dotenv/config';

function extractToken(req) {
  // 1. Authorization: Bearer <token>
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  // 2. HTTP-only cookie (set after OAuth or login)
  if (req.cookies?.postcraft_token) return req.cookies.postcraft_token;
  return null;
}

/**
 * Verify JWT from Bearer header or cookie, attach decoded payload to req.user.
 * Shape: { id, email, plan }
 */
export function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id:    payload.sub,
      email: payload.email,
      plan:  payload.plan,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Optional auth – attaches req.user if token is present, but does not block
 * the request if it is missing.
 */
export function optionalAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id:    payload.sub,
      email: payload.email,
      plan:  payload.plan,
    };
  } catch {
    // intentionally ignored for optional auth
  }

  next();
}
