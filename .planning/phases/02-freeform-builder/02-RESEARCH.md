# Phase 2: Freeform Builder - Research

**Researched:** 2026-03-30
**Domain:** Next.js + React Three Fiber freeform editor workflows and dashboard preview generation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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

### Deferred Ideas (OUT OF SCOPE)
- Snapping, dimension aids, preset views, and BOM export belong to Phase 3.
- Mini-program-specific preview handling belongs to Phase 4 unless Phase 2 creates a reusable asset contract naturally.
</user_constraints>

## Project Constraints (from CLAUDE.md)

- Keep the existing stack baseline: Next.js App Router + React Three Fiber + Zustand + Prisma/SQLite.
- Keep `packages/core` platform-agnostic.
- Keep all user-facing copy in Chinese.
- Treat Docker-friendly local development as the default execution environment.
- Preserve user-scoped design access in all route changes.
- Do not make direct repo edits outside the active GSD workflow.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FREE-01 | User can start a design from an empty canvas without choosing a template | Use the existing `/editor/new` route and store; allow no-template entry, initialize `mode: 'freeform'`, and keep `templateId: null`. |
| FREE-02 | User can add supported components from the library into the 3D scene | Reuse `ComponentPanel` + store `addNode`, but scope Phase 2 to renderable components only and keep the mesh registry aligned with the panel. |
| FREE-03 | User can move, rotate, duplicate, and delete components in freeform mode | Extend `TransformControls` to `translate` and `rotate`, surface duplicate/delete affordances, and fix typed ID generation for duplicated nodes. |
| FREE-04 | User can switch from template mode to freeform mode while keeping the current scene graph | Add an explicit conversion action that preserves `sceneGraph` but disables further template regeneration by clearing template linkage or persisting freeform mode separately. |
| FREE-05 | User can use keyboard shortcuts for the core freeform editing actions | Keep existing undo/redo/delete guards, add freeform-safe shortcuts for duplicate and transform mode, and continue ignoring events inside inputs. |
| PREV-01 | User can visually distinguish preset entries and saved designs on the dashboard through preview images | Populate template thumbnails with real strings, return saved-design thumbnails from the list endpoint, and capture persisted design thumbnails from the existing viewport on create/manual save. |
</phase_requirements>

## Summary

Phase 2 should extend the existing editor and persistence architecture, not introduce a second editor flow. The codebase already has the right primitives: the Zustand store already models `mode: 'template' | 'freeform'`, the scene graph is already the persisted source of truth, the viewport already uses Drei `TransformControls`, and both template metadata and saved designs already carry `thumbnail` fields. The planning work is mostly about formalizing the product contract and fixing the mismatches between current plumbing and the Phase 2 requirements.

The main planning constraint is that several current assumptions are now wrong for Phase 2. `/editor/new` hard-requires a template, `loadDesign()` still infers mode from `templateId`, `GET /api/designs` does not return `thumbnail`, `duplicateNode()` generates random IDs that do not fit the typed ID contract, `ComponentPanel` exposes Phase 3 parts that the renderer cannot draw, and `useAutoSave()` is mounted more than once per editor page. If those are not addressed explicitly in the plan, freeform mode and preview generation will look implemented while still failing on reopen, dashboard rendering, or save churn.

