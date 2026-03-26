import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import type { SceneNode } from '@3d-modeler/core'

// Mock R3F — jsdom has no WebGL
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'canvas' }, children),
}))

// Mock registry with inline component (vi.mock is hoisted — no top-level vars)
vi.mock('@/components/meshes/registry', () => ({
  componentRegistry: {
    rod: ({ nodeId }: { params: any; nodeId: string }) =>
      React.createElement('div', { 'data-testid': `mesh-${nodeId}` }),
  },
}))

import { SceneRenderer } from '@/components/editor/SceneRenderer'

const groupNode = (id: string, children: SceneNode[] = []): SceneNode => ({
  id,
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children,
})

const rodNode = (id: string): SceneNode => ({
  id,
  type: 'rod',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: { diameter: 8, length: 1000 },
  children: [],
})

const shelfNode = (id: string): SceneNode => ({
  id,
  type: 'shelf',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: { width: 400, depth: 200, thickness: 18, material: 'wood' },
  children: [],
})

describe('SceneRenderer', () => {
  it('renders without crashing for an empty group', () => {
    const { container } = render(React.createElement(SceneRenderer, { node: groupNode('root') }))
    expect(container.firstChild).toBeTruthy()
  })

  it('renders a mesh component for a rod node', () => {
    const { getByTestId } = render(React.createElement(SceneRenderer, { node: rodNode('rod-1') }))
    expect(getByTestId('mesh-rod-1')).toBeTruthy()
  })

  it('does not render a mesh for a group node', () => {
    const { queryByTestId } = render(React.createElement(SceneRenderer, { node: groupNode('grp-1') }))
    expect(queryByTestId('mesh-grp-1')).toBeNull()
  })

  it('recursively renders children', () => {
    const parent = groupNode('grp-parent', [rodNode('rod-child')])
    const { getByTestId } = render(React.createElement(SceneRenderer, { node: parent }))
    expect(getByTestId('mesh-rod-child')).toBeTruthy()
  })

  it('renders multiple children', () => {
    const parent = groupNode('grp', [rodNode('rod-a'), rodNode('rod-b')])
    const { getByTestId } = render(React.createElement(SceneRenderer, { node: parent }))
    expect(getByTestId('mesh-rod-a')).toBeTruthy()
    expect(getByTestId('mesh-rod-b')).toBeTruthy()
  })

  it('skips unregistered node types gracefully', () => {
    // 'shelf' is not in our mock registry — should not throw
    expect(() => render(React.createElement(SceneRenderer, { node: shelfNode('shelf-1') }))).not.toThrow()
  })
})
