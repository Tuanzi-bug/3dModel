# Codebase Concerns

**Analysis Date:** 2026-03-29

## Tech Debt

**R3F typing bypass in editor renderer:**
- Issue: `packages/web/src/components/editor/SceneRenderer.tsx` and `packages/web/src/components/editor/ViewportCanvas.tsx` both use `// @ts-nocheck`
- Why: React Three Fiber JSX typing is not fully resolved in the current monorepo setup
- Impact: type safety is effectively disabled in the most interaction-heavy editor rendering code
- Fix approach: resolve TS/R3F JSX config and replace `@ts-nocheck` with explicit typed props/events

**Template catalog narrower than the spec/plan:**
- Issue: `packages/core/src/templates/registry.ts` only registers `single-shelf`, `multi-shelf`, and `standalone`
- Why: the implementation has only covered a subset of the Phase 1/plan template surface
- Impact: product docs overstate what users can currently start from, and planning assumptions can drift
- Fix approach: either implement the missing template modules or update docs/plans to reflect the shipped catalog

**Mixed node-ID strategies:**
- Issue: `packages/core/src/utils/id.ts` uses `nanoid`, while `packages/web/src/stores/editor-store.ts` generates `type-sequence` IDs and `packages/core/src/utils/scene-tree.ts` still duplicates via `generateId()`
- Why: ID readability improvements were added in the editor layer without fully normalizing the shared core utilities
- Impact: different code paths can produce different ID formats, complicating labels, tests, and future serialization assumptions
- Fix approach: centralize ID policy in `packages/core/` and make all creation/duplication/regeneration paths use the same format

## Known Bugs / Behavioral Drift

**Template parameters are not persisted with designs:**
- Symptoms: reopening a saved template-based design restores `templateParams` from template defaults rather than the exact parameters used to create the current scene
- Trigger: create or edit a design, save it, reload `/editor/[id]`, then continue editing template params
- Workaround: treat the saved `sceneGraph` as the source of truth and avoid relying on recovered template metadata
- Root cause: `packages/core/src/schemas/design.ts` and `packages/core/src/types/design.ts` do not include `templateParams`; `packages/web/src/app/editor/[id]/page.tsx` loads `templateParams: null`
- Fix approach: persist template params alongside the design or derive them reliably from stored scene data

**Auto-save delay expectation drift:**
- Symptoms: comments/tests describe a 3-second debounce while implementation uses 500ms
- Trigger: inspect `packages/web/src/hooks/use-auto-save.ts` against `packages/web/src/__tests__/hooks/use-auto-save.test.ts`
- Workaround: none needed at runtime, but developers can easily misread expected autosave behavior
- Root cause: implementation changed without fully updating test descriptions and timing assumptions
- Fix approach: align the constant, comments, and tests on one debounce contract

## Security Considerations

**In-memory rate limiting only:**
- Risk: `packages/web/src/lib/rate-limit.ts` stores counters in process memory
- Current mitigation: login/register endpoints check the limiter before continuing
- Recommendations: move rate limiting to a shared external store or edge-aware middleware before scaling beyond one process

**JWT auth is minimal and app-local:**
- Risk: custom JWT cookies in `packages/web/src/lib/auth.ts` and `packages/web/src/lib/with-auth.ts` have no refresh flow, issuer/audience checks, or centralized revocation
- Current mitigation: `httpOnly`, `sameSite: 'lax'`, and `secure` in production
- Recommendations: add session invalidation strategy, explicit token claims policy, and broader auth regression coverage

**No observability for auth/data failures:**
- Risk: failed auth attempts, DB errors, and malformed payloads return JSON but are not logged anywhere
- Current mitigation: client gets explicit error codes/messages
- Recommendations: add server-side structured logging for security-sensitive and persistence-sensitive paths

## Performance Bottlenecks

