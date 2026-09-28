Status: ready-for-agent

# Post failure badge

## Problem Statement

When a post ultimately fails to publish — most notably a *scheduled* post that exhausts all of its background retry attempts — the only place this is reflected today is a status badge on that individual post's card in the Posts history list. Nothing tells the user proactively that something went wrong. Because scheduling a post is explicitly a "set it and forget it" action, a user can go days without realizing a post never actually made it to Instagram or Facebook, believing instead that it published successfully.

## Solution

Add a persistent, app-wide indicator (a small badge/counter in the app's navigation chrome) that shows the user how many of their posts have failed since they last looked at their failed posts. The count is visible from anywhere in the authenticated app, not just the Posts page. It clears itself automatically the next time the user views their failed posts in the post history — there is no separate "mark as read" or "dismiss" action.

## User Stories

1. As a user with a scheduled post that fails after all retries, I want to see a visible indicator somewhere in the app the next time I'm active, so that I know something needs my attention without having to remember to manually check.
2. As a user with several posts that failed at different times, I want the indicator to reflect the total count of unseen failures, so I understand the scope of the problem at a glance before digging in.
3. As a user, I want the failure indicator to disappear automatically once I've viewed my failed posts in the post history, so that I don't have to perform a separate dismiss action.
4. As a user whose immediate (non-scheduled) publish attempt fails outright, I want that failure to also count toward the same indicator, so the feature behaves consistently regardless of whether the post was scheduled or published right away.
5. As a user, I want to navigate to the post history and filter to failed posts to see exactly which ones failed and why, so I can decide whether to retry, edit, or discard them.
6. As a user on any page (Dashboard, Editor, Settings, not just Posts), I want to see the failure count in the persistent navigation, so I don't have to be on a specific page to notice it.
7. As a user with zero failed posts, I want no indicator to show at all, so the navigation stays visually clean.
8. As a user who deletes a failed post (via the existing delete-post feature) before ever viewing the failed list, I want the count to correctly reflect that the post is gone, so the badge doesn't overcount posts that no longer exist.
9. As the developer maintaining the background publish worker, I want "mark this post as failed" and "reset it to unacknowledged" to happen as part of the same update, so there's no window where a post is failed but not counted, or counted but not actually failed.
10. As a user who views the post history filtered to a status other than "failed" (e.g. "published" or "queued"), I want my unseen failures to remain unacknowledged, so that browsing other filters doesn't silently clear the badge without me ever having seen the failures.
11. As a user who paginates through a long list of failed posts, I want all of my currently-failed posts to be acknowledged once I've requested that filtered view — not just the ones on the page I happened to load — so the badge doesn't stay stuck above zero after I've already looked at "my failed posts."
12. As a user who logs in from a different device or a new browser tab, I want the badge count to reflect the true server-side state, so it's consistent no matter where or how I access the app.
13. As a user, I want the badge to update to zero (or decrease) shortly after I've viewed the failed list, without needing to hard-refresh the whole page.
14. As a user relying on the plan-limit refund behavior already in place for failed posts, I want this feature to add visibility only, and not change how or when a failed post's plan slot gets refunded.
15. As an unauthenticated visitor, I want any endpoint related to this feature to require login, consistent with every other endpoint on the posts resource, so failure data is never exposed without authentication.
16. As a user, I want the failure count to only ever reflect my own posts, so I can never see another account's failures.
17. As a user on a mobile viewport (where navigation collapses to a bottom bar), I want the failure badge to remain visible there too, consistent with how the rest of the persistent navigation already adapts to mobile.
18. As a QA engineer, I want the new behavior covered by the same style of automated tests already used for the rest of the posts resource, so regressions are caught without manual verification.

## Implementation Decisions

- **Schema**: add a nullable `failure_acknowledged_at` timestamp column to the `posts` table. It is `NULL` whenever a post is in a failed state that the user hasn't yet seen reflected in their failed-posts view, and set to the acknowledgment time otherwise. New rows default to `NULL`.
- **Becoming failed always resets acknowledgment**: wherever a post's status is set to `failed` after exhausting its final retry (the background publish worker's final-failure handling, which already refunds the post's plan slot in the same code path from prior work), the same update also resets `failure_acknowledged_at` to `NULL`. This keeps "is failed" and "is unacknowledged" from ever drifting apart.
- **Immediate-publish failures count too**: a post that fails synchronously on its first (non-scheduled) publish attempt lands in the same `failed` status with `failure_acknowledged_at` left `NULL` by the column's default — no special-casing needed, it's covered by the same query used for scheduled failures.
- **One new read endpoint**: exposes the count of the authenticated user's posts where status is `failed` and `failure_acknowledged_at` is `NULL`. It requires the same authentication as the rest of the posts resource, is implicitly scoped to the requesting user, and sits behind the same rate limiting already applied to that resource (register it on the same router rather than a separate, unprotected group).
- **No new write endpoint**: acknowledgment is a side effect, not a user-facing action. The existing posts-list endpoint, when called with the `failed` status filter, additionally stamps `failure_acknowledged_at = now()` on *every* one of that user's currently-failed, currently-unacknowledged posts — the whole matching set, not merely the rows returned on the requested page. Requesting the list with any other status filter (or no filter) must not touch acknowledgment state at all.
- **Frontend chrome**: the persistent navigation shown across all authenticated routes fetches the unacknowledged-failure count (consistent with the app's existing data-fetching approach elsewhere) and renders a small badge only when the count is greater than zero; nothing renders at zero. The exact refetch/caching cadence is left to the implementer, but after the user requests the failed-filtered post list, the badge's count should be invalidated/refetched so it visibly clears without a full page reload.
- **No real-time push**: the count is fetched on demand, not streamed live the instant a background failure happens.

## Testing Decisions

- Tests should only assert on externally observable behavior: HTTP status codes and response bodies for the new endpoint and the modified list endpoint, and the shape/target of the calls made to the (mocked) database layer — never on internal SQL phrasing or private helper structure.
- Follow this codebase's existing convention for the posts resource: route-level tests driven through an HTTP test client against the Express router, with the database access layer mocked, mirroring the structure already used for this resource's other endpoints (and for the sibling routes in this codebase that follow the same pattern).
- Cover for the new count endpoint: returns the correct count; returns zero when there are no unacknowledged failures; requires authentication; never includes another user's posts in the count.
- Cover for the modified list endpoint: requesting the `failed` filter acknowledges the user's entire currently-failed set (not only the page returned); requesting any other filter leaves acknowledgment state untouched; the count endpoint reflects zero immediately after such an acknowledging request.
- Cover the failure path's schema change at the same seam already used for the existing plan-slot-refund test coverage on the background worker's final-failure handling — verify the same update that marks a post failed also clears its acknowledgment.
- Frontend: a small test for the badge component verifying it renders nothing at a zero count and renders the count otherwise, consistent with this codebase's existing component-test conventions.
- Out of scope for testing: re-verifying the background job's retry/backoff timing itself — that behavior is already exercised by existing coverage and isn't touched by this feature.

## Out of Scope

- Email, push notifications, SMS, or any other out-of-app delivery channel — this feature is in-app only.
- An explicit "mark as read" or "dismiss" control — acknowledgment is implicit and tied entirely to viewing the failed list.
- Any change to retry counts, backoff timing, or the underlying reasons a publish can fail.
- Any change to the plan-slot refund logic itself — this feature only adds visibility on top of it.
- A dedicated notifications center, feed, or historical log of past failures beyond what the existing post history already shows.
- Visually distinguishing, in the badge or elsewhere, between a post that failed immediately versus one that failed after scheduled retries.
- Real-time/live-streamed updates to the badge.

## Further Notes

- This builds directly on the atomic plan-slot reservation/refund work already implemented in the background publish worker's failure handling; the acknowledgment-reset addition belongs in that exact same code path, not a new one.
- Any display cap for very large counts (e.g. showing "9+") is a minor UI polish decision left to the implementer.
- This repo has no `CONTEXT.md`, `CONTEXT-MAP.md`, or `docs/adr/` yet, so there's no established domain glossary or prior architectural decision this spec needs to reconcile with beyond what's captured here.
