# ShelfCraft Design System

> 3D 模块化货架设计器 - UI/UX 设计规范

## 品牌

**名称**: ShelfCraft
**定位**: 专业的 3D 模块化货架设计工具
**目标用户**: 家居设计师、仓储规划师、零售空间设计师

**语言**: 所有界面文字使用中文（按钮、标签、提示、错误信息等）

---

## 设计理念

**参考**: Figma 的简洁专业风格
**核心原则**:
- 工具感优先，减少装饰
- 快速响应，流畅交互
- 清晰的视觉层次
- 专注于 3D 内容展示

---

## 配色方案

### 主色调（工业灰 + 安全橙）

```css
/* Primary - 工业灰 */
--color-primary: #64748B;        /* Slate 500 */
--color-primary-hover: #475569;  /* Slate 600 */
--color-primary-light: #94A3B8;  /* Slate 400 */

/* Accent - 安全橙（行动号召） */
--color-accent: #F97316;         /* Orange 500 */
--color-accent-hover: #EA580C;   /* Orange 600 */
--color-accent-light: #FB923C;   /* Orange 400 */

/* Neutral - 背景与文字 */
--color-bg: #F8FAFC;             /* Slate 50 */
--color-surface: #FFFFFF;        /* White */
--color-border: #E2E8F0;         /* Slate 200 */
--color-border-hover: #CBD5E1;   /* Slate 300 */

/* Text */
--color-text-primary: #0F172A;   /* Slate 900 */
--color-text-secondary: #475569; /* Slate 600 */
--color-text-muted: #64748B;     /* Slate 500 */
```

### Tailwind 配置

```js
// tailwind.config.ts
colors: {
  primary: {
    DEFAULT: '#64748B',
    hover: '#475569',
    light: '#94A3B8',
  },
  accent: {
    DEFAULT: '#F97316',
    hover: '#EA580C',
    light: '#FB923C',
  },
}
```

---

## 字体系统

**字体家族**: Inter (全局统一)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### 字体层级

| 用途 | 大小 | 粗细 | 行高 | Tailwind Class |
|------|------|------|------|----------------|
| H1 - 页面标题 | 36px | 700 | 1.2 | `text-4xl font-bold` |
| H2 - 区块标题 | 24px | 600 | 1.3 | `text-2xl font-semibold` |
| H3 - 卡片标题 | 18px | 600 | 1.4 | `text-lg font-semibold` |
| Body - 正文 | 14px | 400 | 1.5 | `text-sm` |
| Small - 辅助文字 | 12px | 400 | 1.4 | `text-xs` |
| Button - 按钮文字 | 14px | 500 | 1 | `text-sm font-medium` |

---

## 组件规范

### 按钮

**主按钮（Primary）**
```tsx
className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg
           font-medium transition-colors duration-200 cursor-pointer"
```

**次要按钮（Secondary）**
```tsx
className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg
           font-medium transition-colors duration-200 cursor-pointer"
```

**幽灵按钮（Ghost）**
```tsx
className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2
           rounded-lg font-medium transition-colors duration-200 cursor-pointer"
```

**图标按钮**
```tsx
className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200
           cursor-pointer"
```

### 卡片

**标准卡片**
```tsx
className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm
           hover:shadow-md hover:border-slate-300 transition-all duration-200
           cursor-pointer"
```

**无边框卡片（Dashboard）**
```tsx
className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md
           transition-shadow duration-200 cursor-pointer"
```

### 表单

**输入框**
```tsx
className="w-full px-3 py-2 border border-slate-300 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
           transition-colors duration-200"
```

**标签**
```tsx
className="block text-sm font-medium text-slate-700 mb-1"
```

**错误状态**
```tsx
className="w-full px-3 py-2 border border-red-500 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-red-500"
// 错误提示
className="text-xs text-red-600 mt-1"
```

### 导航栏

**浮动导航栏（Figma 风格）**
```tsx
className="fixed top-4 left-4 right-4 bg-white/90 backdrop-blur-sm
           border border-slate-200 rounded-xl px-6 py-3 shadow-sm z-50"
```

### 3D 编辑器区域

**工作区背景**
```tsx
className="bg-slate-100"
```

**浮动工具栏**
```tsx
className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm
           border border-slate-200 rounded-lg p-2 shadow-sm"
```

**属性面板**
```tsx
className="absolute top-4 right-4 w-80 bg-white border border-slate-200
           rounded-xl p-4 shadow-lg max-h-[calc(100vh-8rem)] overflow-y-auto"
```

---

## 图标系统

**图标库**: Lucide React

```bash
pnpm add lucide-react
```

**使用示例**
```tsx
import { Box, Grid3x3, Save, Download } from 'lucide-react'

<Box className="w-5 h-5 text-slate-600" />
```

**图标尺寸规范**
- 小图标：`w-4 h-4` (16px)
- 标准图标：`w-5 h-5` (20px)
- 大图标：`w-6 h-6` (24px)

---

