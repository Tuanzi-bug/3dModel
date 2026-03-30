import { describe, expect, it } from 'vitest'
import type { SceneNode } from '../src/types/scene'
import { generateBom, serializeBomCsv } from '../src/utils/bom'

const sceneGraph: SceneNode = {
  id: 'root',
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children: [
    {
      id: 'rod-0',
      type: 'rod',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: { diameter: 13, length: 1.2 },
      children: [],
    },
    {
      id: 'rod-1',
      type: 'rod',
      position: [0.2, 0, 0],
      rotation: [0, 0, 0],
      params: { diameter: 13, length: 1.2 },
      children: [],
    },
    {
      id: 'shelf-0',
      type: 'shelf',
      position: [0, 0.8, 0],
      rotation: [0, 0, 0],
      params: { width: 1, depth: 0.5, thickness: 0.02, material: 'wood' },
      children: [],
    },
    {
      id: 'ledStrip-0',
      type: 'ledStrip',
      position: [0, 1.1, 0.2],
      rotation: [0, 0, 0],
      params: { length: 1.2, color: '#ffcc00' },
      children: [],
    },
    {
      id: 'backPanel-0',
      type: 'backPanel',
      position: [0, 0, -0.02],
      rotation: [0, 0, 0],
      params: { width: 0.8, height: 1.6, material: 'metal' },
      children: [],
    },
  ],
}

describe('generateBom', () => {
  it('aggregates deterministic BOM line items from canonical scene graph data', () => {
    const bom = generateBom(sceneGraph)

    expect(bom).toEqual([
      {
        type: 'rod',
        label: '杆',
        spec: '直径13mm × 长度1.20m',
        quantity: 2,
        unit: '根',
      },
      {
        type: 'shelf',
        label: '层板',
        spec: '1.00m × 0.50m × 0.02m · 木质',
        quantity: 1,
        unit: '块',
      },
      {
        type: 'ledStrip',
        label: 'LED灯带',
        spec: '长度1.20m · #ffcc00',
        quantity: 1,
        unit: '条',
      },
      {
        type: 'backPanel',
        label: '背板',
        spec: '0.80m × 1.60m · 金属',
        quantity: 1,
        unit: '块',
      },
    ])
  })

  it('serializes grouped BOM data into procurement-friendly CSV text', () => {
    const csv = serializeBomCsv(generateBom(sceneGraph))

    expect(csv).toContain('类型,规格,数量,单位')
    expect(csv).toContain('杆,直径13mm × 长度1.20m,2,根')
    expect(csv).toContain('层板,1.00m × 0.50m × 0.02m · 木质,1,块')
    expect(csv).toContain('LED灯带,长度1.20m · #ffcc00,1,条')
    expect(csv).toContain('背板,0.80m × 1.60m · 金属,1,块')
  })
})
