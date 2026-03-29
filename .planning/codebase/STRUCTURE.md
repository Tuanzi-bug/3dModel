# Codebase Structure

**Analysis Date:** 2026-03-29

## Directory Layout

```text
3dModel/
├── docs/                    # Product, phase, and design-system documentation
├── packages/
│   ├── core/                # Shared domain types, schemas, templates, utilities, and unit tests
│   └── web/                 # Next.js web app, Prisma schema, UI, API routes, and E2E tests
├── scripts/                 # Repo-level shell helpers
├── data/                    # SQLite data directory used by Dockerized dev
├── .planning/               # Generated planning/codebase documents
├── package.json             # Root workspace scripts
├── pnpm-workspace.yaml      # Workspace package discovery
├── turbo.json               # Task graph
├── Dockerfile               # Multi-stage dev/build/prod image
├── docker-compose.yml       # Dev + E2E orchestration
└── tsconfig.base.json       # Shared TypeScript config
```

## Directory Purposes

**`docs/`:**
- Purpose: project intent and planning inputs
- Contains: product design doc, design system, Superpowers/GSD plan docs
- Key files: `docs/2026-03-23-3d-modeler-design.md`, `docs/design-system.md`, `docs/superpowers/plans/2026-03-25-phase1-mvp.md`

**`packages/core/`:**
- Purpose: platform-agnostic business/domain layer
- Contains: `src/types/`, `src/schemas/`, `src/templates/`, `src/utils/`, plus `__tests__/`
- Key files: `packages/core/src/index.ts`, `packages/core/src/templates/registry.ts`, `packages/core/src/utils/scene-tree.ts`

**`packages/web/`:**
- Purpose: UI, API, persistence wiring, and test harnesses
- Contains: `src/app/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/stores/`, `prisma/`, `tests/e2e/`
- Key files: `packages/web/src/app/layout.tsx`, `packages/web/src/stores/editor-store.ts`, `packages/web/prisma/schema.prisma`

**`scripts/`:**
- Purpose: repo-level scripts used by Docker/dev flows
- Contains: `scripts/docker-entrypoint.sh`

## Key File Locations

**Entry Points:**
- `package.json` - root workspace command surface
- `packages/web/src/app/page.tsx` - landing page
- `packages/web/src/app/dashboard/page.tsx` - authenticated dashboard
- `packages/web/src/app/editor/new/page.tsx` - create editor flow
- `packages/web/src/app/editor/[id]/page.tsx` - load existing design
- `packages/core/src/index.ts` - shared package barrel export

**Configuration:**
- `pnpm-workspace.yaml` - workspace packages
- `turbo.json` - task dependencies and outputs
- `tsconfig.base.json` - shared TS settings
- `packages/web/next.config.ts` - standalone output and transpile list
- `packages/web/tailwind.config.ts` - theme tokens
- `packages/web/vitest.config.ts` - web test config
- `packages/web/playwright.config.ts` - E2E setup
- `.env.example` - required env vars

**Core Logic:**
- `packages/core/src/templates/` - template generators
- `packages/core/src/schemas/` - shared validators
- `packages/core/src/utils/scene-tree.ts` - immutable tree operations
- `packages/web/src/stores/editor-store.ts` - editor orchestration
- `packages/web/src/components/editor/` - editor layout and controls
- `packages/web/src/app/api/` - server handlers
- `packages/web/src/lib/` - auth, Prisma, env, rate limiting

**Testing:**
- `packages/core/__tests__/` - core unit tests
- `packages/web/src/__tests__/` - web unit/component/hook/store tests
- `packages/web/tests/e2e/` - Playwright suites
- `packages/web/tests/e2e/screenshots/` - checked-in screenshot artifacts

**Documentation / Generated Outputs:**
- `docs/` - human-authored docs
- `.planning/codebase/` - generated map docs
- `packages/web/.next/` - Next build/dev output
- `packages/web/coverage/` - Vitest coverage report
- `packages/web/playwright-report/` - HTML report
- `packages/web/test-results/` - Playwright failure artifacts

## Naming Conventions

**Files:**
- `kebab-case.ts` / `kebab-case.tsx` for most modules, hooks, libs, and templates
- `PascalCase.tsx` for React components under `packages/web/src/components/`
- `page.tsx` and `route.ts` for Next App Router entries
- `*.test.ts` and `*.test.tsx` for tests

**Directories:**
- Feature or concern folders are lowercase and mostly kebab-case or framework-driven names such as `app/`, `components/`, `hooks/`, `schemas/`
- Next dynamic route folders use bracket syntax like `packages/web/src/app/editor/[id]/`

**Special Patterns:**
- `index.ts` used as the core barrel file
- `__tests__` used for colocated web/core test trees
- `tests/e2e/` used for browser scenarios rather than colocated E2E files

## Where to Add New Code

**New Shared Domain Logic:**
- Types/schemas/utils/templates: `packages/core/src/`
- Tests: `packages/core/__tests__/`

**New App Feature:**
- Route/page shell: `packages/web/src/app/`
- UI components: `packages/web/src/components/`
- Shared hooks: `packages/web/src/hooks/`
- Client state: `packages/web/src/stores/`
- Server helpers: `packages/web/src/lib/`
- API endpoint: `packages/web/src/app/api/`
- Tests: `packages/web/src/__tests__/` or `packages/web/tests/e2e/`

**New Persistence Concern:**
- Prisma schema or migrations: `packages/web/prisma/`

## Special Directories

**`packages/web/.next/`:**
- Purpose: Next.js dev/build artifacts
- Source: generated by `next dev` / `next build`
- Committed: should be treated as generated output

**`packages/web/coverage/`:**
- Purpose: Vitest HTML + JSON coverage report
- Source: `pnpm --filter web test:coverage`
- Committed: should be treated as generated output

**`packages/web/playwright-report/`:**
- Purpose: Playwright HTML report
- Source: `pnpm --filter web test:e2e`
- Committed: generated; currently present in the workspace

**`packages/web/test-results/`:**
- Purpose: Playwright failure screenshots, videos, and error context
- Source: Playwright test runs
- Committed: generated; currently present in the workspace

*Structure analysis: 2026-03-29*
*Update when directories, route topology, or generated output locations change*
