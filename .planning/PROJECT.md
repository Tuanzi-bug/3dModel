# ShelfCraft

## What This Is

ShelfCraft is a browser-based 3D modular shelf design tool for quickly producing shelving, display, and storage structures without installing desktop CAD software. The current brownfield codebase already delivers a usable web MVP with template entry points and direct component editing, and the next work is to harden that baseline before expanding into broader freeform building, precision workflows, and a WeChat mini-program.

## Core Value

Users can quickly create, save, reopen, and refine modular shelf designs in a visual 3D workflow that feels reliable enough to keep using.

## Requirements

### Validated

- ✓ User can register, log in, and log out with email/password credentials — existing
- ✓ User can create a new design from shipped shelf templates in the web editor — existing
- ✓ User can save, list, reopen, and delete their own designs — existing
- ✓ User can orbit, zoom, and pan the 3D scene while editing — existing
- ✓ User can use undo/redo and autosave during the current template-based editing flow — existing
- ✓ User can reopen saved designs without scene/state drift across the current template flow — Phase 1
- ✓ User can start from an empty canvas and freeform-edit supported shelf components — Phase 2
- ✓ User can distinguish preset entries and saved designs through generated preview imagery — Phase 2
- ✓ User can duplicate components, use the viewport gizmo safely, and trust dashboard previews after the Phase 2.1 polish pass — Phase 2.1
- ✓ User can snap components, inspect designs with preset views/dimensions, and export a BOM from the web editor — Phase 3
- ✓ User can use repaired precision controls, stable viewport focus/zoom behavior, and Excel-safe BOM export after the Phase 3.1 bugfix pass — Phase 3.1
- ✓ User sees the homepage restored to the original landing-page baseline with the simple placeholder preview and initial marketing copy — Phase 3.4

### Active

- [ ] Reuse the shared core logic in a WeChat mini-program client

### Out of Scope

- Real-time multi-user collaboration — no evidence of collaboration primitives in the current product shape, and it would materially complicate state, auth, and persistence
- General-purpose CAD or arbitrary mesh modeling — the product is intentionally constrained to modular shelf structures and component params
- Native iOS/Android apps outside the planned WeChat mini-program — the current cross-platform plan is web first, mini-program second

## Context

- Product intent is documented in `docs/2026-03-23-3d-modeler-design.md`, `docs/product-proposal.md`, and the Phase 1 delivery plan `docs/superpowers/plans/2026-03-25-phase1-mvp.md`
- Brownfield mapping already exists in `.planning/codebase/` and shows the current implementation is a Next.js 15 + React 19 + R3F + Zustand + Prisma/SQLite monorepo
- The codebase already contains a functioning template-first editor baseline: auth routes, designs CRUD, dashboard, editor pages, autosave, undo/redo, viewport controls, shared templates, and tests
- The Phase 1 plan document is partially stale: several later UI/editor/E2E tasks remain unchecked in the plan doc even though corresponding code now exists in `packages/web/src/` and `packages/web/tests/e2e/`
- Current technical concerns worth addressing before scope expansion include template-specific editor coupling obscuring the core save/reopen model, mixed node-ID strategies, and `@ts-nocheck` in core R3F editor rendering files

## Constraints

- **Tech stack**: Next.js App Router + React Three Fiber + Zustand + Prisma/SQLite — already implemented and should remain the baseline unless there is a strong migration reason
- **Platform**: Web-first with future WeChat mini-program reuse — `packages/core` must stay platform-agnostic to preserve the cross-end plan
- **Language**: Chinese user-facing UI copy — established by `docs/design-system.md` and existing page/component text
- **Workflow**: Docker-friendly local development remains the intended default — reflected by `Dockerfile`, `docker-compose.yml`, and the Phase 1 plan
- **Security**: Design access must stay user-scoped — current routes already enforce owner checks and future phases must preserve that

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep a monorepo with shared `packages/core` domain logic | Future mini-program reuse depends on platform-agnostic scene/types/template logic | ✓ Good |
| Use an immutable JSON scene graph as the canonical design model | It already supports template generation, serialization, and undo/redo cleanly | ✓ Good |
| Keep custom email/password + JWT cookie auth for the current web baseline | It is already working and is sufficient until cross-platform auth needs force a redesign | ⚠️ Revisit |
| Treat the current codebase as a brownfield MVP baseline, not a greenfield project | Existing functionality is substantial enough that GSD should organize around current reality instead of re-planning from zero | ✓ Good |
| Start the first GSD execution phase with MVP hardening before freeform expansion | The current editor already works, but unresolved consistency/quality issues would make Phase 2 riskier if left alone | ✓ Good |
| Treat templates as preset scene entry points during Phase 1, not as a first-class editing system | The core product priority is dependable custom editing, not template parameter fidelity | ✓ Good |
| Insert an urgent Phase 2.1 before Phase 3 when newly shipped freeform features regress or crash | Blocking regressions should be fixed before the precision/output roadmap expands the editor surface further | ✓ Good |
| Keep Phase 3 precision logic in shared core utilities instead of burying it inside the web canvas | Snapping, bounds, and BOM rules should be testable and reusable by later clients, including the mini-program | ✓ Good |
| Keep duplicate IDs on the same typed `type-sequence` scheme as direct component insertion | Property editing, counters, and future snapping rules all depend on predictable node identity after copy | ✓ Good |
| Show unsupported palette entries as disabled instead of clickable | False affordances were creating broken interactions and obscuring the true supported surface | ✓ Good |
| Improve preview fidelity by switching to an x-axis SVG side view and `object-contain` dashboard rendering | Users asked for previews that better resemble the built scene without replacing the deterministic preview pipeline | ✓ Good |
| Keep BOM export as a thin header action backed by pure core CSV generation | Output should come from canonical scene data and stay reusable by future clients | ✓ Good |
| Insert Phase 3.1 before Phase 4 when the new precision workflow regresses on feel, export compatibility, or camera usability | Tight usability fixes should land before cross-platform expansion inherits the wrong behavior | ✓ Good |
| Keep the homepage hero preview isolated from editor state and ship it as a poster-first landing experience with browser-level regression coverage | Marketing-facing 3D should stay lightweight, degrade cleanly, and not pull homepage scope into full editor reuse or broader web adaptation | ✓ Good |
| Reset the homepage hero around a static product preview instead of continuing live-3D polish | The interactive experiment felt overdesigned and less credible than a calmer product-page presentation | ✓ Good |
| Insert Phase 03.4 to restore the homepage to its original landing baseline after the 03.3 polish still missed the user's preference | The user explicitly wants the earliest homepage back, so the roadmap must capture a deliberate rollback instead of pretending the 03.3 direction is still active | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-30 after completing Phase 03.4 homepage original landing restore*
