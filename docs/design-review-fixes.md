# 设计文档修复清单

> 针对 `docs/2026-03-23-3d-modeler-design.md` 的审查结果
> 审查日期: 2026-03-23

---

## CRITICAL（实现前必须修复）

### C1. SceneRenderer 缺少 `group` 节点处理

**位置**: Section 8.1 `componentRegistry` + Section 8.2 `SceneRenderer`

**问题**: `componentRegistry` 无 `group` 条目，根节点 `type: 'group'` 渲染时 `componentRegistry['group']` 为 `undefined`，导致 React 崩溃。

**修复内容**:
- Section 8.2 的 `SceneRenderer` 代码改为：
```tsx
function SceneRenderer({ node }: { node: SceneNode }) {
  const MeshComponent = node.type !== 'group' ? componentRegistry[node.type] : null
  return (
    <group position={node.position} rotation={node.rotation}>
      {MeshComponent && <MeshComponent params={node.params} nodeId={node.id} />}
      {node.children.map(child => (
        <SceneRenderer key={child.id} node={child} />
      ))}
    </group>
  )
}
```

---

### C2. `rotation` 未指定单位和 Euler 顺序

**位置**: Section 4.1 `Vec3` 类型定义 + Section 4.4 场景树示例

**问题**: 未说明 rotation 是弧度还是角度、Euler 顺序。示例中没有任何 rotation 值，无法表达水平光轴。

**修复内容**:
- Section 4.1 的 `Vec3` 定义后添加：
```
**rotation 约定**：单位为弧度，Euler 顺序 XYZ（与 Three.js 默认一致）。
例：绕 X 轴旋转 90°（水平光轴）→ rotation: [Math.PI / 2, 0, 0]
```
- Section 4.4 场景树示例中补充水平光轴的 rotation 示例（目前所有组件 rotation 都缺失）

---

### C3. JWT 密钥管理未指定

**位置**: Section 12 认证流程

**问题**: 未提及 `JWT_SECRET` 环境变量，无 `.env.example`，无启动校验。

**修复内容**:
- Section 12 末尾添加新小节 `12.2 环境变量`：
```markdown
### 12.2 环境变量

| 变量 | 必须 | 说明 |
|------|------|------|
| `JWT_SECRET` | 是 | JWT 签名密钥，最少 32 字符随机字符串 |
| `DATABASE_URL` | 是 | SQLite 数据库路径，如 `file:./dev.db` |

应用启动时校验必须变量存在，缺失则 fail fast。
提供 `.env.example` 文件作为模板。
```

---

### C4. 缺少资源级权限校验说明（IDOR 漏洞）

**位置**: Section 6 API 设计

**问题**: `PUT/DELETE /api/designs/:id` 未明确要求校验 `design.userId === currentUserId`。

