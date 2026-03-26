'use client'

import { useRef } from 'react'
import type { Mesh } from 'three'
import type { RodParams } from '@3d-modeler/core'
import { useEditorStore } from '@/stores/editor-store'

interface Props {
  params: RodParams
  nodeId: string
}

const DIAMETER_SCALE = 0.001 // mm to meters

export function RodMesh({ params, nodeId }: Props) {
  const meshRef = useRef<Mesh>(null)
  const selectNode = useEditorStore((s) => s.selectNode)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)

  const radius = (params.diameter * DIAMETER_SCALE) / 2

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation()
        selectNode(nodeId)
      }}
      position={[0, params.length / 2, 0]}
    >
      <cylinderGeometry args={[radius, radius, params.length, 16]} />
      <meshStandardMaterial
        color={selectedNodeId === nodeId ? '#4a9eff' : '#c0c0c0'}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}
