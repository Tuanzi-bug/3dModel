import { Suspense } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import { NewEditorClient } from '@/app/editor/new/NewEditorClient'
import EditEditorPage from '@/app/editor/[id]/page'
import { useEditorStore } from '@/stores/editor-store'
import type { SceneNode } from '@3d-modeler/core'

const emptyRoot: SceneNode = {
  id: 'root',
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children: [],
}

function resolvedParams(id: string) {
  const params = Promise.resolve({ id }) as Promise<{ id: string }> & {
    status?: 'fulfilled'
    value?: { id: string }
  }
  params.status = 'fulfilled'
  params.value = { id }
  return params
}

const mockPush = vi.fn()
const mockFetch = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/components/editor/EditorShell', () => ({
  EditorShell: () => <div>Editor Shell</div>,
}))

vi.mock('@/hooks/use-auto-save', () => ({
  useAutoSave: () => ({
    manualSave: vi.fn(),
    saveStatus: 'idle',
  }),
}))

vi.stubGlobal('fetch', mockFetch)

describe('editor entry pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useEditorStore.setState({
      sceneGraph: emptyRoot,
      selectedNodeId: null,
      mode: 'template',
      templateId: null,
      templateParams: null,
      transformMode: 'translate',
      past: [],
      future: [],
      typeCounters: {},
      designId: null,
      designName: 'Untitled',
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('creates a new design exactly once after clearing stale editor metadata', async () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState')

    useEditorStore.setState({
      designId: 'stale-design-id',
      designName: 'Stale Design',
      sceneGraph: {
        ...emptyRoot,
        children: [
          {
            id: 'rod-9',
            type: 'rod',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            params: { diameter: 8, length: 1 },
            children: [],
          },
        ],
      },
    })

    mockFetch.mockResolvedValue({
      json: async () => ({
        success: true,
        data: { id: 'new-design-id' },
      }),
    })

    render(<NewEditorClient templateId="single-shelf" />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/designs',
      expect.objectContaining({
        method: 'POST',
      }),
    )

    expect(useEditorStore.getState().designId).toBe('new-design-id')
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/editor/new-design-id')
  })

  it('creates an empty-canvas design exactly once for /editor/new?mode=freeform', async () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState')

    useEditorStore.setState({
      designId: 'stale-design-id',
      designName: 'Old preset draft',
      templateId: 'single-shelf',
      templateParams: {
        width: 0.8,
        height: 1,
        depth: 0.4,
        layers: 1,
        rodDiameter: 8,
        shelfMaterial: 'wood',
      },
      sceneGraph: {
        ...emptyRoot,
        children: [
          {
            id: 'rod-8',
            type: 'rod',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            params: { diameter: 8, length: 1 },
            children: [],
          },
        ],
      },
    })

    mockFetch.mockResolvedValue({
      json: async () => ({
        success: true,
        data: { id: 'freeform-design-id' },
      }),
    })

    render(<NewEditorClient templateId={null} mode="freeform" />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/designs',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(JSON.parse(mockFetch.mock.calls[0]?.[1]?.body as string)).toEqual({
      name: '新建设计',
      templateId: null,
      sceneGraph: emptyRoot,
    })
    expect(useEditorStore.getState()).toMatchObject({
      designId: 'freeform-design-id',
      designName: '新建设计',
      mode: 'freeform',
      templateId: null,
      templateParams: null,
      sceneGraph: emptyRoot,
    })
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/editor/freeform-design-id')
  })

  it('hydrates an existing design from the persisted API scene without recovering template defaults', async () => {
    const persistedScene: SceneNode = {
      id: 'root',
      type: 'group',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: {},
      children: [
        {
          id: 'rod-4',
          type: 'rod',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          params: { diameter: 13, length: 1.3 },
          children: [],
        },
      ],
    }

    mockFetch.mockResolvedValue({
      json: async () => ({
        success: true,
        data: {
          id: 'design-123',
          name: 'Persisted Design',
          templateId: 'single-shelf',
          sceneGraph: persistedScene,
        },
      }),
    })

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <EditEditorPage params={resolvedParams('design-123')} />
      </Suspense>,
    )

    await waitFor(() => {
      expect(useEditorStore.getState().designId).toBe('design-123')
    })

    expect(useEditorStore.getState().sceneGraph).toEqual(persistedScene)
    expect(useEditorStore.getState().templateParams).toBeNull()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('rehydrates a saved freeform design back into freeform mode', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({
        success: true,
        data: {
          id: 'freeform-design',
          name: '自由搭建设计',
          templateId: null,
          sceneGraph: emptyRoot,
        },
      }),
    })

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <EditEditorPage params={resolvedParams('freeform-design')} />
      </Suspense>,
    )

    await waitFor(() => {
      expect(useEditorStore.getState().designId).toBe('freeform-design')
    })

    expect(useEditorStore.getState().mode).toBe('freeform')
    expect(useEditorStore.getState().templateId).toBeNull()
  })

  it('redirects to the dashboard when the persisted design cannot be loaded', async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({
        success: false,
      }),
    })

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <EditEditorPage params={resolvedParams('missing-design')} />
      </Suspense>,
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
