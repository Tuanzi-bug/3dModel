---
phase: 01
slug: mvp-hardening-consistency
status: approved
shadcn_initialized: false
preset: none
created: 2026-03-29
reviewed_at: 2026-03-29T13:58:47Z
---

# Phase 01 — UI Design Contract

> Visual and interaction contract for the MVP hardening phase. This contract keeps Phase 1 focused on a dependable editor flow, not on expanding template behavior.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | lucide-react |
| Font | Inter |

### Source Baseline

- Use `docs/design-system.md` as the product baseline for palette intent, typography hierarchy, interaction patterns, and Chinese product voice.
- Use `packages/web/tailwind.config.ts` as the current implementation entry for named shared tokens such as `primary`, `accent`, and `accent-hover`.
- Until the Tailwind token surface is expanded, neutral backgrounds, borders, and text may continue to use the existing slate utility scale that matches `docs/design-system.md`.
- Do not introduce a new component system or shadcn migration in Phase 1.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline icon gaps, compact indicators |
| sm | 8px | Dense control spacing, label-to-field gap |
| md | 16px | Default card and control spacing |
| lg | 24px | Sidebar sections, grouped toolbar spacing |
| xl | 32px | Major panel padding and dashboard section gaps |
| 2xl | 48px | Empty-state vertical breathing room |
| 3xl | 64px | Page-level section separation |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Meta / Small | 12px | 400-500 | 1.4 |
| Body | 14px | 400 | 1.5 |
| Button / Control | 14px | 500 | 1 |
| Label / Heading | 18px | 600 | 1.4 |
| Section Heading | 24px | 600 | 1.3 |
| Display | 36px | 700 | 1.2 |

### Type Rules

- Phase 1 should stay within the established design-system hierarchy: 12px, 14px, 18px, 24px, and 36px only.
- Allowed weights are `400`, `500`, `600`, and `700`.
- Editor chrome, property labels, status text, timestamps, and metadata should stay in 12px or 14px styles.
- Buttons and compact controls may use 14px / 500.
- Section titles should use 18px or 24px depending on hierarchy.
- `700` is reserved for page-level titles such as the dashboard heading.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #F8FAFC | App background, viewport surround, page canvas |
| Secondary (30%) | #FFFFFF | Header, side panels, cards, saved-design tiles |
| Accent (10%) | #F97316 | Primary save action, active selection dot, focus ring, selected preset entry state |
| Destructive | #DC2626 | Delete design action and destructive confirmation only |

Accent reserved for: `保存设计` primary action, focused form fields, the active selection indicator in the editor, and the currently emphasized preset-entry state. Never use accent for every clickable element.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | 保存设计 |
| Empty state heading | 还没有设计 |
| Empty state body | 先从一个预置方案开始，进入编辑器后继续调整组件与属性。 |
| Error state | 保存失败，请重试。若问题持续，请返回控制台后重新打开设计。 |
| Destructive confirmation | 删除设计：删除后无法恢复，确认删除此设计吗？ |

### Copy Rules

- Replace template-first wording with preset-entry wording where Phase 1 reframes the flow.
- Preferred labels:
  - Dashboard section: `从预置方案开始`
  - Editor save states: `保存设计` / `保存中...` / `已保存` / `保存失败，请重试`
  - Status/source wording: prefer `来源` or `预置方案` over treating `模板` as the core product concept
- Empty and error states must always include the next step, not just the problem description.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable |
| third-party | none | not applicable |

---

## Screen Focus And Hierarchy

### Dashboard

- First focal point: preset-entry grid near the top of the page.
- Second focal point: saved-design cards.
- The preset-entry section should visually read as the way to start quickly, not as a special editing mode with deeper importance than the editor itself.
- Saved-design cards remain quieter than the create-entry section; they should not compete with the page title or primary creation affordance.

### Editor

