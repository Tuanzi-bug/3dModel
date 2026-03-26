// @ts-nocheck - R3F JSX types not resolved in monorepo
'use client'

import type { TeeConnectorParams } from '@3d-modeler/core'
import { useEditorStore } from '@/stores/editor-store'

interface Props {
  params: TeeConnectorParams
  nodeId: string
}

const DIAMETER_SCALE = 0.001

export function TeeMesh({ params, nodeId }: Props) {
  const selectNode = useEditorStore((s) => s.selectNode)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const color = selectedNodeId === nodeId ? '#4a9eff' : '#555555'
  const r = (params.rodDiameter * DIAMETER_SCALE) / 2 + 0.002
  const len = 0.02

  return (
    <group onClick={(e: any) => { e.stopPropagation(); selectNode(nodeId) }}>
      {/* Vertical cylinder */}
      <mesh>
        <cylinderGeometry args={[r, r, len, 12]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Horizontal cylinder (T branch) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r, r, len, 12]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}
