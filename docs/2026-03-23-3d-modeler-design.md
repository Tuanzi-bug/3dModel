# 3D 模块化建模工具 — 设计文档

> Status: Final
> Date: 2026-03-23

## 1. 产品概述

轻量级 Web 3D 建模工具，用于设计模块化框架结构（光轴 + 夹具 + 层板）。

### 1.1 核心功能

- **模式 A（模板快速设计）**：选择预设模板 → 调整尺寸 → 更换组件参数
- **模式 B（自由搭建）**：拖拽组件 → 3D 预览 → 参数调整 → 自动吸附
- 设计保存/加载，跨设备继续编辑

### 1.2 开发阶段

| Phase | 范围 | 优先级 |
|-------|------|--------|
| Phase 1 | 模式 A（模板设计）+ 认证 + 保存/加载 + undo/redo + 自动保存 + 视角控制 | MVP |
| Phase 2 | 模式 B（自由搭建）+ 拖拽放置 + 移动/旋转 + 复制/删除 + 框选 + 快捷键 + 模式切换 | Next |
| Phase 3 | 自动吸附对齐 + 灯带/背板组件 + 尺寸标注 + 预设视角 + 导出 BOM | Later |
| Phase 4 | 微信小程序端（Taro + three-platformize）+ 微信 OAuth | Future |

## 2. 技术栈

| 层 | 选型 | 说明 |
|----|------|------|
| 前端框架 | Next.js (App Router) | 全栈 React 框架 |
| 3D 渲染 | React Three Fiber (R3F) | Three.js 的 React 封装 |
| 状态管理 | Zustand | 轻量，适合 immutable scene graph |
| 后端 | Next.js API Routes | 全栈单体，不需要额外服务 |
| ORM | Prisma | 类型安全的数据库操作 |
| 数据库 | SQLite | MVP 阶段，后续可切 PostgreSQL |
| 认证 | 自实现邮箱+密码 | bcrypt 哈希 + JWT |
| UI 组件 | Tailwind CSS + Radix UI | 实用优先 |

### 2.1 Monorepo 包结构（为跨端复用设计）

**Monorepo 工具**：pnpm workspaces + Turborepo
- pnpm：高效磁盘使用，原生 workspace 支持
- Turborepo：增量构建缓存，适配 Next.js 生态

```
packages/
├── core/              # 平台无关的共享逻辑（从 Phase 1 开始维护）
│   ├── types/         # SceneNode, Design, TemplateParams 等类型定义
│   ├── schemas/       # Zod 校验 schema
│   ├── templates/     # 模板生成函数（纯函数，无 DOM 依赖）
│   └── utils/         # 场景树操作（增删改查节点、深拷贝等）
├── web/               # Next.js + R3F Web 应用（Phase 1-3）
└── miniprogram/       # Taro + three-platformize 小程序端（Phase 4）
```

`packages/core` 从 Phase 1 就独立维护，确保所有业务逻辑不耦合 React/DOM，为后续小程序复用打基础。

## 3. 界面布局

经典三栏布局：

```
┌──────────────────────────────────────────────────┐
│                    Header / Toolbar               │
├────────┬────────────────────────────┬─────────────┤
│        │                            │             │
│ 组件库  │       3D 视口 (R3F)        │  属性面板    │
│ (左侧)  │   旋转 / 缩放 / 平移       │  (右侧)     │
│        │                            │             │
│ - 光轴  │                            │ 光轴长度 ── │
│ - 十字夹│                            │ 层板材质 ── │
│ - 固定环│                            │ 尺寸 W×H×D  │
│ - 三通  │                            │             │
│ - 层板  │                            │             │
│        │                            │             │
├────────┴────────────────────────────┴─────────────┤
│                    Status Bar                     │
└──────────────────────────────────────────────────┘
```

## 4. 核心数据模型

### 4.1 Scene Graph（场景图）

整个系统的核心是一棵 JSON 场景树，所有 3D 状态都由它描述。场景图是 **immutable** 的——每次编辑生成新树，符合 React 范式，也方便做 undo/redo。

