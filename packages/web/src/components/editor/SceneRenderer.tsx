// @ts-nocheck - R3F JSX types not resolved in monorepo
'use client'

import { useRef, useEffect } from 'react'
import type { Group } from 'three'
import type { SceneNode } from '@3d-modeler/core'
import { componentRegistry } from '@/components/meshes/registry'
import { useEditorStore } from '@/stores/editor-store'

interface Props {
  node: SceneNode
  onSelectGroup?: (group: Group | null, nodeId: string) => void
}

export function SceneRenderer({ node, onSelectGroup }: Props) {
  const MeshComponent = node.type !== 'group' ? componentRegistry[node.type] : null
  const groupRef = useRef<Group>(null)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)

  // Notify parent when this node is selected
  useEffect(() => {
    if (selectedNodeId === node.id && groupRef.current && onSelectGroup) {
      onSelectGroup(groupRef.current, node.id)
    }
  }, [selectedNodeId, node.id, onSelectGroup])

  return (
    <group ref={groupRef} position={node.position} rotation={node.rotation}>
      {MeshComponent && <MeshComponent params={node.params} nodeId={node.id} />}
      {node.children.map((child) => (
        <SceneRenderer key={child.id} node={child} onSelectGroup={onSelectGroup} />
      ))}
    </group>
  )
}
