Status: ready-for-agent

# 03 — Posts API: unacknowledged-failures count + acknowledge-on-view

Spec: `.scratch/post-failure-badge/spec.md`

## Description

Two changes to `backend/src/routes/posts.js`:

**A. New read endpoint.** Add a route (e.g. `GET /posts/failed/unacknowledged-count`, exact path left to the implementer as long as it reads clearly as part of the posts resource) that returns `{ count }` — the number of the authenticated user's posts where `status = 'failed' AND failure_acknowledged_at IS NULL`. Register it on the same router as the rest of `posts.js` so the existing `postsLimiter` rate limiter and `requireAuth` conventions apply the same way they do to every other route in this file.

**B. Acknowledge as a side effect of viewing the failed list.** In the existing `GET /posts` handler, when the request's `status` query param is `failed`, after fetching the page of posts to return, also run an `UPDATE posts SET failure_acknowledged_at = NOW() WHERE user_id = $1 AND status = 'failed' AND failure_acknowledged_at IS NULL` (i.e. the *entire* matching set for that user, not just the page being returned — see spec user story 11). Do this for every request where the `failed` filter is used, regardless of `page`/`limit`. Do **not** do this for any other `status` value or when no `status` filter is given.

Order of operations matters: run the acknowledge `UPDATE` after successfully fetching the page + count for the response (so a DB error while listing doesn't silently acknowledge failures the user never actually got to see), but still within the same request/response cycle — no separate endpoint, no client-triggered "mark as read" call.

## Acceptance Criteria

- `GET /posts/.../unacknowledged-count` (or equivalent): requires auth (401 without a valid session), returns `{ count: 0 }` when there are none, returns the correct count otherwise, and only ever counts the requesting user's own posts.
- `GET /posts?status=failed`: continues to return the paginated list exactly as before, and additionally acknowledges the user's full failed-and-unacknowledged set as a side effect.
- `GET /posts` with any other `status` (or none): behaves exactly as before this ticket — no acknowledgment side effect at all.
- The new endpoint's query schema validation follows the existing `zod` + `validate()` middleware pattern already used elsewhere in this file (see `listQuerySchema` / `postIdParamSchema`) rather than manual `if` checks.

## Testing

Follow the exact pattern already established in `backend/src/__tests__/routes/posts.test.js` (supertest against the Express router, `query` mocked) — add cases to that file rather than a new one:

- New count endpoint: returns the count from the mocked query result; returns 0; rejects without auth; (can't meaningfully test cross-user isolation with a mocked DB beyond asserting the query is parameterized by `req.user.id` — assert the mocked `query` call includes the authenticated user's id).
- `GET /posts?status=failed`: assert a second `query` call is made for the acknowledge update, scoped to `status = 'failed'` and the user's id, with no page/limit constraint in it.
- `GET /posts?status=published` (or no status): assert no acknowledge-shaped `query` call happens — only the existing list + count calls.

## Depends on

01 (column must exist). Independent of 02, but logically follows it.