**Full-scene autosave on every change:**
- Problem: `packages/web/src/hooks/use-auto-save.ts` serializes the full `sceneGraph` to `localStorage` and PATCHes the full payload after each debounced change
- Measurement: no metrics are instrumented, but the pattern is O(scene size) per autosave
- Cause: current autosave model sends complete state snapshots instead of deltas
- Improvement path: add dirty-field/delta saves, longer debounce, batching, or server-side versioning

**Whole-tree immutable rewrites on edit operations:**
- Problem: helpers in `packages/core/src/utils/scene-tree.ts` recursively rewrite large portions of the tree for update/remove/duplicate flows
- Measurement: acceptable at MVP scale, but not benchmarked
- Cause: simplicity-first immutable tree operations
- Improvement path: profile with larger scenes, consider indexed node maps or structural sharing helpers if node counts grow

## Fragile Areas

**Editor creation/loading flow:**
- Why fragile: `packages/web/src/app/editor/new/page.tsx` and `packages/web/src/app/editor/[id]/page.tsx` rely on client-only effects, redirects, and store mutations happening in the right order
- Common failures: double initialization, redirect loops, missing `designId`, stale template-derived state
- Safe modification: keep route fetch/init logic small and add regression tests before changing lifecycle behavior
- Test coverage: basic E2E exists, but persistence/auth edge cases are not deeply covered

**Viewport interaction stack:**
- Why fragile: `packages/web/src/components/editor/ViewportCanvas.tsx` coordinates R3F canvas state, selection, transform controls, and store updates while type checking is suppressed
- Common failures: selection desync, transform event mismatches, subtle regressions after dependency upgrades
- Safe modification: change one interaction at a time and verify with both manual interaction and automated coverage
- Test coverage: render/load coverage exists, but complex transform interactions are lightly tested

## Scaling Limits

**SQLite + single-process assumptions:**
- Current capacity: suitable for local/dev or a small single-instance deployment
- Limit: concurrent writes, auth throttling, and cookie/session handling all assume one app instance and one local DB file
- Symptoms at limit: inconsistent rate limiting, DB contention, fragile deploy story
- Scaling path: migrate to a server DB, shared limiter/session store, and explicit deployment environment separation

## Dependencies at Risk

**R3F / Drei typing boundary:**
- Risk: upgrades to `@react-three/fiber`, `@react-three/drei`, or `three` may break editor code without TS catching it because rendering files are unchecked
- Impact: viewport regressions can land silently
- Migration plan: remove `@ts-nocheck` first, then upgrade with confidence

## Missing Critical Features

**No checked-in CI workflow:**
- Problem: scripts exist, but no repo-level CI config was found
- Current workaround: developers run Vitest/Playwright manually
- Blocks: consistent enforcement of tests/lint/build before merge
- Implementation complexity: low to medium

**No dedicated lint configuration despite `lint` scripts:**
- Problem: style and potential bug-catching rules are not visibly enforced by checked-in config
- Current workaround: rely on developer discipline and TypeScript/Vitest failures
- Blocks: consistent style drift prevention and some static analysis checks
- Implementation complexity: low

## Test Coverage Gaps

**Real API route execution:**
- What's not tested: end-to-end request/response behavior for route handlers with actual `NextRequest` objects and real Prisma interactions
- Risk: auth, serialization, and content-type edge cases can regress unnoticed
- Priority: High
- Difficulty to test: Medium

**Complex 3D manipulation behavior:**
- What's not tested: drag/transform interactions, selection edge cases, and pointer-heavy viewport behavior
- Risk: editor regressions may only surface manually
- Priority: High
- Difficulty to test: Medium to High

**Generated artifact hygiene:**
- What's not tested: whether `playwright-report`, `test-results`, and `*.tsbuildinfo` stay out of source-control workflows
- Risk: noisy diffs and accidental commits obscure real code changes
- Priority: Medium
- Difficulty to test: Low

*Concerns audit: 2026-03-29*
*Update as issues are fixed or new risks are discovered*
