# Phase 1: MVP Hardening & Consistency - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md. This log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 01-mvp-hardening-consistency
**Areas discussed:** Template role in Phase 1, Core flow scope, Verification bar

---

## Template role in Phase 1

| Option | Description | Selected |
|--------|-------------|----------|
| Keep template entry, then treat it as normal scene editing | Preserve the dashboard template entry point, but remove template-driven editing from the main flow | ✓ |
| Keep template entry and hide template UI for now | Minimize immediate code churn and defer deeper cleanup | |
| Remove template entry entirely | Focus the phase only on custom editing paths | |

**User's choice:** Keep the template entry, but treat it as a normal scene editing start point.
**Notes:** User clarified that templates are not important in themselves; they are only a predesigned 3D model starting point and can lose first-class status in Phase 1.

## Core flow scope

| Option | Description | Selected |
|--------|-------------|----------|
| Harden the main editing loop only | Dashboard entry to editor to select or add or remove or move to edit basic properties to save or autosave to reopen | ✓ |
| Include empty-canvas creation | Extend Phase 1 to also make from-scratch creation a required entry path | |
| Include broader editing breadth | Pull more operations such as duplicate, more shortcuts, and richer manipulation into Phase 1 | |

**User's choice:** Harden the main editing loop only.
**Notes:** User wants the core chain to be consistent and usable now; broader editing breadth should not be pulled forward into hardening work unless strictly necessary.

## Verification bar

| Option | Description | Selected |
|--------|-------------|----------|
| Automated regression required | Require at least one core API or E2E smoke path for the save and reopen flow | ✓ |
| Mostly unit or API tests | Focus on lower-level tests and defer end-to-end coverage | |
| Manual testing first | Rely on manual verification and backfill tests later | |

**User's choice:** Automated regression required.
**Notes:** User wants a usable and dependable core path; Phase 1 should not finish with only manual confidence.

## the agent's Discretion

- The exact mechanics for hiding, simplifying, or deleting template-parameter behavior.
- The exact test split between API and E2E as long as the core flow is covered.
- Secondary cleanup that supports the hardening goal without expanding scope.

## Deferred Ideas

- Empty-canvas creation as a required start mode.
- Larger freeform editing surface beyond the core hardening path.
- Restoring template-specific behavior as a first-class feature.