```typescript
// --- 组件参数类型（Zod schema 运行时校验） ---

interface RodParams { diameter: 6 | 8 | 13; length: number }
interface CrossClampParams { rodDiameter: 6 | 8 | 13 }
interface FixedRingParams { rodDiameter: 6 | 8 | 13 }
interface TeeConnectorParams { rodDiameter: 6 | 8 | 13 }
interface ShelfParams { width: number; depth: number; thickness: number; material: 'wood' | 'acrylic' | 'metal' }
interface LedStripParams { length: number; color: string }
interface BackPanelParams { width: number; height: number; material: 'wood' | 'acrylic' | 'metal' }

// 判别联合：type 字段决定 params 类型
type SceneNode =
  | { id: string; type: 'rod'; position: Vec3; rotation: Vec3; params: RodParams; children: SceneNode[] }
  | { id: string; type: 'crossClamp'; position: Vec3; rotation: Vec3; params: CrossClampParams; children: SceneNode[] }
  | { id: string; type: 'fixedRing'; position: Vec3; rotation: Vec3; params: FixedRingParams; children: SceneNode[] }
  | { id: string; type: 'teeConnector'; position: Vec3; rotation: Vec3; params: TeeConnectorParams; children: SceneNode[] }
  | { id: string; type: 'shelf'; position: Vec3; rotation: Vec3; params: ShelfParams; children: SceneNode[] }
  | { id: string; type: 'ledStrip'; position: Vec3; rotation: Vec3; params: LedStripParams; children: SceneNode[] }
  | { id: string; type: 'backPanel'; position: Vec3; rotation: Vec3; params: BackPanelParams; children: SceneNode[] }
  | { id: string; type: 'group'; position: Vec3; rotation: Vec3; params: {}; children: SceneNode[] }

type Vec3 = [number, number, number]
```

**rotation 约定**：单位为弧度，Euler 顺序 XYZ（与 Three.js 默认一致）。
例：绕 X 轴旋转 90°（水平光轴）→ `rotation: [Math.PI / 2, 0, 0]`

**运行时校验**：使用 Zod 为每种组件定义 schema，在以下时机校验：
1. 用户通过属性面板修改参数时（即时反馈）
2. 保存到数据库前（防止非法数据持久化）
3. 从数据库加载后（防御性校验）

**ID 生成**：使用 `nanoid(12)` 生成节点 ID，轻量且碰撞概率极低。

```typescript
interface Design {
  id: string
  name: string
  userId: string
  templateId: string | null
  sceneGraph: SceneNode       // 根节点（type: 'group'）
  createdAt: string
  updatedAt: string
  thumbnail: string | null
}
```

**序列化边界**：
- DB 层（Prisma）：`sceneGraph` 为 JSON 字符串
- API 层：API Routes 负责 `JSON.parse`（读取时）和 `JSON.stringify`（写入时）
- 前端层：始终操作 `SceneNode` 对象，不接触 JSON 字符串

建议定义两个类型：
- `DesignRecord`：对应 Prisma 模型，`sceneGraph: string`，`createdAt: Date`
- `DesignDTO`：API 响应类型，`sceneGraph: SceneNode`，`createdAt: string`（ISO 8601）
```

### 4.2 组件参数定义

| 组件 | type | params |
|------|------|--------|
| 光轴 | `rod` | `{ diameter: 6 \| 8 \| 13, length: number }` |
| 十字夹 | `crossClamp` | `{ rodDiameter: 6 \| 8 \| 13 }` |
| 固定环 | `fixedRing` | `{ rodDiameter: 6 \| 8 \| 13 }` |
| 三通 | `teeConnector` | `{ rodDiameter: 6 \| 8 \| 13 }` |
| 层板 | `shelf` | `{ width, depth, thickness, material: 'wood' \| 'acrylic' \| 'metal' }` |
| 灯带 | `ledStrip` | `{ length, color }` (Phase 3) |
| 背板 | `backPanel` | `{ width, height, material }` (Phase 3) |

### 4.3 模板定义

模板 = 一个纯函数 `(params) => SceneNode`，接收用户输入的尺寸参数返回完整场景树。模板是前端代码，不通过 API 传输（`generate` 函数不可序列化）。`GET /api/templates` 返回模板元数据（id, name, category, thumbnail, defaultParams），不含 `generate`。

```typescript
interface TemplateDefinition {
  id: string
  name: string
  category: 'single' | 'multi' | 'corner' | 'lShape' | 'wallMounted' | 'standalone'
  thumbnail: string
  defaultParams: TemplateParams
  generate: (params: TemplateParams) => SceneNode
}

