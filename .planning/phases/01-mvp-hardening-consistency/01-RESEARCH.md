# Phase 1 Research: MVP Hardening & Consistency

**Created:** 2026-03-29
**Purpose:** Planning input for Phase 1 execution

## Research Summary

Phase 1 should not expand the product surface. The highest-value work is to remove template-driven drift from the core save/reopen path, align the UI with the approved preset-entry model, and leave behind a dependable automated regression path for the dashboard -> editor -> save/autosave -> reopen flow.

The current implementation already contains most baseline pieces. The main planning risk is not missing infrastructure; it is inconsistent behavior across route initialization, store loading, autosave, and template-specific UI/state that still frames the editor as a template-regeneration experience instead of a saved scene editor.

## Recommended Plan Decomposition

Keep Phase 1 to **3 plans**.

### Plan 01: Core Scene Persistence and Load Consistency

**Objective:** Make the saved scene graph the source of truth when creating, loading, saving, and reopening a design.

**Scope:**
- Harden `packages/web/src/stores/editor-store.ts`
- Harden `packages/web/src/app/editor/new/page.tsx`
- Harden `packages/web/src/app/editor/[id]/page.tsx`
- Verify `packages/web/src/app/api/designs/route.ts`
- Verify `packages/web/src/app/api/designs/[id]/route.ts`

**Why first:** This is the foundation for RELI-01 and RELI-02. UI cleanup without persistence cleanup would leave the core flow unreliable.

### Plan 02: Phase 1 UI Contract Alignment

**Objective:** Reposition templates as preset entry points and align editor/dashboard chrome with the approved UI-SPEC.

**Scope:**
- Dashboard copy and hierarchy
- Header save-state copy and a11y
- Status bar terminology
- Remove or hide template-parameter editing from the main flow
- Apply responsive and accessibility requirements from `01-UI-SPEC.md`

**Why second:** The UI contract depends on the persistence model being stable enough to represent accurately.

### Plan 03: Automated Regression Path for Save/Reopen Continuity

**Objective:** Add dependable tests that prove the Phase 1 flow works and remains stable.

**Scope:**
- Extend or replace shallow Playwright stubs with a continuity-focused scenario
- Add store/hook/API coverage where E2E alone is too coarse
- Verify the user-visible save/reopen path and the simplified preset-entry language

**Why third:** Tests should lock in the target behavior after the flow and UI model are defined.

## Highest-Risk Code Paths

### 1. Route Initialization and Editor Store Bootstrapping

**Files:**
- `packages/web/src/app/editor/new/page.tsx`
- `packages/web/src/app/editor/[id]/page.tsx`
- `packages/web/src/stores/editor-store.ts`

**Risk:**
- `new/page.tsx` creates a design after the scene graph appears, which couples route lifecycle to template application and store timing.
- `[id]/page.tsx` loads `templateParams: null`, so reopened designs fall back to template defaults during `loadDesign`.
- `loadDesign()` reconstructs `templateParams` from defaults when they are missing, which reintroduces template-driven drift instead of trusting the saved scene graph.

**Planning implication:** Plan 01 should explicitly decide that reopened editing relies on persisted `sceneGraph` and basic node editing, not on recovering template parameters.

### 2. Template-Specific Regeneration Paths

**Files:**
- `packages/web/src/stores/editor-store.ts`
- `packages/web/src/components/editor/TemplateParamsEditor.tsx`
- `packages/web/src/components/editor/StatusBar.tsx`

**Risk:**
- `updateTemplateParams()` regenerates the whole scene and new IDs, which conflicts with the Phase 1 direction to stop treating template regeneration as the core editor model.
- UI still exposes `模板` terminology and regeneration warnings, which contradicts the approved preset-entry framing.

**Planning implication:** Phase 1 should hide, bypass, or narrow template-parameter editing rather than deepen it.

### 3. Save Feedback and Autosave Semantics

**Files:**
- `packages/web/src/hooks/use-auto-save.ts`
- `packages/web/src/components/editor/Header.tsx`

**Risk:**
- Save failure feedback is transient and generic.
- Save status is visible but not announced for assistive tech.
- The save button copy still uses `保存`, not the Phase 1 contract `保存设计`.

**Planning implication:** UI work and test coverage should treat save-state messaging as a first-class Phase 1 surface.

### 4. Current E2E Coverage Is Too Shallow for RELI-01/02/03

**Files:**
- `packages/web/tests/e2e/dashboard/dashboard.spec.ts`
- `packages/web/tests/e2e/editor/editor.spec.ts`

**Risk:**
- Existing tests mostly prove page rendering and redirects with mocked responses.
- They do not prove that a user can save, reopen, and continue editing the same persisted scene state.

**Planning implication:** Phase 1 needs at least one continuity-focused regression path that inspects behavior across save/load boundaries.

## UI-SPEC Implications That Must Become Plan Work

These are not optional polish items. They are part of the phase contract.

### Copy and Product Framing

- Replace template-first wording with preset-entry wording.
- Dashboard section should move from `从模板开始` toward the approved `从预置方案开始`.
- Status and support copy should prefer `来源` / `预置方案` over `模板`.

### Accessibility

- Save and load status changes should use `aria-live="polite"` or equivalent.
- Inline error states near save or form controls should use announced treatment such as `role="alert"` where appropriate.
- Inputs and interactive controls must keep accessible names and visible focus.

### Responsive Behavior

- Dashboard needs an explicit small-screen grid rule.
- Editor side panels must not force mobile horizontal overflow; at small widths they need a stacked, drawer, or other non-overlapping fallback.

### Visual Hierarchy

- The viewport remains the main anchor.
- The save button remains the main action anchor.
- Status bar and side panels should become quieter and less template-centric.

## Verification Strategy for RELI-01 / RELI-02 / RELI-03

Use a layered strategy rather than a single large browser test.

### Browser Regression Path

Add at least one Playwright scenario that proves:
- User starts from a preset entry on `/dashboard`
- Editor creates or opens a design
- User changes at least one basic editable property or node state
- Save or autosave persists the change
- Reopening the design restores the persisted scene and the user can continue editing

### Targeted Unit / Integration Coverage

Add focused tests for:
- `editor-store` load/save assumptions, especially `loadDesign()` and the decision to trust persisted scene state
- `use-auto-save` status transitions and failure handling
- Any new UI state logic introduced for inline save feedback or responsive panel behavior

### Acceptance Bar

Phase 1 should not be considered complete unless the following are proven:
- Reopen continuity is covered by automation, not only manual checking
- The preset-entry reframing is reflected in user-visible copy
- The UI no longer advertises template regeneration as the core editing model

## Suggested Planning Boundaries

### In Scope

- Stabilize saved scene continuity
- Simplify or hide template-regeneration UI
- Align dashboard/editor wording with `01-UI-SPEC.md`
- Add minimum dependable regression coverage

### Out of Scope

- Empty-canvas creation as a first-class flow
- Broader freeform editing upgrades beyond what is needed for continuity
- Richer template persistence fidelity as a restored product capability
- Large R3F type-system cleanup beyond what is required for the Phase 1 flow

## Planner Guidance

- Prefer plans that isolate persistence, UI contract alignment, and regression coverage.
- Avoid one giant plan. The code paths cross route, store, hook, and E2E layers and need separated execution units.
- Every plan should map back to at least one of `RELI-01`, `RELI-02`, `RELI-03`.
- The phase should end with a more dependable editor baseline, not with a more feature-rich template system.
