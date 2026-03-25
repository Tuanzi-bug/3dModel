import { describe, it, expect } from 'vitest'
import { multiShelfTemplate } from '../../src/templates/multi-shelf'
import { sceneNodeSchema } from '../../src/schemas/scene'
import type { TemplateParams } from '../../src/types/template'

const defaultParams: TemplateParams = {
  width: 0.8,
  height: 1.5,
  depth: 0.4,
  layers: 4,
  rodDiameter: 8,
  shelfMaterial: 'wood',
}

describe('multiShelfTemplate', () => {
  it('has correct metadata', () => {
    expect(multiShelfTemplate.id).toBe('multi-shelf')
    expect(multiShelfTemplate.category).toBe('multi')
  })

  it('generates valid scene graph', () => {
    const scene = multiShelfTemplate.generate(defaultParams)
    expect(() => sceneNodeSchema.parse(scene)).not.toThrow()
  })

  it('generates 4 rods', () => {
    const scene = multiShelfTemplate.generate(defaultParams)
    const rods = scene.children.filter((n) => n.type === 'rod')
    expect(rods).toHaveLength(4)
  })

  it('generates correct number of shelves (= layers)', () => {
    const scene = multiShelfTemplate.generate(defaultParams)
    const shelves = scene.children.filter((n) => n.type === 'shelf')
    expect(shelves).toHaveLength(defaultParams.layers)
  })

  it('generates correct number of clamps (= 4 * layers)', () => {
    const scene = multiShelfTemplate.generate(defaultParams)
    const clamps = scene.children.filter((n) => n.type === 'crossClamp')
    expect(clamps).toHaveLength(4 * defaultParams.layers)
  })
})
