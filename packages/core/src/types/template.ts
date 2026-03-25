import type { SceneNode } from './scene'

export interface TemplateParams {
  width: number
  height: number
  depth: number
  layers: number
  rodDiameter: 6 | 8 | 13
  shelfMaterial: 'wood' | 'acrylic' | 'metal'
}

export interface TemplateDefinition {
  id: string
  name: string
  category: 'single' | 'multi' | 'corner' | 'lShape' | 'wallMounted' | 'standalone'
  thumbnail: string
  defaultParams: TemplateParams
  generate: (params: TemplateParams) => SceneNode
}

export interface TemplateMetadata {
  id: string
  name: string
  category: TemplateDefinition['category']
  thumbnail: string
  defaultParams: TemplateParams
}
