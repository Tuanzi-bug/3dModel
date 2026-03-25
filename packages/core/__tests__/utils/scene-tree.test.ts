import { describe, it, expect } from 'vitest'
import { findNode, updateNode, addNode, removeNode, duplicateNode } from '../../src/utils/scene-tree'
import type { SceneNode } from '../../src/types/scene'

const makeRoot = (): SceneNode => ({
  id: 'root',
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children: [
    {
      id: 'rod-1',
      type: 'rod',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: { diameter: 8, length: 1.0 },
      children: [],
    },
    {
      id: 'shelf-1',
      type: 'shelf',
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      params: { width: 0.8, depth: 0.4, thickness: 0.02, material: 'wood' },
      children: [],
    },
  ],
})

describe('findNode', () => {
  it('finds root node', () => {
    const root = makeRoot()
    expect(findNode(root, 'root')?.id).toBe('root')
  })

  it('finds child node', () => {
    const root = makeRoot()
    expect(findNode(root, 'rod-1')?.type).toBe('rod')
  })

  it('returns undefined for missing id', () => {
    const root = makeRoot()
    expect(findNode(root, 'nonexistent')).toBeUndefined()
  })
})

describe('updateNode', () => {
  it('updates node params immutably', () => {
    const root = makeRoot()
    const updated = updateNode(root, 'rod-1', { params: { diameter: 13, length: 1.5 } })
    expect(findNode(updated, 'rod-1')?.params).toEqual({ diameter: 13, length: 1.5 })
    // original unchanged
    expect(findNode(root, 'rod-1')?.params).toEqual({ diameter: 8, length: 1.0 })
  })

  it('updates node position', () => {
    const root = makeRoot()
    const updated = updateNode(root, 'shelf-1', { position: [1, 1, 1] })
    const node = findNode(updated, 'shelf-1')
    expect(node?.position).toEqual([1, 1, 1])
  })
})

describe('addNode', () => {
  it('adds node to root children', () => {
    const root = makeRoot()
    const newNode: SceneNode = {
      id: 'rod-2',
      type: 'rod',
      position: [1, 0, 0],
      rotation: [0, 0, 0],
      params: { diameter: 8, length: 1.0 },
      children: [],
    }
    const updated = addNode(root, newNode)
    expect(updated.children).toHaveLength(3)
    expect(findNode(updated, 'rod-2')).toBeDefined()
    // original unchanged
    expect(root.children).toHaveLength(2)
  })
})

describe('removeNode', () => {
  it('removes node from root children', () => {
    const root = makeRoot()
    const updated = removeNode(root, 'rod-1')
    expect(updated.children).toHaveLength(1)
    expect(findNode(updated, 'rod-1')).toBeUndefined()
    // original unchanged
    expect(root.children).toHaveLength(2)
  })
})

describe('duplicateNode', () => {
  it('duplicates node with new id', () => {
    const root = makeRoot()
    const updated = duplicateNode(root, 'rod-1')
    expect(updated.children).toHaveLength(3)
    const dup = updated.children[2]
    expect(dup.type).toBe('rod')
    expect(dup.id).not.toBe('rod-1')
  })
})
