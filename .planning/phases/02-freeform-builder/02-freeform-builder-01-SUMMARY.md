---
phase: 02-freeform-builder
plan: 01
subsystem: editor
tags: [freeform, persistence, zustand, nextjs, autosave]
requires:
  - phase: 01-mvp-hardening-consistency
    provides: Stable persisted sceneGraph reopen baseline
provides:
  - Empty-canvas entry creates freeform designs directly from the dashboard.
  - Template-started designs can convert to freeform by persisting `templateId: null`.
  - Autosave/manual save now carry the freeform contract through PATCH.
affects: [dashboard, editor, persistence]
tech-stack:
  added: []
  patterns: [empty-canvas entry, persisted freeform contract, template-to-freeform promotion]
key-files:
  created: []
  modified:
    - packages/core/src/schemas/design.ts
    - packages/web/src/stores/editor-store.ts
    - packages/web/src/hooks/use-auto-save.ts
    - packages/web/src/app/editor/new/page.tsx
    - packages/web/src/app/editor/new/NewEditorClient.tsx
    - packages/web/src/app/dashboard/page.tsx
    - packages/web/src/components/editor/Header.tsx
    - packages/web/src/app/api/designs/[id]/route.ts
    - packages/web/src/__tests__/stores/editor-store.test.ts
    - packages/web/src/__tests__/app/editor-pages.test.tsx
    - packages/web/src/__tests__/api/designs-route.test.ts
    - packages/web/src/__tests__/hooks/use-auto-save.test.ts
key-decisions:
  - "Freeform is persisted as `templateId: null` instead of as a separate server-side mode field."
  - "The empty-canvas path creates the design immediately so freeform work has a durable design ID before editing continues."
patterns-established:
  - "Use `/editor/new?mode=freeform` as the canonical empty-canvas entry."
  - "Promote preset designs to freeform by clearing template provenance without resetting the current scene."
requirements-completed: [FREE-01, FREE-04]
duration: 24m
completed: 2026-03-30
---

# Phase 02 Plan 01 Summary

**Freeform entry is now a real persisted design contract instead of a client-only mode toggle**

## Performance

- **Duration:** 24 min
- **Started:** 2026-03-30T08:45:00+00:00
- **Completed:** 2026-03-30T09:09:00+00:00
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Added a first-class dashboard CTA for `空白画布` and wired `/editor/new?mode=freeform` to create empty-scene designs.
- Introduced `switchToFreeform()` in the editor store so preset-started scenes can retain their current graph while clearing template provenance.
- Extended save and PATCH flows so `templateId: null` survives manual save, autosave, and reopen.

## Task Commits

None. This plan was executed inline in the current worktree without per-task commits.

## Files Created/Modified

- `packages/core/src/schemas/design.ts` - Allowed `templateId` updates on PATCH.
- `packages/web/src/stores/editor-store.ts` - Added explicit freeform conversion behavior.
- `packages/web/src/hooks/use-auto-save.ts` - Included `templateId` in save payloads.
- `packages/web/src/app/editor/new/page.tsx` - Normalized `mode` and `template` entry params.
- `packages/web/src/app/editor/new/NewEditorClient.tsx` - Bootstrapped empty-canvas creation and freeform create-once flow.
- `packages/web/src/app/dashboard/page.tsx` - Added the `空白画布` dashboard entry.
- `packages/web/src/components/editor/Header.tsx` - Added the `转为自由搭建` action for preset-started designs.
- `packages/web/src/app/api/designs/[id]/route.ts` - Persisted `templateId` updates, including `null`.

## Decisions Made

- Freeform persistence stays compatible with the current schema by using `templateId: null`.
- Empty-canvas creation happens before any component is added so freeform edits always have a stable design record.

## Deviations from Plan

None. The plan executed as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Freeform mode now has a durable contract that later manipulation and preview work can build on safely.
- Dashboard and editor entry points are aligned around both preset and empty-canvas starts.

---
*Phase: 02-freeform-builder*
*Completed: 2026-03-30*
