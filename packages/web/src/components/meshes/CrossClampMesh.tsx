// @ts-nocheck - R3F JSX types not resolved in monorepo
'use client'

import type { CrossClampParams } from '@3d-modeler/core'
import { useEditorStore } from '@/stores/editor-store'

interface Props {
  params: CrossClampParams
  nodeId: string
}

const DIAMETER_SCALE = 0.001

export function CrossClampMesh({ params, nodeId }: Props) {
  const selectNode = useEditorStore((s) => s.selectNode)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const color = selectedNodeId === nodeId ? '#4a9eff' : '#555555'
  const outerRadius = (params.rodDiameter * DIAMETER_SCALE) / 2 + 0.003

  return (
    <group onClick={(e: any) => { e.stopPropagation(); selectNode(nodeId) }}>
      {/* Vertical ring */}
      <mesh>
        <torusGeometry args={[outerRadius, 0.002, 8, 16]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Horizontal ring (rotated 90 degrees) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[outerRadius, 0.002, 8, 16]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}
