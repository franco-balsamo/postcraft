Status: ready-for-agent

# 04 — Frontend: failure count badge in navigation

Spec: `.scratch/post-failure-badge/spec.md`

## Description

`frontend/src/components/Layout/Sidebar.jsx` already renders one `navItems` array through two loops — the desktop `<aside>` and the mobile bottom `<nav>` — so covering both contexts (spec user story 17) is a matter of touching this one component, not two.

1. Add `getUnacknowledgedFailuresCount()` to `frontend/src/api/posts.js` (same `client.get(...)` shape as the other functions in that file), pointed at whichever path ticket 03 lands on.
2. In `Sidebar.jsx`, fetch it with `useQuery` (same pattern already used there for `getPlans`), and render a small badge next to the "Posts" `navItem` — in both the desktop and mobile render loops — only when `count > 0`. Nothing renders at `count === 0`.
3. In `frontend/src/pages/Posts.jsx`, after the posts query for `status: 'failed'` succeeds, invalidate the badge's query (`queryClient.invalidateQueries(...)` with the same query key used in step 1) so the badge disappears without a full page reload, per spec user story 13. The backend already did the actual acknowledging as a side effect of that request (ticket 03) — this step is purely "tell the badge to refetch."

## Acceptance Criteria

- Badge shows the correct count from the API in both the desktop sidebar and the mobile bottom nav.
- Badge is absent (not just empty/zero) when the count is 0.
- Visiting `/posts` with the "failed" filter selected causes the badge to update to reflect the new (typically zero) count without the user reloading the page.
- No new global state/store needed — plain `useQuery`, consistent with how `plans` and other server state is already handled in this codebase (no Zustand store for this).

## Testing

- A focused test for the badge's render logic: given a count of 0 it renders nothing extra next to the Posts nav item; given a count > 0 it renders that number. Follow this codebase's existing component-test conventions (`@testing-library/react`, see `Login.test.jsx` / `Register.test.jsx` for setup/mocking style — mock the query response rather than hitting a real API).
- No test is expected for the cross-component invalidation timing itself (react-query cache behavior) — that's covered functionally by ticket 03's backend test already asserting the acknowledge side effect happens; this ticket's frontend test only needs to cover the badge's own render behavior.

## Depends on

03 (the endpoint and its response shape must exist).

## Note for whoever picks this up

While reading `frontend/src/api/posts.js` to place the new function, I noticed `publishPost`, `schedulePost`, and `getDashboardStats` in that file call `/api/posts/publish`, `/api/posts/schedule`, and `/api/posts/stats` — none of which exist on the backend's `posts.js` router (publishing/scheduling actually happens through `/api/publish`, and there's no stats endpoint at all). That's a pre-existing, unrelated bug — don't fix it as part of this ticket, just don't copy that pattern for the new function; base it on `getPosts`, which *is* wired correctly.