interface TemplateParams {
  width: number
  height: number
  depth: number
  layers: number
  rodDiameter: 6 | 8 | 13
  shelfMaterial: 'wood' | 'acrylic' | 'metal'
}
```

### 4.4 场景树结构示例

以 2 层独立架（width=0.8m, depth=0.4m, height=1.0m, rodDiameter=8）为例，模板 `generate()` 输出的场景树：

```
root (group)
├── rod-front-left   { type: 'rod', position: [0,0,0], rotation: [0,0,0], params: { diameter: 8, length: 1.0 } }
├── rod-front-right  { type: 'rod', position: [0.8,0,0], rotation: [0,0,0], params: { diameter: 8, length: 1.0 } }
├── rod-back-left    { type: 'rod', position: [0,0,0.4], rotation: [0,0,0], params: { diameter: 8, length: 1.0 } }
├── rod-back-right   { type: 'rod', position: [0.8,0,0.4], rotation: [0,0,0], params: { diameter: 8, length: 1.0 } }
├── shelf-bottom     { type: 'shelf', position: [0,0,0], rotation: [0,0,0], params: { width: 0.8, depth: 0.4, thickness: 0.02, material: 'wood' } }
├── shelf-top        { type: 'shelf', position: [0,0.5,0], rotation: [0,0,0], params: { width: 0.8, depth: 0.4, thickness: 0.02, material: 'wood' } }
├── clamp-bl-1       { type: 'crossClamp', position: [0,0,0], rotation: [0,0,0], params: { rodDiameter: 8 } }
├── clamp-br-1       { type: 'crossClamp', position: [0.8,0,0], rotation: [0,0,0], params: { rodDiameter: 8 } }
├── ... (每个层板-光轴交叉点一个 clamp)
```

**树结构说明**：
- 根节点固定为 `type: 'group'`，是所有组件的容器
- **模板模式**：所有组件平铺在 root 下（扁平结构），位置关系由 `position` 决定，`children` 留空。模板函数根据参数计算每个组件的绝对位置。
- **自由搭建模式（Phase 2）**：同样扁平结构，用户通过拖拽决定位置。
- 两种模式的 sceneGraph 结构一致，区别仅在于生成方式（函数计算 vs 用户手动放置）。

### 4.5 模板参数与节点参数的交互

- `updateTemplateParams()` **完全重新生成** sceneGraph，覆盖所有节点——用户对个别节点的修改会丢失
- 这是有意的 trade-off：模板模式的价值是快速出方案，不是精细调节
- 如果用户需要精细控制个别组件，应切换到自由搭建模式（Phase 2）
- Phase 1 在属性面板顶部提示："修改模板参数将重置所有组件"

### 4.6 设计决策

- **Immutable scene graph**：每次编辑生成新树，天然支持 undo/redo。使用 `structuredClone` 深拷贝，场景规模小（< 200 节点）性能无忧。
- **模板 = 纯函数**：无副作用，参数变化时重新生成整棵树，保证一致性
- **JSON 序列化**：保存就是 `JSON.stringify(sceneGraph)`，加载时通过 Zod schema 校验
- **扁平场景树**：模板和自由搭建模式统一使用扁平 children 结构，简化渲染和操作逻辑
- **无 scale 属性**：组件尺寸完全由 params 控制（如 rod.length、shelf.width），不支持非等比缩放。Phase 2 自由模式下，调整尺寸必须通过属性面板修改 params，不提供拖拽 scale handles。这是有意简化——模块化组件有固定规格，自由缩放不符合物理约束。

## 5. 数据库 Schema

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  designs      Design[]
  createdAt    DateTime @default(now())
}

model Design {
  id         String   @id @default(cuid())
  name       String
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  templateId String?
  sceneGraph String   // JSON string, Zod 校验后存入
  thumbnail  String?  // base64 JPEG, MVP 阶段直接存 DB，后续迁移到对象存储
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**MVP 限制**：单用户设计数量暂不限制，场景大小不设硬上限（典型场景 < 50KB JSON）。

## 6. API 设计

| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/auth/register` | 注册，body: `{ email, password }` |
| POST | `/api/auth/login` | 登录，设置 httpOnly cookie |
| POST | `/api/auth/logout` | 登出，清除 cookie |
| GET | `/api/designs?page=1&limit=20` | 获取当前用户设计列表（分页） |
| GET | `/api/designs/:id` | 获取单个设计 |
| POST | `/api/designs` | 创建新设计，body: `{ name, templateId?, sceneGraph }` |
| PATCH | `/api/designs/:id` | 部分更新设计，body: `{ name?, sceneGraph?, thumbnail? }`（省略的字段不修改） |
| DELETE | `/api/designs/:id` | 删除设计 |
| GET | `/api/templates` | 获取模板元数据列表（不含 generate 函数） |

