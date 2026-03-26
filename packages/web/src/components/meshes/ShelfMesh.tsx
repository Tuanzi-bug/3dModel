'use client'

import { useRef } from 'react'
import type { Mesh } from 'three'
import type { ShelfParams } from '@3d-modeler/core'
import { useEditorStore } from '@/stores/editor-store'

interface Props {
  params: ShelfParams
  nodeId: string
}

const materialColors = {
  wood: '#c4a882',
  acrylic: '#e8f4f8',
  metal: '#808080',
} as const

export function ShelfMesh({ params, nodeId }: Props) {
  const meshRef = useRef<Mesh>(null)
  const selectNode = useEditorStore((s) => s.selectNode)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)

  const isAcrylic = params.material === 'acrylic'

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation()
        selectNode(nodeId)
      }}
      position={[params.width / 2, 0, params.depth / 2]}
    >
      <boxGeometry args={[params.width, params.thickness, params.depth]} />
      {isAcrylic ? (
        <meshPhysicalMaterial
          color={selectedNodeId === nodeId ? '#4a9eff' : materialColors.acrylic}
          transmission={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      ) : (
        <meshStandardMaterial
          color={selectedNodeId === nodeId ? '#4a9eff' : materialColors[params.material]}
          metalness={params.material === 'metal' ? 0.6 : 0}
          roughness={params.material === 'metal' ? 0.3 : 0.7}
        />
      )}
    </mesh>
  )
}
