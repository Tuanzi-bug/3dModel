// @ts-nocheck - R3F JSX types not resolved in monorepo
'use client'

import type { FixedRingParams } from '@3d-modeler/core'
import { useEditorStore } from '@/stores/editor-store'

interface Props {
  params: FixedRingParams
  nodeId: string
}

const DIAMETER_SCALE = 0.001

export function FixedRingMesh({ params, nodeId }: Props) {
  const selectNode = useEditorStore((s) => s.selectNode)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const outerRadius = (params.rodDiameter * DIAMETER_SCALE) / 2 + 0.004

  return (
    <mesh onClick={(e: any) => { e.stopPropagation(); selectNode(nodeId) }}>
      <torusGeometry args={[outerRadius, 0.003, 8, 24]} />
      <meshStandardMaterial
        color={selectedNodeId === nodeId ? '#4a9eff' : '#444444'}
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  )
}