**Primary recommendation:** Plan Phase 2 as one shared editor-flow expansion: add explicit freeform state and transform controls to the current store/viewport, clear template linkage on conversion to preserve reopen semantics, and generate saved-design thumbnails from the existing viewport on create plus manual save only.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15.5.14 | Dashboard/editor routes and API handlers | Already the shipped app shell; Phase 1 already established the server-wrapper/client-page split pattern. |
| React | 19.2.4 | UI runtime | Already locked across the repo and aligned with Next 15. |
| `@react-three/fiber` | 9.5.0 | Scene rendering in the editor viewport | Already owns the editor canvas; no reason to introduce a parallel 3D layer. |
| `@react-three/drei` | 9.122.0 | `TransformControls`, `OrbitControls`, grid, gizmo helpers | Standard helper layer on top of R3F; already present in `ViewportCanvas.tsx`. |
| `three` | 0.170.0 | Low-level 3D engine underneath R3F/Drei | Already pinned and required for transform controls and canvas capture. |
| Zustand | 5.0.12 | Long-lived editor state, history, selection, mode | Already central to editor behavior; Phase 2 should extend it, not bypass it. |
| Prisma + SQLite | 6.19.2 | Persist designs and thumbnails | Existing design CRUD path; `thumbnail` already exists in schema. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.25.76 | Request payload validation for create/update routes | Keep route contracts explicit when adding freeform mode and thumbnail writes. |
| Lucide React | 1.7.0 | Editor/dashboard icons | Keep the Phase 1 visual language. |
| Vitest | 3.2.4 | Store, hook, and route-level regression tests | Use for freeform mode, duplication, and thumbnail-route coverage. |
| Playwright | 1.58.2 | Browser regression coverage | Use for dashboard entry, mode conversion, and preview rendering checks. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Viewport-captured saved-design thumbnails | Pure `sceneGraph` preview generator in `packages/core` | More reusable long-term, but materially larger scope than Phase 2 and not required to satisfy PREV-01. |
| Reusing the existing editor/store flow | Separate freeform-only editor route/store | Adds avoidable drift and reopens the Phase 1 continuity problem. |
| Clearing template linkage on conversion | Persisting a separate provenance field | Better provenance, but adds schema/API/UI surface that the requirements do not ask for. |

**Installation:**
```bash
# No new packages are recommended for Phase 2.
docker compose exec web pnpm install --frozen-lockfile
```

**Version verification:** Versions above were verified against `pnpm-lock.yaml` and the active Docker toolchain (`docker compose exec web pnpm --version`, `docker compose exec web node --version`). The planning recommendation is to stay on the repo-locked stack for this phase, not upgrade libraries mid-phase.

## Architecture Patterns

### Recommended Project Structure
```text
packages/core/src/
├── schemas/             # create/update route contracts
├── templates/           # preset metadata + default scene generation
└── utils/               # scene-tree helpers and typed ID utilities

packages/web/src/
├── app/dashboard/       # empty-canvas entry + preview cards
├── app/editor/          # shared new/open routes
├── components/editor/   # mode toggle, viewport controls, panels
├── hooks/               # single save/thumbnail controller
└── stores/              # editor state, history, selection, transform mode
```

### Pattern 1: One Editor Flow, Two Modes
**What:** Keep `/editor/new` and `/editor/[id]` as the only editor entry points, and express template/freeform differences through store state instead of separate page trees.
**When to use:** All Phase 2 create, open, reopen, and convert flows.
**Example:**
```typescript
// Source: existing codebase pattern in packages/web/src/stores/editor-store.ts
type EditorMode = 'template' | 'freeform'

type EditorState = {
  mode: EditorMode
  templateId: string | null
  templateParams: TemplateParams | null
  sceneGraph: SceneNode
}

function convertToFreeform() {
  set({
    mode: 'freeform',
    templateId: null,
    templateParams: null,
  })
}
```

### Pattern 2: Transform Mode Belongs in Shared Editor State
**What:** Track `transformMode: 'translate' | 'rotate'` in editor state and bind both toolbar buttons and keyboard shortcuts to it.
**When to use:** Any viewport interaction that must stay consistent across canvas controls, keyboard shortcuts, and selection changes.
**Example:**
```tsx
// Source: https://threejs.org/docs/pages/TransformControls.html
// Source: https://r3f.docs.pmnd.rs/api/canvas
<TransformControls
  object={selectedGroup}
  mode={transformMode}
  onObjectChange={(event) => {
    const object = event?.target?.object
    if (!object) return
    updateNodeTransform(selectedNodeId, {
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
    })
  }}
/>
```

