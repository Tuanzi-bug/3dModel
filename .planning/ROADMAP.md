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

### Phase 4: WeChat Mini-Program
**Goal**: Extend the product to a WeChat mini-program while preserving shared core business logic across platforms.
**Depends on**: Phase 3
**Requirements**: [XPLT-01, XPLT-02, XPLT-03]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can sign in and access saved designs from the mini-program client.
  2. Shared scene/types/template logic is reused rather than reimplemented separately.
  3. Mini-program users can view and edit the supported subset of design parameters.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 2.1 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. MVP Hardening & Consistency | 3/3 | Completed | 2026-03-29 |
| 2. Freeform Builder | 4/4 | Completed | 2026-03-30 |
| 2.1. Freeform Stability & Preview Polish | 4/4 | Completed | 2026-03-30 |
| 3. Smart Snapping & Output | 4/4 | Completed | 2026-03-30 |
| 4. WeChat Mini-Program | 0/TBD | Not started | - |
