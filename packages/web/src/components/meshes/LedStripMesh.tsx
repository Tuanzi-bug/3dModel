// @ts-nocheck - R3F JSX types not resolved in monorepo
'use client'

import type { LedStripParams } from '@3d-modeler/core'
import { useEditorStore } from '@/stores/editor-store'

interface Props {
  params: LedStripParams
  nodeId: string
}

const STRIP_HEIGHT = 0.012
const STRIP_DEPTH = 0.02

export function LedStripMesh({ params, nodeId }: Props) {
  const selectNode = useEditorStore((s) => s.selectNode)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const isSelected = selectedNodeId === nodeId

  return (
    <mesh
      onClick={(e: any) => {
        e.stopPropagation()
        selectNode(nodeId)
      }}
    >
      <boxGeometry args={[params.length, STRIP_HEIGHT, STRIP_DEPTH]} />
      <meshStandardMaterial
        color={isSelected ? '#4a9eff' : params.color}
        emissive={params.color}
        emissiveIntensity={isSelected ? 0.5 : 0.8}
        metalness={0.15}
        roughness={0.35}
      />
    </mesh>
  )
}
