import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import React, { useEffect } from 'react'
import type { SceneNode } from '@3d-modeler/core'

const mocks = vi.hoisted(() => {
  const position = {
    x: 0.23,
    y: 1.02,
    z: -0.01,
    set: vi.fn((x: number, y: number, z: number) => {
      position.x = x
      position.y = y
      position.z = z
    }),
  }

  const rotation = { x: 0, y: 0, z: 0 }
  const group = { position, rotation }

  return {
    camera: {
      position: { set: vi.fn() },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn(),
    },
    orbitControls: {
      enabled: true,
      target: { copy: vi.fn() },
      update: vi.fn(),
    },
    position,
    group,
    selectNode: vi.fn(),
    setTransformMode: vi.fn(),
    updateNodeTransform: vi.fn(),
    resolveSnapPosition: vi.fn(() => ({
      position: [0.25, 1, 0] as [number, number, number],
      reason: 'grid' as const,
    })),
  }
})

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
      params: { diameter: 8, length: 1 },
      children: [],
    },
  ],
}

vi.mock('@3d-modeler/core', async () => {
  const actual = await vi.importActual<typeof import('@3d-modeler/core')>('@3d-modeler/core')

  return {
    ...actual,
    getSceneBounds: vi.fn(() => ({
      min: [0, 0, 0] as [number, number, number],
      max: [1, 1, 1] as [number, number, number],
      size: [1, 1, 1] as [number, number, number],
      center: [0.5, 0.5, 0.5] as [number, number, number],
    })),
    resolveSnapPosition: mocks.resolveSnapPosition,
  }
})

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, onPointerMissed }: { children: React.ReactNode; onPointerMissed?: () => void }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'canvas',
        onClick: () => onPointerMissed?.(),
      },
      children,
    ),
  useThree: () => ({ camera: mocks.camera }),
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: React.forwardRef((_props: object, ref: React.ForwardedRef<object>) => {
    if (typeof ref === 'function') {
      ref(mocks.orbitControls)
    } else if (ref) {
      ref.current = mocks.orbitControls
    }

    return React.createElement('div', { 'data-testid': 'orbit-controls' })
  }),
  Grid: () => React.createElement('div', { 'data-testid': 'grid' }),
  GizmoHelper: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  GizmoViewport: () => React.createElement('div', { 'data-testid': 'gizmo' }),
  TransformControls: ({
    object,
    onObjectChange,
    onMouseDown,
    onMouseUp,
  }: {
    object: typeof mocks.group
    onObjectChange?: (event: { target: { object: typeof mocks.group } }) => void
    onMouseDown?: () => void
    onMouseUp?: (event?: { target: { object: typeof mocks.group } }) => void
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'transform-controls' },
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () => {
            onMouseDown?.()
            onObjectChange?.({ target: { object } })
          },
        },
        'drag-change',
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () => onMouseUp?.({ target: { object } }),
        },
        'drag-end',
      ),
    ),
}))

vi.mock('@/components/editor/SceneRenderer', () => ({
  SceneRenderer: ({ onSelectGroup }: { onSelectGroup?: (group: typeof mocks.group, nodeId: string) => void }) => {
    useEffect(() => {
      onSelectGroup?.(mocks.group, 'rod-0')
    }, [onSelectGroup])

    return React.createElement('div', { 'data-testid': 'scene-renderer' })
  },
}))

vi.mock('@/stores/editor-store', () => ({
  useEditorStore: (selector: (state: {
    sceneGraph: SceneNode
    selectedNodeId: string | null
    transformMode: 'translate' | 'rotate'
    selectNode: typeof mocks.selectNode
    setTransformMode: typeof mocks.setTransformMode
    updateNodeTransform: typeof mocks.updateNodeTransform
  }) => unknown) =>
    selector({
      sceneGraph,
      selectedNodeId: 'rod-0',
      transformMode: 'translate',
      selectNode: mocks.selectNode,
      setTransformMode: mocks.setTransformMode,
      updateNodeTransform: mocks.updateNodeTransform,
    }),
}))

import { ViewportCanvas } from '@/components/editor/ViewportCanvas'

describe('ViewportCanvas', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.camera.position.set.mockClear()
    mocks.camera.lookAt.mockClear()
    mocks.camera.updateProjectionMatrix.mockClear()
    mocks.orbitControls.target.copy.mockClear()
    mocks.orbitControls.update.mockClear()
    mocks.position.set.mockClear()
    mocks.selectNode.mockClear()
    mocks.setTransformMode.mockClear()
    mocks.updateNodeTransform.mockClear()
    mocks.resolveSnapPosition.mockClear()
    mocks.position.x = 0.23
    mocks.position.y = 1.02
    mocks.position.z = -0.01
    mocks.orbitControls.enabled = true
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('defers snap resolution for translate mode until the drag ends', () => {
    render(<ViewportCanvas />)

    fireEvent.click(screen.getByRole('button', { name: 'drag-change' }))

    expect(mocks.resolveSnapPosition).not.toHaveBeenCalled()
    expect(mocks.updateNodeTransform).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'drag-end' }))

    expect(mocks.resolveSnapPosition).toHaveBeenCalledWith(sceneGraph, [0.23, 1.02, -0.01], {
      movingNodeId: 'rod-0',
    })
    expect(mocks.position.set).toHaveBeenCalledWith(0.25, 1, 0)
    expect(mocks.updateNodeTransform).toHaveBeenCalledTimes(1)
    expect(mocks.updateNodeTransform).toHaveBeenCalledWith('rod-0', {
      position: [0.25, 1, 0],
      rotation: [0, 0, 0],
    })
  })
})
