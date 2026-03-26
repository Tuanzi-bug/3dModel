// @ts-nocheck - R3F JSX types not resolved in monorepo
'use client'

import type { SceneNode } from '@3d-modeler/core'
import { componentRegistry } from '@/components/meshes/registry'

interface Props {
  node: SceneNode
}

export function SceneRenderer({ node }: Props) {
  const MeshComponent = node.type !== 'group' ? componentRegistry[node.type] : null

  return (
    <group position={node.position} rotation={node.rotation}>
      {MeshComponent && <MeshComponent params={node.params} nodeId={node.id} />}
      {node.children.map((child) => (
        <SceneRenderer key={child.id} node={child} />
      ))}
    </group>
  )
}
