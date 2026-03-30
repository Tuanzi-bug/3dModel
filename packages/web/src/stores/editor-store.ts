import { create } from 'zustand'
import type { SceneNode, TemplateParams, Vec3 } from '@3d-modeler/core'
import {
  findNode,
  updateNode as updateNodeInTree,
  addNode as addNodeToTree,
  removeNode as removeNodeFromTree,
  duplicateNodeWithFactory,
  getTemplateById,
  parseNodeId,
  regenerateNodeIds,
  resolveSnapPosition,
} from '@3d-modeler/core'

const MAX_HISTORY = 50

const emptyRoot: SceneNode = {
  id: 'root',
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children: [],
}

export interface EditorState {
  sceneGraph: SceneNode
  selectedNodeId: string | null
  mode: 'template' | 'freeform'
  templateId: string | null
  templateParams: TemplateParams | null
  transformMode: 'translate' | 'rotate'
  past: SceneNode[]
  future: SceneNode[]
  typeCounters: Record<string, number>

  // Design metadata
  designId: string | null
  designName: string

  selectNode: (id: string | null) => void
  setTransformMode: (mode: 'translate' | 'rotate') => void
  updateNodeTransform: (id: string, updates: { position?: Vec3; rotation?: Vec3 }) => void
  updateNodeParams: (id: string, params: SceneNode['params']) => void
  addNode: (node: SceneNode) => void
  removeNode: (id: string) => void
  duplicateNode: (id: string) => void
  undo: () => void
  redo: () => void
  applyTemplate: (templateId: string, params: TemplateParams) => void
  updateTemplateParams: (params: Partial<TemplateParams>) => void
  switchToFreeform: () => void
  loadDesign: (opts: { id: string; name: string; sceneGraph: SceneNode; templateId: string | null; templateParams: TemplateParams | null }) => void
  setDesignName: (name: string) => void
  resetScene: () => void
  generateNodeId: (type: string) => string
}

function pushHistory(state: EditorState): Partial<EditorState> {
  const past = [...state.past, state.sceneGraph]
  if (past.length > MAX_HISTORY) past.shift()
  return { past, future: [] }
}

function deriveTypeCounters(sceneGraph: SceneNode): Record<string, number> {
  const counters: Record<string, number> = {}

  function visit(node: SceneNode) {
    if (node.id !== 'root') {
      const parsed = parseNodeId(node.id)
      const numericSequence = Number(parsed.sequence)

      if (Number.isFinite(numericSequence) && numericSequence >= 0) {
        counters[node.type] = Math.max(counters[node.type] ?? 0, numericSequence + 1)
      } else {
        counters[node.type] = (counters[node.type] ?? 0) + 1
      }
    }

    node.children.forEach(visit)
  }

  visit(sceneGraph)

  return counters
}

function regenerateSceneWithCounters(
  sceneGraph: SceneNode,
  counters: Record<string, number>,
) {
  const nextCounters = { ...counters }
  const nextSceneGraph = regenerateNodeIds(sceneGraph, (type) => {
    const currentCount = nextCounters[type] || 0
    nextCounters[type] = currentCount + 1
    return `${type}-${currentCount}`
  })

  return {
    nextSceneGraph,
    nextCounters,
  }
}