**分页响应格式**：

```typescript
{
  success: true,
  data: Design[],
  pagination: { page: number, limit: number, total: number }
}
```

统一响应格式：

```typescript
// 成功
{ success: true, data: { ... } }
// 失败
{ success: false, error: { code: string, message: string } }
```

JWT 鉴权中间件保护 `/api/designs/*` 端点。

**权限校验规则**：
- `GET/PATCH/DELETE /api/designs/:id`：`withAuth` 中间件提取 userId 后，
  必须校验 `design.userId === req.userId`，否则返回 403 `DESIGN_FORBIDDEN`
- 所有 `/api/designs/*` 端点仅返回当前用户的数据

## 7. 前端架构

### 7.1 页面结构

```
/                         → Landing page（登录/注册入口）
/login                    → 登录
/register                 → 注册
/dashboard                → 设计列表（我的设计 + 新建）
/editor/:id               → 3D 编辑器（核心页面）
/editor/new?template=xxx  → 从模板新建
```

### 7.2 状态管理（Zustand Store）

```typescript
interface EditorStore {
  // 场景状态
  sceneGraph: SceneNode
  selectedNodeId: string | null
  mode: 'template' | 'freeform'

  // 模板状态（模板模式下维护，自由模式下为 null）
  templateId: string | null
  templateParams: TemplateParams | null

  // 历史（undo/redo）
  past: SceneNode[]
  future: SceneNode[]

  // 拖拽状态（Phase 2）
  dragState: DragState

  // 操作 — 所有操作返回新 store（immutable，通过 structuredClone 深拷贝后修改）
  updateNodeTransform: (id: string, updates: { position?: Vec3; rotation?: Vec3 }) => void
  updateNodeParams: (id: string, params: SceneNode['params']) => void  // Zod 校验 type/params 匹配后再更新
  addNode: (type: SceneNode['type'], position: [number, number, number]) => void
  removeNode: (id: string) => void
  duplicateNode: (id: string) => void
  selectNode: (id: string | null) => void
  undo: () => void
  redo: () => void
  applyTemplate: (templateId: string, params: TemplateParams) => void
  updateTemplateParams: (params: Partial<TemplateParams>) => void
}
```

### 7.3 核心组件树

```
<EditorPage>
  ├── <Header>              // 设计名称、保存按钮、返回 dashboard
  ├── <EditorLayout>        // 三栏容器（可拖拽调整宽度）
  │   ├── <ComponentPanel>  // 左栏
  │   │   ├── <TemplateList>      // Phase 1: 模板选择
  │   │   └── <ComponentLibrary>  // Phase 2: 拖拽组件
  │   ├── <Viewport>        // 中栏：R3F Canvas
  │   │   ├── <SceneRenderer>     // 递归渲染 sceneGraph
  │   │   ├── <OrbitControls>     // 旋转/缩放/平移
  │   │   ├── <Grid>              // 地面网格
  │   │   └── <SelectionOutline>  // 选中高亮
  │   └── <PropertiesPanel> // 右栏：选中组件的参数编辑
  │       ├── <NodeTransform>     // 位置/旋转
  │       └── <NodeParams>        // 组件专属参数
  └── <StatusBar>           // 底部：组件数量、视角信息
```

### 7.4 关键交互流程

**Phase 1 — 模板模式**：

```
用户选择模板 → applyTemplate() 生成 sceneGraph
  → 调整尺寸参数 → updateTemplateParams() 重新生成
  → 点击组件 → selectNode() → 右侧显示属性
  → 修改属性 → updateNode() 生成新树 → R3F 重新渲染
  → 点击保存 → PATCH /api/designs/:id
```

**Phase 2 — 自由搭建模式**：

```
组件库拖拽 → 进入 3D 视口 → 放置到场景
  → 选中已有组件 → 拖拽移动位置 / 旋转
  → 调整参数 → 实时预览
```

## 8. 3D 渲染实现

### 8.1 组件几何体映射

```typescript
const componentRegistry = {
  rod:          RodMesh,        // CylinderGeometry
  crossClamp:   CrossClampMesh, // 组合体：两个交叉环形
  fixedRing:    FixedRingMesh,  // TorusGeometry
  teeConnector: TeeMesh,        // T 型组合体
  shelf:        ShelfMesh,      // BoxGeometry
  ledStrip:     LedStripMesh,   // 细长发光体（Phase 3）
  backPanel:    BackPanelMesh,  // 薄 BoxGeometry（Phase 3）
}
```

