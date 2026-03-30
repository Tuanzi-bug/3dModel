# Phase 3: Smart Snapping & Output - Research

**Researched:** 2026-03-30
**Domain:** Precision placement, advanced component support, viewport inspection tools, and BOM export on the current R3F editor
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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

### Deferred Ideas (OUT OF SCOPE)
- Full CAD-style constraint solving or physics-based placement remains out of scope.
- Procurement workflow integrations beyond a lightweight export remain out of scope.
- Mini-program-specific precision/output handling belongs to Phase 4.
</user_constraints>

## Project Constraints (from repo state)

- Keep the existing stack baseline: Next.js App Router + React Three Fiber + Drei + Zustand + Prisma/SQLite.
- Keep `packages/core` platform-agnostic so future clients can reuse geometry/output logic.
- Keep all user-facing copy in Chinese.
- Treat Docker-friendly local development as the default execution environment.
- Preserve the current sceneGraph persistence path and owner-scoped design routes.
- Preserve the current editor shell and visual language unless a requirement explicitly needs a new control surface.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SNAP-01 | User can snap components to grid positions or compatible connection points during placement and movement | Add pure snap/bounds utilities under `packages/core`, then apply them from `ViewportCanvas` and component-placement flows so persisted transforms are already snapped. |
| SNAP-02 | User can add LED strip and back panel components to a design | The scene types/schemas already support these nodes; Phase 3 mainly needs mesh components, registry enablement, panel availability, and params editors. |
| SNAP-03 | User can view preset camera angles and dimension aids while editing | Keep view state ephemeral in the viewport, compute bounds from the current scene/selection, and render view tools/labels without mutating `sceneGraph`. |
| OUT-01 | User can export a BOM / parts list for the current design | Build a pure sceneGraph-to-BOM utility in `packages/core`, then add a thin web export action such as CSV download from the current design state. |
</phase_requirements>

## Summary

Phase 3 should be planned as a precision layer on top of the current freeform editor, not as a separate viewer or output subsystem. The repo already has the necessary baseline contracts: the editor store persists canonical `sceneGraph` data, the viewport already owns transform/camera primitives, the scene schema already includes `ledStrip` and `backPanel`, and the preview pipeline already knows how to serialize current designs deterministically. What is missing is shared spatial reasoning and output aggregation.

The most durable split is:
1. Build reusable snap and bounds utilities in `packages/core`.
2. Enable the remaining Phase 3 components end-to-end in the existing editor flow.
3. Add viewport-only inspection controls for preset views and dimensions.
4. Generate BOM output from pure sceneGraph data and verify the full precision workflow with browser coverage.

**Primary recommendation:** Plan Phase 3 as 4 plans in 3 waves. Use Wave 1 for the snap foundation, Wave 2 for advanced components plus inspection tools, and Wave 3 for BOM export plus cross-feature regression coverage.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15.5.14 | Existing page/API shell | Already owns dashboard/editor routes and user-scoped APIs. |
| React | 19.2.4 | UI runtime | Already locked across the repo. |
| `@react-three/fiber` | 9.5.0 | Canvas/scene runtime | Already powers the editor viewport. |
| `@react-three/drei` | 9.122.0 | Transform controls, gizmo helpers, HTML overlays | Already integrated and sufficient for preset view tools and dimension overlays. |
| `three` | 0.170.0 | Bounds/camera/math primitives | Already installed; use for `Box3`, vectors, and camera positioning rather than adding a new math layer. |
| Zustand | 5.0.12 | Editor state and history | Existing canonical editor state owner. |
| Prisma + SQLite | 6.19.2 | Design persistence | Existing design storage path; no schema change is required to export a BOM. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.25.76 | Scene validation | Keep scene/input contracts explicit if new component params are surfaced. |
| Vitest | 3.2.4 | Core/store/component regression tests | Use for snap math, bounds, component enablement, and BOM aggregation. |
| Playwright | 1.58.2 | Browser regression coverage | Use for snapping, view presets, and export UX. |
| Lucide React | 1.7.0 | Tool icons | Keep current editor chrome consistent. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pure core snap/BOM utilities | Canvas-local math and ad-hoc CSV string building | Faster initially, but hard to test and impossible to reuse in future clients. |
| Thin client-side export from current design state | Separate API/export service | More infrastructure with little benefit for the current single-user editor. |
| Viewport-only inspection tools | Separate read-only viewer page | Splits the workflow and duplicates current editor camera logic. |
| Custom advanced layout solver | Deterministic grid/anchor snap resolution | Solver complexity is out of scope for the requirement and would slow the phase down materially. |

**Installation:**
```bash
# No new packages are recommended for Phase 3.
docker compose exec web pnpm install --frozen-lockfile
```

## Architecture Patterns

### Pattern 1: Put Spatial Reasoning in `packages/core`
**What:** Keep snap resolution, scene bounds, and BOM aggregation as pure sceneGraph/Vec3 utilities.
**When to use:** Any logic that should be deterministic, unit-testable, and reusable outside the web canvas.
**Example:**
```ts
type SnapResult = {
  position: Vec3
  reason: 'grid' | 'anchor' | 'none'
  targetId?: string
}

export function resolveSnapPosition(sceneGraph: SceneNode, movingNodeId: string, proposed: Vec3): SnapResult
```

