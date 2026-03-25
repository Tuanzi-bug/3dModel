import { z } from 'zod'

const rodDiameter = z.union([z.literal(6), z.literal(8), z.literal(13)])

export const templateParamsSchema = z.object({
  width: z.number().positive().finite(),
  height: z.number().positive().finite(),
  depth: z.number().positive().finite(),
  layers: z.number().int().min(1).max(20),
  rodDiameter: rodDiameter,
  shelfMaterial: z.enum(['wood', 'acrylic', 'metal']),
})

export type TemplateParamsInput = z.infer<typeof templateParamsSchema>
