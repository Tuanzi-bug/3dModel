import type {
  SceneNode,
  RodParams,
  CrossClampParams,
  FixedRingParams,
  TeeConnectorParams,
  ShelfParams,
  LedStripParams,
  BackPanelParams,
} from '../types/scene'
import { generateId } from './id'

type AnyNodeParams =
  | RodParams
  | CrossClampParams
  | FixedRingParams
  | TeeConnectorParams
  | ShelfParams
  | LedStripParams
  | BackPanelParams
  | Record<string, never>

export function findNode(root: SceneNode, id: string): SceneNode | undefined {
  if (root.id === id) return root
  for (const child of root.children) {
    const found = findNode(child, id)
    if (found) return found
  }
  return undefined
}

export type NodePatch = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  children?: SceneNode[]
  params?: AnyNodeParams
}

export function updateNode(root: SceneNode, id: string, patch: NodePatch): SceneNode {
  if (root.id === id) {
    return { ...root, ...patch } as SceneNode
  }
  return {
    ...root,
    children: root.children.map((child) => updateNode(child, id, patch)),
  } as SceneNode
}

export function addNode(root: SceneNode, node: SceneNode): SceneNode {
  return {
    ...root,
    children: [...root.children, node],
  } as SceneNode
}

export function removeNode(root: SceneNode, id: string): SceneNode {
  return {
    ...root,
    children: root.children
      .filter((child) => child.id !== id)
      .map((child) => removeNode(child, id)),
  } as SceneNode
}

function cloneSubtree(node: SceneNode): SceneNode {
  return {
    ...node,
    id: generateId(),
    children: node.children.map(cloneSubtree),
  } as SceneNode
}

export function duplicateNode(root: SceneNode, id: string): SceneNode {
  const target = findNode(root, id)
  if (!target || root.id === id) return root

  const dup = cloneSubtree(target)

  function appendInTree(node: SceneNode): SceneNode {
    if (node.children.some((c) => c.id === id)) {
      return { ...node, children: [...node.children, dup] } as SceneNode
    }
    return {
      ...node,
      children: node.children.map((child) => appendInTree(child)),
    } as SceneNode
  }

  return appendInTree(root)
}
