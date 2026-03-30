import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore, type EditorState } from '@/stores/editor-store'
import type { SceneNode, TemplateParams } from '@3d-modeler/core'

const emptyRoot: SceneNode = {
  id: 'root',
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children: [],
}

describe('EditorStore', () => {
  beforeEach(() => {
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

  it('selects a node', () => {
    useEditorStore.getState().selectNode('rod-1')
    expect(useEditorStore.getState().selectedNodeId).toBe('rod-1')
  })

  it('deselects with null', () => {
    useEditorStore.getState().selectNode('rod-1')
    useEditorStore.getState().selectNode(null)
    expect(useEditorStore.getState().selectedNodeId).toBeNull()
  })

  describe('undo/redo', () => {
    it('undoes last change', () => {
      // Add a rod via addNode
      const rod: SceneNode = {
        id: 'rod-test',
        type: 'rod',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        params: { diameter: 8, length: 1 },
        children: [],
      }
      useEditorStore.getState().addNode(rod)
      expect(useEditorStore.getState().sceneGraph.children).toHaveLength(1)

      useEditorStore.getState().undo()
      expect(useEditorStore.getState().sceneGraph.children).toHaveLength(0)
    })

    it('redoes undone change', () => {
      const rod: SceneNode = {
        id: 'rod-test',
        type: 'rod',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        params: { diameter: 8, length: 1 },
        children: [],
      }
      useEditorStore.getState().addNode(rod)
      useEditorStore.getState().undo()
      useEditorStore.getState().redo()
      expect(useEditorStore.getState().sceneGraph.children).toHaveLength(1)
    })
  })

  it('removes a node', () => {
    const rod: SceneNode = {
      id: 'rod-test',
      type: 'rod',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: { diameter: 8, length: 1 },
      children: [],
    }
    useEditorStore.getState().addNode(rod)
    useEditorStore.getState().removeNode('rod-test')
    expect(useEditorStore.getState().sceneGraph.children).toHaveLength(0)
  })

  it('duplicates a node and switches selection to the duplicated copy', () => {
    const originalId = useEditorStore.getState().generateNodeId('rod')
    const rod: SceneNode = {
      id: originalId,
      type: 'rod',
      position: [1, 0.25, 0],
      rotation: [0, 0.5, 0],
      params: { diameter: 8, length: 1.25 },
      children: [],
    }
    useEditorStore.getState().addNode(rod)
    useEditorStore.getState().selectNode(originalId)
    useEditorStore.getState().duplicateNode(originalId)

    const state = useEditorStore.getState()
    expect(state.sceneGraph.children).toHaveLength(2)
    expect(state.selectedNodeId).toBe('rod-1')
    expect(state.typeCounters).toEqual({ rod: 2 })
    expect(state.sceneGraph.children[0]).toMatchObject(rod)
    expect(state.sceneGraph.children[1]).toMatchObject({
      ...rod,
      id: 'rod-1',
    })
  })

  it('tracks the active transform mode for freeform editing', () => {
    useEditorStore.getState().setTransformMode('rotate')

    expect(useEditorStore.getState().transformMode).toBe('rotate')
  })

  it('snaps new freeform components onto the placement grid', () => {
    useEditorStore.getState().addNode({
      id: 'rod-test',
      type: 'rod',
      position: [0.06, 0.12, -0.02],
      rotation: [0, 0, 0],
      params: { diameter: 8, length: 1 },
      children: [],
    })

    expect(useEditorStore.getState().sceneGraph.children[0]?.position).toEqual([0.05, 0.1, 0])
  })

  it('snaps moved nodes onto nearby connection anchors before persisting the transform', () => {
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
        {
          id: 'rod-1',
          type: 'rod',
          position: [0.3, 0, 0],
          rotation: [0, 0, 0],
          params: { diameter: 8, length: 1 },
          children: [],
        },
      ],
    }

    useEditorStore.setState({
      sceneGraph,
      selectedNodeId: 'rod-1',
      mode: 'freeform',
      templateId: null,
      templateParams: null,
      transformMode: 'translate',
      past: [],
      future: [],
      typeCounters: { rod: 2 },
      designId: 'design-precision',
      designName: 'Precision test',
    })

    useEditorStore.getState().updateNodeTransform('rod-1', {
      position: [0.02, 1.02, -0.01],
    })

    expect(useEditorStore.getState().sceneGraph.children[1]?.position).toEqual([0, 1, 0])
  })

  it('preserves node position when only the rotation changes', () => {
    const rod: SceneNode = {
      id: 'rod-rotation-test',
      type: 'rod',
      position: [0.5, 0.25, -0.75],
      rotation: [0, 0, 0],
      params: { diameter: 8, length: 1 },
      children: [],
    }

    useEditorStore.getState().addNode(rod)
    useEditorStore.getState().updateNodeTransform('rod-rotation-test', {
      rotation: [0, 0.5, 0],
    })

    expect(useEditorStore.getState().sceneGraph.children[0]).toMatchObject({
      id: 'rod-rotation-test',
      position: [0.5, 0.25, -0.75],
      rotation: [0, 0.5, 0],
    })
  })

  describe('applyTemplate', () => {
    it('regenerates all node IDs to type-sequence format', () => {
      const params: TemplateParams = {
        width: 0.8,
        height: 1.0,
        depth: 0.4,
        layers: 1,
        rodDiameter: 8,
        shelfMaterial: 'wood',
      }

      useEditorStore.getState().applyTemplate('single-shelf', params)

      const sceneGraph = useEditorStore.getState().sceneGraph

      // Helper to collect all node IDs recursively
      function collectIds(node: SceneNode): string[] {
        return [node.id, ...node.children.flatMap(collectIds)]
      }

      const allIds = collectIds(sceneGraph)

      // All IDs should match the pattern: type-number (e.g., "rod-0", "shelf-1")
      // or be "root" (special case)
      for (const id of allIds) {
        if (id === 'root') continue

        // Should match pattern: type-sequence
        const parts = id.split('-')
        expect(parts.length).toBeGreaterThanOrEqual(2)

        // Last part should be a number
        const sequence = parts[parts.length - 1]
        expect(sequence).toMatch(/^\d+$/)
      }

      // Verify we have the expected node types
      expect(allIds.some(id => id.startsWith('rod-'))).toBe(true)
      expect(allIds.some(id => id.startsWith('shelf-'))).toBe(true)
    })
  })

  describe('loadDesign', () => {
    it('trusts the persisted scene graph and keeps template params null when absent', () => {
      const persistedScene: SceneNode = {
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
          {
            id: 'shelf-0',
            type: 'shelf',
            position: [0, 0.4, 0],
            rotation: [0, 0, 0],
            params: { width: 0.8, depth: 0.4, thickness: 0.02, material: 'wood' },
            children: [],
          },
        ],
      }

      useEditorStore.setState({
        selectedNodeId: 'rod-1',
        transformMode: 'rotate',
        past: [persistedScene],
        future: [persistedScene],
      })

      useEditorStore.getState().loadDesign({
        id: 'design-123',
        name: 'Persisted design',
        sceneGraph: persistedScene,
        templateId: 'single-shelf',
        templateParams: null,
      })

      const state = useEditorStore.getState()

      expect(state.sceneGraph).toEqual(persistedScene)
      expect(state.templateParams).toBeNull()
      expect(state.selectedNodeId).toBeNull()
      expect(state.past).toEqual([])
      expect(state.future).toEqual([])
      expect(state.typeCounters).toEqual({
        rod: 1,
        shelf: 1,
      })
      expect(state.transformMode).toBe('translate')
    })

    it('seeds counters from loaded node ids so new ids do not collide', () => {
      const persistedScene: SceneNode = {
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
          {
            id: 'rod-2',
            type: 'rod',
            position: [0, 0.5, 0],
            rotation: [0, 0, 0],
            params: { diameter: 8, length: 1 },
            children: [],
          },
        ],
      }

      useEditorStore.getState().loadDesign({
        id: 'design-456',
        name: 'Counter seed',
        sceneGraph: persistedScene,
        templateId: null,
        templateParams: null,
      })

      const id = useEditorStore.getState().generateNodeId('rod')

      expect(id).toBe('rod-3')
      expect(useEditorStore.getState().mode).toBe('freeform')
    })

    it('switches a preset-started design to freeform without clearing the current scene', () => {
      const currentScene: SceneNode = {
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

      useEditorStore.setState({
        sceneGraph: currentScene,
        selectedNodeId: 'rod-0',
        mode: 'template',
        templateId: 'single-shelf',
        templateParams: {
          width: 0.8,
          height: 1.0,
          depth: 0.4,
          layers: 1,
          rodDiameter: 8,
          shelfMaterial: 'wood',
        },
        past: [emptyRoot],
        future: [],
        typeCounters: { rod: 1 },
        designId: 'design-freeform',
        designName: '模板设计',
      })

      useEditorStore.getState().switchToFreeform()

      expect(useEditorStore.getState()).toMatchObject({
        sceneGraph: currentScene,
        selectedNodeId: 'rod-0',
        mode: 'freeform',
        templateId: null,
        templateParams: null,
        past: [emptyRoot],
        future: [],
        typeCounters: { rod: 1 },
        designId: 'design-freeform',
        designName: '模板设计',
      })
    })
  })

  describe('resetScene', () => {
    it('clears persisted design metadata and counters before a new preset entry', () => {
      useEditorStore.setState({
        sceneGraph: {
          ...emptyRoot,
          children: [
            {
              id: 'rod-4',
              type: 'rod',
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              params: { diameter: 8, length: 1 },
              children: [],
            },
          ],
        },
        selectedNodeId: 'rod-4',
        mode: 'freeform',
        templateId: 'single-shelf',
        templateParams: {
          width: 0.8,
          height: 1.0,
          depth: 0.4,
          layers: 1,
          rodDiameter: 8,
          shelfMaterial: 'wood',
        },
        transformMode: 'rotate',
        past: [emptyRoot],
        future: [emptyRoot],
        typeCounters: { rod: 5 },
        designId: 'design-789',
        designName: 'Old design',
      })

      useEditorStore.getState().resetScene()

      expect(useEditorStore.getState()).toMatchObject({
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
  })
})
