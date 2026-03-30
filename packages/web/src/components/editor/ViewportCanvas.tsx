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
  command: CameraCommand | null
  controlsRef: RefObject<any>
  onCameraStateChange: (state: { position: [number, number, number]; target: [number, number, number] }) => void
}

type CameraCommand =
  | {
      type: 'frame'
      bounds: ReturnType<typeof getSceneBounds>
      preset: ViewPreset
      token: number
    }
  | {
      type: 'zoom'
      direction: 'in' | 'out'
      token: number
    }

function frameCamera(
  camera: any,
  controlsRef: RefObject<any>,
  bounds: NonNullable<ReturnType<typeof getSceneBounds>>,
  preset: ViewPreset,
) {
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

  camera.position.set(...presetPosition[preset])
  camera.lookAt(target)
  camera.updateProjectionMatrix()

  if (controlsRef.current) {
    controlsRef.current.target.copy(target)
    controlsRef.current.update()
  }
}

function zoomCamera(camera: any, controlsRef: RefObject<any>, direction: 'in' | 'out') {
  const target = controlsRef.current?.target
  const tx = target?.x ?? 0
  const ty = target?.y ?? 0
  const tz = target?.z ?? 0
  const scale = direction === 'in' ? 0.82 : 1.18
  const nextPosition: [number, number, number] = [
    tx + (camera.position.x - tx) * scale,
    ty + (camera.position.y - ty) * scale,
    tz + (camera.position.z - tz) * scale,
  ]

  camera.position.set(...nextPosition)
  camera.lookAt(new Vector3(tx, ty, tz))
  camera.updateProjectionMatrix()

  if (controlsRef.current) {
    controlsRef.current.update()
  }
}

function readCameraState(camera: any, controlsRef: RefObject<any>) {
  return {
    position: [camera.position.x, camera.position.y, camera.position.z] as [number, number, number],
    target: [
      controlsRef.current?.target?.x ?? 0,
      controlsRef.current?.target?.y ?? 0,
      controlsRef.current?.target?.z ?? 0,
    ] as [number, number, number],
  }
}

function CameraPresetController({ command, controlsRef, onCameraStateChange }: CameraPresetControllerProps) {
  const { camera } = useThree()

  useEffect(() => {
    if (!command) {
      return
    }

    if (command.type === 'frame' && command.bounds) {
      frameCamera(camera, controlsRef, command.bounds, command.preset)
      onCameraStateChange(readCameraState(camera, controlsRef))
      return
    }

    if (command.type === 'zoom') {
      zoomCamera(camera, controlsRef, command.direction)
      onCameraStateChange(readCameraState(camera, controlsRef))
    }
  }, [camera, command, controlsRef, onCameraStateChange])

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
  const [cameraCommand, setCameraCommand] = useState<CameraCommand | null>(null)
  const [cameraState, setCameraState] = useState({
    position: [3, 3, 3] as [number, number, number],
    target: [0, 0, 0] as [number, number, number],
  })
  const transformDragRef = useRef<{
    position: [number, number, number]
    rotation: [number, number, number]
  } | null>(null)
  const sceneBounds = getSceneBounds(sceneGraph)
  const selectedBounds = selectedNodeId ? getSceneBounds(sceneGraph, selectedNodeId) : null
  const bounds = selectedBounds ?? sceneBounds

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

  useEffect(() => {
    if (!cameraCommand && sceneBounds) {
      setCameraCommand({
        type: 'frame',
        bounds: sceneBounds,
        preset: activePreset,
        token: Date.now(),
      })
    }
  }, [activePreset, cameraCommand, sceneBounds])

  const handlePresetChange = useCallback((preset: ViewPreset) => {
    setActivePreset(preset)

    if (!sceneBounds) {
      return
    }

    setCameraCommand({
      type: 'frame',
      bounds: selectedBounds ?? sceneBounds,
      preset,
      token: Date.now(),
    })
  }, [sceneBounds, selectedBounds])

  const handleFocusSelected = useCallback(() => {
    if (!selectedBounds) {
      return
    }

    setCameraCommand({
      type: 'frame',
      bounds: selectedBounds,
      preset: activePreset,
      token: Date.now(),
    })
  }, [activePreset, selectedBounds])

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setCameraCommand({
      type: 'zoom',
      direction,
      token: Date.now(),
    })
  }, [])

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

      <ViewPresetToolbar
        activePreset={activePreset}
        onChange={handlePresetChange}
        onFocusSelected={handleFocusSelected}
        onZoomIn={() => handleZoom('in')}
        onZoomOut={() => handleZoom('out')}
        focusDisabled={!selectedBounds}
      />
      <DimensionOverlay bounds={bounds} />
      <div data-testid="camera-state" className="sr-only">
        {JSON.stringify(cameraState)}
      </div>

      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        onPointerMissed={() => selectNode(null)}
      >
        <CameraPresetController
          command={cameraCommand}
          controlsRef={orbitControlsRef}
          onCameraStateChange={setCameraState}
        />
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
              transformDragRef.current = null
              if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = false
              }
            }}
            onMouseUp={() => {
              if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = true
              }

              if (!selectedGroup || transformMode !== 'translate') {
                transformDragRef.current = null
                return
              }

              const latestTransform = transformDragRef.current ?? {
                position: [selectedGroup.position.x, selectedGroup.position.y, selectedGroup.position.z],
                rotation: [selectedGroup.rotation.x, selectedGroup.rotation.y, selectedGroup.rotation.z],
              }
              const snapped = resolveSnapPosition(sceneGraph, latestTransform.position, {
                movingNodeId: selectedNodeId,
              })

              selectedGroup.position.set(...snapped.position)
              updateNodeTransform(selectedNodeId, {
                position: snapped.position,
                rotation: latestTransform.rotation,
              })
              transformDragRef.current = null
            }}
            onObjectChange={(e) => {
              if (e?.target?.object) {
                const pos = e.target.object.position
                const rotation = e.target.object.rotation
                const nextTransform = {
                  position: [pos.x, pos.y, pos.z] as [number, number, number],
                  rotation: [rotation.x, rotation.y, rotation.z] as [number, number, number],
                }

                if (transformMode === 'translate') {
                  transformDragRef.current = nextTransform
                  return
                }

                updateNodeTransform(selectedNodeId, {
                  rotation: nextTransform.rotation,
                })
              }
            }}
          />
        )}
      </Canvas>
    </div>
  )
}
