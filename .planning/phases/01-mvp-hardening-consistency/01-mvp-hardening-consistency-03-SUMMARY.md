---
phase: 01-mvp-hardening-consistency
plan: 03
subsystem: testing
tags: [vitest, playwright, api, regression, continuity]
requires:
  - phase: 01-mvp-hardening-consistency
    provides: Persisted editor continuity and approved preset-entry UI behavior from plans 01 and 02
provides:
  - Direct design route regression coverage for create/get/patch sceneGraph continuity.
  - Browser continuity coverage for preset entry, save, and reopen flows.
  - Automated copy coverage for preset-entry wording in the dashboard and save flow.
affects: [freeform-builder, testing, verification]
tech-stack:
  added: []
  patterns: [route-handler invocation tests, stub-driven continuity e2e]
key-files:
  created:
    - packages/web/src/__tests__/api/designs-route.test.ts
    - packages/web/tests/e2e/editor/save-reopen-continuity.spec.ts
  modified:
    - packages/web/tests/e2e/dashboard/dashboard.spec.ts
key-decisions:
  - "Route continuity is covered by direct handler tests with mocked auth and Prisma instead of database-backed integration tests."
  - "Playwright continuity stays stub-driven and validates route payloads plus visible editor copy instead of deep 3D drag automation."
patterns-established:
  - "Use mocked route handlers to assert parsed sceneGraph continuity for POST/GET/PATCH."
  - "Use captured request payloads plus visible footer/header state to prove save-and-reopen continuity in browser tests."
requirements-completed: [RELI-01, RELI-02, RELI-03]
duration: 15m
completed: 2026-03-29
---

# Phase 01 Plan 03 Summary

**Direct route tests and a preset-entry save/reopen Playwright path now lock the Phase 1 continuity baseline in place**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-29T15:55:00+00:00
- **Completed:** 2026-03-29T16:10:45+00:00
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added direct route-handler coverage for design create/get/patch continuity and ownership failure handling.
- Added a Playwright continuity scenario that proves preset entry -> edit -> save -> reopen without `waitForTimeout(...)`.
- Updated dashboard browser coverage so preset-entry click behavior matches the current auto-create flow.

## Task Commits

None. This plan was executed inline in the current worktree without per-task commits.

## Files Created/Modified

- `packages/web/src/__tests__/api/designs-route.test.ts` - Directly invokes design route handlers with mocked Prisma/auth and asserts parsed `sceneGraph` round-trips.
- `packages/web/tests/e2e/editor/save-reopen-continuity.spec.ts` - Covers preset entry, scene edit, manual save, dashboard reopen, and persisted continuity.
- `packages/web/tests/e2e/dashboard/dashboard.spec.ts` - Aligns preset-entry copy and POST-aware design-route stubs with current editor behavior.

## Decisions Made

- Browser continuity validation stayed shallow on 3D interactions and instead used component-panel/property-panel controls plus intercepted save payloads.

## Deviations from Plan

### Auto-fixed Issues

**1. [Blocking] Fixed stale dashboard POST stub**
- **Found during:** Playwright verification
- **Issue:** The existing dashboard spec stubbed `/api/designs` as a list endpoint for all methods, causing preset-entry clicks to redirect to `/editor/undefined`.
- **Fix:** Split the stub so `GET /api/designs` returns the list and `POST /api/designs` returns a created design payload.
- **Files modified:** `packages/web/tests/e2e/dashboard/dashboard.spec.ts`
- **Verification:** `docker compose run --rm e2e sh -lc 'pnpm --filter @3d-modeler/web exec playwright test tests/e2e/dashboard/dashboard.spec.ts tests/e2e/editor/save-reopen-continuity.spec.ts --project=chromium'`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The deviation aligned legacy test scaffolding with the current preset-entry create flow and removed a false failure.

## Issues Encountered

- The dev `web` container had to be force-recreated before Playwright because the earlier production build had invalidated the bind-mounted `.next` artifacts used by `next dev`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 1 now exits with both fast route-level tests and browser-level continuity evidence.
- Phase 2 can extend the editor surface with a stable regression baseline for save/reopen and preset-entry wording.

---
*Phase: 01-mvp-hardening-consistency*
*Completed: 2026-03-29*
