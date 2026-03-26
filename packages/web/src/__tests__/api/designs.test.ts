import { describe, it, expect, vi } from 'vitest'

vi.stubEnv('JWT_SECRET', 'a'.repeat(32))
vi.stubEnv('DATABASE_URL', 'file:./test.db')

import { createDesignSchema, updateDesignSchema } from '@3d-modeler/core'

describe('design validation', () => {
  it('validates create design input', () => {
    const input = {
      name: 'My Shelf',
      templateId: 'standalone',
      sceneGraph: {
        id: 'root',
        type: 'group',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        params: {},
        children: [],
      },
    }
    expect(() => createDesignSchema.parse(input)).not.toThrow()
  })

  it('validates partial update', () => {
    const input = { name: 'Renamed' }
    expect(() => updateDesignSchema.parse(input)).not.toThrow()
  })

  it('rejects empty name', () => {
    const input = { name: '' }
    expect(() => createDesignSchema.parse(input)).toThrow()
  })
})
