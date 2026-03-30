import { describe, expect, it } from 'vitest'
import type { SceneNode } from '../src/types/scene'
import { getSceneBounds } from '../src/utils/scene-bounds'

const sceneGraph: SceneNode = {
  id: 'root',
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children: [
    {
      id: 'shelf-0',
      type: 'shelf',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: { width: 1, depth: 0.5, thickness: 0.02, material: 'wood' },
      children: [],
    },
    {
      id: 'backPanel-0',
      type: 'backPanel',
      position: [1.25, 0, 0],
      rotation: [0, 0, 0],
      params: { width: 0.75, height: 1.5, material: 'metal' },
      children: [],
    },
    {
      id: 'ledStrip-0',
      type: 'ledStrip',
      position: [0.5, 1.7, 0.2],
      rotation: [0, 0, 0],
      params: { length: 1.2, color: '#ffffff' },
      children: [],
    },
  ],
}

describe('getSceneBounds', () => {
  it('derives whole-scene bounds from the canonical scene graph', () => {
    const bounds = getSceneBounds(sceneGraph)

    expect(bounds).not.toBeNull()
    expect(bounds?.min[0]).toBeCloseTo(-0.1)
    expect(bounds?.min[1]).toBeCloseTo(-0.01)
    expect(bounds?.min[2]).toBeCloseTo(-0.01)
    expect(bounds?.max[0]).toBeCloseTo(2)
    expect(bounds?.max[1]).toBeCloseTo(1.706)
    expect(bounds?.max[2]).toBeCloseTo(0.5)
    expect(bounds?.size[0]).toBeCloseTo(2.1)
    expect(bounds?.size[1]).toBeCloseTo(1.716)
    expect(bounds?.size[2]).toBeCloseTo(0.51)
  })

  it('can scope bounds to the selected node subtree', () => {
    const bounds = getSceneBounds(sceneGraph, 'backPanel-0')

    expect(bounds).not.toBeNull()
    expect(bounds?.min).toEqual([1.25, 0, -0.01])
    expect(bounds?.max).toEqual([2, 1.5, 0.01])
    expect(bounds?.size).toEqual([0.75, 1.5, 0.02])
    expect(bounds?.center).toEqual([1.625, 0.75, 0])
  })
})
