import { describe, expect, it } from 'vitest'
import { componentRegistry } from '@/components/meshes/registry'

describe('componentRegistry', () => {
  it('registers the Phase 3 LED strip and back panel meshes', () => {
    expect(componentRegistry.ledStrip).toBeDefined()
    expect(componentRegistry.backPanel).toBeDefined()
  })
})
