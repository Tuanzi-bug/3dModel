import { describe, it, expect } from 'vitest'
import { sceneNodeSchema, vec3Schema } from '../../src/schemas/scene'

describe('vec3Schema', () => {
  it('accepts valid Vec3', () => {
    expect(vec3Schema.parse([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('rejects array with wrong length', () => {
    expect(() => vec3Schema.parse([1, 2])).toThrow()
  })
})

describe('sceneNodeSchema', () => {
  it('validates rod node', () => {
    const rod = {
      id: 'rod-1',
      type: 'rod',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: { diameter: 8, length: 1.0 },
      children: [],
    }
    expect(sceneNodeSchema.parse(rod)).toEqual(rod)
  })

  it('rejects rod with invalid diameter', () => {
    const rod = {
      id: 'rod-1',
      type: 'rod',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: { diameter: 10, length: 1.0 },
      children: [],
    }
    expect(() => sceneNodeSchema.parse(rod)).toThrow()
  })

  it('validates shelf node', () => {
    const shelf = {
      id: 'shelf-1',
      type: 'shelf',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: { width: 0.8, depth: 0.4, thickness: 0.02, material: 'wood' },
      children: [],
    }
    expect(sceneNodeSchema.parse(shelf)).toEqual(shelf)
  })

  it('validates group node with children', () => {
    const group = {
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
      ],
    }
    expect(sceneNodeSchema.parse(group)).toBeDefined()
  })

  it('rejects node with mismatched type/params', () => {
    const bad = {
      id: 'bad-1',
      type: 'rod',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: { width: 0.8, depth: 0.4, thickness: 0.02, material: 'wood' },
      children: [],
    }
    expect(() => sceneNodeSchema.parse(bad)).toThrow()
  })
})
