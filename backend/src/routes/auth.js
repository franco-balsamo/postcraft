import { Router } from 'express';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { query } from '../config/db.js';
import { saveTokens, exchangeForLongLivedToken, fetchPagesAndIgAccounts } from '../services/tokenService.js';
import { createError } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import 'dotenv/config';

export const router = Router();

// ─── Rate limiters ───────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again in 15 minutes.' },
});

// ─── Passport / Meta OAuth setup ─────────────────────────────────────────────

const metaConfigured = process.env.META_APP_ID && process.env.META_APP_SECRET;

if (!metaConfigured) {
  console.warn('[auth] META_APP_ID / META_APP_SECRET not set — Facebook OAuth disabled.');
}

if (metaConfigured) passport.use(
  new FacebookStrategy(
    {
      clientID:     process.env.META_APP_ID,
      clientSecret: process.env.META_APP_SECRET,
      callbackURL:  process.env.META_CALLBACK_URL,
      profileFields: ['id', 'emails', 'displayName', 'photos'],
      enableProof:  true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value ||
          `fb_${profile.id}@postcraft.noemail`;

        // Find or create user
        let { rows } = await query(
          'SELECT * FROM users WHERE email = $1 LIMIT 1',
          [email]
        );

        let user = rows[0];

        if (!user) {
          const inserted = await query(
            `INSERT INTO users (email, full_name, avatar_url)
             VALUES ($1, $2, $3) RETURNING *`,
            [
              email,
              profile.displayName || '',
              profile.photos?.[0]?.value || null,
            ]
          );
          user = inserted.rows[0];
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
          token_expires_at:  expiresAt,
          scopes:            profile._json?.scope?.split(',') || [],
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
  return jwt.sign(
    { email: user.email, plan: user.plan },
    process.env.JWT_SECRET,
    { subject: user.id, expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path:     '/',
};

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /auth/meta
 * Redirect user to Facebook OAuth consent page.
 */
router.get('/meta', (req, res, next) => {
  if (!metaConfigured) {
    return res.status(503).json({ error: 'Meta OAuth is not configured on this server.' });
  }
  passport.authenticate('facebook', {
    session: false,
    scope: [
      'email',
      'public_profile',
      'pages_manage_posts',
      'pages_read_engagement',
      'instagram_basic',
      'instagram_content_publish',
    ],
  })(req, res, next);
});

/**
 * GET /auth/meta/callback
 * Handle OAuth callback from Meta.
 * Sets the JWT as an HTTP-only cookie and redirects the SPA to /auth/callback.
 * The token is never placed in the URL to avoid leaking into logs.
 */
router.get(
  '/meta/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?error=meta_auth_failed`,
  }),
  (req, res) => {
    const token       = signJwt(req.user);
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
 * Returns the authenticated user from the cookie-based session.
 * Used by the frontend /auth/callback page after OAuth redirect.
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, email, full_name, plan, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
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
 * Body: { email, password, full_name? }
 */
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      throw createError(400, 'email and password are required');
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      throw createError(400, passwordError);
    }

    const emailLower = email.toLowerCase().trim();

    // Check for existing user
    const existing = await query(
      'SELECT id FROM users WHERE email = $1',
      [emailLower]
    );
    if (existing.rows.length > 0) {
      throw createError(409, 'A user with this email already exists');
    }

    const hash = await bcrypt.hash(password, 12);

    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3) RETURNING *`,
      [emailLower, hash, full_name?.trim() || null]
    );

    const user  = rows[0];
    const token = signJwt(user);

    res.cookie('postcraft_token', token, COOKIE_OPTIONS);
    res.status(201).json({
      token,
      user: {
        id:        user.id,
        email:     user.email,
        full_name: user.full_name,
        plan:      user.plan,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError(400, 'email and password are required');
    }

    const { rows } = await query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );

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
      user: {
        id:        user.id,
        email:     user.email,
        full_name: user.full_name,
        plan:      user.plan,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
