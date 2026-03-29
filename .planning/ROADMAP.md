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

- [ ] **Phase 1: MVP Hardening & Consistency** - Turn the current brownfield template-based editor into a dependable baseline for further expansion
- [ ] **Phase 2: Freeform Builder** - Add create-from-empty, component placement, and direct scene editing workflows
- [ ] **Phase 3: Smart Snapping & Output** - Add precision assistance, advanced components, and BOM-oriented output
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
- [ ] 01-01-PLAN.md — Make persisted scene state the only source of truth for create/open/reopen editor flows
- [ ] 01-02-PLAN.md — Align dashboard and editor chrome with the approved preset-entry UI contract
- [ ] 01-03-PLAN.md — Add automated regression coverage for save/reopen continuity

### Phase 2: Freeform Builder
**Goal**: Let users create and manipulate modular shelf structures directly in the editor without depending on a template-first workflow.
**Depends on**: Phase 1
**Requirements**: [FREE-01, FREE-02, FREE-03, FREE-04, FREE-05]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can start from an empty scene and add supported components from the library.
  2. User can move, rotate, duplicate, and delete freeform components in the 3D editor.
  3. User can switch between template and freeform editing without unexpectedly losing the current scene graph.
  4. Core editing shortcuts work in the intended contexts.
**Plans**: TBD

### Phase 3: Smart Snapping & Output
**Goal**: Add precision assistance and deliverables that make the freeform editor practical for more exact design work.
**Depends on**: Phase 2
**Requirements**: [SNAP-01, SNAP-02, SNAP-03, OUT-01]
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can snap components to meaningful positions while placing or moving them.
  2. LED strip and back panel components are available in the editor.
  3. User can use preset views and dimension aids to inspect design intent more precisely.
  4. User can export a BOM / parts list from the current design.
**Plans**: TBD

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
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. MVP Hardening & Consistency | 0/3 | Not started | - |
| 2. Freeform Builder | 0/TBD | Not started | - |
| 3. Smart Snapping & Output | 0/TBD | Not started | - |
| 4. WeChat Mini-Program | 0/TBD | Not started | - |
