import { describe, expect, it } from 'vitest'
import type { SceneNode } from '../src/types/scene'
import { resolveSnapPosition } from '../src/utils/snap'

const emptyRoot = (): SceneNode => ({
  id: 'root',
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children: [],
})

describe('resolveSnapPosition', () => {
  it('returns none when the released position is already aligned', () => {
    const result = resolveSnapPosition(emptyRoot(), [0.05, 0.1, 0], {
      movingNode: {
        id: 'rod-new',
        type: 'rod',
        position: [0.05, 0.1, 0],
        rotation: [0, 0, 0],
        params: { diameter: 8, length: 1 },
        children: [],
      },
    })

    expect(result.reason).toBe('none')
    expect(result.position).toEqual([0.05, 0.1, 0])
  })

  it('snaps to the nearest grid point when no anchor match is closer', () => {
    const result = resolveSnapPosition(emptyRoot(), [0.06, 0.12, -0.02], {
      movingNode: {
        id: 'rod-new',
        type: 'rod',
        position: [0.06, 0.12, -0.02],
        rotation: [0, 0, 0],
        params: { diameter: 8, length: 1 },
        children: [],
      },
    })

    expect(result.reason).toBe('grid')
    expect(result.position).toEqual([0.05, 0.1, 0])
  })

  it('prefers anchor alignment over grid snapping when a compatible point is close', () => {
    const sceneGraph: SceneNode = {
      id: 'root',
      type: 'group',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: {},
      children: [
        {
          id: 'rod-target',
          type: 'rod',
          position: [0.4, 0, 0.2],
          rotation: [0, 0, 0],
          params: { diameter: 8, length: 1 },
          children: [],
        },
      ],
    }

    const result = resolveSnapPosition(sceneGraph, [0.42, 1.03, 0.19], {
      movingNode: {
        id: 'rod-moving',
        type: 'rod',
        position: [0.42, 1.03, 0.19],
        rotation: [0, 0, 0],
        params: { diameter: 8, length: 1 },
        children: [],
      },
    })

    expect(result.reason).toBe('anchor')
    expect(result.targetId).toBe('rod-target')
    expect(result.position).toEqual([0.4, 1, 0.2])
  })
})
