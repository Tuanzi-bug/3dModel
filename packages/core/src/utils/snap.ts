import type { SceneNode, Vec3 } from '../types/scene'
import { findNode } from './scene-tree'

type SnapReason = 'grid' | 'anchor' | 'none'

export interface SnapResult {
  position: Vec3
  reason: SnapReason
  targetId?: string
}

interface SnapOptions {
  movingNodeId?: string
  movingNode?: SceneNode
  gridSize?: number
  threshold?: number
}

interface AnchorPoint {
  nodeId: string
  point: Vec3
}

const DEFAULT_GRID_SIZE = 0.05
const DEFAULT_SNAP_THRESHOLD = 0.08

function roundToGrid(value: number, gridSize: number) {
  const snapped = Math.round(value / gridSize) * gridSize
  return Object.is(snapped, -0) ? 0 : snapped
}

function roundVec(position: Vec3, gridSize: number): Vec3 {
  return [
    roundToGrid(position[0], gridSize),
    roundToGrid(position[1], gridSize),
    roundToGrid(position[2], gridSize),
  ]
}

function distanceBetween(a: Vec3, b: Vec3) {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  const dz = a[2] - b[2]

  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function addVec(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function subtractVec(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function getNodeAnchors(node: SceneNode, position: Vec3): Vec3[] {
  switch (node.type) {
    case 'rod':
      return [
        position,
        [position[0], position[1] + node.params.length, position[2]],
      ]
    case 'shelf':
      return [
        position,
        [position[0] + node.params.width, position[1], position[2]],
        [position[0], position[1], position[2] + node.params.depth],
        [position[0] + node.params.width, position[1], position[2] + node.params.depth],
      ]
    case 'backPanel':
      return [
        position,
        [position[0] + node.params.width, position[1], position[2]],
        [position[0], position[1] + node.params.height, position[2]],
        [position[0] + node.params.width, position[1] + node.params.height, position[2]],
      ]
    case 'ledStrip':
      return [
        [position[0] - node.params.length / 2, position[1], position[2]],
        [position[0] + node.params.length / 2, position[1], position[2]],
      ]
    default:
      return [position]
  }
}

function collectAnchors(
  node: SceneNode,
  ignoredId: string | undefined,
  anchors: AnchorPoint[],
  parentPosition: Vec3 = [0, 0, 0],
) {
  const worldPosition = addVec(parentPosition, node.position)

  if (node.id !== 'root' && node.id !== ignoredId) {
    getNodeAnchors(node, worldPosition).forEach((point) => {
      anchors.push({
        nodeId: node.id,
        point,
      })
    })
  }

  node.children.forEach((child) => collectAnchors(child, ignoredId, anchors, worldPosition))
}

export function resolveSnapPosition(
  sceneGraph: SceneNode,
  proposedPosition: Vec3,
  options: SnapOptions = {},
): SnapResult {
  const gridSize = options.gridSize ?? DEFAULT_GRID_SIZE
  const threshold = options.threshold ?? DEFAULT_SNAP_THRESHOLD
  const movingNode =
    options.movingNode ?? (options.movingNodeId ? findNode(sceneGraph, options.movingNodeId) : undefined)
  const gridPosition = roundVec(proposedPosition, gridSize)
  const gridDistance = distanceBetween(proposedPosition, gridPosition)

  if (!movingNode) {
    return {
      position: gridDistance === 0 ? proposedPosition : gridPosition,
      reason: gridDistance === 0 ? 'none' : 'grid',
    }
  }

  const stationaryAnchors: AnchorPoint[] = []
  collectAnchors(sceneGraph, options.movingNodeId ?? options.movingNode?.id, stationaryAnchors)

  let bestAnchor: SnapResult | null = null
  let bestAnchorDistance = Number.POSITIVE_INFINITY

  for (const movingAnchor of getNodeAnchors(movingNode, proposedPosition)) {
    for (const targetAnchor of stationaryAnchors) {
      const candidatePosition = addVec(proposedPosition, subtractVec(targetAnchor.point, movingAnchor))
      const candidateDistance = distanceBetween(proposedPosition, candidatePosition)

      if (candidateDistance <= threshold && candidateDistance < bestAnchorDistance) {
        bestAnchorDistance = candidateDistance
        bestAnchor = {
          position: candidatePosition,
          reason: 'anchor',
          targetId: targetAnchor.nodeId,
        }
      }
    }
  }

  if (bestAnchor) {
    return bestAnchor
  }

  return {
    position: gridDistance === 0 ? proposedPosition : gridPosition,
    reason: gridDistance === 0 ? 'none' : 'grid',
  }
}
