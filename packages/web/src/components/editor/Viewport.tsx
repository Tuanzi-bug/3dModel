// @ts-nocheck - R3F JSX types not resolved in monorepo
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { SceneRenderer } from './SceneRenderer'
import { useEditorStore } from '@/stores/editor-store'

export function Viewport() {
  const sceneGraph = useEditorStore((s) => s.sceneGraph)
  const selectNode = useEditorStore((s) => s.selectNode)

  return (
    <div className="flex-1 h-full bg-gray-900">
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        onPointerMissed={() => selectNode(null)}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <OrbitControls enableDamping dampingFactor={0.1} />
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#444444"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#666666"
          fadeDistance={25}
          infiniteGrid
        />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport />
        </GizmoHelper>
        <SceneRenderer node={sceneGraph} />
      </Canvas>
    </div>
  )
}
