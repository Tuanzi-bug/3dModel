---
phase: 02-freeform-builder
plan: 03
subsystem: dashboard
tags: [preview, svg, dashboard, templates, api]
requires:
  - phase: 02-freeform-builder
    provides: Freeform create/save contract from plan 01
provides:
  - Deterministic scene-derived SVG preview generation for templates and saved designs.
  - Automatic thumbnail persistence on design create/update.
  - Dashboard cards that render real preview images for presets and saved designs.
affects: [dashboard, api, core, templates]
tech-stack:
  added: [pure svg preview generator]
  patterns: [scene-derived thumbnail metadata, api-side thumbnail persistence, tmp-copy build verification]
key-files:
  created:
    - packages/core/src/utils/scene-preview.ts
    - packages/core/__tests__/scene-preview.test.ts
  modified:
    - packages/core/src/index.ts
    - packages/core/src/templates/single-shelf.ts
    - packages/core/src/templates/multi-shelf.ts
    - packages/core/src/templates/standalone.ts
    - packages/web/src/app/api/designs/route.ts
    - packages/web/src/app/api/designs/[id]/route.ts
    - packages/web/src/__tests__/api/designs-route.test.ts
    - packages/web/src/app/dashboard/page.tsx
key-decisions:
  - "Preview imagery is generated from scene data as SVG data URLs rather than from viewport screenshots."
  - "Production build verification runs from a `/tmp` Docker copy to avoid corrupting the bind-mounted `.next` used by the dev container."
patterns-established:
  - "Generate template thumbnails once from default generated scenes at module load time."
  - "Regenerate saved-design thumbnails on POST/PATCH whenever canonical scene data changes."
requirements-completed: [PREV-01]
duration: 26m
completed: 2026-03-30
---

# Phase 02 Plan 03 Summary

**Dashboard previews now come from canonical scene data instead of empty placeholders**

## Performance

- **Duration:** 26 min
- **Started:** 2026-03-30T09:31:00+00:00
- **Completed:** 2026-03-30T09:57:00+00:00
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Added a pure core utility that projects `sceneGraph` data into deterministic SVG preview data URLs.
- Replaced empty template thumbnails with generated previews from shipped default scenes.
- Updated design create/update routes to persist thumbnails automatically and updated dashboard cards to render preview images with accessible alt text.

## Task Commits

None. This plan was executed inline in the current worktree without per-task commits.

## Files Created/Modified

- `packages/core/src/utils/scene-preview.ts` - Added scene-derived SVG preview generation.
- `packages/core/src/templates/single-shelf.ts` - Generated preset thumbnail from default scene data.
- `packages/core/src/templates/multi-shelf.ts` - Generated preset thumbnail from default scene data.
- `packages/core/src/templates/standalone.ts` - Generated preset thumbnail from default scene data.
- `packages/web/src/app/api/designs/route.ts` - Persisted generated thumbnails on create and exposed thumbnails in the dashboard list endpoint.
- `packages/web/src/app/api/designs/[id]/route.ts` - Regenerated thumbnails on sceneGraph PATCH when callers did not provide an explicit image.
- `packages/web/src/app/dashboard/page.tsx` - Rendered preview `<img>` elements for templates and saved designs.

## Decisions Made

- Preview generation stays platform-agnostic by producing SVG directly inside `packages/core`.
- Build verification was intentionally isolated inside the Docker container’s `/tmp` filesystem to avoid destabilizing the long-lived dev service.

## Deviations from Plan

### Auto-fixed Issues

**1. [Preventive] Isolated production build output away from bind mounts**
- **Found during:** Verification planning
- **Issue:** Earlier production builds against the bind-mounted workspace had already broken the long-lived `web` dev container.
- **Fix:** Copied the repo into `/tmp/phase2-buildcheck` inside Docker, symlinked existing container `node_modules`, and ran `next build` there.
- **Files modified:** None in repo; verification procedure only.
- **Verification:** `docker compose exec -T web sh -lc '... cd /tmp/phase2-buildcheck && NODE_ENV=production pnpm --filter @3d-modeler/web build'`

---

**Total deviations:** 1 preventive auto-fix
**Impact on plan:** The deviation preserved the required production-build verification without destabilizing the active dev environment.

## Issues Encountered

- The web image still emits Prisma OpenSSL detection warnings during production build, but the build completes successfully.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Dashboard preview rendering is now ready for browser-level regression coverage.
- Freeform save/reopen tests can assert preview continuity using persisted design thumbnails.

---
*Phase: 02-freeform-builder*
*Completed: 2026-03-30*
