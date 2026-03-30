// @ts-nocheck - R3F JSX types not resolved in monorepo
'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { RefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, TransformControls } from '@react-three/drei'
import type { Group } from 'three'
import { Vector3 } from 'three'
import { getSceneBounds, resolveSnapPosition } from '@3d-modeler/core'
import { Move3d, RotateCw } from 'lucide-react'
import { SceneRenderer } from './SceneRenderer'
import { ViewPresetToolbar, type ViewPreset } from './ViewPresetToolbar'
import { DimensionOverlay } from './DimensionOverlay'
import { useEditorStore } from '@/stores/editor-store'

interface CameraPresetControllerProps {
  activePreset: ViewPreset
  bounds: ReturnType<typeof getSceneBounds>
  controlsRef: RefObject<any>
}

function CameraPresetController({ activePreset, bounds, controlsRef }: CameraPresetControllerProps) {
  const { camera } = useThree()

  useEffect(() => {
    if (!bounds) {
      return
    }

    const [width, height, depth] = bounds.size
    const [cx, cy, cz] = bounds.center
    const maxSpan = Math.max(width, height, depth, 0.5)
    const distance = Math.max(maxSpan * 2.4, 2)
    const target = new Vector3(cx, cy, cz)

    const presetPosition: Record<ViewPreset, [number, number, number]> = {
      front: [cx, cy + height * 0.15, cz + distance],
      side: [cx + distance, cy + height * 0.15, cz],
      top: [cx, cy + distance, cz + 0.001],
      iso: [cx + distance * 0.72, cy + distance * 0.6, cz + distance * 0.72],
    }

    camera.position.set(...presetPosition[activePreset])
    camera.lookAt(target)
    camera.updateProjectionMatrix()

    if (controlsRef.current) {
      controlsRef.current.target.copy(target)
      controlsRef.current.update()
    }
  }, [activePreset, bounds, camera, controlsRef])

  return null
}

export function ViewportCanvas() {
  const sceneGraph = useEditorStore((s) => s.sceneGraph)
  const selectNode = useEditorStore((s) => s.selectNode)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const transformMode = useEditorStore((s) => s.transformMode)
  const setTransformMode = useEditorStore((s) => s.setTransformMode)
  const updateNodeTransform = useEditorStore((s) => s.updateNodeTransform)

  const orbitControlsRef = useRef<any>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [activePreset, setActivePreset] = useState<ViewPreset>('iso')
  const bounds = getSceneBounds(sceneGraph, selectedNodeId) ?? getSceneBounds(sceneGraph)

  const handleSelectGroup = useCallback((group: Group | null, nodeId: string) => {
    if (nodeId === selectedNodeId) {
      setSelectedGroup(group)
    }
  }, [selectedNodeId])

  useEffect(() => {
    if (!selectedNodeId) {
      setSelectedGroup(null)
    }
  }, [selectedNodeId])

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={() => setTransformMode('translate')}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            transformMode === 'translate'
              ? 'bg-accent text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Move3d className="w-4 h-4" />
          移动
        </button>
        <button
          type="button"
          onClick={() => setTransformMode('rotate')}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            transformMode === 'rotate'
              ? 'bg-accent text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <RotateCw className="w-4 h-4" />
          旋转
        </button>
      </div>

      <ViewPresetToolbar activePreset={activePreset} onChange={setActivePreset} />
      <DimensionOverlay bounds={bounds} />

      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        onPointerMissed={() => selectNode(null)}
      >
        <CameraPresetController activePreset={activePreset} bounds={bounds} controlsRef={orbitControlsRef} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <OrbitControls
          ref={orbitControlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.1}
        />
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
        <SceneRenderer node={sceneGraph} onSelectGroup={handleSelectGroup} />

        {selectedGroup && selectedNodeId && (
          <TransformControls
            object={selectedGroup}
            mode={transformMode}
            onMouseDown={() => {
              if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = false
              }
            }}
            onMouseUp={() => {
              if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = true
              }
            }}
            onObjectChange={(e) => {
              if (e?.target?.object) {
                const pos = e.target.object.position
                const rotation = e.target.object.rotation
                const snapped = resolveSnapPosition(
                  sceneGraph,
                  [pos.x, pos.y, pos.z],
                  { movingNodeId: selectedNodeId },
                )
                e.target.object.position.set(...snapped.position)
                updateNodeTransform(selectedNodeId, {
                  position: snapped.position,
                  rotation: [rotation.x, rotation.y, rotation.z],
                })
              }
            }}
          />
        )}
      </Canvas>
    </div>
  )
}