**修复内容**:
- Section 6 API 表格下方添加：
```markdown
**权限校验规则**：
- `GET/PUT/DELETE /api/designs/:id`：`withAuth` 中间件提取 userId 后，
  必须校验 `design.userId === req.userId`，否则返回 403 `DESIGN_FORBIDDEN`
- 所有 `/api/designs/*` 端点仅返回当前用户的数据
```

---

## HIGH（实现时会导致 bug 或混乱）

### H1. Design 类型 TS ↔ Prisma 序列化边界未定义

**位置**: Section 4.1 `Design` interface vs Section 5 Prisma schema

**问题**: TS 是 `sceneGraph: SceneNode`，Prisma 是 `sceneGraph String`。未说明在哪一层做 JSON.parse/stringify。

**修复内容**:
- Section 4.1 `Design` interface 后添加：
```markdown
**序列化边界**：
- DB 层（Prisma）：`sceneGraph` 为 JSON 字符串
- API 层：API Routes 负责 `JSON.parse`（读取时）和 `JSON.stringify`（写入时）
- 前端层：始终操作 `SceneNode` 对象，不接触 JSON 字符串

建议定义两个类型：
- `DesignRecord`：对应 Prisma 模型，`sceneGraph: string`
- `DesignDTO`：API 响应类型，`sceneGraph: SceneNode`
```

### H2. `createdAt/updatedAt` 类型不匹配

**位置**: Section 4.1 `Design` interface vs Section 5 Prisma schema

**问题**: TS 声明为 `string`，Prisma 返回 `Date` 对象。

**修复内容**:
- Section 4.1 `Design` interface 中将注释改为：
```typescript
interface Design {
  // ...
  createdAt: string   // ISO 8601 字符串（API 响应层序列化）
  updatedAt: string   // Prisma 返回 Date，API Route 中 JSON.stringify 自动转为 ISO string
}
```
- 或者将此差异纳入 H1 的 `DesignRecord` vs `DesignDTO` 方案统一处理

### H3. `updateNodeParams` 类型签名丢失判别联合安全

**位置**: Section 7.2 `EditorStore`

**问题**: `params: SceneNode['params']` 是所有 params 的联合类型，编译期无法防止 type/params 不匹配。

**修复内容**:
- 将签名改为泛型约束：
```typescript
updateNodeParams: <T extends SceneNode['type']>(
  id: string,
  type: T,
  params: Extract<SceneNode, { type: T }>['params']
) => void
```
- 或保留当前签名，但在说明中明确：**运行时通过 Zod discriminated union 校验，编译期不保证匹配**

### H4. `PUT` 语义与可选字段矛盾

**位置**: Section 6 `PUT /api/designs/:id`

**问题**: 标注 "全量更新" 但 body 有可选字段 `name?`、`thumbnail?`，违反 PUT 语义。

**修复内容**（二选一）:
- **方案 A**（推荐）：改为 `PATCH /api/designs/:id`，说明 "部分更新，省略的字段不修改"
- **方案 B**：保持 `PUT`，将所有字段改为必填：`{ name, sceneGraph, thumbnail }`

### H5. base64 缩略图存 DB 的迁移路径不清晰

**位置**: Section 5 Prisma schema + Section 11.3 缩略图生成

**问题**: base64 存入 SQLite String 字段，单条可达 200KB，影响 B-tree 性能。更关键的是 API 契约问题：如果后续迁移到对象存储，返回值从 base64 变成 URL，前端代码必须改。

**修复内容**:
- 明确 API 层始终返回 **URL 格式**（MVP 阶段用 `data:image/jpeg;base64,...` 作为 URL）
- 这样迁移到对象存储时只需改后端，前端 `<img src={url}>` 无需变更
- 在 Section 11.3 添加说明

### H6. SceneNode 缺少 `scale` 属性

**位置**: Section 4.1 SceneNode 类型定义

**问题**: 无 `scale`，Phase 2 自由模式无法通过拖拽缩放组件。

**修复内容**:
- 在 Section 4.5 "设计决策" 中添加：
```markdown
**无 scale 属性**：组件尺寸完全由 params 控制（如 rod.length、shelf.width），
不支持非等比缩放。Phase 2 自由模式下，调整尺寸必须通过属性面板修改 params，
不提供拖拽 scale handles。这是有意简化——模块化组件有固定规格，自由缩放不符合物理约束。
```

### H7. CSRF 保护方案未确定

**位置**: Section 12

**问题**: 仅说 "需配置 CSRF 保护" 但未选定方案。

**修复内容**:
- 替换为具体方案：
```markdown
**CSRF 防护**：Cookie 设置 `SameSite=Lax`。
所有 state-mutating API（POST/PUT/DELETE）要求 `Content-Type: application/json`，
浏览器表单提交无法设置此 header，天然防御 CSRF。
不额外引入 CSRF token 机制（MVP 阶段足够）。
```

---

## MEDIUM（影响开发效率和架构一致性）

### M1. Undo/Redo 架构重复定义

**位置**: Section 7.2 `EditorStore.past/future` vs Section 11.1 `HistoryManager`

**修复**: 删除 Section 11.1 的独立 `HistoryManager` interface，统一为 EditorStore 内置。添加说明：
> undo/redo 通过 Zustand store 的 `past`/`future` 数组实现，`maxHistory` 为 50，超出时丢弃最旧快照。

### M2. `addNode` 签名缺少 `params` 参数

**位置**: Section 7.2 `addNode`

**修复**: 改为 `addNode: (type: SceneNode['type'], position: Vec3, params?: Partial<SceneNode['params']>) => void`。
添加说明：未传 params 时使用各组件类型的默认值（需在 Section 4.2 定义每种组件的 `defaultParams`）。

### M3. 设计列表无排序规则

**位置**: Section 6 `GET /api/designs`

**修复**: 表格说明改为：`获取当前用户设计列表（分页，默认按 updatedAt DESC 排序）`

### M4. 无独立 rename 端点

**位置**: Section 6

**修复**: 如果采用 H4 方案 A（PATCH），此问题自动解决——`PATCH { name: "新名称" }` 即可。

### M5. 自动保存与手动保存竞态

**位置**: Section 11.2

**修复**: 在 Section 11.2 添加：
> 手动保存触发时，取消当前 debounce 定时器。使用 `updatedAt` 乐观锁：
> PUT 请求携带 `expectedUpdatedAt`，服务端校验不匹配则返回 409 Conflict。

### M6. Monorepo 工具未选型

**位置**: Section 2.1

**修复**: 在 Section 2.1 顶部添加：
```markdown
**Monorepo 工具**：pnpm workspaces + Turborepo
- pnpm：高效磁盘使用，原生 workspace 支持
- Turborepo：增量构建缓存，适配 Next.js 生态
```

### M7. 部署策略缺失（影响 SQLite 可行性）

**位置**: 新增 Section（建议作为 Section 16）

**修复**: 添加部署章节：
```markdown
## 16. 部署策略

MVP 部署目标：单台 VPS（如 Fly.io / Railway），支持 SQLite 持久化。
- Docker 化部署，数据卷持久化 SQLite 文件
- 不使用 Vercel/Netlify（serverless 不支持 SQLite 持久写入）
- 后续可迁移到 Turso（SQLite 兼容）或 PostgreSQL
```

### M8. EditorStore 缺少 `templateParams` 字段

**位置**: Section 7.2 `EditorStore`

**修复**: 在 EditorStore interface 中添加：
```typescript
templateId: string | null
templateParams: TemplateParams | null
```

### M9. Phase 3 类型（ledStrip/backPanel）过早引入

**位置**: Section 4.1 SceneNode 类型 + Section 8.1 componentRegistry

**修复**: 在 Section 4.1 添加说明：
> Phase 1 实现时，`ledStrip` 和 `backPanel` 类型保留在类型定义中（前向兼容），
> 但 componentRegistry 中注册为 placeholder 组件（渲染为灰色半透明 box + "Phase 3" 标签），
> 避免未知类型导致渲染崩溃。

### M10. Editor 页面缺少 loading/404/离线状态

**位置**: Section 7.3 / 7.4

**修复**: 在 Section 7.4 添加：
```markdown
**编辑器页面生命周期**：
- 加载中：显示骨架屏（左中右三栏 placeholder）
- 设计不存在（404）：跳转 /dashboard 并 toast 提示
- 网络离线：banner 提示 "离线模式，修改已保存到本地"，恢复后自动同步
- 自动保存失败：toast 警告，不阻断编辑
```

---

## LOW（文档规范性）

| # | 问题 | 修复 |
|---|------|------|
| L1 | `maxHistory: 50` 是字面量类型 | 改为 `maxHistory: number // default: 50` |
| L2 | 路由用 `:id` 而非 Next.js `[id]` | Section 7.1 统一改为 `/editor/[id]` 并注明 |
| L3 | API 路径 `:id` 同上 | Section 6 表格加注 "`:id` 为参数占位符，实际文件路径 `[id]`" |
| L4 | 未列出 `@react-three/drei` 依赖 | Section 2 技术栈表添加 drei + postprocessing |
| L5 | `<gridHelper>` vs `<Grid>` 不一致 | 统一为 `<Grid>`（drei），Section 8.4 同步修改 |
| L6 | `nanoid` 版本未指定 | Section 4.1 注明 "nanoid v3（CJS 兼容）或确认项目全 ESM" |
| L7 | 场景树示例物理不合理 | 补充说明 "光轴长度 = 架体总高度，顶部预留空间用于固定环/端盖" |
| L8 | 未处理 WebGL context loss | Section 8 添加 "监听 `webglcontextlost`，显示 '点击重新加载' 遮罩" |

---

## 修复优先级建议

```
实现前必修（阻塞开发）:
  C1 → C3 → C4 → C2 → H4 → M7 → M6

实现中修复（影响代码质量）:
  H1 → H2 → H3 → H7 → M1 → M8 → M2

可延后（不影响 MVP 功能）:
  H5 → H6 → M3~M5 → M9 → M10 → L1~L8
```