- Primary visual anchor: the 3D viewport.
- Primary action anchor: the top-right `保存设计` button in the header.
- Secondary controls: undo/redo in a quieter white-outline treatment beside the save action.
- Support regions: left component panel and right property panel stay white and tool-like, framing the viewport rather than stealing attention from it.
- The selection indicator may use a small accent dot, but broad panel backgrounds must remain neutral.

---

## Responsive Contract

Target checkpoints: `375px`, `768px`, `1024px`, `1440px`

### Dashboard

- At `375px`, use a single-column saved-design list and a 1- to 2-column preset-entry grid with no horizontal scrolling.
- At `768px`, saved designs may expand to 2 columns; preset-entry cards may expand to 2 to 3 columns.
- At `1024px` and above, the current multi-column dashboard layout is acceptable as long as the preset-entry section remains visually first.
- At `1440px`, widen spacing rather than over-emphasizing cards; page title and create-entry section should still dominate visual hierarchy.

### Editor

- At `375px`, the viewport remains the primary surface; side panels must collapse into stacked sections, drawers, or another non-overlapping pattern.
- At `768px`, keep the viewport dominant and allow at most one persistent side panel at a time.
- At `1024px`, the standard header + left panel + viewport + right panel layout is allowed if the viewport remains visually dominant.
- At `1440px`, increase breathing room without turning panels into oversized visual blocks.

### Responsive Rules

- No breakpoint may introduce horizontal page scroll for primary editor or dashboard surfaces.
- Fixed or sticky bars must not cover actionable content.
- Save, undo, redo, and return actions must remain reachable without relying on hover-only behavior.

---

## Phase-Specific UI Contract

### Template Repositioning

- Keep the current dashboard entry path, but present it as a preset starting scene.
- Remove or hide template-parameter editing from the main Phase 1 UI.
- Do not present template regeneration as a core editing concept in buttons, warnings, or status areas.

### Core Hardening Surfaces

- The editor must communicate a stable flow: enter design, edit scene, save, reopen, continue.
- Save feedback stays inline in the header button state rather than introducing toast-heavy behavior.
- Property editing should stay explicit and narrow: edit only the currently selected component and its basic fields.
- Status bars and side panels should expose useful state only; avoid template-heavy status labels that no longer reflect the Phase 1 model.

### Loading And Error Feedback

- Viewport loading uses the existing centered spinner on a neutral slate background.
- Editor-loading fallback copy should be direct and calm, with a clear return path.
- Save failure messaging should remain near the save action and must tell the user what to do next.

---

## Motion And Feedback

- Use fast to standard transitions only: 150ms to 200ms for hover, border, and shadow changes.
- Preserve the existing reduced-motion behavior in `globals.css`.
- Avoid decorative motion in Phase 1. Feedback motion should exist only to confirm hover, focus, loading, and save-state changes.

---

## Accessibility Contract

- Icon-only affordances must keep text or `aria-label` fallback.
- Prefer semantic interactive elements first: `button`, `a`, `input`, and `label` before ARIA-heavy fallbacks.
- All form controls must have a visible label or an accessible name; placeholder text alone is not sufficient.
- Focus states must be visible on all interactive elements. Accent focus is reserved for the active field and primary action; secondary controls may use a neutral slate outline or ring.
- Async save and load status that changes in place should be announced with `aria-live="polite"` or equivalent.
- Save failures and inline validation states should appear near the relevant action or field and use `role="alert"` or equivalent announced error treatment when appropriate.
- Non-semantic interactive containers must support keyboard access, but Phase 1 should prefer semantic elements instead of recreating them.
- White panels on slate backgrounds must preserve strong text contrast using the current slate palette.
- Empty-state and error copy must be understandable without relying on color alone.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Accessibility: PASS
- [x] Dimension 7 Responsive Behavior: PASS
- [x] Dimension 8 Motion And Feedback: PASS
- [x] Dimension 9 Registry Safety: PASS

**Approval:** approved 2026-03-29
