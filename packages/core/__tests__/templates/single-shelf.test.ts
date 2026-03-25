import { describe, it, expect } from 'vitest'
import { singleShelfTemplate } from '../../src/templates/single-shelf'
import { sceneNodeSchema } from '../../src/schemas/scene'
import type { TemplateParams } from '../../src/types/template'

describe('singleShelfTemplate', () => {
  it('has correct metadata', () => {
    expect(singleShelfTemplate.id).toBe('single-shelf')
    expect(singleShelfTemplate.category).toBe('single')
  })

  it('generates valid scene graph', () => {
    const scene = singleShelfTemplate.generate({
      width: 0.8,
      height: 1.0,
      depth: 0.4,
      layers: 5, // should be ignored: single-shelf always has 1 shelf
      rodDiameter: 8,
      shelfMaterial: 'wood',
    })
    expect(() => sceneNodeSchema.parse(scene)).not.toThrow()
  })

  it('always generates exactly 1 shelf regardless of layers param', () => {
    const params: TemplateParams = {
      width: 0.8,
      height: 1.0,
      depth: 0.4,
      layers: 5,
      rodDiameter: 8,
      shelfMaterial: 'wood',
    }
    const scene = singleShelfTemplate.generate(params)
    const shelves = scene.children.filter((n) => n.type === 'shelf')
    expect(shelves).toHaveLength(1)
  })
})
