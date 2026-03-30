# Requirements: ShelfCraft

**Defined:** 2026-03-29
**Core Value:** Users can quickly create, save, reopen, and refine modular shelf designs in a visual 3D workflow that feels reliable enough to keep using.

## v1 Requirements

Requirements for the next execution roadmap, starting from the current brownfield MVP baseline.

### Reliability

- [x] **RELI-01**: User can reopen a saved design and continue editing the persisted scene graph and component properties without hidden resets or template-driven drift
- [x] **RELI-02**: User can use the current core flow (dashboard entry → edit → save/autosave → reopen) without data-consistency regressions across save/load/edit paths
- [x] **RELI-03**: User can trust that the current editor MVP remains stable while new phases are added on top of it, backed by automated regression coverage for the core flow

### Freeform Builder

- [x] **FREE-01**: User can start a design from an empty canvas without choosing a template
- [x] **FREE-02**: User can add supported components from the library into the 3D scene
- [x] **FREE-03**: User can move, rotate, duplicate, and delete components in freeform mode
- [x] **FREE-04**: User can switch from template mode to freeform mode while keeping the current scene graph
- [x] **FREE-05**: User can use keyboard shortcuts for the core freeform editing actions
- [x] **PREV-01**: User can visually distinguish preset entries and saved designs on the dashboard through preview images

### Stability & Polish

- [x] **FIX-01**: User can duplicate a component and immediately edit the duplicated component without the properties panel falling into an empty or invalid state
- [x] **FIX-02**: User only sees interactive component-library entries for currently supported components; unsupported entries remain disabled until implemented
- [x] **FIX-03**: User can click the viewport coordinate-axis gizmo without triggering runtime errors or destabilizing camera controls
- [x] **FIX-04**: User sees dashboard preview images rendered from a stable x-axis-oriented view that better matches the actual shelf structure

### Precision & Output

- [x] **SNAP-01**: User can snap components to grid positions or compatible connection points during placement and movement
- [x] **SNAP-02**: User can add LED strip and back panel components to a design
- [x] **SNAP-03**: User can view preset camera angles and dimension aids while editing
- [x] **OUT-01**: User can export a BOM / parts list for the current design

### Post-Phase-3 Bugfixes

- [ ] **FIX-05**: User can move components without over-aggressive real-time snapping; valid component/grid snap resolves when the drag completes
- [ ] **FIX-06**: User can open the exported BOM CSV in Excel without Chinese text becoming garbled
- [ ] **FIX-07**: User can deselect without camera jumps and can explicitly focus the selected component plus zoom in/out from the viewport controls

### Cross-Platform

- [ ] **XPLT-01**: User can authenticate into a WeChat mini-program client using the project auth model
- [ ] **XPLT-02**: User can open previously saved designs in the mini-program
- [ ] **XPLT-03**: User can view and edit supported design parameters in the mini-program while reusing shared core logic

## v2 Requirements

### Post-Roadmap Extensions

- **COLL-01**: Multiple users can collaborate on the same design in real time
- **INTG-01**: BOM/export data can sync into external procurement or ERP workflows

## Out of Scope

| Feature | Reason |
|---------|--------|
| General-purpose 3D/CAD modeling | The product is intentionally limited to modular shelf structures and parameterized components |
| Native iOS/Android apps | Web + WeChat mini-program are the planned channels |
| Billing, subscriptions, or e-commerce checkout | No current product docs or code indicate a monetization workflow |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| RELI-01 | Phase 1 | Completed |
| RELI-02 | Phase 1 | Completed |
| RELI-03 | Phase 1 | Completed |
| FREE-01 | Phase 2 | Completed |
| FREE-02 | Phase 2 | Completed |
| FREE-03 | Phase 2 | Completed |
| FREE-04 | Phase 2 | Completed |
| FREE-05 | Phase 2 | Completed |
| PREV-01 | Phase 2 | Completed |
| FIX-01 | Phase 2.1 | Completed |
| FIX-02 | Phase 2.1 | Completed |
| FIX-03 | Phase 2.1 | Completed |
| FIX-04 | Phase 2.1 | Completed |
| SNAP-01 | Phase 3 | Completed |
| SNAP-02 | Phase 3 | Completed |
| SNAP-03 | Phase 3 | Completed |
| OUT-01 | Phase 3 | Completed |
| FIX-05 | Phase 3.1 | Pending |
| FIX-06 | Phase 3.1 | Pending |
| FIX-07 | Phase 3.1 | Pending |
| XPLT-01 | Phase 4 | Pending |
| XPLT-02 | Phase 4 | Pending |
| XPLT-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-30 after completing Phase 3*