### 8.2 递归场景渲染器

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

### 8.3 材质系统

| 材质 | Three.js Material | 视觉效果 |
|------|-------------------|----------|
| 金属光轴 | `MeshStandardMaterial` | metalness: 0.8, roughness: 0.2, 银色 |
| 木质层板 | `MeshStandardMaterial` | 木纹贴图, roughness: 0.7 |
| 亚克力层板 | `MeshPhysicalMaterial` | transmission: 0.9, 半透明 |
| 金属层板 | `MeshStandardMaterial` | metalness: 0.6, 深灰 |
| 夹具/连接件 | `MeshStandardMaterial` | metalness: 0.7, 深色金属 |

### 8.4 场景环境

```tsx
<Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
  <ambientLight intensity={0.4} />
  <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
  <OrbitControls enableDamping />
  <gridHelper args={[20, 20, '#444', '#222']} />
  <SceneRenderer node={sceneGraph} />
</Canvas>
```

### 8.5 选中交互

- 点击组件 → raycaster 检测 → `selectNode(id)`
- 选中后显示 outline（`@react-three/postprocessing` 的 Outline 效果）
- 右侧属性面板同步显示该组件参数

## 9. 模式 B — 自由搭建（Phase 2）

### 9.1 拖拽系统

```typescript
interface DragState {
  isDragging: boolean
  draggedType: SceneNode['type'] | null
  ghostPosition: [number, number, number] | null
}
```

流程：
1. 组件库 mousedown → 设置 `draggedType`
2. 进入 Canvas → raycaster 投射到地面/已有组件表面 → 更新 `ghostPosition`
3. 显示半透明 ghost 预览体
4. mouseup → 在 `ghostPosition` 创建真实节点插入 sceneGraph

模式 B 的 sceneGraph 是扁平结构（所有组件平级挂在 root 下），用户通过空间位置关系自行组织。

### 9.2 组件操作工具栏

| 工具 | 快捷键 | 说明 |
|------|--------|------|
| 选择 | `V` | 点击选中，框选多个 |
| 移动 | `G` | TransformControls translate 模式 |
| 旋转 | `R` | TransformControls rotate 模式 |
| 复制 | `Ctrl+D` | 复制选中组件（含参数） |
| 删除 | `Delete` | 删除选中组件 |
| 撤销 | `Ctrl+Z` | undo |
| 重做 | `Ctrl+Shift+Z` | redo |

### 9.3 模式切换

- template → freeform：保留当前 sceneGraph，解锁拖拽/移动
- freeform → template：警告"将清空当前设计"，确认后重新选模板

## 10. 自动吸附对齐（Phase 3）

```typescript
interface SnapSystem {
  enabled: boolean
  gridSize: number          // 网格吸附间距，默认 0.5
  snapToGrid: boolean
  snapToComponent: boolean  // 吸附到已有组件端点
  snapThreshold: number     // 吸附触发距离，默认 0.3
}

interface SnapPoint {
  nodeId: string
  position: [number, number, number]
  direction: [number, number, number]  // 法向量
  type: 'end' | 'middle' | 'surface'
}
```

吸附逻辑：
1. 拖拽组件时，计算该组件所有 snapPoint 与场景中已有 snapPoint 的距离
2. 距离 < `snapThreshold` → 修正组件位置到对齐位置
3. 视觉反馈：蓝色辅助线 + 吸附点高亮

## 11. 辅助功能

### 11.1 Undo/Redo

通过 Zustand EditorStore 的 `past`/`future` 数组实现（见 Section 7.2）。每次编辑将当前 sceneGraph 推入 `past`，上限 50 条，超出丢弃最旧快照。`undo` 将当前 sceneGraph 推入 `future` 并从 `past` 弹出恢复；`redo` 反向操作。

### 11.2 自动保存

- 防抖 3 秒：编辑后 3 秒无操作触发 `PATCH /api/designs/:id`
- 离线兜底：每次编辑同时写 `localStorage`，下次打开提示恢复

### 11.3 缩略图生成

保存时从 R3F canvas 截图：`gl.domElement.toDataURL('image/jpeg', 0.6)`

