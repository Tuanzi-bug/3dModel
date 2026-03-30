import { describe, expect, it } from 'vitest'
import type { SceneNode } from '../src/types/scene'
import { generateScenePreviewDataUrl } from '../src/utils/scene-preview'
import { singleShelfTemplate } from '../src/templates/single-shelf'
import { multiShelfTemplate } from '../src/templates/multi-shelf'
import { standaloneTemplate } from '../src/templates/standalone'

const previewScene: SceneNode = {
  id: 'root',
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children: [
    {
      id: 'rod-0',
      type: 'rod',
      position: [-0.4, 0, -0.2],
      rotation: [0, 0, 0],
      params: { diameter: 8, length: 1.2 },
      children: [],
    },
    {
      id: 'shelf-0',
      type: 'shelf',
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      params: { width: 0.8, depth: 0.4, thickness: 0.02, material: 'wood' },
      children: [],
    },
  ],
}

describe('generateScenePreviewDataUrl', () => {
  function decodePreview(dataUrl: string) {
    return decodeURIComponent(dataUrl.split(',')[1] ?? '')
  }

  function extractRectsByFill(svg: string, fill: string) {
    const matches = [...svg.matchAll(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"[^>]* fill="([^"]+)"[^>]*>/g)]

    return matches
      .filter((match) => match[5] === fill)
      .map((match) => ({
        x: Number(match[1]),
        y: Number(match[2]),
        width: Number(match[3]),
        height: Number(match[4]),
      }))
  }

  it('returns a deterministic svg data url for a scene graph', () => {
    const first = generateScenePreviewDataUrl(previewScene)
    const second = generateScenePreviewDataUrl(previewScene)

    expect(first).toBe(second)
    expect(first).toMatch(/^data:image\/svg\+xml/)
    expect(first.length).toBeGreaterThan(120)
  })

  it('provides non-empty thumbnails for the shipped preset templates', () => {
    for (const template of [singleShelfTemplate, multiShelfTemplate, standaloneTemplate]) {
      expect(template.thumbnail).toMatch(/^data:image\/svg\+xml/)
      expect(template.thumbnail.length).toBeGreaterThan(120)
    }
  })

  it('keeps rods with the same z-depth horizontally aligned in the x-axis side view', () => {
    const svg = decodePreview(generateScenePreviewDataUrl({
      id: 'root',
      type: 'group',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: {},
      children: [
        {
          id: 'rod-left',
          type: 'rod',
          position: [-0.6, 0, 0],
          rotation: [0, 0, 0],
          params: { diameter: 8, length: 1.2 },
          children: [],
        },
        {
          id: 'rod-right',
          type: 'rod',
          position: [0.6, 0, 0],
          rotation: [0, 0, 0],
          params: { diameter: 8, length: 1.2 },
          children: [],
        },
      ],
    }))

    const rods = extractRectsByFill(svg, '#c9d2dd').sort((a, b) => a.x - b.x)

    expect(rods).toHaveLength(2)
    expect(Math.abs(rods[1].x - rods[0].x)).toBeLessThan(2)
  })

  it('sizes shelf silhouettes from depth rather than hidden x-axis width', () => {
    const svg = decodePreview(generateScenePreviewDataUrl({
      id: 'root',
      type: 'group',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: {},
      children: [
        {
          id: 'shelf-narrow-depth',
          type: 'shelf',
          position: [0, 0.35, -0.45],
          rotation: [0, 0, 0],
          params: { width: 1.4, depth: 0.3, thickness: 0.02, material: 'wood' },
          children: [],
        },
        {
          id: 'shelf-wide-depth',
          type: 'shelf',
          position: [0, 0.75, 0.45],
          rotation: [0, 0, 0],
          params: { width: 0.4, depth: 0.9, thickness: 0.02, material: 'wood' },
          children: [],
        },
      ],
    }))

    const shelves = extractRectsByFill(svg, '#d6b38b').sort((a, b) => a.x - b.x)

    expect(shelves).toHaveLength(2)
    expect(shelves[1].width).toBeGreaterThan(shelves[0].width)
  })
})
