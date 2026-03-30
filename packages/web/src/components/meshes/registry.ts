import { RodMesh } from './RodMesh'
import { CrossClampMesh } from './CrossClampMesh'
import { FixedRingMesh } from './FixedRingMesh'
import { TeeMesh } from './TeeMesh'
import { ShelfMesh } from './ShelfMesh'
import { LedStripMesh } from './LedStripMesh'
import { BackPanelMesh } from './BackPanelMesh'
import type { SceneNodeType } from '@3d-modeler/core'
import type { ComponentType } from 'react'

const freeformComponentTypes = new Set<SceneNodeType>(['rod', 'shelf', 'ledStrip', 'backPanel'])

export function isFreeformComponentEnabled(type: SceneNodeType) {
  return freeformComponentTypes.has(type)
}

export const componentRegistry: Partial<Record<SceneNodeType, ComponentType<{ params: any; nodeId: string }>>> = {
  rod: RodMesh,
  crossClamp: CrossClampMesh,
  fixedRing: FixedRingMesh,
  teeConnector: TeeMesh,
  shelf: ShelfMesh,
  ledStrip: LedStripMesh,
  backPanel: BackPanelMesh,
}
