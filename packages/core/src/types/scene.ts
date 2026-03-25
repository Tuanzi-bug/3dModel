export type Vec3 = [number, number, number]

// --- Component Params ---

export interface RodParams {
  diameter: 6 | 8 | 13
  length: number
}

export interface CrossClampParams {
  rodDiameter: 6 | 8 | 13
}

export interface FixedRingParams {
  rodDiameter: 6 | 8 | 13
}

export interface TeeConnectorParams {
  rodDiameter: 6 | 8 | 13
}

export interface ShelfParams {
  width: number
  depth: number
  thickness: number
  material: 'wood' | 'acrylic' | 'metal'
}

export interface LedStripParams {
  length: number
  color: string
}

export interface BackPanelParams {
  width: number
  height: number
  material: 'wood' | 'acrylic' | 'metal'
}

// --- Scene Node (discriminated union) ---

interface BaseNode {
  id: string
  position: Vec3
  rotation: Vec3 // radians, Euler XYZ order
  children: SceneNode[]
}

export type SceneNode =
  | (BaseNode & { type: 'rod'; params: RodParams })
  | (BaseNode & { type: 'crossClamp'; params: CrossClampParams })
  | (BaseNode & { type: 'fixedRing'; params: FixedRingParams })
  | (BaseNode & { type: 'teeConnector'; params: TeeConnectorParams })
  | (BaseNode & { type: 'shelf'; params: ShelfParams })
  | (BaseNode & { type: 'ledStrip'; params: LedStripParams })
  | (BaseNode & { type: 'backPanel'; params: BackPanelParams })
  | (BaseNode & { type: 'group'; params: Record<string, never> })

export type SceneNodeType = SceneNode['type']
