import type { TemplateDefinition, TemplateMetadata } from '../types/template'
import { singleShelfTemplate } from './single-shelf'
import { multiShelfTemplate } from './multi-shelf'
import { standaloneTemplate } from './standalone'

export const templateRegistry: Record<string, TemplateDefinition> = {
  [singleShelfTemplate.id]: singleShelfTemplate,
  [multiShelfTemplate.id]: multiShelfTemplate,
  [standaloneTemplate.id]: standaloneTemplate,
}

export function getTemplateMetadata(): TemplateMetadata[] {
  return Object.values(templateRegistry).map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    thumbnail: t.thumbnail,
    defaultParams: t.defaultParams,
  }))
}
