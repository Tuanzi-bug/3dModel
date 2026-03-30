// @ts-nocheck - R3F JSX types not resolved in monorepo
'use client'

import type { BackPanelParams } from '@3d-modeler/core'
import { useEditorStore } from '@/stores/editor-store'

interface Props {
  params: BackPanelParams
  nodeId: string
}

const PANEL_THICKNESS = 0.02

const materialColors = {
  wood: '#d0b18c',
  acrylic: '#dbeff6',
  metal: '#8d98a6',
} as const

export function BackPanelMesh({ params, nodeId }: Props) {
  const selectNode = useEditorStore((s) => s.selectNode)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const isSelected = selectedNodeId === nodeId

  return (
    <mesh
      onClick={(e: any) => {
        e.stopPropagation()
        selectNode(nodeId)
      }}
      position={[params.width / 2, params.height / 2, 0]}
    >
      <boxGeometry args={[params.width, params.height, PANEL_THICKNESS]} />
      {params.material === 'acrylic' ? (
        <meshPhysicalMaterial
          color={isSelected ? '#4a9eff' : materialColors.acrylic}
          transmission={0.82}
          transparent
          opacity={0.45}
          roughness={0.1}
        />
      ) : (
        <meshStandardMaterial
          color={isSelected ? '#4a9eff' : materialColors[params.material]}
          metalness={params.material === 'metal' ? 0.55 : 0.05}
          roughness={params.material === 'metal' ? 0.35 : 0.7}
        />
      )}
    </mesh>
  )
}