## 动画与交互

### 过渡时间

| 类型 | 时长 | 用途 |
|------|------|------|
| 快速 | 150ms | 按钮悬停、颜色变化 |
| 标准 | 200ms | 卡片悬停、边框变化 |
| 慢速 | 300ms | 模态框、抽屉打开 |

### 微交互

**悬停反馈**
- 按钮：颜色加深
- 卡片：阴影增强 + 边框变化
- 图标按钮：背景色出现

**加载状态**
```tsx
// 使用 Lucide 的 Loader2 图标
<Loader2 className="w-5 h-5 animate-spin" />
```

**成功/错误状态**
- 成功：绿色边框 + 勾选图标（200ms 淡入）
- 错误：红色边框 + 错误图标（200ms 淡入）

### 尊重用户偏好

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 页面布局

### Landing Page（简洁版）

**结构**
```
┌─────────────────────────────────────┐
│  Navbar (浮动)                       │
├─────────────────────────────────────┤
│                                     │
│  Hero Section                       │
│  - 标题 + 副标题                     │
│  - CTA 按钮                         │
│  - 3D 预览图/动画                    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Features (3 列)                    │
│  - 3D 可视化                        │
│  - 模板库                           │
│  - 快速导出                         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  CTA Section                        │
│  - 开始设计按钮                      │
│                                     │
└─────────────────────────────────────┘
```

### Dashboard

**结构**
```
┌─────────────────────────────────────┐
│  Navbar (固定)                       │
├─────────────────────────────────────┤
│  Header                             │
│  - "我的设计" + 新建按钮              │
├─────────────────────────────────────┤
│                                     │
│  Design Grid (响应式)                │
│  - 卡片网格                          │
│  - 缩略图 + 名称 + 日期               │
│                                     │
└─────────────────────────────────────┘
```

### Editor

**结构**
```
┌─────────────────────────────────────┐
│  Toolbar (顶部固定)                  │
│  - Logo + 设计名称 + 保存/导出        │
├──┬──────────────────────────────┬───┤
│工│                              │属 │
│具│      3D Canvas               │性 │
│栏│      (React Three Fiber)     │面 │
│  │                              │板 │
│  │                              │   │
└──┴──────────────────────────────┴───┘
```

---

## 响应式断点

```js
// tailwind.config.ts
screens: {
  'sm': '640px',   // 手机横屏
  'md': '768px',   // 平板
  'lg': '1024px',  // 笔记本
  'xl': '1280px',  // 桌面
  '2xl': '1536px', // 大屏
}
```

**设计策略**：桌面端优先，移动端自适应
- 默认样式为桌面端（1280px+）
- 使用 `max-md:` `max-lg:` 等前缀适配小屏
- 关键原则：
  - 桌面：多列布局、侧边栏、浮动面板
  - 平板：2列布局、可折叠侧边栏
  - 手机：单列布局、底部导航、全屏模态框

**自适应要点**：
- 文字大小：桌面 `text-base`，移动 `max-md:text-sm`
- 间距：桌面 `p-6`，移动 `max-md:p-4`
- 按钮：桌面 `px-6 py-3`，移动 `max-md:px-4 max-md:py-2`
- 导航：桌面浮动，移动固定顶部
- 卡片网格：桌面 3-4列，平板 2列，手机 1列

---

## 可访问性（A11y）

### 必须遵守

- [ ] 所有图片有 `alt` 属性
- [ ] 表单输入框有 `<label>` 或 `aria-label`
- [ ] 按钮有清晰的文字或 `aria-label`
- [ ] 颜色对比度 ≥ 4.5:1（文字与背景）
- [ ] 键盘可访问（Tab 导航）
- [ ] Focus 状态可见（`focus:ring-2`）
- [ ] 尊重 `prefers-reduced-motion`

---

## 交付前检查清单

### 视觉质量
- [ ] 无 emoji 作为图标（使用 Lucide SVG）
- [ ] 所有图标来自 Lucide React
- [ ] 悬停状态不导致布局偏移（避免 scale）
- [ ] 使用主题色（`bg-primary` 而非 `bg-slate-500`）

### 交互
- [ ] 所有可点击元素有 `cursor-pointer`
- [ ] 悬停状态有清晰视觉反馈
- [ ] 过渡流畅（150-300ms）
- [ ] 键盘导航的 Focus 状态可见

### 布局
- [ ] 浮动元素与边缘有适当间距
- [ ] 无内容被固定导航栏遮挡
- [ ] 响应式：375px, 768px, 1024px, 1440px
- [ ] 无横向滚动（移动端）

### 可访问性
- [ ] 所有图片有 alt 文本
- [ ] 表单输入框有标签
- [ ] 颜色对比度 ≥ 4.5:1
- [ ] `prefers-reduced-motion` 已处理

---

## 参考资源

- **Figma**: 简洁专业的工具 UI 风格
- **Lucide Icons**: https://lucide.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Radix UI**: https://www.radix-ui.com/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/
