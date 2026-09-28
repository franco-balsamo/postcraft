import { Router } from 'express';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../config/db.js';
import {
  saveTokens,
  exchangeForLongLivedToken,
  fetchPagesAndIgAccounts,
} from '../services/tokenService.js';
import { createError } from '../middleware/errorHandler.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import 'dotenv/config';

export const router = Router();

// ─── Rate limiters ───────────────────────────────────────────────────────────

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many attempts, please try again in 15 minutes.',
});

// ─── Passport / Meta OAuth setup ─────────────────────────────────────────────

const metaConfigured = process.env.META_APP_ID && process.env.META_APP_SECRET;

if (!metaConfigured) {
  console.warn('[auth] META_APP_ID / META_APP_SECRET not set — Facebook OAuth disabled.');
}

const META_OAUTH_SCOPE = [
  'email',
  'public_profile',
  'pages_manage_posts',
  'pages_read_engagement',
  'instagram_basic',
  'instagram_content_publish',
];

// This flow only ever connects a Meta account to whoever is already logged
// in via the app's own JWT cookie (see optionalAuth on the routes below) —
// there is no "log in with Facebook" entry point in the frontend. So the
// verify callback attaches tokens to req.user's existing account instead of
// finding-or-creating a user by email, which would otherwise risk silently
// switching (or creating) accounts if the Facebook email doesn't match.
if (metaConfigured)
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.META_APP_ID,
        clientSecret: process.env.META_APP_SECRET,
        callbackURL: process.env.META_CALLBACK_URL,
        profileFields: ['id', 'emails', 'displayName', 'photos'],
        enableProof: true,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          if (!req.user) {
            console.warn('[auth] Meta callback hit with no authenticated session — rejecting.');
            return done(null, false);
          }

          const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
          const user = rows[0];

          if (!user) {
            return done(null, false);
          }

          // Exchange short-lived token for long-lived token
          let longLived;
          try {
            longLived = await exchangeForLongLivedToken(accessToken);
          } catch {
            longLived = { access_token: accessToken, expires_in: null };
          }

          const expiresAt = longLived.expires_in
            ? new Date(Date.now() + longLived.expires_in * 1000)
            : null;

          // Fetch pages + IG accounts
          let pageInfo = {};
          try {
            const pages = await fetchPagesAndIgAccounts(longLived.access_token);
            if (pages.length > 0) pageInfo = pages[0]; // use first page by default
          } catch (e) {
            console.warn('[auth] Could not fetch pages:', e.message);
          }

          await saveTokens(user.id, {
            user_access_token: longLived.access_token,
            token_expires_at: expiresAt,
            scopes: profile._json?.scope?.split(',') || [],
            ...pageInfo,
          });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