- 截图前将 canvas 缩放到 400x300（避免大图）
- base64 字符串上限 200KB，超限则降低质量重试
- `GET /api/designs` 列表接口不返回 thumbnail 字段（仅 `GET /api/designs/:id` 返回），避免列表响应过大
- **API 返回格式**：`thumbnail` 字段始终返回可直接用于 `<img src>` 的 URL。MVP 阶段为 `data:image/jpeg;base64,...` data URL，后续迁移对象存储时改为 HTTPS URL，前端代码无需变更

### 11.4 视角控制

| 操作 | 交互 |
|------|------|
| 旋转视角 | 鼠标左键拖拽 |
| 平移视角 | 鼠标右键拖拽 / 中键 |
| 缩放 | 滚轮 |
| 重置视角 | 双击空白处 / `Home` 键 |
| 预设视角 | 正面 / 俯视 / 侧面 / 等轴（Phase 3） |

### 11.5 场景辅助元素

| 元素 | 说明 | 可开关 |
|------|------|--------|
| 网格地面 | 灰色参考网格 | 是 |
| 坐标轴 | XYZ 轴指示器（右下角） | 是 |
| 尺寸标注 | 选中组件时显示长/宽/高（Phase 3） | 是 |
| 组件数量 | 底部状态栏显示当前场景组件总数 | 否 |

## 12. 认证流程

```
注册: email + password → 格式校验 → bcrypt hash → 存 User 表 → 设置 httpOnly cookie
登录: email + password → bcrypt verify → 设置 httpOnly cookie
鉴权: 浏览器自动携带 cookie → withAuth 中间件解析 JWT → 注入 userId
登出: 清除 cookie
```

- JWT 有效期 7 天，存 **httpOnly cookie**（浏览器自动携带，无需手动 Authorization header）
- 需配置 CSRF 保护：Cookie 设置 `SameSite=Lax`；所有 state-mutating API（POST/PATCH/DELETE）要求 `Content-Type: application/json`，服务端校验此 header——浏览器表单提交无法伪造 JSON content-type，天然防御 CSRF
- 登录接口速率限制：同一 IP 每分钟最多 5 次失败尝试，超限返回 429
- 注册接口速率限制：同一 IP 每小时最多 10 次，超限返回 429
- 密码最少 8 位，邮箱格式校验
- `withAuth` 中间件包裹 `/api/designs/*`
- MVP 不实现：密码重置、邮箱验证、token 刷新（过期后重新登录）
- 仅支持桌面端浏览器

### 12.1 多端认证扩展规划（Phase 4）

后续接入微信小程序时，认证模块需支持多种登录方式：

```
Web 端:    邮箱+密码 → JWT cookie（现有方案）
小程序端:  wx.login() → code → 后端换 session_key → JWT token（header 传输）
```

数据库扩展：

```prisma
// Phase 4 新增
model User {
  // ...existing fields
  wxOpenId    String?  @unique  // 微信 openid
  wxUnionId   String?           // 微信 unionid（多端关联）
}
```

- 同一用户可同时绑定邮箱和微信，通过 unionid/邮箱关联
- 小程序端不支持 httpOnly cookie，改用 Authorization header + token 存 storage
- API 中间件 `withAuth` 同时支持 cookie 和 header 两种传输方式

### 12.2 环境变量

| 变量 | 必须 | 说明 |
|------|------|------|
| `JWT_SECRET` | 是 | JWT 签名密钥，≥ 32 字符随机字符串（256-bit 熵） |
| `DATABASE_URL` | 是 | SQLite 路径，如 `file:./dev.db` |

应用启动时校验必须变量存在，缺失则 fail fast 并输出明确错误信息。项目根目录提供 `.env.example` 作为模板。

## 13. 错误处理

### 13.1 错误码

| Code | HTTP | 说明 |
|------|------|------|
| `AUTH_INVALID_CREDENTIALS` | 401 | 邮箱或密码错误 |
| `AUTH_EMAIL_EXISTS` | 409 | 邮箱已注册 |
| `DESIGN_NOT_FOUND` | 404 | 设计不存在 |
| `DESIGN_FORBIDDEN` | 403 | 无权访问他人设计 |
| `VALIDATION_ERROR` | 400 | 参数校验失败 |
| `AUTH_RATE_LIMITED` | 429 | 登录/注册请求过于频繁 |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT 已过期，需重新登录 |

### 13.2 前端错误处理

- API 调用失败 → toast 提示用户友好信息
- 3D 渲染异常 → `<ErrorBoundary>` 捕获，显示 fallback UI
- 自动保存失败 → localStorage 兜底，下次打开提示恢复

## 14. 测试策略

### Phase 1 MVP 测试范围

