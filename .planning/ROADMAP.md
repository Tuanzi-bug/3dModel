# Roadmap: ShelfCraft

## Overview

This roadmap starts from an existing brownfield MVP baseline instead of planning from zero. The current codebase already covers the core web editor workflow, with templates serving as one entry path into a broader scene-editing experience. The first execution phase therefore focuses on making that editor baseline consistent and dependable before the project expands into freeform building, precision tooling, and WeChat mini-program reuse.

## Existing Completed Baseline (Pre-GSD)

Before GSD initialization, the codebase already implements the equivalent of a substantial "Phase 0 / shipped baseline":

- Docker/workspace scaffolding, shared `packages/core`, and the main Next.js web app
- Email/password auth with JWT cookie sessions
- Template registry, scene graph types/schemas, and template-based design creation
- Design CRUD, dashboard listing, save/load/delete flows, and owner checks
- 3D viewport rendering, orbit controls, undo/redo, autosave, and editor shell pages
- Unit tests, hook/store tests, and Playwright E2E scaffolding

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: MVP Hardening & Consistency** - Turn the current brownfield template-based editor into a dependable baseline for further expansion
- [x] **Phase 2: Freeform Builder** - Add create-from-empty, component placement, and direct scene editing workflows
- [x] **Phase 2.1: Freeform Stability & Preview Polish (INSERTED)** - Fix newly discovered freeform regressions and preview fidelity issues before precision work continues
- [x] **Phase 3: Smart Snapping & Output** - Add precision assistance, advanced components, and BOM-oriented output
- [x] **Phase 3.1: Precision Usability Bugfixes (INSERTED)** - Fix post-Phase-3 snapping feel, CSV export compatibility, and viewport focus/zoom regressions (completed 2026-03-30)
- [x] **Phase 3.2: Homepage 3D Preview & Web Adaptation (INSERTED)** - Complete the landing-page hero 3D preview before broader web adaptation and mini-program expansion (completed 2026-03-30)
- [x] **Phase 3.3: Homepage Static Product Hero Polish (INSERTED)** - Reset the homepage hero around a static, product-led preview before any future live 3D revisit (completed 2026-03-30)
- [x] **Phase 3.4: Homepage Original Landing Restore (INSERTED)** - Restore the homepage to the original landing-page baseline the user preferred before mini-program work resumes (completed 2026-03-30)
- [ ] **Phase 4: WeChat Mini-Program** - Reuse the shared core model in a mini-program client

## Phase Details

### Phase 1: MVP Hardening & Consistency
**Goal**: Close the known consistency gaps in the shipped editor MVP so the saved/reopened editing flow is stable enough to serve as the long-term baseline.
**Depends on**: Brownfield baseline already exists
**Requirements**: [RELI-01, RELI-02, RELI-03]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can reopen a saved design and continue editing the persisted scene and basic component properties without hidden state drift.
  2. The existing dashboard entry → editor → save/autosave → reopen flow behaves consistently across core save/load paths, whether the design started from a preset template entry or not.
  3. The team has a dependable automated verification path for the current MVP before Phase 2 work starts.
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Make persisted scene state the only source of truth for create/open/reopen editor flows
- [x] 01-02-PLAN.md — Align dashboard and editor chrome with the approved preset-entry UI contract
- [x] 01-03-PLAN.md — Add automated regression coverage for save/reopen continuity

### Phase 2: Freeform Builder
**Goal**: Let users create and manipulate modular shelf structures directly in the editor without depending on a template-first workflow, while making dashboard entry more scannable with preview imagery.
**Depends on**: Phase 1
**Requirements**: [FREE-01, FREE-02, FREE-03, FREE-04, FREE-05, PREV-01]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can start from an empty scene and add supported components from the library.
  2. User can move, rotate, duplicate, and delete freeform components in the 3D editor.
  3. User can switch between template and freeform editing without unexpectedly losing the current scene graph.
  4. Core editing shortcuts work in the intended contexts.
  5. Dashboard preset entries and saved designs show preview images that help users identify what they are opening.
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Establish empty-canvas entry and the persisted freeform-mode contract
- [x] 02-02-PLAN.md — Expose move/rotate/duplicate/delete as complete freeform editing controls
- [x] 02-03-PLAN.md — Generate and surface dashboard preview images for presets and saved designs
- [x] 02-04-PLAN.md — Add automated regression coverage for freeform entry, manipulation, and previews

