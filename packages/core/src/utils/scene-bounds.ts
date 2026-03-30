import type { SceneNode, Vec3 } from '../types/scene'

const ROD_DIAMETER_SCALE = 0.001
const LED_STRIP_HEIGHT = 0.012
const LED_STRIP_DEPTH = 0.02
const BACK_PANEL_THICKNESS = 0.02
const CONNECTOR_LENGTH = 0.02

export interface Bounds3D {
  min: Vec3
  max: Vec3
  size: Vec3
  center: Vec3
}

interface TraverseResult {
  bounds: Bounds3D | null
  selectedBounds: Bounds3D | null
}

function addVec(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function roundCoord(value: number) {
  const rounded = Number(value.toFixed(6))
  return Object.is(rounded, -0) ? 0 : rounded
}

function rotatePoint(point: Vec3, rotation: Vec3): Vec3 {
  const [rx, ry, rz] = rotation

  const cosX = Math.cos(rx)
  const sinX = Math.sin(rx)
  const cosY = Math.cos(ry)
  const sinY = Math.sin(ry)
  const cosZ = Math.cos(rz)
  const sinZ = Math.sin(rz)

  const afterX: Vec3 = [
    point[0],
    point[1] * cosX - point[2] * sinX,
    point[1] * sinX + point[2] * cosX,
  ]

  const afterY: Vec3 = [
    afterX[0] * cosY + afterX[2] * sinY,
    afterX[1],
    -afterX[0] * sinY + afterX[2] * cosY,
  ]

  return [
    afterY[0] * cosZ - afterY[1] * sinZ,
    afterY[0] * sinZ + afterY[1] * cosZ,
    afterY[2],
  ]
}

function applyRotationChain(point: Vec3, rotations: Vec3[]): Vec3 {
  return rotations.reduce<Vec3>((current, rotation) => rotatePoint(current, rotation), point)
}

function createBounds(min: Vec3, max: Vec3): Bounds3D {
  const roundedMin: Vec3 = [roundCoord(min[0]), roundCoord(min[1]), roundCoord(min[2])]
  const roundedMax: Vec3 = [roundCoord(max[0]), roundCoord(max[1]), roundCoord(max[2])]

  return {
    min: roundedMin,
    max: roundedMax,
    size: [
      roundCoord(roundedMax[0] - roundedMin[0]),
      roundCoord(roundedMax[1] - roundedMin[1]),
      roundCoord(roundedMax[2] - roundedMin[2]),
    ],
    center: [
      roundCoord((roundedMin[0] + roundedMax[0]) / 2),
      roundCoord((roundedMin[1] + roundedMax[1]) / 2),
      roundCoord((roundedMin[2] + roundedMax[2]) / 2),
    ],
  }
}

function unionBounds(a: Bounds3D | null, b: Bounds3D | null): Bounds3D | null {
  if (!a) return b
  if (!b) return a

  return createBounds(
    [
      Math.min(a.min[0], b.min[0]),
      Math.min(a.min[1], b.min[1]),
      Math.min(a.min[2], b.min[2]),
    ],
    [
      Math.max(a.max[0], b.max[0]),
      Math.max(a.max[1], b.max[1]),
      Math.max(a.max[2], b.max[2]),
    ],
  )
}

function boxCorners(min: Vec3, max: Vec3): Vec3[] {
  return [
    [min[0], min[1], min[2]],
    [min[0], min[1], max[2]],
    [min[0], max[1], min[2]],
    [min[0], max[1], max[2]],
    [max[0], min[1], min[2]],
    [max[0], min[1], max[2]],
    [max[0], max[1], min[2]],
    [max[0], max[1], max[2]],
  ]
}

function connectorExtent(rodDiameter: number, padding: number) {
  return (rodDiameter * ROD_DIAMETER_SCALE) / 2 + padding
}

function getLocalCorners(node: SceneNode): Vec3[] {
  switch (node.type) {
    case 'rod': {
      const radius = (node.params.diameter * ROD_DIAMETER_SCALE) / 2
      return boxCorners([-radius, 0, -radius], [radius, node.params.length, radius])
    }
    case 'shelf':
      return boxCorners(
        [0, -node.params.thickness / 2, 0],
        [node.params.width, node.params.thickness / 2, node.params.depth],
      )
    case 'ledStrip':
      return boxCorners(
        [-node.params.length / 2, -LED_STRIP_HEIGHT / 2, -LED_STRIP_DEPTH / 2],
        [node.params.length / 2, LED_STRIP_HEIGHT / 2, LED_STRIP_DEPTH / 2],
      )
    case 'backPanel':
      return boxCorners(
        [0, 0, -BACK_PANEL_THICKNESS / 2],
        [node.params.width, node.params.height, BACK_PANEL_THICKNESS / 2],
      )
    case 'crossClamp': {
      const extent = connectorExtent(node.params.rodDiameter, 0.005)
      return boxCorners([-extent, -extent, -extent], [extent, extent, extent])
    }
    case 'fixedRing': {
      const extent = connectorExtent(node.params.rodDiameter, 0.007)
      return boxCorners([-extent, -extent, -0.003], [extent, extent, 0.003])
    }
    case 'teeConnector': {
      const radius = connectorExtent(node.params.rodDiameter, 0.002)
      return boxCorners([-CONNECTOR_LENGTH / 2, -CONNECTOR_LENGTH / 2, -radius], [CONNECTOR_LENGTH / 2, CONNECTOR_LENGTH / 2, radius])
    }
    case 'group':
      return []
  }
}

function getNodeBounds(node: SceneNode, parentPosition: Vec3, parentRotations: Vec3[]): Bounds3D | null {
  if (node.type === 'group') {
    return null
  }

  const worldCorners = getLocalCorners(node).map((localCorner) => {
    const rotatedLocal = rotatePoint(localCorner, node.rotation)
    const nodeOffset = addVec(node.position, rotatedLocal)
    const parentRotated = applyRotationChain(nodeOffset, parentRotations)

    return addVec(parentPosition, parentRotated)
  })

  if (worldCorners.length === 0) {
    return null
  }

  return createBounds(
    [
      Math.min(...worldCorners.map((point) => point[0])),
      Math.min(...worldCorners.map((point) => point[1])),
      Math.min(...worldCorners.map((point) => point[2])),
    ],
    [
      Math.max(...worldCorners.map((point) => point[0])),
      Math.max(...worldCorners.map((point) => point[1])),
      Math.max(...worldCorners.map((point) => point[2])),
    ],
  )
}

function traverseScene(
  node: SceneNode,
  parentPosition: Vec3,
  parentRotations: Vec3[],
  selectedNodeId?: string | null,
): TraverseResult {
  let bounds = getNodeBounds(node, parentPosition, parentRotations)
  let selectedBounds: Bounds3D | null = null

  const nodeWorldPosition = addVec(parentPosition, applyRotationChain(node.position, parentRotations))
  const childRotations = [...parentRotations, node.rotation]

  for (const child of node.children) {
    const childResult = traverseScene(child, nodeWorldPosition, childRotations, selectedNodeId)
    bounds = unionBounds(bounds, childResult.bounds)

    if (childResult.selectedBounds) {
      selectedBounds = childResult.selectedBounds
    }
  }

  if (selectedNodeId && node.id === selectedNodeId) {
    selectedBounds = bounds
  }

  return { bounds, selectedBounds }
}

export function getSceneBounds(sceneGraph: SceneNode, selectedNodeId?: string | null): Bounds3D | null {
  const { bounds, selectedBounds } = traverseScene(sceneGraph, [0, 0, 0], [], selectedNodeId)

  if (selectedNodeId) {
    return selectedBounds
  }

  return bounds
}
