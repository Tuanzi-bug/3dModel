import { z } from 'zod'

export const createDesignSchema = z.object({
  name: z.string().min(1).max(255),
  templateId: z.string().nullable().optional(),
})

export const updateDesignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  sceneGraph: z
    .string()
    .max(500_000)
    .refine(
      (s) => { try { JSON.parse(s); return true } catch { return false } },
      { message: 'sceneGraph must be valid JSON' }
    )
    .optional(),
  thumbnail: z.string().nullable().optional(),
})

export type CreateDesignInput = z.infer<typeof createDesignSchema>
export type UpdateDesignInput = z.infer<typeof updateDesignSchema>
