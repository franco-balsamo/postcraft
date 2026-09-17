-- PostCraft – plan display fields
-- `plan_limits` becomes the single source of truth for plan definitions:
-- numeric limits (already here) plus the display/feature fields the API
-- needs, so app code stops hardcoding a second and third copy of this data.

ALTER TABLE plan_limits
  ADD COLUMN IF NOT EXISTS label            TEXT,
  ADD COLUMN IF NOT EXISTS currency         TEXT NOT NULL DEFAULT 'usd',
  ADD COLUMN IF NOT EXISTS billing_interval TEXT, -- NULL = no recurring interval (free plan)
  ADD COLUMN IF NOT EXISTS networks         TEXT[] NOT NULL DEFAULT '{instagram,facebook}',
  ADD COLUMN IF NOT EXISTS scheduling       BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE plan_limits SET label = 'Free',    billing_interval = NULL,    scheduling = FALSE WHERE plan = 'free';
UPDATE plan_limits SET label = 'Starter', billing_interval = 'month', scheduling = TRUE  WHERE plan = 'starter';
UPDATE plan_limits SET label = 'Pro',     billing_interval = 'month', scheduling = TRUE  WHERE plan = 'pro';
UPDATE plan_limits SET label = 'Agency',  billing_interval = 'month', scheduling = TRUE  WHERE plan = 'agency';
