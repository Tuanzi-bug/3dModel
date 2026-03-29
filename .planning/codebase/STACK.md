# Technology Stack

**Analysis Date:** 2026-03-29

## Languages

**Primary:**
- TypeScript 5.x - All application code in `packages/core/src/` and `packages/web/src/`

**Secondary:**
- CSS - Global styling in `packages/web/src/app/globals.css`
- SQL - Prisma migrations in `packages/web/prisma/migrations/`
- Shell - Container bootstrap in `scripts/docker-entrypoint.sh`
- JSON/YAML - Workspace and build config in `package.json`, `turbo.json`, `pnpm-workspace.yaml`

## Runtime

**Environment:**
- Node.js 22 - Declared by the base image in `Dockerfile`
- Browser runtime - Client components under `packages/web/src/app/`, `packages/web/src/components/`, and `packages/web/src/hooks/`
- SQLite file storage - Default dev DB at `file:/app/data/dev.db` from `.env.example` and `docker-compose.yml`

**Package Manager:**
- pnpm 9.15.0 - Declared in root `package.json` and activated in `Dockerfile`
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- Next.js 15 - App Router app and API routes in `packages/web/src/app/`
- React 19 - UI layer in `packages/web/src/app/` and `packages/web/src/components/`
- React Three Fiber 9.5 + Drei 9.x - 3D viewport in `packages/web/src/components/editor/ViewportCanvas.tsx`
- Zustand 5 - Editor state store in `packages/web/src/stores/editor-store.ts`
- Prisma 6 - ORM and SQLite access in `packages/web/src/lib/prisma.ts` and `packages/web/prisma/schema.prisma`
- Zod 3 - Runtime validation in `packages/core/src/schemas/`

**UI / Styling:**
- Tailwind CSS 3 - Utility styling configured in `packages/web/tailwind.config.ts`
- Lucide React 1.7 - Icons used across dashboard and editor components
- Radix UI packages installed - Dialog, dropdown, select, slider, toast deps declared in `packages/web/package.json`, but current code primarily uses custom Tailwind markup rather than Radix primitives

**Testing:**
- Vitest 3 - Unit, hook, store, and component tests in `packages/core/__tests__/` and `packages/web/src/__tests__/`
- Testing Library React 16 - Hook/component tests in `packages/web/src/__tests__/`
- Playwright 1 - E2E tests in `packages/web/tests/e2e/`

**Build / Dev:**
- Turborepo 2 - Workspace orchestration from root `package.json` and `turbo.json`
- Next standalone output - Enabled by `packages/web/next.config.ts`
- Docker / Docker Compose - Default dev and E2E environment in `Dockerfile` and `docker-compose.yml`

## Key Dependencies

**Critical:**
- `@3d-modeler/core` - Shared domain package consumed by the web app
- `next` - Full-stack runtime for pages and API handlers
- `@react-three/fiber`, `@react-three/drei`, `three` - 3D rendering stack
- `zustand` - Persistent client-side editor state and undo/redo history
- `@prisma/client`, `prisma` - DB client and schema/migration workflow
- `zod` - Input and scene graph validation
- `bcryptjs`, `jose` - Password hashing and JWT auth

**Infrastructure:**
- `turbo` - Monorepo task runner
- `tailwindcss`, `postcss`, `autoprefixer` - Styling pipeline
- `vitest`, `@vitest/coverage-v8`, `@playwright/test` - Test execution and reporting

## Configuration

**Workspace / Build:**
- Root workspaces: `pnpm-workspace.yaml`
- Task graph: `turbo.json`
- Shared TS base: `tsconfig.base.json`
- Package TS configs: `packages/core/tsconfig.json`, `packages/web/tsconfig.json`
- Next output + transpilation: `packages/web/next.config.ts`
- Tailwind theme: `packages/web/tailwind.config.ts`
- PostCSS: `packages/web/postcss.config.js`

**Environment:**
- Required env vars: `JWT_SECRET`, `DATABASE_URL` from `packages/web/src/lib/env.ts`
- Example values: `.env.example`
- Docker dev service loads `.env` via `docker-compose.yml`

**Database / Persistence:**
- Prisma schema: `packages/web/prisma/schema.prisma`
- SQL migrations: `packages/web/prisma/migrations/`

## Platform Requirements

**Development:**
- Docker Desktop is the intended baseline per `docs/superpowers/plans/2026-03-25-phase1-mvp.md`
- Node 22 + pnpm 9.15.0 if running outside Docker
- Local writable `data/` mount for SQLite when using containerized dev

**Production:**
- Standalone Next.js server bundle from `packages/web/.next/standalone`
- Health check endpoint at `packages/web/src/app/api/health/route.ts`
- Current production target is a Docker container, not a managed platform config

## Planned vs Implemented

- The product/design docs call for a broader template catalog and future multi-platform targets, but the current runtime only ships the web app plus three templates in `packages/core/src/templates/`
- The design doc mentions Radix UI as a core UI foundation; the codebase currently depends on Radix packages but largely does not use them yet
- The stack already includes Playwright, Docker, and Prisma as planned, so the foundation aligns well with the MVP plan even if some Phase 1 features are still partial

*Stack analysis: 2026-03-29*
*Update after major dependency or runtime changes*
