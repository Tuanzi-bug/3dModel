# Architecture

**Analysis Date:** 2026-03-29

## Pattern Overview

**Overall:** Full-stack monorepo web application with a shared domain package

**Key Characteristics:**
- Single repo with two active workspaces: shared domain logic in `packages/core/` and the web app in `packages/web/`
- Next.js App Router handles both UI and server endpoints under `packages/web/src/app/`
- Editor state is client-side and long-lived via Zustand in `packages/web/src/stores/editor-store.ts`
- The canonical modeling contract is an immutable scene graph shared across UI, API validation, and persistence
- Persistence is synchronous request/response against Prisma + SQLite; there is no background job or external service tier

## Layers

**Domain Layer:**
- Purpose: define shared types, schemas, templates, and scene-tree utilities
- Contains: `packages/core/src/types/`, `packages/core/src/schemas/`, `packages/core/src/templates/`, `packages/core/src/utils/`
- Depends on: `zod`, `nanoid`
- Used by: API routes, editor store, rendering components, tests

**Application Server Layer:**
- Purpose: expose data/auth/template endpoints and mediate persistence
- Contains: `packages/web/src/app/api/`
- Depends on: `@3d-modeler/core`, Prisma client, auth helpers in `packages/web/src/lib/`
- Used by: browser clients via `fetch()`

**Client State Layer:**
- Purpose: hold the active design, selection, mode, history, and template state
- Contains: `packages/web/src/stores/editor-store.ts`
- Depends on: shared core functions such as `updateNode`, `duplicateNode`, `getTemplateById`, `regenerateNodeIds`
- Used by: editor pages, panels, viewport, hooks

**Presentation Layer:**
- Purpose: render the dashboard, auth screens, and 3D editor shell
- Contains: `packages/web/src/app/` pages plus `packages/web/src/components/`
- Depends on: Zustand selectors, internal API routes, Lucide, R3F/Drei
- Used by: the browser runtime

**Persistence Layer:**
- Purpose: persist users and saved designs
- Contains: `packages/web/prisma/schema.prisma`, `packages/web/prisma/migrations/`, `packages/web/src/lib/prisma.ts`
- Depends on: SQLite via `DATABASE_URL`
- Used by: auth and design API routes

## Data Flow

**Create New Template-Based Design:**
1. User opens `packages/web/src/app/dashboard/page.tsx`
2. Dashboard fetches `/api/designs` and `/api/templates`
3. User navigates to `packages/web/src/app/editor/new/page.tsx?template=...`
4. Page resolves a template from `@3d-modeler/core` and calls `useEditorStore.getState().applyTemplate(...)`
5. Store generates a new scene graph and initializes editor state
6. The page POSTs the scene graph to `/api/designs`
7. API route validates with `createDesignSchema`, writes via Prisma, and returns a DTO
8. The editor replaces the URL with `/editor/{id}` and subsequent changes autosave via PATCH

**Edit Existing Design:**
1. User opens `packages/web/src/app/editor/[id]/page.tsx`
2. The page fetches `/api/designs/{id}`
3. API handler authenticates via `withAuth()`, loads from Prisma, and parses stored JSON
4. `loadDesign()` hydrates the Zustand store
5. `EditorShell` renders panels + viewport against the store state

**Authentication Flow:**
1. Client calls `/api/auth/register` or `/api/auth/login` from `packages/web/src/hooks/use-auth.ts`
2. API route validates input with Zod
3. Register hashes password with `bcryptjs`; login verifies hash
4. API route signs JWT with `jose` and writes the `token` cookie
5. Protected routes call `withAuth()` to decode the cookie and derive `userId`

**State Management:**
- In-memory client store owns scene graph, undo/redo stacks, selected node, and design metadata
- Server DB stores only serialized `sceneGraph`, design metadata, and auth records
- Autosave writes to both `localStorage` and the `/api/designs/[id]` PATCH endpoint

## Key Abstractions

**Scene Graph:**
- Purpose: canonical representation of the 3D model
- Examples: `SceneNode`, `Vec3`, component param types in `packages/core/src/types/scene.ts`
- Pattern: discriminated union + immutable tree helpers

**Template Registry:**
- Purpose: map template IDs to metadata and generator functions
- Examples: `templateRegistry`, `getTemplateMetadata()`, `getTemplateById()` in `packages/core/src/templates/registry.ts`
- Pattern: pure-function generation over `TemplateParams`

**Editor Store:**
- Purpose: coordinate UI state, history, selection, template re-generation, and manual editing
- Examples: `applyTemplate`, `updateNodeParams`, `undo`, `redo`, `loadDesign`
- Pattern: centralized Zustand store with imperative `getState()` usage in event handlers and effects

**Mesh Registry:**
- Purpose: map domain node types to renderable R3F components
- Examples: `packages/web/src/components/meshes/registry.ts`
- Pattern: type-to-component lookup used by `SceneRenderer`

## Entry Points

**User-Facing Pages:**
- `packages/web/src/app/page.tsx` - landing page
- `packages/web/src/app/login/page.tsx` - login UI
- `packages/web/src/app/register/page.tsx` - registration UI
- `packages/web/src/app/dashboard/page.tsx` - saved designs + template chooser
- `packages/web/src/app/editor/new/page.tsx` - create workflow
- `packages/web/src/app/editor/[id]/page.tsx` - edit workflow

**API Surface:**
- `packages/web/src/app/api/auth/register/route.ts`
- `packages/web/src/app/api/auth/login/route.ts`
- `packages/web/src/app/api/auth/logout/route.ts`
- `packages/web/src/app/api/designs/route.ts`
- `packages/web/src/app/api/designs/[id]/route.ts`
- `packages/web/src/app/api/templates/route.ts`
- `packages/web/src/app/api/health/route.ts`

**Shared Package Export Surface:**
- `packages/core/src/index.ts`

## Error Handling

**Strategy:** explicit boundary checks and JSON error payloads at route level; redirect-based recovery in client pages

**Patterns:**
- API handlers guard on `content-type`, auth result, record existence, and Zod parsing before mutating state
- Client pages often `.catch(() => router.push(...))` rather than surfacing inline errors
- Lower-level helpers (`getEnv`, `verifyToken`) throw; callers convert failures into responses or redirects

## Cross-Cutting Concerns

**Validation:**
- Zod schemas in `packages/core/src/schemas/` are the contract boundary for auth, design payloads, templates, and scene nodes

**Authentication:**
- Cookie-based JWT auth in `packages/web/src/lib/auth.ts` and `packages/web/src/lib/with-auth.ts`

**Persistence:**
- JSON serialization/deserialization of `sceneGraph` occurs inside the design routes rather than inside the core package

**Rendering:**
- The viewport uses R3F + Drei in `packages/web/src/components/editor/ViewportCanvas.tsx`
- Node-to-mesh dispatch happens recursively in `packages/web/src/components/editor/SceneRenderer.tsx`

**Logging / Observability:**
- Minimal. No dedicated logger, metrics, tracing, or exception sink is present

## Planned vs Implemented

- The architecture matches the MVP direction in the spec: monorepo, shared core package, App Router, Prisma, and immutable scene graph
- The current implementation is still narrower than the design docs: only template mode is materially developed, and the template catalog is smaller than planned

*Architecture analysis: 2026-03-29*
*Update when layers, runtime boundaries, or major data flows change*
