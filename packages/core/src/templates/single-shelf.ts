import type { SceneNode } from '../types/scene'
import type { TemplateDefinition, TemplateParams } from '../types/template'
import { generateId } from '../utils/id'

function generate(params: TemplateParams): SceneNode {
  const { width, depth, height, rodDiameter, shelfMaterial } = params
  const halfW = width / 2
  const halfD = depth / 2

  const rods: SceneNode[] = [
    { id: generateId(), type: 'rod', position: [-halfW, 0, -halfD], rotation: [0, 0, 0], params: { diameter: rodDiameter, length: height }, children: [] },
    { id: generateId(), type: 'rod', position: [halfW, 0, -halfD], rotation: [0, 0, 0], params: { diameter: rodDiameter, length: height }, children: [] },
    { id: generateId(), type: 'rod', position: [-halfW, 0, halfD], rotation: [0, 0, 0], params: { diameter: rodDiameter, length: height }, children: [] },
    { id: generateId(), type: 'rod', position: [halfW, 0, halfD], rotation: [0, 0, 0], params: { diameter: rodDiameter, length: height }, children: [] },
  ]

  const shelf: SceneNode = {
    id: generateId(),
    type: 'shelf',
    position: [0, height / 2, 0],
    rotation: [0, 0, 0],
    params: { width, depth, thickness: 0.02, material: shelfMaterial },
    children: [],
  }

  return {
    id: generateId(),
    type: 'group',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    params: {} as Record<string, never>,
    children: [...rods, shelf],
  }
}

export const singleShelfTemplate: TemplateDefinition = {
  id: 'single-shelf',
  name: 'Single Shelf',
  category: 'single',
  thumbnail: '',
  defaultParams: {
    width: 0.8,
    height: 1.0,
    depth: 0.4,
    layers: 1,
    rodDiameter: 8,
    shelfMaterial: 'wood',
  },
  generate,
}