### Phase 2.1: Freeform Stability & Preview Polish (INSERTED)
**Goal**: Resolve the regressions and polish gaps discovered immediately after Phase 2 so the freeform editor remains stable before snapping/output work expands the surface area again.
**Depends on**: Phase 2
**Requirements**: [FIX-01, FIX-02, FIX-03, FIX-04]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Duplicating a component keeps the duplicate selected and fully editable in the properties panel.
  2. The component library only exposes supported entries as interactive actions, with unsupported components clearly disabled instead of pretending to work.
  3. Clicking the viewport coordinate-axis gizmo no longer throws runtime errors.
  4. Dashboard previews render from a stable x-axis-oriented view that users can recognize more easily.
**Plans**: 4 plans

Plans:
- [x] 02.1-01-PLAN.md — Repair duplicate identity, selection, and property-panel continuity
- [x] 02.1-02-PLAN.md — Gate the component library to currently supported parts only
- [x] 02.1-03-PLAN.md — Harden viewport gizmo and camera-control interactions against null-control crashes
- [x] 02.1-04-PLAN.md — Rework preview projection fidelity and lock it with targeted regressions

### Phase 3: Smart Snapping & Output
**Goal**: Add precision assistance and deliverables that make the freeform editor practical for more exact design work.
**Depends on**: Phase 2.1
**Requirements**: [SNAP-01, SNAP-02, SNAP-03, OUT-01]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can snap components to meaningful positions while placing or moving them.
  2. LED strip and back panel components are available in the editor.
  3. User can use preset views and dimension aids to inspect design intent more precisely.
  4. User can export a BOM / parts list from the current design.
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md — Add a reusable snapping foundation and apply it to placement/movement
- [x] 03-02-PLAN.md — Turn LED strip and back panel into fully supported editor components
- [x] 03-03-PLAN.md — Add preset camera views and dimension aids to the viewport
- [x] 03-04-PLAN.md — Export a BOM / parts list and lock the precision workflow with browser coverage

### Phase 3.1: Precision Usability Bugfixes (INSERTED)
**Goal**: Resolve the interaction regressions discovered immediately after Phase 3 so the precision workflow feels controllable before cross-platform work begins.
**Depends on**: Phase 3
**Requirements**: [FIX-05, FIX-06, FIX-07]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can drag components at a predictable pace and still get snap assistance when releasing near valid anchors or grid positions.
  2. User can open the exported BOM CSV directly in Excel without Chinese text turning into mojibake.
  3. User can click empty space to deselect without camera jumps, and can explicitly focus the selected component plus zoom in/out from the viewport chrome.
**Plans**: 4 plans

Plans:
- [x] 03.1-01-PLAN.md — Shift movement snapping to drag-release resolution
- [x] 03.1-02-PLAN.md — Make BOM CSV export Excel-safe without changing the file contract
- [x] 03.1-03-PLAN.md — Stabilize deselection and add explicit viewport focus/zoom controls
- [x] 03.1-04-PLAN.md — Lock the repaired precision workflow with browser regression coverage

### Phase 3.2: Homepage 3D Preview & Web Adaptation (INSERTED)
**Goal**: Complete the landing-page hero 3D preview with a lightweight interactive scene before broader web adaptation and mini-program work begin.
**Depends on**: Phase 3.1
**Requirements**: [HERO-01, HERO-02, HERO-03, HERO-04]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. The homepage hero replaces the static placeholder with a poster-first preview that upgrades into a lightweight interactive 3D scene while keeping the title, supporting copy, and CTA immediately usable.
  2. The preview supports slow auto-rotation plus user-controlled rotate/zoom interaction on desktop and touch devices, pauses during active interaction, and returns to a stable default showcase angle before resuming motion, without introducing pan or editor-style controls.
  3. Unsupported, failed, reduced-motion, or otherwise unsafe 3D states fall back cleanly to a stable poster presentation with device-appropriate interaction hinting and no broken or blank hero block.
  4. Broader web adaptation and Phase 4 mini-program work stay deferred instead of expanding this inserted phase.
**Plans**: 4 plans

