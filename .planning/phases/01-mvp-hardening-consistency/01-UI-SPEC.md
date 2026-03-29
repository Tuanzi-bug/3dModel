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

- Use the existing Tailwind extension in `packages/web/tailwind.config.ts` as the canonical token source.
- Preserve the existing Chinese product voice from `docs/design-system.md`.
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
| Body | 14px | 400 | 1.5 |
| Label | 12px | 600 | 1.4 |
| Heading | 18px | 600 | 1.4 |
| Display | 36px | 600 | 1.2 |

### Type Rules

- Use only these four sizes in Phase 1 surfaces.
- Use only weights `400` and `600`.
- Editor chrome, property labels, status text, and metadata should stay in Body or Label sizes.
- The dashboard page title may use Display size; section titles should use Heading size.

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
- Focus states use the accent color only on the active field or primary action.
- White panels on slate backgrounds must preserve strong text contrast using the current slate palette.
- Empty-state and error copy must be understandable without relying on color alone.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-03-29
