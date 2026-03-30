# Phase 2: Freeform Builder - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning
**Source:** User request during `$gsd-plan-phase 2`

<domain>
## Phase Boundary

Phase 2 expands the editor from a preset-entry baseline into a true freeform builder. The phase must cover empty-canvas entry, direct component composition/editing, and safe switching from template-derived scenes into freeform editing. In addition, the dashboard must gain visual preview cards for both shipped preset templates and saved user designs so users can identify what they want to open before entering the editor.

</domain>

<decisions>
## Implementation Decisions

### Freeform entry
- Phase 2 must introduce a dashboard entry that starts from an empty scene without choosing a preset.
- Empty-scene creation must produce a design flow with `templateId: null` and editor `mode: freeform`.

### Freeform editing
- Users must be able to add supported components from the existing component library into a freeform scene.
- Users must be able to move, rotate, duplicate, and delete selected components in freeform mode.
- Users must be able to convert a preset-started design into freeform mode without losing the current `sceneGraph`.
- Core editing shortcuts must continue to work in their intended contexts after freeform controls are added.

### Dashboard previews
- Dashboard preset cards must display real preview imagery instead of empty placeholders.
- Dashboard saved-design cards must display a preview image that reflects the saved design rather than a generic empty state.
- Saved-design previews should use the existing `thumbnail` field in the design model unless research reveals a blocker.

### UX and workflow constraints
- User-facing UI remains Chinese.
- The dashboard and editor should stay aligned with `docs/design-system.md` and the Phase 1 UI contract where still applicable.
- Project runtime/build/test commands must continue to run inside Docker containers, not directly on the host.

### The agent's Discretion
- Exact freeform mode toggle location and control layout.
- Exact thumbnail asset format and storage cadence, as long as it fits the existing model and dashboard UX.
- Whether saved-design preview generation happens on manual save only or on autosave as well, provided the plan makes the behavior explicit.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and planning
- `.planning/ROADMAP.md` — Phase 2 goal, dependency, and success criteria
- `.planning/REQUIREMENTS.md` — Freeform and preview requirements mapped to Phase 2
- `.planning/STATE.md` — Current decisions and execution constraints from Phase 1
- `.planning/phases/01-mvp-hardening-consistency/01-mvp-hardening-consistency-01-SUMMARY.md` — Persistence baseline delivered in Phase 1
- `.planning/phases/01-mvp-hardening-consistency/01-mvp-hardening-consistency-02-SUMMARY.md` — UI contract alignment and `/editor/new` routing pattern
- `.planning/phases/01-mvp-hardening-consistency/01-mvp-hardening-consistency-03-SUMMARY.md` — Existing route/E2E regression patterns

### UI and dashboard
- `docs/design-system.md` — Existing dashboard/editor design baseline
- `.planning/phases/01-mvp-hardening-consistency/01-UI-SPEC.md` — Phase 1 preset-entry UI contract still governing dashboard/editor chrome
- `packages/web/src/app/dashboard/page.tsx` — Current dashboard cards, preset entry, and saved-design list

### Editor and scene state
- `packages/web/src/stores/editor-store.ts` — Editor mode, scene persistence, and tree editing actions
- `packages/web/src/app/editor/new/page.tsx` — New-design entry wrapper pattern
- `packages/web/src/app/editor/new/NewEditorClient.tsx` — Preset-entry create flow
- `packages/web/src/app/editor/[id]/page.tsx` — Saved-design hydration path
- `packages/web/src/components/editor/EditorShell.tsx` — Keyboard shortcut baseline
- `packages/web/src/components/editor/ComponentPanel.tsx` — Current component library UI
- `packages/web/src/components/editor/ViewportCanvas.tsx` — Current translate gizmo and viewport controls
- `packages/web/src/components/editor/NodeParamsEditor.tsx` — Current parameter editing surface

### Data and preview model
- `packages/core/src/types/design.ts` — Saved-design `thumbnail` field
- `packages/core/src/types/template.ts` — Template metadata `thumbnail` field
- `packages/core/src/templates/registry.ts` — Template metadata export path
- `packages/core/src/templates/single-shelf.ts` — Current empty template thumbnail placeholder
- `packages/core/src/templates/multi-shelf.ts` — Current empty template thumbnail placeholder
- `packages/core/src/templates/standalone.ts` — Current empty template thumbnail placeholder
- `packages/web/src/app/api/designs/route.ts` — Create/list design API shape
- `packages/web/src/app/api/designs/[id]/route.ts` — Get/update/delete design API shape
- `packages/web/src/app/api/templates/route.ts` — Template metadata API shape

</canonical_refs>

<specifics>
## Specific Ideas

- Reuse the existing `mode: 'template' | 'freeform'` state instead of introducing a second parallel editor flow.
- Preserve the current persisted `sceneGraph` model from Phase 1 as the canonical design payload for both preset and freeform work.
- Use template thumbnails for preset cards and persisted design thumbnails for saved-design cards, so the dashboard becomes visually scannable.

</specifics>

<deferred>
## Deferred Ideas

- Snapping, dimension aids, preset views, and BOM export belong to Phase 3.
- Mini-program-specific preview handling belongs to Phase 4 unless Phase 2 creates a reusable asset contract naturally.

</deferred>

---

*Phase: 02-freeform-builder*
*Context gathered: 2026-03-30 via direct user requirement*
