# ShelfCraft

## What This Is

ShelfCraft is a browser-based 3D modular shelf design tool for quickly producing shelving, display, and storage structures without installing desktop CAD software. The current brownfield codebase already delivers a usable template-first web MVP, and the next work is to harden that baseline before expanding into freeform building, precision workflows, and a WeChat mini-program.

## Core Value

Users can quickly create, save, reopen, and refine modular shelf designs in a visual 3D workflow that feels reliable enough to keep using.

## Requirements

### Validated

- ✓ User can register, log in, and log out with email/password credentials — existing
- ✓ User can create a new design from shipped shelf templates in the web editor — existing
- ✓ User can save, list, reopen, and delete their own designs — existing
- ✓ User can orbit, zoom, and pan the 3D scene while editing — existing
- ✓ User can use undo/redo and autosave during the current template-based editing flow — existing

### Active

- [ ] Stabilize the current template-based MVP so saved/reopened editing flows stay consistent before adding major new scope
- [ ] Add full freeform building mode for composing designs without starting from a template
- [ ] Add snapping, advanced components, dimension aids, preset views, and BOM export
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
- Current technical concerns worth addressing before scope expansion include template parameter persistence drift on reload, mixed node-ID strategies, and `@ts-nocheck` in core R3F editor rendering files

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
| Start the first GSD execution phase with MVP hardening before freeform expansion | The current editor already works, but unresolved consistency/quality issues would make Phase 2 riskier if left alone | — Pending |

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
*Last updated: 2026-03-29 after initialization*
