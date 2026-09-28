Status: ready-for-agent

# 02 — Reset acknowledgment when a post's final publish attempt fails

Spec: `.scratch/post-failure-badge/spec.md`

## Description

Whenever a post's status is set to `failed`, `failure_acknowledged_at` must be reset to `NULL` in that same update, so "is failed" and "is unacknowledged" never drift apart (spec user story 9).

There are two places a post lands in `failed` status:

1. **Scheduled posts, after exhausting retries** — `backend/src/jobs/publishQueue.js`, in the `failed` queue-event handler, the same `updatePostStatus(postId, { status: 'failed', ... })` call that was extended in prior work to also call `releasePostSlot(user_id)` (the plan-slot refund). Add the acknowledgment reset to this same status update.
2. **Immediate (non-scheduled) publish, when all networks fail synchronously** — `backend/src/routes/publish.js`, the `updatePostStatus(post.id, { status: allFailed ? 'failed' : 'published', ... })` call. Since this is a *new* row (just inserted in the same request), and the column added in ticket 01 defaults to `NULL`, this path needs no code change — confirm this with a test rather than assuming it.

## Acceptance Criteria

- `updatePostStatus` (`backend/src/services/publishService.js`) is the single place that resets `failure_acknowledged_at` — don't duplicate this at the `publishQueue.js`/`publish.js` call sites. It already uses a `CASE WHEN $1 = '...' THEN ... ELSE <column> END` pattern for `published_at`; follow the same pattern: `failure_acknowledged_at = CASE WHEN $1 = 'failed' THEN NULL ELSE failure_acknowledged_at END`.
- Statuses other than `failed` passed to `updatePostStatus` must not touch `failure_acknowledged_at` at all (don't accidentally acknowledge or un-acknowledge a post that's transitioning to `published`, `queued`, etc.) — the `CASE` above already guarantees this, just don't regress it.

## Testing

- There's no existing test file for `publishService.js` (it's one of this codebase's known untested modules) — this codebase's convention leans on route/worker-level tests rather than isolated service unit tests (see `publish.test.js`, `posts.test.js`, `plans.test.js`), so cover this behavior there rather than adding a new isolated unit-test file:
  - Extend the existing plan-slot-refund test coverage on the publish queue's final-failure handler (added in prior work) to also assert the mocked `query` call for the final status update includes the `failure_acknowledged_at` reset (e.g. assert on the SQL text/params passed, the same way the existing tests assert on `releasePostSlot` being called).
  - Extend `backend/src/__tests__/routes/publish.test.js`'s "libera el slot si la publicación falla en todas las redes" case (or add a sibling case) to assert the same for the immediate-publish path.

## Depends on

01 (the column must exist).
