import type { SceneNode } from './scene'

export interface DesignDTO {
  id: string
  name: string
  userId: string
  templateId: string | null
  sceneGraph: SceneNode
  thumbnail: string | null
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
}

export interface DesignRecord {
  id: string
  name: string
  userId: string
  templateId: string | null
  sceneGraph: string  // JSON string
  thumbnail: string | null
  createdAt: Date
  updatedAt: Date
}