export const useEditorStore = create<EditorState>((set, get) => ({
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

  selectNode: (id) => set({ selectedNodeId: id }),

  setTransformMode: (mode) => set({ transformMode: mode }),

  generateNodeId: (type) => {
    const state = get()
    const currentCount = state.typeCounters[type] || 0
    set({ typeCounters: { ...state.typeCounters, [type]: currentCount + 1 } })
    return `${type}-${currentCount}`
  },

  updateNodeTransform: (id, updates) =>
    set((state) => {
      const nextPosition = updates.position
        ? resolveSnapPosition(state.sceneGraph, updates.position, {
            movingNodeId: id,
          }).position
        : undefined

      return {
        ...pushHistory(state),
        sceneGraph: updateNodeInTree(state.sceneGraph, id, {
          ...updates,
          position: nextPosition,
        }),
      }
    }),

  updateNodeParams: (id, params) =>
    set((state) => ({
      ...pushHistory(state),
      sceneGraph: updateNodeInTree(state.sceneGraph, id, { params }),
    })),

  addNode: (node) =>
    set((state) => ({
      ...pushHistory(state),
      sceneGraph: addNodeToTree(state.sceneGraph, {
        ...node,
        position: resolveSnapPosition(state.sceneGraph, node.position, {
          movingNode: node,
        }).position,
      }),
    })),

  removeNode: (id) =>
    set((state) => ({
      ...pushHistory(state),
      sceneGraph: removeNodeFromTree(state.sceneGraph, id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  duplicateNode: (id) =>
    set((state) => {
      const nextCounters = { ...state.typeCounters }
      const { sceneGraph, duplicatedRootId } = duplicateNodeWithFactory(
        state.sceneGraph,
        id,
        (type) => {
          const currentCount = nextCounters[type] || 0
          nextCounters[type] = currentCount + 1
          return `${type}-${currentCount}`
        },
      )

      if (!duplicatedRootId) {
        return state
      }

      return {
        ...pushHistory(state),
        sceneGraph,
        selectedNodeId: duplicatedRootId,
        typeCounters: nextCounters,
      }
    }),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state
      const prev = state.past[state.past.length - 1]
      return {
        sceneGraph: prev,
        past: state.past.slice(0, -1),
        future: [state.sceneGraph, ...state.future],
      }
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        sceneGraph: next,
        past: [...state.past, state.sceneGraph],
        future: state.future.slice(1),
      }
    }),

  applyTemplate: (templateId, params) => {
    const template = getTemplateById(templateId)
    if (!template) return

    const state = get()
    const { nextSceneGraph, nextCounters } = regenerateSceneWithCounters(
      template.generate(params),
      state.typeCounters,
    )

    set((state) => ({
      ...pushHistory(state),
      sceneGraph: nextSceneGraph,
      templateId,
      templateParams: params,
      mode: 'template',
      selectedNodeId: null,
      typeCounters: nextCounters,
    }))
  },

  updateTemplateParams: (partialParams) =>
    set((state) => {
      if (!state.templateId || !state.templateParams) return state
      const newParams = { ...state.templateParams, ...partialParams }
      const template = getTemplateById(state.templateId)
      if (!template) return state

      const { nextSceneGraph, nextCounters } = regenerateSceneWithCounters(
        template.generate(newParams),
        state.typeCounters,
      )

      return {
        ...pushHistory(state),
        sceneGraph: nextSceneGraph,
        templateParams: newParams,
        selectedNodeId: null,
        typeCounters: nextCounters,
      }
    }),

  switchToFreeform: () =>
    set((state) => ({
      mode: 'freeform',
      templateId: null,
      templateParams: null,
      sceneGraph: state.sceneGraph,
      selectedNodeId: state.selectedNodeId,
      past: state.past,
      future: state.future,
      typeCounters: state.typeCounters,
      designId: state.designId,
      designName: state.designName,
    })),

  loadDesign: (opts) => {
    set({
      designId: opts.id,
      designName: opts.name,
      sceneGraph: opts.sceneGraph,
      templateId: opts.templateId,
      templateParams: opts.templateParams,
      mode: opts.templateId ? 'template' : 'freeform',
      transformMode: 'translate',
      past: [],
      future: [],
      selectedNodeId: null,
      typeCounters: deriveTypeCounters(opts.sceneGraph),
    })
  },

  setDesignName: (name) => set({ designName: name }),

  resetScene: () =>
    set({
      sceneGraph: emptyRoot,
      selectedNodeId: null,
      past: [],
      future: [],
      mode: 'template',
      templateId: null,
      templateParams: null,
      transformMode: 'translate',
      typeCounters: {},
      designId: null,
      designName: 'Untitled',
    }),
}))