### Pattern 2: A Component Is Not "Supported" Until the Whole Chain Agrees
**What:** Enabling a new component means its type/schema, mesh, panel availability, editor params, preview/output, and tests all line up.
**When to use:** `ledStrip` and `backPanel` rollout in Phase 3.
**Example:**
```ts
componentRegistry.ledStrip = LedStripMesh
componentRegistry.backPanel = BackPanelMesh
// ...and ComponentPanel + NodeParamsEditor + tests update in the same phase.
```

### Pattern 3: Keep View Tools Ephemeral
**What:** Preset views and dimension aids live in viewport-local state and derive from the current scene/selection.
**When to use:** Camera preset buttons, measurement overlays, selection-size labels.
**Why:** View/measurement state is inspection-only and should not pollute persisted design records.

### Pattern 4: BOM Is Pure Data, Export UI Is Thin
**What:** Generate line items from the canonical sceneGraph in `packages/core`, then let the web layer download or display the result.
**When to use:** CSV or lightweight parts-list export from the current design.
**Why:** Output stays reusable and testable, while the browser layer only handles download UX.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Precision placement | Physics/collision engine | Deterministic grid + anchor snap resolution | The requirement asks for practical snapping, not full constraint solving. |
| View presets | Separate viewer route or canvas remount flow | The current `ViewportCanvas` camera/control stack | Avoids breaking selection, gizmos, and current editor continuity. |
| Dimension logic | DOM layout measurements | Scene bounds from current nodes/meshes | Dimensions must reflect the actual design, not panel size. |
| BOM export | Server-only reporting service | Pure `packages/core` generator + thin download action | Smaller scope, better reuse, simpler tests. |
| Advanced component rollout | Only enabling the library button | Full mesh + params + tests + output compatibility | Prevents invisible or half-implemented components. |

## Common Pitfalls

### Pitfall 1: Snap Logic Buried Entirely Inside the Canvas
**What goes wrong:** Snapping becomes hard to test, harder to reuse, and likely inconsistent between add-flow, drag-flow, and future clients.
**How to avoid:** Keep snap candidate generation and final resolution in `packages/core`, with the viewport acting as the caller.

### Pitfall 2: Relying Only on `translationSnap`
**What goes wrong:** Grid snapping may work, but compatible connection-point snapping never materializes.
**How to avoid:** Treat built-in control snapping as optional assistance only; the real contract needs a shared resolver that can rank both grid and anchor candidates.

### Pitfall 3: Enabling `LED灯带` / `背板` Before the Full Chain Exists
**What goes wrong:** The panel shows clickable entries that do not render correctly or cannot be edited/exported.
**How to avoid:** Roll out each component only when mesh registration, params editing, and regression coverage are in place.

### Pitfall 4: Dimension Aids Tied to the Wrong Source of Truth
**What goes wrong:** Labels drift from the actual scene or stop matching rotated/selected objects.
**How to avoid:** Derive dimensions from current scene/selection bounds utilities instead of from panel copy or hand-maintained numbers.

### Pitfall 5: BOM Built from UI Labels Instead of Scene Data
**What goes wrong:** Export output diverges from saved design state and becomes hard to trust.
**How to avoid:** Aggregate from canonical sceneGraph nodes and params in `packages/core`, then render/download in the web layer.

### Pitfall 6: Camera Tools Accidentally Mutate Design State
**What goes wrong:** View presets become persisted scene changes or interfere with selection/transform history.
**How to avoid:** Keep camera preset state ephemeral and separate from `sceneGraph` mutation history.

## Codebase Reality Check

- There is currently **no** snap utility or bounds utility in `packages/core`; Phase 3 needs to introduce them.
- `packages/core/src/types/scene.ts` and `packages/core/src/schemas/scene.ts` already define `ledStrip` and `backPanel`, so Phase 3 does not need a new scene-model contract.
- `packages/web/src/components/meshes/registry.ts` still excludes `ledStrip` and `backPanel`; the library intentionally stops at `rod` and `shelf`.
- `packages/web/src/components/editor/NodeParamsEditor.tsx` currently only handles `rod` and `shelf`, so new components are not editable yet.
- `packages/web/src/components/editor/ViewportCanvas.tsx` already owns camera, gizmo, and transform flows, which makes it the right home for precision tooling.
- `packages/core/src/utils/scene-preview.ts` already has basic `backPanel` and `ledStrip` preview handling, reducing the risk of preview regressions when those components become supported.

## Recommended Plan Split

| Wave | Plan | Focus |
|------|------|-------|
| 1 | 03-01 | Shared snapping foundation and transform integration |
| 2 | 03-02 | LED strip + back panel implementation |
| 2 | 03-03 | Preset camera views + dimension aids |
| 3 | 03-04 | BOM export + precision workflow regression coverage |

**Why this split works:** the snap foundation creates the precision contract first; advanced components and inspection tooling can then build in parallel on the stabilized editor baseline; BOM/export closes the phase with a reusable output contract and browser evidence.

---

*Phase: 03-smart-snapping-output*
*Research completed: 2026-03-30 via local codebase audit*
