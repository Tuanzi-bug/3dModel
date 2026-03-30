import { nanoid } from 'nanoid'
import type { SceneNodeType } from '../types/scene'

export const generateId = (): string => nanoid()

const TYPE_LABELS: Record<SceneNodeType, string> = {
  rod: '杆',
  shelf: '层板',
  crossClamp: '十字夹',
  fixedRing: '固定环',
  teeConnector: 'T型连接器',
  ledStrip: 'LED灯带',
  backPanel: '背板',
  group: '组',
}

export function getNodeTypeLabel(type: SceneNodeType): string {
  return TYPE_LABELS[type]
}

export interface ParsedNodeId {
  type: SceneNodeType
  typeLabel: string
  sequence: string
  displayLabel: string
}

export function parseNodeId(id: string): ParsedNodeId {
  // Handle special case: root node
  if (id === 'root') {
    return {
      type: 'group',
      typeLabel: getNodeTypeLabel('group'),
      sequence: '',
      displayLabel: '组',
    }
  }

  // Parse id format: "type-sequence" or just "type"
  const parts = id.split('-')
  const type = parts[0] as SceneNodeType
  const sequence = parts[1] || ''

  const typeLabel = getNodeTypeLabel(type)
  const displayLabel = sequence ? `${typeLabel}-${sequence}` : typeLabel

  return {
    type,
    typeLabel,
    sequence,
    displayLabel,
  }
}
