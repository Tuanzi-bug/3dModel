import { RodMesh } from './RodMesh'
import { CrossClampMesh } from './CrossClampMesh'
import { FixedRingMesh } from './FixedRingMesh'
import { TeeMesh } from './TeeMesh'
import { ShelfMesh } from './ShelfMesh'
import type { SceneNodeType } from '@3d-modeler/core'
import type { ComponentType } from 'react'

export const componentRegistry: Partial<Record<SceneNodeType, ComponentType<{ params: any; nodeId: string }>>> = {
  rod: RodMesh,
  crossClamp: CrossClampMesh,
  fixedRing: FixedRingMesh,
  teeConnector: TeeMesh,
  shelf: ShelfMesh,
  // ledStrip and backPanel are Phase 3 — not registered
}
