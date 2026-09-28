Status: ready-for-agent

# 01 — Add `failure_acknowledged_at` column to `posts`

Spec: `.scratch/post-failure-badge/spec.md`

## Description

Add a nullable `failure_acknowledged_at TIMESTAMPTZ` column to the `posts` table (`backend/migrations/`, next numbered migration after `002_plan_limits_display.sql`). `NULL` means "this post is failed and the user hasn't seen it reflected in their failed-posts view yet" (or simply "not applicable, post isn't failed"). A non-null value is the timestamp the user's view of their failed posts acknowledged it.

No backfill logic is needed beyond the column default — existing rows (whatever their current status) get `NULL`, which is the correct starting state.

## Acceptance Criteria

- New migration file adds the column with a `NULL` default, following the existing migration style in this repo (see `001_init.sql` / `002_plan_limits_display.sql` for conventions — plain SQL, idempotent `ADD COLUMN IF NOT EXISTS` where the existing migrations use that pattern).
- Running `npm run migrate` (backend) applies cleanly against a fresh database and against a database that already has `001`/`002` applied.
- No application code changes in this ticket — this is schema-only. Tickets 02 and 03 depend on this column existing.

## Testing

- No new automated test is expected for a schema-only migration (this repo has no migration test harness). Verify manually by running the migration locally against the dev Postgres container.

## Depends on

Nothing — this is the first ticket.
