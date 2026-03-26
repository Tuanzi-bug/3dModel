import { z } from 'zod'
import { sceneNodeSchema } from './scene'

export const createDesignSchema = z.object({
  name: z.string().min(1).max(255),
  templateId: z.string().nullable().optional(),
  sceneGraph: sceneNodeSchema,
})

export const updateDesignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  sceneGraph: sceneNodeSchema.optional(),
  thumbnail: z.string().max(2_000_000).nullable().optional(),
})

export type CreateDesignInput = z.infer<typeof createDesignSchema>
export type UpdateDesignInput = z.infer<typeof updateDesignSchema>
