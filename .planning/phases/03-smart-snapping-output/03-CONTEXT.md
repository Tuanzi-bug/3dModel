# Phase 3: Smart Snapping & Output - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning
**Source:** Direct planning request during `$gsd-plan-phase 3`

<domain>
## Phase Boundary

Phase 3 turns the current freeform editor into a precision-capable workflow. It must add snapping during placement and movement, ship the remaining planned editor components (`LED灯带` and `背板`), improve inspection through preset camera views plus dimension aids, and let users export a BOM / parts list from the current design. This phase builds on the stable freeform baseline from Phase 2 and the regression fixes from Phase 2.1; it should deepen the existing editor rather than introduce a second viewer or export flow.

</domain>

<decisions>
## Implementation Decisions

### Snapping and movement
- Phase 3 must add snapping during both placement and movement inside the existing freeform editor flow.
- Snapping must cover both grid positions and compatible connection points.
- Snapped transforms must persist through the current `sceneGraph` save/reopen pipeline.

### Advanced components
- `LED灯带` and `背板` move from disabled placeholders to supported components in this phase.
- Supported means: visible in the component library, renderable in the viewport, editable in the properties panel, and compatible with save/load/preview/output flows.

### Inspection tools
- Preset camera views and dimension aids must live inside the current editor viewport, not a separate viewer page.
- Inspection tools must help users understand orientation and size without mutating scene data.

### Output contract
- The user must be able to export a BOM / parts list from the current design.
- Export content must come from canonical `sceneGraph` data, not from dashboard preview strings or UI-only labels.
- The exact output format may be lightweight, but it must be practical for downstream review and procurement.

### UX and workflow constraints
- User-facing UI remains Chinese.
- Existing dashboard/editor visual patterns from `docs/design-system.md` and the Phase 1 UI contract remain in force; this is not a redesign phase.
- Project runtime/build/test commands must continue to run inside Docker containers, not directly on the host.

### The agent's Discretion
- Exact snap increments, thresholds, and whether snapping is always-on or user-toggleable.
- Exact presentation of dimension aids and preset view controls.
- Exact export format and download UX, provided the current design can be exported end-to-end.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and planning
- `.planning/ROADMAP.md` - Phase 3 goal, dependency, and success criteria
- `.planning/REQUIREMENTS.md` - Precision/output requirements mapped to Phase 3
- `.planning/STATE.md` - Current project state and Docker-only execution constraint
- `.planning/PROJECT.md` - Current project framing and recorded decisions
- `.planning/phases/02-freeform-builder/02-freeform-builder-01-SUMMARY.md` - Empty-canvas and persisted freeform contract baseline
- `.planning/phases/02-freeform-builder/02-freeform-builder-02-SUMMARY.md` - Existing freeform manipulation controls baseline
- `.planning/phases/02-freeform-builder/02-freeform-builder-03-SUMMARY.md` - Dashboard preview pipeline baseline
- `.planning/phases/02-freeform-builder/02-freeform-builder-04-SUMMARY.md` - Existing freeform/browser regression patterns
- `.planning/phases/02.1-freeform-stability-polish/02.1-freeform-stability-polish-01-SUMMARY.md` - Typed duplicate ID and selection continuity contract
- `.planning/phases/02.1-freeform-stability-polish/02.1-freeform-stability-polish-02-SUMMARY.md` - Current component-library enablement boundary
- `.planning/phases/02.1-freeform-stability-polish/02.1-freeform-stability-polish-03-SUMMARY.md` - Viewport gizmo stability baseline
- `.planning/phases/02.1-freeform-stability-polish/02.1-freeform-stability-polish-04-SUMMARY.md` - Current x-axis preview projection baseline

### UI and editor baseline
- `docs/design-system.md` - Existing dashboard/editor design baseline
- `.planning/phases/01-mvp-hardening-consistency/01-UI-SPEC.md` - Accessibility/responsive/editor chrome constraints still in force
- `packages/web/src/components/editor/Header.tsx` - Current action bar and save UX
- `packages/web/src/components/editor/ViewportCanvas.tsx` - Current camera, gizmo, and transform-control integration
- `packages/web/src/components/editor/StatusBar.tsx` - Existing footer-level editor metadata surface
- `packages/web/src/components/editor/NodeParamsEditor.tsx` - Current component parameter editing surface

### Scene, components, and persistence
- `packages/core/src/types/scene.ts` - Scene node types, including `ledStrip` and `backPanel`
- `packages/core/src/schemas/scene.ts` - Validation contract for persisted scene nodes
- `packages/core/src/utils/scene-tree.ts` - Current immutable scene mutation helpers
- `packages/core/src/utils/scene-preview.ts` - Preview behavior that new components/output should not break
- `packages/core/src/utils/id.ts` - Node labels and typed ID parsing
- `packages/web/src/stores/editor-store.ts` - Editor state, selection, history, and transform flow
- `packages/web/src/components/editor/ComponentPanel.tsx` - Current component library
- `packages/web/src/components/meshes/registry.ts` - Mesh registration boundary and current Phase 3 placeholders
- `packages/web/src/app/api/designs/[id]/route.ts` - Save/update flow driven from canonical `sceneGraph`

### Testing
- `.planning/codebase/TESTING.md` - Current Vitest/Playwright topology and expectations
- `packages/web/tests/e2e/editor/freeform-builder.spec.ts` - Current freeform continuity browser coverage
- `packages/web/tests/e2e/editor/keyboard-shortcuts.spec.ts` - Existing editor shortcut/spec structure
- `packages/web/tests/e2e/editor/viewport-gizmo.spec.ts` - Viewport-specific regression pattern

</canonical_refs>

<specifics>
## Specific Ideas

- Reuse `packages/core` for pure snapping, bounds, and BOM logic so later clients can share the same precision/output rules.
- Keep the current `sceneGraph` as the only source of truth for snapping results, dimension calculations, previews, and exported BOM content.
- Use the existing header and viewport chrome as the home for Phase 3 controls instead of creating additional pages or drawers unless the plan proves it necessary.

</specifics>

<deferred>
## Deferred Ideas

- Full CAD-style constraint solving or physics-based placement remains out of scope.
- Procurement workflow integrations beyond a lightweight export remain out of scope.
- Mini-program-specific precision/output handling belongs to Phase 4.

</deferred>

---

*Phase: 03-smart-snapping-output*
*Context gathered: 2026-03-30 via direct planning request*
