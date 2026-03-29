# Requirements: ShelfCraft

**Defined:** 2026-03-29
**Core Value:** Users can quickly create, save, reopen, and refine modular shelf designs in a visual 3D workflow that feels reliable enough to keep using.

## v1 Requirements

Requirements for the next execution roadmap, starting from the current brownfield MVP baseline.

### Reliability

- [ ] **RELI-01**: User can reopen a saved design and continue editing the persisted scene graph and component properties without hidden resets or template-driven drift
- [ ] **RELI-02**: User can use the current core flow (dashboard entry → edit → save/autosave → reopen) without data-consistency regressions across save/load/edit paths
- [ ] **RELI-03**: User can trust that the current editor MVP remains stable while new phases are added on top of it, backed by automated regression coverage for the core flow

### Freeform Builder

- [ ] **FREE-01**: User can start a design from an empty canvas without choosing a template
- [ ] **FREE-02**: User can add supported components from the library into the 3D scene
- [ ] **FREE-03**: User can move, rotate, duplicate, and delete components in freeform mode
- [ ] **FREE-04**: User can switch from template mode to freeform mode while keeping the current scene graph
- [ ] **FREE-05**: User can use keyboard shortcuts for the core freeform editing actions

### Precision & Output

- [ ] **SNAP-01**: User can snap components to grid positions or compatible connection points during placement and movement
- [ ] **SNAP-02**: User can add LED strip and back panel components to a design
- [ ] **SNAP-03**: User can view preset camera angles and dimension aids while editing
- [ ] **OUT-01**: User can export a BOM / parts list for the current design

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
| RELI-01 | Phase 1 | Pending |
| RELI-02 | Phase 1 | Pending |
| RELI-03 | Phase 1 | Pending |
| FREE-01 | Phase 2 | Pending |
| FREE-02 | Phase 2 | Pending |
| FREE-03 | Phase 2 | Pending |
| FREE-04 | Phase 2 | Pending |
| FREE-05 | Phase 2 | Pending |
| SNAP-01 | Phase 3 | Pending |
| SNAP-02 | Phase 3 | Pending |
| SNAP-03 | Phase 3 | Pending |
| OUT-01 | Phase 3 | Pending |
| XPLT-01 | Phase 4 | Pending |
| XPLT-02 | Phase 4 | Pending |
| XPLT-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 after project initialization*
