import { describe, it, expect } from 'vitest'
import { standaloneTemplate } from '../../src/templates/standalone'
import { sceneNodeSchema } from '../../src/schemas/scene'
import type { TemplateParams } from '../../src/types/template'

const defaultParams: TemplateParams = {
  width: 0.8,
  height: 1.0,
  depth: 0.4,
  layers: 2,
  rodDiameter: 8,
  shelfMaterial: 'wood',
}

describe('standaloneTemplate', () => {
  it('has correct metadata', () => {
    expect(standaloneTemplate.id).toBe('standalone')
    expect(standaloneTemplate.category).toBe('standalone')
  })

  it('generates valid scene graph', () => {
    const scene = standaloneTemplate.generate(defaultParams)
    expect(() => sceneNodeSchema.parse(scene)).not.toThrow()
  })

  it('root is a group node', () => {
    const scene = standaloneTemplate.generate(defaultParams)
    expect(scene.type).toBe('group')
  })

  it('generates 4 vertical rods', () => {
    const scene = standaloneTemplate.generate(defaultParams)
    const rods = scene.children.filter((n) => n.type === 'rod')
    expect(rods).toHaveLength(4)
    rods.forEach((rod) => {
      if (rod.type === 'rod') {
        expect(rod.params.diameter).toBe(8)
        expect(rod.params.length).toBe(1.0)
      }
    })
  })

  it('generates correct number of shelves', () => {
    const scene = standaloneTemplate.generate(defaultParams)
    const shelves = scene.children.filter((n) => n.type === 'shelf')
    expect(shelves).toHaveLength(2)
  })

  it('generates cross clamps at each rod-shelf intersection', () => {
    const scene = standaloneTemplate.generate(defaultParams)
    const clamps = scene.children.filter((n) => n.type === 'crossClamp')
    // 4 rods * 2 shelves = 8 clamps
    expect(clamps).toHaveLength(8)
  })

  it('respects rodDiameter parameter', () => {
    const scene = standaloneTemplate.generate({ ...defaultParams, rodDiameter: 13 })
    const rods = scene.children.filter((n) => n.type === 'rod')
    rods.forEach((rod) => {
      if (rod.type === 'rod') expect(rod.params.diameter).toBe(13)
    })
  })

  it('distributes shelves evenly by height', () => {
    const scene = standaloneTemplate.generate(defaultParams)
    const shelves = scene.children
      .filter((n): n is Extract<typeof n, { type: 'shelf' }> => n.type === 'shelf')
      .sort((a, b) => a.position[1] - b.position[1])
    // 2 layers, height 1.0 → shelves at y=0 and y=0.5
    expect(shelves[0]!.position[1]).toBeCloseTo(0)
    expect(shelves[1]!.position[1]).toBeCloseTo(0.5)
  })
})
