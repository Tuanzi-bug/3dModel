# External Integrations

**Analysis Date:** 2026-03-29

## APIs & External Services

**Third-party APIs:**
- None implemented in application code today
  - Evidence: no SDK clients or outbound API wrappers under `packages/web/src/lib/` or `packages/web/src/app/api/`
  - Impact: the app currently behaves as a self-contained full-stack monolith

**Fonts / Frontend assets:**
- Google Fonts - Inter loaded by `next/font/google` in `packages/web/src/app/layout.tsx`
- Google Fonts CSS import - Inter also imported in `packages/web/src/app/globals.css`
  - Auth: none
  - Integration method: external font fetch at runtime/build time

## Data Storage

**Databases:**
- SQLite - Primary application database
  - Connection: `DATABASE_URL` env var
  - Client: Prisma via `packages/web/src/lib/prisma.ts`
  - Schema: `packages/web/prisma/schema.prisma`
  - Migrations: `packages/web/prisma/migrations/`

**File / Asset Storage:**
- No external object storage configured
  - Current approach: `thumbnail` is stored inline in the `Design` table as a nullable string per `packages/web/prisma/schema.prisma`

**Browser Storage:**
- `localStorage` - Client-side autosave cache in `packages/web/src/hooks/use-auto-save.ts`
  - Key: `autosave-design`
  - Purpose: best-effort local persistence before/alongside server PATCH requests

## Authentication & Identity

**Auth Provider:**
- Custom email/password + JWT implementation
  - Password hashing: `bcryptjs` in `packages/web/src/lib/auth.ts`
  - Token signing/verification: `jose` in `packages/web/src/lib/auth.ts`
  - Token storage: `httpOnly` cookie named `token` in `packages/web/src/app/api/auth/login/route.ts` and `packages/web/src/app/api/auth/register/route.ts`
  - Request auth gate: `packages/web/src/lib/with-auth.ts`

**OAuth Integrations:**
- None implemented
  - The product docs mention future WeChat OAuth in later phases, but there is no current provider integration in code

## Monitoring & Observability

**Error Tracking:**
- None found
  - No Sentry, Datadog, or similar SDK/config in manifests or source

**Analytics:**
- None found

**Logs:**
- No structured logging layer
  - API routes typically return JSON errors directly without server logging

## CI/CD & Deployment

**Hosting:**
- Dockerized Next.js standalone deployment
  - Container build and runtime: `Dockerfile`
  - Health check: `/api/health` via `packages/web/src/app/api/health/route.ts`

**CI Pipeline:**
- No GitHub Actions or other CI config found in the repo root
  - Testing is wired through scripts, but not yet automated by checked-in CI definitions

## Environment Configuration

**Development:**
- Required env vars: `JWT_SECRET`, `DATABASE_URL`
- Default DB path: `file:/app/data/dev.db`
- `.env` is loaded into Compose services by `docker-compose.yml`
- E2E service requires `BASE_URL` and `PLAYWRIGHT_BROWSERS_PATH`

**Staging / Production:**
- No separate staging configuration committed
- Production config is implied by standalone Next output and `NODE_ENV=production`

## Webhooks & Callbacks

**Incoming:**
- None implemented

**Outgoing:**
- None implemented

## Internal Network Boundaries

**Browser → App API:**
- Client components call same-origin API routes such as `/api/auth/*`, `/api/designs`, and `/api/templates`
- Key call sites: `packages/web/src/hooks/use-auth.ts`, `packages/web/src/hooks/use-auto-save.ts`, `packages/web/src/app/dashboard/page.tsx`, `packages/web/src/app/editor/new/page.tsx`, `packages/web/src/app/editor/[id]/page.tsx`

**Core Package Boundary:**
- `packages/web` depends on `@3d-modeler/core` as an internal workspace integration
- Shared contracts include schemas, template generators, scene types, and tree utilities from `packages/core/src/index.ts`

## Planned vs Implemented

- The design docs anticipate more integrations later, but the current system is intentionally narrow: SQLite, cookies, browser storage, and internal API routes only
- This makes the current runtime easy to reason about, but it also means auth, rate limiting, monitoring, and persistence are all single-node implementations

*Integrations analysis: 2026-03-29*
*Update when external services, CI, or deployment targets change*
