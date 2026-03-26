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
      past: [],
      future: [],
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

  it('duplicates a node', () => {
    const rod: SceneNode = {
      id: 'rod-test',
      type: 'rod',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: { diameter: 8, length: 1 },
      children: [],
    }
    useEditorStore.getState().addNode(rod)
    useEditorStore.getState().duplicateNode('rod-test')
    expect(useEditorStore.getState().sceneGraph.children).toHaveLength(2)
  })
})