Plans:
- [x] 03.2-01-PLAN.md — Establish the hero preview shell with poster-first loading and safe fallback behavior
- [x] 03.2-02-PLAN.md — Build the lightweight interactive 3D scene and camera behavior for the landing hero
- [x] 03.2-03-PLAN.md — Integrate the preview into the landing page with stable layout, hinting, and CTA-first hierarchy
- [x] 03.2-04-PLAN.md — Add homepage regression coverage for preview states and interactions

### Phase 03.3: Homepage Static Product Hero Polish (INSERTED)
**Goal**: Rework the homepage hero around a static, realistic, product-led preview so the landing page feels more credible before any future live 3D revisit.
**Depends on**: Phase 3.2
**Requirements**: [LAND-01, LAND-02, LAND-03, LAND-04]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. The homepage hero shifts from animation/demo energy toward a believable product-page presentation centered on a static preview image.
  2. The hero preview reads as a realistic product render or product-photo surface, not a toy-like or stylized 3D demo.
  3. Title, supporting copy, CTA, and the static preview work as one coherent first-screen composition with a few restrained parameter labels.
  4. The first section below the hero receives only minimal consistency cleanup; the phase does not expand into a full-homepage redesign.
**Plans**: 3 plans

Plans:
- [x] 03.3-01-PLAN.md — Replace the live/default hero preview shell with a static product-led preview component and component tests
- [x] 03.3-02-PLAN.md — Rework homepage copy/layout and lightly quiet the first section below the hero
- [x] 03.3-03-PLAN.md — Replace the old interactive homepage browser regression with static hero coverage

### Phase 03.4: Homepage Original Landing Restore (INSERTED)
**Goal**: Restore the homepage to the original landing-page baseline from commit `42a3af0`, removing the Phase 3.2 and 3.3 hero treatments so the first screen matches the simpler page the user preferred.
**Depends on**: Phase 3.3
**Requirements**: [RESTORE-01, RESTORE-02, RESTORE-03, RESTORE-04]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. The homepage hero title, supporting copy, CTA arrangement, preview placeholder, feature cards, CTA section, and footer match the original landing-page structure and content from the `42a3af0` baseline.
  2. The homepage route no longer imports or renders `HeroPreview`, `HeroPreviewPoster`, or `HeroPreviewScene`; the simple `3D 预览区域` placeholder returns as the first-screen visual.
  3. Homepage tests are realigned to the restored baseline and no longer assert the Phase 3.2 or 3.3 preview-specific contracts.
  4. The rollback stays scoped to the homepage surface and its tests; it does not reopen editor, dashboard, or mini-program scope.
**Plans**: 2 plans

Plans:
- [x] 03.4-01-PLAN.md — Restore the homepage route to the original landing baseline and retire the obsolete HeroPreview unit test
- [x] 03.4-02-PLAN.md — Rewrite homepage Playwright coverage to the restored original baseline

### Phase 4: WeChat Mini-Program
**Goal**: Extend the product to a WeChat mini-program while preserving shared core business logic across platforms.
**Depends on**: Phase 3.4
**Requirements**: [XPLT-01, XPLT-02, XPLT-03]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can sign in and access saved designs from the mini-program client.
  2. Shared scene/types/template logic is reused rather than reimplemented separately.
  3. Mini-program users can view and edit the supported subset of design parameters.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 2.1 → 3 → 3.1 → 3.2 → 3.3 → 3.4 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. MVP Hardening & Consistency | 3/3 | Completed | 2026-03-29 |
| 2. Freeform Builder | 4/4 | Completed | 2026-03-30 |
| 2.1. Freeform Stability & Preview Polish | 4/4 | Completed | 2026-03-30 |
| 3. Smart Snapping & Output | 4/4 | Completed | 2026-03-30 |
| 3.1. Precision Usability Bugfixes | 4/4 | Complete    | 2026-03-30 |
| 3.2. Homepage 3D Preview & Web Adaptation | 4/4 | Completed | 2026-03-30 |
| 3.3. Homepage Static Product Hero Polish | 3/3 | Completed | 2026-03-30 |
| 3.4. Homepage Original Landing Restore | 2/2 | Completed | 2026-03-30 |
| 4. WeChat Mini-Program | 0/TBD | Not started | - |
