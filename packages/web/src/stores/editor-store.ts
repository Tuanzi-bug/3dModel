import { create } from 'zustand'
import type { SceneNode, TemplateParams, Vec3 } from '@3d-modeler/core'
import {
  findNode,
  updateNode as updateNodeInTree,
  addNode as addNodeToTree,
  removeNode as removeNodeFromTree,
  duplicateNode as duplicateNodeInTree,
  getTemplateById,
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
  past: SceneNode[]
  future: SceneNode[]

  // Design metadata
  designId: string | null
  designName: string

  selectNode: (id: string | null) => void
  updateNodeTransform: (id: string, updates: { position?: Vec3; rotation?: Vec3 }) => void
  updateNodeParams: (id: string, params: SceneNode['params']) => void
  addNode: (node: SceneNode) => void
  removeNode: (id: string) => void
  duplicateNode: (id: string) => void
  undo: () => void
  redo: () => void
  applyTemplate: (templateId: string, params: TemplateParams) => void
  updateTemplateParams: (params: Partial<TemplateParams>) => void
  loadDesign: (opts: { id: string; name: string; sceneGraph: SceneNode; templateId: string | null; templateParams: TemplateParams | null }) => void
  setDesignName: (name: string) => void
  resetScene: () => void
}

function pushHistory(state: EditorState): Partial<EditorState> {
  const past = [...state.past, state.sceneGraph]
  if (past.length > MAX_HISTORY) past.shift()
  return { past, future: [] }
}

export const useEditorStore = create<EditorState>((set, get) => ({
  sceneGraph: emptyRoot,
  selectedNodeId: null,
  mode: 'template',
  templateId: null,
  templateParams: null,
  past: [],
  future: [],
  designId: null,
  designName: 'Untitled',

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeTransform: (id, updates) =>
    set((state) => ({
      ...pushHistory(state),
      sceneGraph: updateNodeInTree(state.sceneGraph, id, updates),
    })),

  updateNodeParams: (id, params) =>
    set((state) => ({
      ...pushHistory(state),
      sceneGraph: updateNodeInTree(state.sceneGraph, id, { params }),
    })),

  addNode: (node) =>
    set((state) => ({
      ...pushHistory(state),
      sceneGraph: addNodeToTree(state.sceneGraph, node),
    })),

  removeNode: (id) =>
    set((state) => ({
      ...pushHistory(state),
      sceneGraph: removeNodeFromTree(state.sceneGraph, id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  duplicateNode: (id) =>
    set((state) => ({
      ...pushHistory(state),
      sceneGraph: duplicateNodeInTree(state.sceneGraph, id),
    })),

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
    set((state) => ({
      ...pushHistory(state),
      sceneGraph: template.generate(params),
      templateId,
      templateParams: params,
      mode: 'template',
      selectedNodeId: null,
    }))
  },

  updateTemplateParams: (partialParams) =>
    set((state) => {
      if (!state.templateId || !state.templateParams) return state
      const newParams = { ...state.templateParams, ...partialParams }
      const template = getTemplateById(state.templateId)
      if (!template) return state
      return {
        ...pushHistory(state),
        sceneGraph: template.generate(newParams),
        templateParams: newParams,
        selectedNodeId: null,
      }
    }),

  loadDesign: (opts) => {
    // Recover templateParams from template defaults if available
    const template = opts.templateId ? getTemplateById(opts.templateId) : null
    const templateParams = opts.templateParams ?? template?.defaultParams ?? null

    set({
      designId: opts.id,
      designName: opts.name,
      sceneGraph: opts.sceneGraph,
      templateId: opts.templateId,
      templateParams,
      mode: opts.templateId ? 'template' : 'freeform',
      past: [],
      future: [],
      selectedNodeId: null,
    })
  },

  setDesignName: (name) => set({ designName: name }),

  resetScene: () =>
    set({
      sceneGraph: emptyRoot,
      selectedNodeId: null,
      past: [],
      future: [],
      templateId: null,
      templateParams: null,
    }),
}))
