import type { SceneNode, SceneNodeType } from '../types/scene'
import { getNodeTypeLabel } from './id'

export interface BomLineItem {
  type: Exclude<SceneNodeType, 'group'>
  label: string
  spec: string
  quantity: number
  unit: string
}

const COMPONENT_ORDER: Array<BomLineItem['type']> = [
  'rod',
  'shelf',
  'ledStrip',
  'backPanel',
  'crossClamp',
  'fixedRing',
  'teeConnector',
]

const MATERIAL_LABELS = {
  wood: '木质',
  acrylic: '亚克力',
  metal: '金属',
} as const

const UNIT_LABELS: Record<BomLineItem['type'], string> = {
  rod: '根',
  shelf: '块',
  ledStrip: '条',
  backPanel: '块',
  crossClamp: '个',
  fixedRing: '个',
  teeConnector: '个',
}

function formatMeters(value: number) {
  return `${value.toFixed(2)}m`
}

function getNodeSpec(node: SceneNode): string | null {
  switch (node.type) {
    case 'rod':
      return `直径${node.params.diameter}mm × 长度${formatMeters(node.params.length)}`
    case 'shelf':
      return `${formatMeters(node.params.width)} × ${formatMeters(node.params.depth)} × ${formatMeters(node.params.thickness)} · ${MATERIAL_LABELS[node.params.material]}`
    case 'ledStrip':
      return `长度${formatMeters(node.params.length)} · ${node.params.color}`
    case 'backPanel':
      return `${formatMeters(node.params.width)} × ${formatMeters(node.params.height)} · ${MATERIAL_LABELS[node.params.material]}`
    case 'crossClamp':
    case 'fixedRing':
    case 'teeConnector':
      return `适配${node.params.rodDiameter}mm`
    case 'group':
      return null
  }
}

function flattenScene(node: SceneNode): SceneNode[] {
  return [
    node,
    ...node.children.flatMap((child) => flattenScene(child)),
  ]
}

export function generateBom(sceneGraph: SceneNode): BomLineItem[] {
  const grouped = new Map<string, BomLineItem>()

  for (const node of flattenScene(sceneGraph)) {
    if (node.type === 'group') {
      continue
    }

    const spec = getNodeSpec(node)
    if (!spec) {
      continue
    }

    const key = `${node.type}::${spec}`
    const existing = grouped.get(key)

    if (existing) {
      existing.quantity += 1
      continue
    }

    grouped.set(key, {
      type: node.type,
      label: getNodeTypeLabel(node.type),
      spec,
      quantity: 1,
      unit: UNIT_LABELS[node.type],
    })
  }

  return [...grouped.values()].sort((a, b) => {
    const typeOrder = COMPONENT_ORDER.indexOf(a.type) - COMPONENT_ORDER.indexOf(b.type)
    if (typeOrder !== 0) {
      return typeOrder
    }

    return a.spec.localeCompare(b.spec, 'zh-CN')
  })
}

function escapeCsvCell(value: string | number) {
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

export function serializeBomCsv(items: BomLineItem[]): string {
  const rows = [
    ['类型', '规格', '数量', '单位'],
    ...items.map((item) => [item.label, item.spec, item.quantity, item.unit]),
  ]

  return rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
    .join('\n')
}
