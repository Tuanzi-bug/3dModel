import type { TemplateDefinition } from '../types/template'
import { singleShelfTemplate } from './single-shelf'
import { multiShelfTemplate } from './multi-shelf'
import { standaloneTemplate } from './standalone'

export const templateRegistry: Record<string, TemplateDefinition> = {
  [singleShelfTemplate.id]: singleShelfTemplate,
  [multiShelfTemplate.id]: multiShelfTemplate,
  [standaloneTemplate.id]: standaloneTemplate,
}
