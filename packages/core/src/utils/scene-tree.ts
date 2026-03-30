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

export interface DuplicateNodeResult {
  sceneGraph: SceneNode
  duplicatedRootId: string | null
}

function cloneSubtree(
  node: SceneNode,
  createId: (type: string) => string,
): SceneNode {
  return {
    ...node,
    id: createId(node.type),
    children: node.children.map((child) => cloneSubtree(child, createId)),
  } as SceneNode
}

export function duplicateNodeWithFactory(
  root: SceneNode,
  id: string,
  createId: (type: string) => string,
): DuplicateNodeResult {
  const target = findNode(root, id)
  if (!target || root.id === id) {
    return {
      sceneGraph: root,
      duplicatedRootId: null,
    }
  }

  const dup = cloneSubtree(target, createId)

  function appendInTree(node: SceneNode): SceneNode {
    if (node.children.some((c) => c.id === id)) {
      return { ...node, children: [...node.children, dup] } as SceneNode
    }
    return {
      ...node,
      children: node.children.map((child) => appendInTree(child)),
    } as SceneNode
  }

  return {
    sceneGraph: appendInTree(root),
    duplicatedRootId: dup.id,
  }
}

export function duplicateNode(root: SceneNode, id: string): SceneNode {
  return duplicateNodeWithFactory(root, id, () => generateId()).sceneGraph
}

/**
 * Regenerate all node IDs in a scene graph using a custom ID generator.
 * Preserves tree structure but assigns new IDs to all nodes.
 *
 * @param node - The root node of the scene graph
 * @param generateId - Function that takes a node type and returns a new ID
 * @returns A new scene graph with regenerated IDs
 */
export function regenerateNodeIds(
  node: SceneNode,
  generateId: (type: string) => string
): SceneNode {
  // Special case: preserve 'root' ID
  const newId = node.id === 'root' ? 'root' : generateId(node.type)

  return {
    ...node,
    id: newId,
    children: node.children.map((child) => regenerateNodeIds(child, generateId)),
  } as SceneNode
}