// Passport serialize/deserialize (only needed for session-based flow;
// we use JWT so these are minimal)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, rows[0] || null);
  } catch (err) {
    done(err);
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function signJwt(user) {
  return jwt.sign({ email: user.email, plan: user.plan }, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

// ─── Validation schemas ──────────────────────────────────────────────────────
// These only guard shape/type/presence; password strength and business rules
// (email uniqueness, current-password checks, ...) stay as regular code below.

const registerSchema = z.object({
  email: z.string().trim().min(1, 'email is required').email('must be a valid email'),
  password: z.string().min(1, 'password is required'),
  name: z.string().trim().max(200).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().min(1, 'email is required').email('must be a valid email'),
  password: z.string().min(1, 'password is required'),
});

const updateMeSchema = z.object({
  name: z.string().trim().max(200).optional(),
  email: z.string().trim().min(1, 'email is required').email('must be a valid email'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

/**
 * Shapes a `users` row (optionally left-joined with `meta_tokens`) into the
 * user object sent to the frontend. Centralised so the field names
 * (notably `name`, not the DB's `full_name`) stay consistent across every
 * route that returns a user.
 */
function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    plan: row.plan,
    avatarUrl: row.avatar_url,
    ...(row.posts_this_month !== undefined && { postsThisMonth: row.posts_this_month }),
    ...(('ig_username' in row || 'page_name' in row) && {
      instagramConnected: Boolean(row.ig_username),
      instagramUsername: row.ig_username || null,
      facebookConnected: Boolean(row.page_name),
      facebookPageName: row.page_name || null,
    }),
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /auth/meta
 * Redirect the logged-in user to the Facebook OAuth consent page.
 */
router.get('/meta', requireAuth, (req, res, next) => {
  if (!metaConfigured) {
    return res.status(503).json({ error: 'Meta OAuth is not configured on this server.' });
  }
  passport.authenticate('facebook', {
    session: false,
    scope: META_OAUTH_SCOPE,
  })(req, res, next);
});

/**
 * GET /auth/meta/url
 * Same as /meta, but returns the consent URL as JSON instead of redirecting,
 * so the frontend can navigate there itself (client.get(...).then(({url}) => ...)).
 */
router.get('/meta/url', requireAuth, (req, res, next) => {
  if (!metaConfigured) {
    return res.status(503).json({ error: 'Meta OAuth is not configured on this server.' });
  }
  // passport.authenticate() issues a 302 redirect on its own; intercept that
  // single redirect and return its target as JSON instead of following it.
  res.redirect = (url) => res.json({ url });
  passport.authenticate('facebook', {
    session: false,
    scope: META_OAUTH_SCOPE,
  })(req, res, next);
});

/**
 * GET /auth/meta/callback
 * Handle OAuth callback from Meta. The user must already be logged in
 * (their JWT cookie is sent along on this top-level redirect since it's
 * SameSite=Lax) — that's whose account the Meta tokens get attached to.
 * Re-signs the JWT and redirects the SPA to /auth/callback.
 */
router.get(
  '/meta/callback',
  optionalAuth,
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=meta_auth_failed`,
  }),
  (req, res) => {
    const token = signJwt(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Set token in HTTP-only cookie — never expose in URL
    res.cookie('postcraft_token', token, COOKIE_OPTIONS);
    res.redirect(`${frontendUrl}/auth/callback`);
  }
);

router.get('/meta/error', (_req, res) => {
  res.status(401).json({ error: 'Meta OAuth authentication failed' });
});

/**
 * GET /auth/me
 * Returns the authenticated user from the cookie-based session, including
 * their live Meta connection status and current usage — used by the
 * frontend /auth/callback page after OAuth redirect, and by Settings to
 * refresh this data instead of relying on whatever was cached at login.
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.email, u.full_name, u.plan, u.avatar_url, u.posts_this_month,
              mt.ig_username, mt.page_name
       FROM users u
       LEFT JOIN meta_tokens mt ON mt.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ user: toPublicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /auth/me
 * Body: { name?, email, currentPassword?, newPassword? }
 * Updates the authenticated user's profile, and optionally their password
 * (currentPassword is required to change it, unless the account has no
 * password yet — e.g. it was only ever used for the Meta-connect flow).
 */
router.put('/me', requireAuth, validate(updateMeSchema), async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = rows[0];
    if (!user) {
      throw createError(404, 'User not found');
    }

    const emailLower = email.toLowerCase().trim();
    if (emailLower !== user.email) {
      const existing = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [
        emailLower,
        user.id,
      ]);
      if (existing.rows.length > 0) {
        throw createError(409, 'A user with this email already exists');
      }
    }

    let passwordHash = user.password_hash;
    if (newPassword) {
      if (user.password_hash) {
        if (!currentPassword) {
          throw createError(400, 'currentPassword is required to set a new password');
        }
        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) {
          throw createError(401, 'Current password is incorrect');
        }
      }

      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        throw createError(400, passwordError);
      }

      passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const { rows: updated } = await query(
      `UPDATE users
       SET full_name = $1, email = $2, password_hash = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name?.trim() || null, emailLower, passwordHash, user.id]
    );

    res.json({ user: toPublicUser(updated[0]) });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/logout
 * Clears the auth cookie.
 */
router.post('/logout', (_req, res) => {
  res.clearCookie('postcraft_token', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ ok: true });
});

/**
 * POST /auth/register
 * Body: { email, password, name? }
 */
router.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const passwordError = validatePassword(password);
    if (passwordError) {
      throw createError(400, passwordError);
    }

    const emailLower = email.toLowerCase().trim();

    // Check for existing user
    const existing = await query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existing.rows.length > 0) {
      throw createError(409, 'A user with this email already exists');
    }

    const hash = await bcrypt.hash(password, 12);

    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3) RETURNING *`,
      [emailLower, hash, name || null]
    );

    const user = rows[0];
    const token = signJwt(user);

    res.cookie('postcraft_token', token, COOKIE_OPTIONS);
    res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [
      email.toLowerCase().trim(),
    ]);

    const user = rows[0];

    if (!user || !user.password_hash) {
      throw createError(401, 'Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw createError(401, 'Invalid credentials');
    }

    const token = signJwt(user);

    res.cookie('postcraft_token', token, COOKIE_OPTIONS);
    res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