| 层 | 工具 | 覆盖内容 |
|----|------|----------|
| 单元测试 | Vitest | 模板生成函数、scene graph 操作、参数校验 |
| 集成测试 | Vitest + Prisma (test DB) | API 路由 CRUD、auth 流程 |
| 组件测试 | React Testing Library | 属性面板交互、模板选择 |
| E2E | Playwright | 注册 → 选模板 → 调参数 → 保存 → 重新打开 |

覆盖率目标：80%+

## 15. 架构总览

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│  Next.js App                                 │
│  ┌──────────┬──────────────┬──────────────┐  │
│  │Component │  R3F Viewport │ Properties   │  │
│  │  Panel   │              │   Panel      │  │
│  │          │ SceneRenderer│              │  │
│  └────┬─────┴──────┬───────┴──────┬───────┘  │
│       └────────────┼──────────────┘           │
│           Zustand EditorStore                 │
│         (immutable scene graph)               │
└────────────────────┼──────────────────────────┘
                     │ REST API
┌────────────────────┼──────────────────────────┐
│           Next.js API Routes                  │
│  ┌─────────────┐  ┌──────────────────┐       │
│  │  Auth (JWT)  │  │  Designs CRUD    │       │
│  └─────────────┘  └──────────────────┘       │
│              Prisma ORM                       │
│              SQLite DB                        │
└───────────────────────────────────────────────┘
```

### 15.1 Phase 4 跨端架构

```
┌─────────────────┐     ┌─────────────────────┐
│   Web (Next.js)  │     │ 小程序 (Taro)        │
│   R3F + Zustand  │     │ three-platformize    │
└────────┬─────────┘     └──────────┬───────────┘
         │                          │
         │    ┌──────────────┐      │
         └────┤ packages/core├──────┘
              │  types       │
              │  schemas     │  共享（npm 包）
              │  templates   │
              │  utils       │
              └──────┬───────┘
                     │
              REST API (共享)
                     │
         ┌───────────┴───────────┐
         │  Next.js API Routes   │
         │  Auth: cookie + header│
         │  Prisma + SQLite/PG   │
         └───────────────────────┘
```

### 15.2 小程序端技术选型（Phase 4 参考）

| 层 | 选型 | 说明 |
|----|------|------|
| 跨平台框架 | Taro 3.x | React 语法编译到小程序，与 Web 端共享开发习惯 |
| 3D 渲染 | three-platformize | Three.js 小程序适配层，支持微信/支付宝小程序 |
| 状态管理 | Zustand | 同 Web 端，Taro 支持 React hooks |
| 认证 | wx.login + JWT header | 小程序原生登录，token 存 wx.storage |
| 离线存储 | wx.storage | 替代 localStorage，自动保存兜底 |

**小程序端需要重写的部分**：
- 3D 渲染组件（R3F → three-platformize 原生 Three.js API）
- UI 组件（Tailwind/Radix → Taro UI 或自定义组件）
- 认证流程（cookie → header + wx.login）
- 手势交互（鼠标事件 → 触摸事件，OrbitControls 需适配触屏）

**可直接复用的部分**（来自 packages/core）：
- SceneNode 类型定义 + Zod 校验 schema
- 模板生成函数（纯函数，零平台依赖）
- 场景树操作工具函数（节点增删改查、深拷贝）
- API 接口定义和响应类型

## 16. Docker 开发与部署环境

**核心原则**：开发期间所有 runtime（Node.js、pnpm、Prisma CLI）运行在 Docker 容器内，本机只需编辑器，不安装任何项目依赖。开发和生产共用同一份 Dockerfile，通过 multi-stage + target 切换。

### 16.1 环境总览

| 环境 | 方案 | 说明 |
|------|------|------|
| 开发 | `docker compose up` | Bind mount 源码 + named volume 隔离 node_modules |
| 生产（MVP） | 单台 VPS（Fly.io / Railway） | `docker compose -f docker-compose.prod.yml up` |
| 生产（后续） | 同上或迁移 Turso / PostgreSQL | 按用户量决定 |

**不使用 Vercel/Netlify**：serverless 函数无持久文件系统，SQLite 无法可靠写入。

### 16.2 Dockerfile（多阶段构建）

```dockerfile
# ---- Base: 所有阶段共享 ----
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ---- Dependencies: 依赖安装层（缓存优化） ----
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/core/package.json packages/core/
COPY packages/web/package.json packages/web/
RUN pnpm install --frozen-lockfile

