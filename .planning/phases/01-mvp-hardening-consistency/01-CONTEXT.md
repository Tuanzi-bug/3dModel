# Phase 1: MVP Hardening & Consistency - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 stabilizes the existing web editor so the saved and reopened editing flow is dependable for real use. Templates are not a product capability to deepen in this phase; they may remain only as preset scene entry points. This phase is about consistent editor behavior after a design is opened: selecting components, adding or removing them, moving them, editing basic component properties, saving or autosaving, and reopening without losing the actual editable scene state.

</domain>

<decisions>
## Implementation Decisions

### Template role in Phase 1
- **D-01:** Keep the dashboard "from template" entry as a convenience start path, but treat templates as preset starting scenes rather than a first-class editing system.
- **D-02:** Remove, hide, or bypass template-parameter editing and template-driven regeneration from the core Phase 1 path.
- **D-03:** Do not spend Phase 1 effort on persisting template parameters; template-specific persistence can be deleted or simplified if it blocks the core editor flow.

### Core flow scope
- **D-04:** Phase 1 hardens one core user path: dashboard entry to editor to select or add or remove or move component to edit basic component properties to manual save or autosave to reopen and continue editing.
- **D-05:** Empty-canvas creation is not required in this phase.
- **D-06:** Expanded editing breadth such as duplicate-first workflows, larger shortcut scope, or richer manipulation patterns stays out of scope unless needed to keep the core path coherent.

### Verification bar
- **D-07:** Phase 1 must leave behind an automated regression path, not just manual testing.
- **D-08:** The minimum acceptable verification is at least one core API or E2E smoke path that proves save and reopen continuity.
- **D-09:** Planning should prioritize tests that prove user-visible consistency over broad engineering cleanup.

### the agent's Discretion
- Exact UI copy and affordances used to reposition templates as preset entries.
- Whether template-related code is hidden, simplified, or removed, as long as it stops steering the core editor state model.
- How much secondary engineering debt to include after the core path is protected, if it clearly supports the main flow and does not expand scope.

</decisions>

<specifics>
## Specific Ideas

- "模板其实就是预先设计好的一套三维建模" means templates should be treated as preset scenes, not as a separate editing model.
- "核心还是自定义的编辑" means planning should bias toward node-level editing continuity rather than template-level fidelity.
- "现在是需要保证核心链路是一致的，用户是可用的" means the standard for Phase 1 is practical usability of the main editor flow, not completeness of old template behavior.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and phase direction
- `.planning/PROJECT.md` — current brownfield baseline, active product direction, and constraints.
- `.planning/REQUIREMENTS.md` — Phase 1 reliability requirements and roadmap traceability.
- `.planning/ROADMAP.md` — fixed Phase 1 boundary, goal, and success criteria.
- `.planning/STATE.md` — current focus and planning continuity notes.

### Product docs and historical build docs
- `docs/2026-03-23-3d-modeler-design.md` — original product and editor baseline for the web workflow and component model.
- `docs/superpowers/plans/2026-03-25-phase1-mvp.md` — original Phase 1 build plan; use as historical implementation context, not as the final source of current Phase 1 scope.
- `docs/design-system.md` — established Chinese UI language, dashboard/editor visual direction, and interaction conventions.

### Codebase analysis
- `.planning/codebase/ARCHITECTURE.md` — current monorepo and editor data-flow structure.
- `.planning/codebase/CONCERNS.md` — consistency risks, fragile areas, and testing gaps relevant to hardening.
- `.planning/codebase/TESTING.md` — current automated test surface and verification gaps.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/web/src/components/editor/EditorShell.tsx`, `Header.tsx`, `Viewport.tsx`, and `StatusBar.tsx`: existing editor shell to harden rather than redesign.
- `packages/web/src/components/editor/ComponentPanel.tsx`: current component-library add flow for node creation.
- `packages/web/src/components/editor/NodeParamsEditor.tsx`: current node property editor for basic editable fields.
- `packages/web/src/stores/editor-store.ts`: central scene, selection, undo/redo, and save-related state; also the main place where template coupling can be simplified.
- `packages/web/src/hooks/use-auto-save.ts`: current autosave and manual-save behavior plus save-status UI surface.
- `packages/web/src/app/api/designs/route.ts` and `packages/web/src/app/api/designs/[id]/route.ts`: existing persistence endpoints for create, list, get, patch, and delete.
- `packages/web/src/app/dashboard/page.tsx`, `packages/web/src/app/editor/new/page.tsx`, and `packages/web/src/app/editor/[id]/page.tsx`: route-level entry and loading flow that must be kept consistent.

### Established Patterns
- Editor state lives in a single Zustand store backed by whole-scene JSON snapshots.
- Save and load use Next.js route handlers with client-side `fetch` calls.
- The dashboard remains the main entry to design creation and reopening.
- Current editor UI uses Chinese copy and the existing tool-like design system; Phase 1 should preserve that baseline.
- Template logic currently lives inside the same store and routes as core editing, so this phase can simplify that coupling instead of adding more template-specific state.

### Integration Points
- `/dashboard` create and open actions feed into `/editor/new` and `/editor/[id]`.
- `useAutoSave` and `Header` manual save both patch `/api/designs/[id]`.
- Node editing flows through `ComponentPanel`, `NodeParamsEditor`, `ViewportCanvas`, and `editor-store`.
- Any template simplification must be reconciled across dashboard template cards, `/editor/new`, store initialization, and status or panel UI.

</code_context>

<deferred>
## Deferred Ideas

- Empty-canvas creation as a first-class starting path belongs to Phase 2.
- Broader freeform editing breadth beyond the core hardening path, including richer manipulation patterns and expanded shortcut scope, belongs to Phase 2 or later.
- Template-specific persistence fidelity or template-parameter systems should only return if a later phase intentionally restores templates as a first-class product feature.

</deferred>

---

*Phase: 01-mvp-hardening-consistency*
*Context gathered: 2026-03-29*
