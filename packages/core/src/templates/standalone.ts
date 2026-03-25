import type { SceneNode } from '../types/scene'
import type { TemplateDefinition, TemplateParams } from '../types/template'
import { generateId } from '../utils/id'

function generate(params: TemplateParams): SceneNode {
  const { width, depth, height, layers, rodDiameter, shelfMaterial } = params
  const halfW = width / 2
  const halfD = depth / 2

  const cornerPositions: Array<[number, number]> = [
    [-halfW, -halfD],
    [halfW, -halfD],
    [-halfW, halfD],
    [halfW, halfD],
  ]

  const rods: SceneNode[] = cornerPositions.map(([x, z]) => ({
    id: generateId(),
    type: 'rod' as const,
    position: [x, 0, z] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    params: { diameter: rodDiameter, length: height },
    children: [],
  }))

  const shelves: SceneNode[] = []
  const clamps: SceneNode[] = []

  for (let i = 0; i < layers; i++) {
    const y = (i * height) / layers

    shelves.push({
      id: generateId(),
      type: 'shelf',
      position: [0, y, 0],
      rotation: [0, 0, 0],
      params: { width, depth, thickness: 0.02, material: shelfMaterial },
      children: [],
    })

    for (const [x, z] of cornerPositions) {
      clamps.push({
        id: generateId(),
        type: 'crossClamp',
        position: [x, y, z],
        rotation: [0, 0, 0],
        params: { rodDiameter },
        children: [],
      })
    }
  }

  return {
    id: generateId(),
    type: 'group',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    params: {} as Record<string, never>,
    children: [...rods, ...shelves, ...clamps],
  }
}

export const standaloneTemplate: TemplateDefinition = {
  id: 'standalone',
  name: 'Standalone Shelf',
  category: 'standalone',
  thumbnail: '',
  defaultParams: {
    width: 0.8,
    height: 1.0,
    depth: 0.4,
    layers: 2,
    rodDiameter: 8,
    shelfMaterial: 'wood',
  },
  generate,
}