### Pattern 3: Capture Saved-Design Thumbnails from the Existing Canvas
**What:** Reuse the live editor canvas to export a small persisted preview string after the scene is rendered.
**When to use:** Initial create follow-up and explicit manual saves. Do not run this on every autosave in Phase 2.
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
// Source: https://threejs.org/docs/pages/WebGLRenderer.html
async function captureThumbnail(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.8),
  )
  if (!blob) return null

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
```

### Pattern 4: Single Save Controller
**What:** Mount one save hook/controller per editor surface and let header controls read from it instead of creating a second autosave timer tree.
**When to use:** Any change to save cadence, thumbnail capture, or save status messaging.
**Example:**
```tsx
// Source: existing codebase pattern, corrected for single ownership
function EditorPage() {
  const saveController = useAutoSave()
  return <EditorShell saveController={saveController} />
}
```

### Anti-Patterns to Avoid
- **Separate freeform route/store:** It will duplicate Phase 1 persistence logic and invite reopen drift.
- **Autosave thumbnail regeneration on every state change:** It will multiply PATCH payload size and amplify the current double-hook save bug.
- **Keeping `templateId` after conversion without persisting freeform mode:** `loadDesign()` currently derives mode from `templateId`, so converted designs will reopen in template mode.
- **Leaving Phase 3 parts enabled in the Phase 2 component library:** `ledStrip` and `backPanel` are not rendered by the current mesh registry.
- **Using `duplicateNode()` as-is for freeform duplication:** it produces random IDs that break typed ID parsing and counter continuity.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 3D move/rotate gizmos | Custom drag/rotate math in React event handlers | Drei/Three `TransformControls` | Already integrated, handles axis gizmos and object transforms, and matches the current viewport stack. |
| Scene-tree mutation logic | Ad-hoc recursive edits inside components | Existing `@3d-modeler/core` scene-tree helpers plus store actions | Keeps mutations centralized and testable. |
| Saved-design preview pipeline | New asset service, worker queue, or headless render service | Existing `thumbnail` field plus viewport capture on create/manual save | Satisfies PREV-01 with the current schema and minimal surface area. |
| Preset preview distribution | Separate dashboard-only preview registry | Existing `TemplateMetadata.thumbnail` strings | The metadata path already exists end-to-end. |
| Undo/redo state | A second viewport-local history model | Existing Zustand `past` / `future` stacks | Prevents editor controls and store state from diverging. |

**Key insight:** Phase 2 is mostly a contract-completion phase. The expensive mistakes would come from building parallel systems around an editor stack that already exists.

## Common Pitfalls

### Pitfall 1: The Dashboard List Route Does Not Return `thumbnail`
**What goes wrong:** Saved-design previews stay blank even if the database contains thumbnail data.
**Why it happens:** `GET /api/designs` currently omits `thumbnail` from its Prisma `select`, while the dashboard UI expects it.
**How to avoid:** Make the list route return `thumbnail` explicitly and keep its DTO aligned with `DesignDTO`.
**Warning signs:** Dashboard cards still show `无预览图` after thumbnail persistence is implemented.

### Pitfall 2: `useAutoSave()` Is Mounted More Than Once Per Editor Page
**What goes wrong:** Duplicate timers and duplicate PATCH requests create save churn and make thumbnail timing harder to reason about.
**Why it happens:** `useAutoSave()` is called in both the editor page/client wrapper and `Header`.
**How to avoid:** Move save ownership to one place and pass the controller down.
**Warning signs:** Duplicate network requests, inconsistent save labels, or save status flicker after adding thumbnails.

### Pitfall 3: Converted Designs Reopen in the Wrong Mode
**What goes wrong:** A user converts to freeform, but reopening the design restores template-mode behavior.
**Why it happens:** `loadDesign()` currently sets `mode` from `templateId`, not from persisted freeform intent.
**How to avoid:** For Phase 2, clear `templateId` and `templateParams` when converting to freeform unless you also add a new persisted provenance field.
**Warning signs:** Template regeneration controls reappear after reopening a converted design.

### Pitfall 4: Duplicate IDs Break Labels and Future Adds
**What goes wrong:** Duplicated nodes get random `nanoid()` IDs, which do not match the `type-sequence` contract used by `parseNodeId()` and the store counters.
**Why it happens:** `duplicateNode()` in `packages/core/src/utils/scene-tree.ts` clones subtrees with `generateId()`.
**How to avoid:** Regenerate duplicate IDs through the store’s typed counter strategy.
**Warning signs:** Selected-node labels lose their Chinese type labels, or new freeform nodes collide with existing IDs.

### Pitfall 5: The Component Library Currently Exposes Phase 3 Parts
**What goes wrong:** Users can add `ledStrip` and `backPanel` nodes that the mesh registry does not render.
**Why it happens:** `ComponentPanel.tsx` lists them, but `components/meshes/registry.ts` does not register them.
**How to avoid:** Scope Phase 2 to renderable parts only, or explicitly mark Phase 3 parts as disabled.
**Warning signs:** Added nodes increase the component count but do not appear in the viewport.

### Pitfall 6: Thumbnail Cadence Can Become the New Performance Problem
**What goes wrong:** Preview generation bloats save payloads and increases unnecessary writes.
**Why it happens:** Canvas-export strings are much larger than ordinary sceneGraph deltas, and `thumbnail` is a persisted text field.
**How to avoid:** Generate saved-design previews on initial create follow-up plus explicit manual save only in Phase 2.
**Warning signs:** Large PATCH payloads, frequent save errors, or noticeably slower dashboard return after small edits.

## Code Examples

Verified patterns from official sources:

### Freeform Transform Mode Wiring
```tsx
// Source: https://threejs.org/docs/pages/TransformControls.html
const [transformMode, setTransformMode] = useState<'translate' | 'rotate'>('translate')

