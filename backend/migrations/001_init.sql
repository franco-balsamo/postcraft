-- PostCraft – initial schema
-- Run via: npm run migrate

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT,                          -- NULL for OAuth-only accounts
  full_name     TEXT,
  avatar_url    TEXT,
  plan          TEXT        NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free','starter','pro','agency')),
  stripe_customer_id        TEXT,
  stripe_subscription_id    TEXT,
  posts_this_month          INTEGER NOT NULL DEFAULT 0,
  billing_cycle_start       TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', NOW()),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Meta OAuth Tokens ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meta_tokens (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Long-lived user access token (60 days)
  user_access_token   TEXT        NOT NULL,
  token_expires_at    TIMESTAMPTZ,
  -- Facebook Pages
  page_id             TEXT,
  page_name           TEXT,
  page_access_token   TEXT,
  -- Instagram Business / Creator
  ig_user_id          TEXT,
  ig_username         TEXT,
  -- Meta app scopes granted
  scopes              TEXT[],
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ─── Posts ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caption         TEXT,
  image_url       TEXT,                  -- Cloudinary URL
  cloudinary_id   TEXT,                  -- public_id for deletion
  networks        TEXT[]      NOT NULL DEFAULT '{}',
                                         -- ['instagram','facebook','fb_story','ig_story']
  status          TEXT        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft','queued','published','failed')),
  scheduled_at    TIMESTAMPTZ,           -- NULL = publish immediately
  published_at    TIMESTAMPTZ,
  bull_job_id     TEXT,                  -- Bull job reference for cancellation
  -- Platform-specific IDs returned after successful publish
  fb_post_id      TEXT,
  ig_media_id     TEXT,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Plan limits table (static reference) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS plan_limits (
  plan            TEXT    PRIMARY KEY,
  monthly_posts   INTEGER NOT NULL,
  max_accounts    INTEGER NOT NULL DEFAULT 1,
  analytics       BOOLEAN NOT NULL DEFAULT FALSE,
  price_monthly   NUMERIC(10,2) NOT NULL DEFAULT 0
);

INSERT INTO plan_limits (plan, monthly_posts, max_accounts, analytics, price_monthly) VALUES
  ('free',    5,    1, FALSE,  0.00),
  ('starter', 50,   2, FALSE, 19.00),
  ('pro',     200,  5, TRUE,  49.00),
  ('agency',  1000, 20, TRUE, 99.00)
ON CONFLICT (plan) DO NOTHING;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_user_id        ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status         ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at   ON posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_meta_tokens_user_id  ON meta_tokens(user_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['users','meta_tokens','posts'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I;
       CREATE TRIGGER set_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;
