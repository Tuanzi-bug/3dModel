import type { SceneNode, Vec3 } from '../types/scene'

type PreviewShape = {
  kind: 'rect' | 'circle'
  cx: number
  cy: number
  width: number
  height: number
  fill: string
  stroke: string
  opacity: number
  rx?: number
  depth: number
}

const CANVAS_WIDTH = 160
const CANVAS_HEIGHT = 120
const CANVAS_PADDING = 14

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function materialFill(material: 'wood' | 'acrylic' | 'metal') {
  if (material === 'wood') return '#d6b38b'
  if (material === 'acrylic') return '#dff1fb'
  return '#9ca3af'
}

function project(position: Vec3) {
  return {
    x: position[2] * 88,
    y: position[1] * 70,
    depth: position[0] + position[2] * 0.12 - position[1] * 0.04,
  }
}

function toWorldPosition(parent: Vec3, local: Vec3): Vec3 {
  return [
    parent[0] + local[0],
    parent[1] + local[1],
    parent[2] + local[2],
  ]
}

function collectShapes(node: SceneNode, parentPosition: Vec3 = [0, 0, 0]): PreviewShape[] {
  const worldPosition = toWorldPosition(parentPosition, node.position)
  const childShapes = node.children.flatMap((child) => collectShapes(child, worldPosition))

  if (node.type === 'group') {
    return childShapes
  }

  if (node.type === 'rod') {
    const center = toWorldPosition(worldPosition, [0, node.params.length / 2, 0])
    const projected = project(center)
    return [
      ...childShapes,
      {
        kind: 'rect',
        cx: projected.x,
        cy: projected.y,
        width: clamp(node.params.diameter * 0.7, 8, 14),
        height: clamp(node.params.length * 68, 44, 94),
        fill: '#c9d2dd',
        stroke: '#94a3b8',
        opacity: 0.95,
        rx: 5,
        depth: projected.depth,
      },
    ]
  }

  if (node.type === 'shelf') {
    const center = toWorldPosition(worldPosition, [0, node.params.thickness / 2, node.params.depth / 2])
    const projected = project(center)
    return [
      ...childShapes,
      {
        kind: 'rect',
        cx: projected.x,
        cy: projected.y,
        width: clamp(node.params.depth * 112, 18, 86),
        height: clamp(node.params.thickness * 180, 8, 16),
        fill: materialFill(node.params.material),
        stroke: '#7c6750',
        opacity: 0.98,
        rx: 6,
        depth: projected.depth + 0.2,
      },
    ]
  }

  if (node.type === 'backPanel') {
    const center = toWorldPosition(worldPosition, [0, node.params.height / 2, 0])
    const projected = project(center)
    return [
      ...childShapes,
      {
        kind: 'rect',
        cx: projected.x,
        cy: projected.y,
        width: clamp(node.params.width * 10, 8, 18),
        height: clamp(node.params.height * 52, 24, 92),
        fill: materialFill(node.params.material),
        stroke: '#64748b',
        opacity: 0.5,
        rx: 8,
        depth: projected.depth - 0.3,
      },
    ]
  }

  const projected = project(worldPosition)
  return [
    ...childShapes,
    {
      kind: 'circle',
      cx: projected.x,
      cy: projected.y,
      width: node.type === 'ledStrip' ? 12 : 10,
      height: node.type === 'ledStrip' ? 12 : 10,
      fill: node.type === 'ledStrip' ? '#facc15' : '#475569',
      stroke: '#334155',
      opacity: node.type === 'ledStrip' ? 0.85 : 0.92,
      depth: projected.depth,
    },
  ]
}

function renderEmptyPreview() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}">
      <rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" rx="18" fill="#f8fafc"/>
      <rect x="28" y="24" width="104" height="72" rx="16" fill="#e2e8f0" stroke="#cbd5e1" stroke-dasharray="5 5"/>
      <path d="M80 44v32M64 60h32" stroke="#94a3b8" stroke-linecap="round" stroke-width="5"/>
    </svg>
  `.trim()
}

export function generateScenePreviewDataUrl(sceneGraph: SceneNode): string {
  const shapes = collectShapes(sceneGraph).sort((a, b) => a.depth - b.depth)

  const svg = shapes.length === 0
    ? renderEmptyPreview()
    : (() => {
      const minX = Math.min(...shapes.map((shape) => shape.cx - shape.width / 2))
      const maxX = Math.max(...shapes.map((shape) => shape.cx + shape.width / 2))
      const minY = Math.min(...shapes.map((shape) => shape.cy - shape.height / 2))
      const maxY = Math.max(...shapes.map((shape) => shape.cy + shape.height / 2))
      const contentWidth = Math.max(maxX - minX, 1)
      const contentHeight = Math.max(maxY - minY, 1)
      const availableWidth = CANVAS_WIDTH - CANVAS_PADDING * 2
      const availableHeight = CANVAS_HEIGHT - CANVAS_PADDING * 2
      const scale = clamp(
        Math.min(availableWidth / contentWidth, availableHeight / contentHeight),
        0.72,
        1.8,
      )
      const offsetX = CANVAS_PADDING + (availableWidth - contentWidth * scale) / 2
      const offsetY = CANVAS_PADDING + (availableHeight - contentHeight * scale) / 2

      const renderedShapes = shapes.map((shape) => {
        const cx = offsetX + (shape.cx - minX) * scale
        const cy = offsetY + (maxY - shape.cy) * scale
        const width = shape.width * scale
        const height = shape.height * scale

        if (shape.kind === 'circle') {
          return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(width / 2).toFixed(2)}" fill="${shape.fill}" fill-opacity="${shape.opacity}" stroke="${shape.stroke}" stroke-width="1.5"/>`
        }

        return `<rect x="${(cx - width / 2).toFixed(2)}" y="${(cy - height / 2).toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" rx="${(shape.rx ?? 4).toFixed(2)}" fill="${shape.fill}" fill-opacity="${shape.opacity}" stroke="${shape.stroke}" stroke-width="1.5"/>`
      }).join('')

      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}">
          <defs>
            <linearGradient id="preview-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f8fafc"/>
              <stop offset="100%" stop-color="#e2e8f0"/>
            </linearGradient>
          </defs>
          <rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" rx="18" fill="url(#preview-bg)"/>
          <rect x="12" y="12" width="136" height="96" rx="14" fill="#ffffff" fill-opacity="0.82"/>
          <path d="M18 92h124" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
          ${renderedShapes}
        </svg>
      `.trim()
    })()

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