<TransformControls
  object={selectedGroup}
  mode={transformMode}
  onObjectChange={(event) => {
    const object = event?.target?.object
    if (!object) return
    updateNodeTransform(selectedNodeId, {
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
    })
  }}
/>
```

### Canvas Capture for Saved-Design Preview
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
async function canvasToDataUrl(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', 0.8)
  })

  if (!blob) return null

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
```

### R3F Canvas Configuration for Reliable Capture
```tsx
// Source: https://r3f.docs.pmnd.rs/api/canvas
// Source: https://threejs.org/docs/pages/WebGLRenderer.html
<Canvas gl={{ preserveDrawingBuffer: true }}>
  {/* scene */}
</Canvas>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Template-first editor bootstrap only | Shared editor shell with template and freeform modes in the same store | Phase 1 established the persistence baseline on 2026-03-29; Phase 2 should complete the product flow | Avoids a second editor architecture. |
| Treat template params as the primary editing mechanism | Persisted `sceneGraph` is the editing source of truth | Phase 1, 2026-03-29 | Freeform work should mutate scene nodes directly, not regenerate from templates. |
| Empty dashboard placeholders | Real thumbnail strings for templates and saved designs | Phase 2 target | Preview work belongs in the existing metadata fields, not a new subsystem. |

**Deprecated/outdated:**
- `NewEditorClient` redirecting when `templateId` is missing: outdated once FREE-01 is in scope.
- `loadDesign()` deriving mode solely from `templateId`: outdated once FREE-04 is implemented.
- Showing `ledStrip` and `backPanel` as active freeform parts in Phase 2: outdated because Phase 3 owns those components.

## Open Questions

1. **Should converted designs preserve preset provenance after switching to freeform?**
   - What we know: current persistence only has `templateId`, and `loadDesign()` derives mode from it.
   - What's unclear: whether product wants to keep showing the original preset source after conversion.
   - Recommendation: For Phase 2, clear `templateId` on conversion and reopen as freeform. Only add a separate provenance field if the product explicitly asks for it later.

2. **Should saved-design thumbnails refresh on autosave as well as manual save?**
   - What we know: the context leaves cadence to implementation discretion, and the current save hook is already mounted twice.
   - What's unclear: whether the product values always-fresh previews more than save simplicity in Phase 2.
   - Recommendation: Create or refresh thumbnails on initial create follow-up plus explicit manual save only. Revisit autosave thumbnail refresh after save ownership is unified.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Docker Desktop | Required runtime/build/test path from project constraints | ✓ | 29.1.3 | — |
| Docker Compose | Running app/test commands the supported way | ✓ | 2.40.3-desktop.1 | — |
| Node inside `web` container | Next.js app/runtime tasks | ✓ | 22.22.1 | — |
| `pnpm` inside `web` container | Package/test runner in supported environment | ✓ | 9.15.0 | — |
| Playwright inside `web` container | Browser regression coverage | ✓ | 1.58.2 | — |
| Host `pnpm` | Direct host execution | ✗ | — | Use `docker compose exec web pnpm ...` |
| Host Node | Ad-hoc local scripts only | ✓ | 25.6.1 | Do not use it for app build/test; container Node 22 is the supported baseline. |

**Missing dependencies with no fallback:**
- None for planning. The supported Docker execution path is available.

**Missing dependencies with fallback:**
- Host `pnpm` is missing, but the repo already requires Docker-based commands, so containerized `pnpm` is the correct fallback.

## Sources

### Primary (HIGH confidence)
- Local phase context and requirements:
  - `.planning/phases/02-freeform-builder/02-CONTEXT.md`
  - `.planning/REQUIREMENTS.md`
  - `.planning/STATE.md`
  - `.planning/ROADMAP.md`
- Local implementation:
  - `packages/web/src/stores/editor-store.ts`
  - `packages/web/src/app/dashboard/page.tsx`
  - `packages/web/src/app/editor/new/NewEditorClient.tsx`
  - `packages/web/src/app/editor/[id]/page.tsx`
  - `packages/web/src/components/editor/EditorShell.tsx`
  - `packages/web/src/components/editor/ComponentPanel.tsx`
  - `packages/web/src/components/editor/ViewportCanvas.tsx`
  - `packages/web/src/hooks/use-auto-save.ts`
  - `packages/web/src/app/api/designs/route.ts`
  - `packages/web/src/app/api/designs/[id]/route.ts`
  - `packages/core/src/schemas/design.ts`
  - `packages/core/src/utils/scene-tree.ts`
  - `packages/core/src/utils/id.ts`
  - `packages/core/src/templates/*.ts`
  - `packages/web/prisma/schema.prisma`
  - `pnpm-lock.yaml`
- Official docs:
  - https://r3f.docs.pmnd.rs/api/canvas - checked Canvas `gl` configuration
  - https://threejs.org/docs/pages/TransformControls.html - checked transform modes and update events
  - https://threejs.org/docs/pages/WebGLRenderer.html - checked `preserveDrawingBuffer`
  - https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob - checked blob export and quality/type parameters
  - https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL - checked data URL export behavior and caveats

### Secondary (MEDIUM confidence)
- https://drei.docs.pmnd.rs/gizmos/transform-controls - verified Drei wrapper usage pattern at the docs level, then cross-checked against Three.js `TransformControls`

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified from the repo lockfile, current codebase, and the Docker runtime actually available here.
- Architecture: HIGH - derived directly from current Phase 1 summaries plus the live editor/dashboard/store code.
- Pitfalls: HIGH - each major pitfall is based on direct code inspection; thumbnail-cadence tradeoffs are MEDIUM but explicitly marked as a recommendation.

**Research date:** 2026-03-30
**Valid until:** 2026-04-29
