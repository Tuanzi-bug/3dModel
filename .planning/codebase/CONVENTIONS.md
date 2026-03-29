# Coding Conventions

**Analysis Date:** 2026-03-29

## Naming Patterns

**Files:**
- `kebab-case` for most TS modules, hooks, libs, and templates such as `scene-tree.ts`, `use-auto-save.ts`, `single-shelf.ts`
- `PascalCase.tsx` for React components such as `EditorShell.tsx`, `SceneRenderer.tsx`, `PropertiesPanel.tsx`
- `page.tsx` and `route.ts` follow Next App Router conventions under `packages/web/src/app/`
- Tests use `*.test.ts` or `*.test.tsx`

**Functions:**
- `camelCase` for utilities and hook internals such as `hashPassword`, `verifyToken`, `handleDelete`, `handleAdd`
- Async helpers usually do not receive an `Async` suffix
- Event handlers tend to use `handle*` naming in components

**Variables:**
- `camelCase` for locals and state
- `UPPER_SNAKE_CASE` for module-level constants such as `AUTO_SAVE_DELAY`, `LOCAL_STORAGE_KEY`, `MAX_HISTORY`
- Zustand selectors use short `s` parameters, e.g. `useEditorStore((s) => s.sceneGraph)`

**Types:**
- `PascalCase` for interfaces and type aliases such as `DesignDTO`, `TemplateParams`, `NodePatch`
- No `I` prefix usage
- Scene node type strings are lower camel / lower-case literals such as `'crossClamp'`, `'fixedRing'`, `'teeConnector'`

## Code Style

**Formatting:**
- TypeScript-first ESM modules
- Single quotes dominate source files
- Semicolons are generally omitted
- Trailing commas are common in multiline objects and parameter lists
- Two-space indentation is consistent in most files

**Linting / Formatting Enforcement:**
- Root and workspace scripts expose `lint`, but no checked-in ESLint config was found
- No Prettier config was found
- Practical implication: the style is consistent, but enforcement appears convention-driven rather than tool-enforced

## Import Organization

**Order:**
1. Framework / external packages
2. Workspace package imports such as `@3d-modeler/core`
3. App alias imports using `@/`
4. Relative imports

**Grouping:**
- Imports are usually grouped by source type with blank lines between major groups
- Type-only imports are sometimes separated with `import type`, especially for Three.js and shared types

**Path Aliases:**
- `@/` maps to `packages/web/src/` via `packages/web/vitest.config.ts` and TS config
- `@3d-modeler/core` is the internal workspace package boundary

## Error Handling

**Patterns:**
- Route handlers validate `content-type`, parse JSON, and return structured JSON errors with `success: false`
- Zod `safeParse()` is preferred at API boundaries
- Utility helpers throw on invalid env or invalid tokens, with routes/hooks converting failures into user-facing responses or redirects
- Client pages often recover with `router.push(...)` rather than inline retry/error state

**Error Types:**
- API errors use string codes such as `VALIDATION_ERROR`, `UNAUTHORIZED`, `DESIGN_NOT_FOUND`
- Hooks commonly rethrow `Error` with the server-provided message, e.g. `packages/web/src/hooks/use-auth.ts`

## Logging

**Framework:**
- No dedicated logger or logging convention found

**Patterns:**
- The codebase favors returning explicit errors over logging context
- Tests also do not assert on logs, reinforcing that logging is currently not a first-class pattern

## Comments

**When to Comment:**
- Comments explain intent, UX behavior, or test sections rather than every line
- Chinese comments are common in UI and tests
- Examples: keyboard shortcut notes in `packages/web/src/components/editor/EditorShell.tsx`, section banners in Playwright specs

**Special Cases:**
- `// @ts-nocheck` is used in `packages/web/src/components/editor/SceneRenderer.tsx` and `packages/web/src/components/editor/ViewportCanvas.tsx` to suppress unresolved R3F typing issues
- TODO-style comments are rare; the current code prefers direct implementation notes

## Function Design

**Patterns:**
- Small focused helpers are common in `packages/core/src/utils/` and `packages/web/src/lib/`
- Route files export one function per HTTP method and keep per-method logic inline
- Guard clauses are preferred for auth, invalid input, and missing records
- Hooks frequently combine refs, effects, and memoized callbacks

**State Access:**
- React components generally subscribe via narrow Zustand selectors
- Imperative actions inside effects or keyboard handlers call `useEditorStore.getState()` directly

## Module Design

**Exports:**
- Named exports are the default for shared modules, hooks, and components
- Default exports are mostly reserved for Next page components
- `packages/core/src/index.ts` acts as the public barrel surface for the shared package

**Patterns:**
- Shared logic is intentionally pushed into `packages/core/` to keep the web layer thinner
- UI code separates shell/layout components from mesh-rendering components
- API helper modules (`auth.ts`, `env.ts`, `prisma.ts`, `with-auth.ts`) are small and single-purpose

## Testing Conventions

**Vitest Patterns:**
- Tests use `describe` / `it` with explicit arrange-act-assert flow
- `beforeEach` resets global stores or mocks when needed
- Browser globals and framework APIs are stubbed with `vi.mock`, `vi.stubEnv`, and `vi.stubGlobal`

**Fixtures:**
- Test data is usually inline object literals
- Reusable factories appear selectively, e.g. `makeRoot()` in `packages/core/__tests__/utils/scene-tree.test.ts`

## UI / Copy Conventions

- User-facing strings are predominantly Chinese, consistent with `docs/design-system.md`
- Styling is mostly direct Tailwind utility composition rather than design-token helper components
- Icon usage follows Lucide React, usually with `w-4 h-4` or `w-5 h-5`

*Conventions analysis: 2026-03-29*
*Update when linting, formatting, or major coding patterns change*
