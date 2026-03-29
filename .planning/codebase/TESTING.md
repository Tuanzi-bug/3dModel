# Testing Patterns

**Analysis Date:** 2026-03-29

## Test Framework

**Runner:**
- Vitest 3 for unit, hook, store, and component-level tests
- Config files: `packages/core/vitest.config.ts`, `packages/web/vitest.config.ts`

**Assertion Library:**
- Vitest built-in `expect`
- Testing Library utilities for React hooks/components in web tests

**Run Commands:**
```bash
pnpm test                                # Run workspace tests via Turbo
pnpm --filter @3d-modeler/core test      # Core unit tests
pnpm --filter @3d-modeler/web test       # Web unit/component/hook/store tests
pnpm --filter @3d-modeler/web test:coverage
pnpm --filter @3d-modeler/web test:e2e
```

## Test File Organization

**Location:**
- Core tests live in `packages/core/__tests__/`
- Web unit/component/hook/store tests live in `packages/web/src/__tests__/`
- E2E browser tests live in `packages/web/tests/e2e/`

**Naming:**
- Unit tests: `*.test.ts`
- React component tests: `*.test.tsx`
- Playwright scenario specs: `*.spec.ts`

**Structure:**
```text
packages/core/
  __tests__/
    schemas/
    templates/
    utils/

packages/web/
  src/__tests__/
    api/
    components/
    hooks/
    lib/
    stores/
  tests/e2e/
    auth/
    dashboard/
    editor/
```

## Test Structure

**Suite Organization:**
```ts
describe('EditorStore', () => {
  beforeEach(() => {
    // reset shared state
  })

  it('undoes last change', () => {
    // arrange
    // act
    // assert
  })
})
```

**Patterns:**
- `beforeEach` is used heavily for resetting Zustand state or test doubles
- Tests prefer direct state inspection over rendering when validating pure store/util logic
- Playwright specs group related scenarios by page or workflow with `test.describe(...)`

## Mocking

**Framework:**
- Vitest `vi.mock`, `vi.stubEnv`, `vi.stubGlobal`, fake timers

**Patterns:**
```ts
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.stubGlobal('fetch', vi.fn())
vi.stubEnv('JWT_SECRET', 'a'.repeat(32))
```

**What Gets Mocked:**
- `next/navigation`
- `fetch`
- `localStorage`
- Prisma access in some auth tests
- Browser APIs and timers

**What Usually Does Not Get Mocked:**
- Pure core utilities like scene-tree helpers
- Zod schemas and type-level domain contracts

## Fixtures and Factories

**Test Data:**
- Inline literals are the dominant pattern
- Small helpers are introduced only where tree shapes would otherwise be repetitive, e.g. `makeRoot()` in `packages/core/__tests__/utils/scene-tree.test.ts`

**Examples:**
- Scene graph literals in `packages/web/src/__tests__/stores/editor-store.test.ts`
- Auth env setup in `packages/web/src/__tests__/api/auth.test.ts`
- Route stubs in Playwright specs such as `packages/web/tests/e2e/editor/editor.spec.ts`

## Coverage

**Web Coverage:**
- Enabled in `packages/web/vitest.config.ts`
- Provider: V8
- Thresholds: 80 for lines, functions, branches, statements
- Current include scope: only `src/hooks/**`
- Generated report exists in `packages/web/coverage/`

**Core Coverage:**
- No explicit coverage config in `packages/core/vitest.config.ts`
- `passWithNoTests: true` is enabled

## E2E Patterns

**Playwright Configuration:**
- `packages/web/playwright.config.ts`
- Single worker, no full parallelism
- HTML report + list reporter
- `trace: 'on-first-retry'`, screenshot on failure, retained video on failure

**Execution Model:**
- Browser tests assume the app is already running
- Docker Compose defines a separate `e2e` profile/service
- Specs commonly stub app API responses with `page.route(...)` rather than hitting a real DB-backed environment

## Current Test Coverage Shape

**Well Represented:**
- Core scene schemas and tree utilities
- Template generation basics
- Auth utility functions
- Hook/store behavior
- Basic editor/dashboard/auth browser flows

**Less Represented:**
- Direct API route invocation with real request objects
- 3D interaction behavior beyond basic render/load flows
- Persistence edge cases and production-like auth/session behavior

## Artifacts

- `packages/web/coverage/` contains the HTML coverage output
- `packages/web/playwright-report/` contains the Playwright HTML report
- `packages/web/test-results/` contains screenshots, videos, and error context from failed E2E runs
- `packages/web/tests/e2e/screenshots/` contains checked-in manual/reference screenshots

*Testing analysis: 2026-03-29*
*Update when frameworks, coverage scope, or test topology change*
