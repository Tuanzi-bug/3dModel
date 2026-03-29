<!-- GSD:project-start source:PROJECT.md -->
## Project

**ShelfCraft**

ShelfCraft is a browser-based 3D modular shelf design tool for quickly producing shelving, display, and storage structures without installing desktop CAD software. The current brownfield codebase already delivers a usable template-first web MVP, and the next work is to harden that baseline before expanding into freeform building, precision workflows, and a WeChat mini-program.

**Core Value:** Users can quickly create, save, reopen, and refine modular shelf designs in a visual 3D workflow that feels reliable enough to keep using.

### Constraints

- **Tech stack**: Next.js App Router + React Three Fiber + Zustand + Prisma/SQLite — already implemented and should remain the baseline unless there is a strong migration reason
- **Platform**: Web-first with future WeChat mini-program reuse — `packages/core` must stay platform-agnostic to preserve the cross-end plan
- **Language**: Chinese user-facing UI copy — established by `docs/design-system.md` and existing page/component text
- **Workflow**: Docker-friendly local development remains the intended default — reflected by `Dockerfile`, `docker-compose.yml`, and the Phase 1 plan
- **Security**: Design access must stay user-scoped — current routes already enforce owner checks and future phases must preserve that
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.x - All application code in `packages/core/src/` and `packages/web/src/`
- CSS - Global styling in `packages/web/src/app/globals.css`
- SQL - Prisma migrations in `packages/web/prisma/migrations/`
- Shell - Container bootstrap in `scripts/docker-entrypoint.sh`
- JSON/YAML - Workspace and build config in `package.json`, `turbo.json`, `pnpm-workspace.yaml`
## Runtime
- Node.js 22 - Declared by the base image in `Dockerfile`
- Browser runtime - Client components under `packages/web/src/app/`, `packages/web/src/components/`, and `packages/web/src/hooks/`
- SQLite file storage - Default dev DB at `file:/app/data/dev.db` from `.env.example` and `docker-compose.yml`
- pnpm 9.15.0 - Declared in root `package.json` and activated in `Dockerfile`
- Lockfile: `pnpm-lock.yaml` present
## Frameworks
- Next.js 15 - App Router app and API routes in `packages/web/src/app/`
- React 19 - UI layer in `packages/web/src/app/` and `packages/web/src/components/`
- React Three Fiber 9.5 + Drei 9.x - 3D viewport in `packages/web/src/components/editor/ViewportCanvas.tsx`
- Zustand 5 - Editor state store in `packages/web/src/stores/editor-store.ts`
- Prisma 6 - ORM and SQLite access in `packages/web/src/lib/prisma.ts` and `packages/web/prisma/schema.prisma`
- Zod 3 - Runtime validation in `packages/core/src/schemas/`
- Tailwind CSS 3 - Utility styling configured in `packages/web/tailwind.config.ts`
- Lucide React 1.7 - Icons used across dashboard and editor components
- Radix UI packages installed - Dialog, dropdown, select, slider, toast deps declared in `packages/web/package.json`, but current code primarily uses custom Tailwind markup rather than Radix primitives
- Vitest 3 - Unit, hook, store, and component tests in `packages/core/__tests__/` and `packages/web/src/__tests__/`
- Testing Library React 16 - Hook/component tests in `packages/web/src/__tests__/`
- Playwright 1 - E2E tests in `packages/web/tests/e2e/`
- Turborepo 2 - Workspace orchestration from root `package.json` and `turbo.json`
- Next standalone output - Enabled by `packages/web/next.config.ts`
- Docker / Docker Compose - Default dev and E2E environment in `Dockerfile` and `docker-compose.yml`
## Key Dependencies
- `@3d-modeler/core` - Shared domain package consumed by the web app
- `next` - Full-stack runtime for pages and API handlers
- `@react-three/fiber`, `@react-three/drei`, `three` - 3D rendering stack
- `zustand` - Persistent client-side editor state and undo/redo history
- `@prisma/client`, `prisma` - DB client and schema/migration workflow
- `zod` - Input and scene graph validation
- `bcryptjs`, `jose` - Password hashing and JWT auth
- `turbo` - Monorepo task runner
- `tailwindcss`, `postcss`, `autoprefixer` - Styling pipeline
- `vitest`, `@vitest/coverage-v8`, `@playwright/test` - Test execution and reporting
## Configuration
- Root workspaces: `pnpm-workspace.yaml`
- Task graph: `turbo.json`
- Shared TS base: `tsconfig.base.json`
- Package TS configs: `packages/core/tsconfig.json`, `packages/web/tsconfig.json`
- Next output + transpilation: `packages/web/next.config.ts`
- Tailwind theme: `packages/web/tailwind.config.ts`
- PostCSS: `packages/web/postcss.config.js`
- Required env vars: `JWT_SECRET`, `DATABASE_URL` from `packages/web/src/lib/env.ts`
- Example values: `.env.example`
- Docker dev service loads `.env` via `docker-compose.yml`
- Prisma schema: `packages/web/prisma/schema.prisma`
- SQL migrations: `packages/web/prisma/migrations/`
## Platform Requirements
- Docker Desktop is the intended baseline per `docs/superpowers/plans/2026-03-25-phase1-mvp.md`
- Node 22 + pnpm 9.15.0 if running outside Docker
- Local writable `data/` mount for SQLite when using containerized dev
- Standalone Next.js server bundle from `packages/web/.next/standalone`
- Health check endpoint at `packages/web/src/app/api/health/route.ts`
- Current production target is a Docker container, not a managed platform config
## Planned vs Implemented
- The product/design docs call for a broader template catalog and future multi-platform targets, but the current runtime only ships the web app plus three templates in `packages/core/src/templates/`
- The design doc mentions Radix UI as a core UI foundation; the codebase currently depends on Radix packages but largely does not use them yet
- The stack already includes Playwright, Docker, and Prisma as planned, so the foundation aligns well with the MVP plan even if some Phase 1 features are still partial
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- `kebab-case` for most TS modules, hooks, libs, and templates such as `scene-tree.ts`, `use-auto-save.ts`, `single-shelf.ts`
- `PascalCase.tsx` for React components such as `EditorShell.tsx`, `SceneRenderer.tsx`, `PropertiesPanel.tsx`
- `page.tsx` and `route.ts` follow Next App Router conventions under `packages/web/src/app/`
- Tests use `*.test.ts` or `*.test.tsx`
- `camelCase` for utilities and hook internals such as `hashPassword`, `verifyToken`, `handleDelete`, `handleAdd`
- Async helpers usually do not receive an `Async` suffix
- Event handlers tend to use `handle*` naming in components
- `camelCase` for locals and state
- `UPPER_SNAKE_CASE` for module-level constants such as `AUTO_SAVE_DELAY`, `LOCAL_STORAGE_KEY`, `MAX_HISTORY`
- Zustand selectors use short `s` parameters, e.g. `useEditorStore((s) => s.sceneGraph)`
- `PascalCase` for interfaces and type aliases such as `DesignDTO`, `TemplateParams`, `NodePatch`
- No `I` prefix usage
- Scene node type strings are lower camel / lower-case literals such as `'crossClamp'`, `'fixedRing'`, `'teeConnector'`
## Code Style
- TypeScript-first ESM modules
- Single quotes dominate source files
- Semicolons are generally omitted
- Trailing commas are common in multiline objects and parameter lists
- Two-space indentation is consistent in most files
- Root and workspace scripts expose `lint`, but no checked-in ESLint config was found
- No Prettier config was found
- Practical implication: the style is consistent, but enforcement appears convention-driven rather than tool-enforced
## Import Organization
- Imports are usually grouped by source type with blank lines between major groups
- Type-only imports are sometimes separated with `import type`, especially for Three.js and shared types
- `@/` maps to `packages/web/src/` via `packages/web/vitest.config.ts` and TS config
- `@3d-modeler/core` is the internal workspace package boundary
## Error Handling
- Route handlers validate `content-type`, parse JSON, and return structured JSON errors with `success: false`
- Zod `safeParse()` is preferred at API boundaries
- Utility helpers throw on invalid env or invalid tokens, with routes/hooks converting failures into user-facing responses or redirects
- Client pages often recover with `router.push(...)` rather than inline retry/error state
- API errors use string codes such as `VALIDATION_ERROR`, `UNAUTHORIZED`, `DESIGN_NOT_FOUND`
- Hooks commonly rethrow `Error` with the server-provided message, e.g. `packages/web/src/hooks/use-auth.ts`
## Logging
- No dedicated logger or logging convention found
- The codebase favors returning explicit errors over logging context
- Tests also do not assert on logs, reinforcing that logging is currently not a first-class pattern
## Comments
- Comments explain intent, UX behavior, or test sections rather than every line
- Chinese comments are common in UI and tests
- Examples: keyboard shortcut notes in `packages/web/src/components/editor/EditorShell.tsx`, section banners in Playwright specs
- `// @ts-nocheck` is used in `packages/web/src/components/editor/SceneRenderer.tsx` and `packages/web/src/components/editor/ViewportCanvas.tsx` to suppress unresolved R3F typing issues
- TODO-style comments are rare; the current code prefers direct implementation notes
## Function Design
- Small focused helpers are common in `packages/core/src/utils/` and `packages/web/src/lib/`
- Route files export one function per HTTP method and keep per-method logic inline
- Guard clauses are preferred for auth, invalid input, and missing records
- Hooks frequently combine refs, effects, and memoized callbacks
- React components generally subscribe via narrow Zustand selectors
- Imperative actions inside effects or keyboard handlers call `useEditorStore.getState()` directly
## Module Design
- Named exports are the default for shared modules, hooks, and components
- Default exports are mostly reserved for Next page components
- `packages/core/src/index.ts` acts as the public barrel surface for the shared package
- Shared logic is intentionally pushed into `packages/core/` to keep the web layer thinner
- UI code separates shell/layout components from mesh-rendering components
- API helper modules (`auth.ts`, `env.ts`, `prisma.ts`, `with-auth.ts`) are small and single-purpose
## Testing Conventions
- Tests use `describe` / `it` with explicit arrange-act-assert flow
- `beforeEach` resets global stores or mocks when needed
- Browser globals and framework APIs are stubbed with `vi.mock`, `vi.stubEnv`, and `vi.stubGlobal`
- Test data is usually inline object literals
- Reusable factories appear selectively, e.g. `makeRoot()` in `packages/core/__tests__/utils/scene-tree.test.ts`
## UI / Copy Conventions
- User-facing strings are predominantly Chinese, consistent with `docs/design-system.md`
- Styling is mostly direct Tailwind utility composition rather than design-token helper components
- Icon usage follows Lucide React, usually with `w-4 h-4` or `w-5 h-5`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Single repo with two active workspaces: shared domain logic in `packages/core/` and the web app in `packages/web/`
- Next.js App Router handles both UI and server endpoints under `packages/web/src/app/`
- Editor state is client-side and long-lived via Zustand in `packages/web/src/stores/editor-store.ts`
- The canonical modeling contract is an immutable scene graph shared across UI, API validation, and persistence
- Persistence is synchronous request/response against Prisma + SQLite; there is no background job or external service tier
## Layers
- Purpose: define shared types, schemas, templates, and scene-tree utilities
- Contains: `packages/core/src/types/`, `packages/core/src/schemas/`, `packages/core/src/templates/`, `packages/core/src/utils/`
- Depends on: `zod`, `nanoid`
- Used by: API routes, editor store, rendering components, tests
- Purpose: expose data/auth/template endpoints and mediate persistence
- Contains: `packages/web/src/app/api/`
- Depends on: `@3d-modeler/core`, Prisma client, auth helpers in `packages/web/src/lib/`
- Used by: browser clients via `fetch()`
- Purpose: hold the active design, selection, mode, history, and template state
- Contains: `packages/web/src/stores/editor-store.ts`
- Depends on: shared core functions such as `updateNode`, `duplicateNode`, `getTemplateById`, `regenerateNodeIds`
- Used by: editor pages, panels, viewport, hooks
- Purpose: render the dashboard, auth screens, and 3D editor shell
- Contains: `packages/web/src/app/` pages plus `packages/web/src/components/`
- Depends on: Zustand selectors, internal API routes, Lucide, R3F/Drei
- Used by: the browser runtime
- Purpose: persist users and saved designs
- Contains: `packages/web/prisma/schema.prisma`, `packages/web/prisma/migrations/`, `packages/web/src/lib/prisma.ts`
- Depends on: SQLite via `DATABASE_URL`
- Used by: auth and design API routes
## Data Flow
- In-memory client store owns scene graph, undo/redo stacks, selected node, and design metadata
- Server DB stores only serialized `sceneGraph`, design metadata, and auth records
- Autosave writes to both `localStorage` and the `/api/designs/[id]` PATCH endpoint
## Key Abstractions
- Purpose: canonical representation of the 3D model
- Examples: `SceneNode`, `Vec3`, component param types in `packages/core/src/types/scene.ts`
- Pattern: discriminated union + immutable tree helpers
- Purpose: map template IDs to metadata and generator functions
- Examples: `templateRegistry`, `getTemplateMetadata()`, `getTemplateById()` in `packages/core/src/templates/registry.ts`
- Pattern: pure-function generation over `TemplateParams`
- Purpose: coordinate UI state, history, selection, template re-generation, and manual editing
- Examples: `applyTemplate`, `updateNodeParams`, `undo`, `redo`, `loadDesign`
- Pattern: centralized Zustand store with imperative `getState()` usage in event handlers and effects
- Purpose: map domain node types to renderable R3F components
- Examples: `packages/web/src/components/meshes/registry.ts`
- Pattern: type-to-component lookup used by `SceneRenderer`
## Entry Points
- `packages/web/src/app/page.tsx` - landing page
- `packages/web/src/app/login/page.tsx` - login UI
- `packages/web/src/app/register/page.tsx` - registration UI
- `packages/web/src/app/dashboard/page.tsx` - saved designs + template chooser
- `packages/web/src/app/editor/new/page.tsx` - create workflow
- `packages/web/src/app/editor/[id]/page.tsx` - edit workflow
- `packages/web/src/app/api/auth/register/route.ts`
- `packages/web/src/app/api/auth/login/route.ts`
- `packages/web/src/app/api/auth/logout/route.ts`
- `packages/web/src/app/api/designs/route.ts`
- `packages/web/src/app/api/designs/[id]/route.ts`
- `packages/web/src/app/api/templates/route.ts`
- `packages/web/src/app/api/health/route.ts`
- `packages/core/src/index.ts`
## Error Handling
- API handlers guard on `content-type`, auth result, record existence, and Zod parsing before mutating state
- Client pages often `.catch(() => router.push(...))` rather than surfacing inline errors
- Lower-level helpers (`getEnv`, `verifyToken`) throw; callers convert failures into responses or redirects
## Cross-Cutting Concerns
- Zod schemas in `packages/core/src/schemas/` are the contract boundary for auth, design payloads, templates, and scene nodes
- Cookie-based JWT auth in `packages/web/src/lib/auth.ts` and `packages/web/src/lib/with-auth.ts`
- JSON serialization/deserialization of `sceneGraph` occurs inside the design routes rather than inside the core package
- The viewport uses R3F + Drei in `packages/web/src/components/editor/ViewportCanvas.tsx`
- Node-to-mesh dispatch happens recursively in `packages/web/src/components/editor/SceneRenderer.tsx`
- Minimal. No dedicated logger, metrics, tracing, or exception sink is present
## Planned vs Implemented
- The architecture matches the MVP direction in the spec: monorepo, shared core package, App Router, Prisma, and immutable scene graph
- The current implementation is still narrower than the design docs: only template mode is materially developed, and the template catalog is smaller than planned
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