# ---- Dev: 开发目标 ----
FROM base AS dev
# dev 阶段不 COPY 源码，通过 bind mount 挂载
# node_modules 通过 named volume 从 deps 阶段同步
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "dev"]

# ---- Build: 生产构建 ----
FROM deps AS build
COPY . .
RUN pnpm --filter web exec prisma generate
RUN pnpm --filter web build

# ---- Production: 最小化生产镜像 ----
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/packages/web/.next/standalone ./
COPY --from=build /app/packages/web/.next/static ./.next/static
COPY --from=build /app/packages/web/public ./public
COPY --from=build /app/packages/web/prisma ./prisma
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]
```

**优化要点**：
- `node:22-slim`：比 alpine 更兼容（Prisma 需要 glibc），比 full 镜像小 ~600MB
- 依赖层独立：`pnpm-lock.yaml` 不变时跳过 install，rebuild 秒级
- 生产镜像仅含 `standalone` 输出（Next.js `output: 'standalone'`），~150MB

### 16.3 docker-compose.yml（开发环境）

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev
    ports:
      - "3000:3000"
    volumes:
      # 源码 bind mount：本机编辑，容器热更新
      - .:/app
      # named volume 隔离 node_modules，不污染本机
      - node_modules:/app/node_modules
      - node_modules_core:/app/packages/core/node_modules
      - node_modules_web:/app/packages/web/node_modules
      # SQLite 数据持久化
      - sqlite_data:/app/data
    environment:
      - NODE_ENV=development
      - DATABASE_URL=file:/app/data/dev.db
    env_file:
      - .env
    entrypoint: ["/app/scripts/docker-entrypoint.sh"]

volumes:
  node_modules:
  node_modules_core:
  node_modules_web:
  sqlite_data:
```

**关键设计**：
- **Bind mount `.:/app`**：本机编辑器（Claude Code / VSCode）修改代码，容器内 Next.js dev server 自动热更新
- **Named volume 覆盖 node_modules**：避免 bind mount 把本机空的 node_modules 覆盖容器内已安装的依赖，也防止 Linux 容器的 native 模块（如 Prisma engine）泄漏到 macOS 本机
- **sqlite_data volume**：SQLite 文件持久化，容器重建不丢数据

### 16.4 docker-compose.prod.yml（生产部署）

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    volumes:
      - sqlite_data:/app/data
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/prod.db
    env_file:
      - .env.production
    restart: unless-stopped

volumes:
  sqlite_data:
```

### 16.5 入口脚本

```bash
#!/bin/sh
# scripts/docker-entrypoint.sh
set -e

echo "Installing dependencies..."
pnpm install

echo "Running Prisma migrations..."
pnpm --filter web exec prisma migrate dev --skip-generate 2>/dev/null || \
  pnpm --filter web exec prisma migrate deploy

echo "Generating Prisma client..."
pnpm --filter web exec prisma generate

echo "Starting dev server..."
exec pnpm --filter web dev
```

每次 `docker compose up` 自动执行：依赖安装（增量，有缓存时秒级）→ 数据库迁移 → Prisma 生成 → 启动 dev server。

### 16.6 辅助文件

**.dockerignore**：
```
node_modules
.next
.git
*.md
.DS_Store
data/*.db
.env.production
```

**.env.example**：
```bash
JWT_SECRET=change-me-to-a-random-string-at-least-32-chars
DATABASE_URL=file:/app/data/dev.db
```

### 16.7 开发者工作流

```bash
# 首次启动（构建镜像 + 安装依赖 + 迁移 + 启动）
docker compose up --build

# 日常开发（容器后台运行，本机编辑代码即可）
docker compose up -d
# 编辑代码 → 浏览器 localhost:3000 自动热更新

# 执行容器内命令（如添加依赖、运行测试）
docker compose exec web pnpm add zod --filter core
docker compose exec web pnpm test
docker compose exec web pnpm --filter web exec prisma studio

# 重建（Dockerfile 或依赖变更后）
docker compose up --build

# 清理
docker compose down           # 停止，保留数据
docker compose down -v        # 停止 + 删除 volumes（含数据库）
```

### 16.8 迁移至生产服务器

```bash
# 服务器上
git clone <repo>
cp .env.example .env.production  # 编辑生产环境变量
docker compose -f docker-compose.prod.yml up -d --build
```

生产镜像直接构建 `production` target，不挂载源码，不安装 devDependencies，镜像体积最小化。
