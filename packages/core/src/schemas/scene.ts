import { z } from 'zod'

export const vec3Schema = z.tuple([z.number(), z.number(), z.number()])

const baseNodeFields = {
  id: z.string(),
  position: vec3Schema,
  rotation: vec3Schema,
}

const rodDiameterSchema = z.union([z.literal(6), z.literal(8), z.literal(13)])
const shelfMaterialSchema = z.union([z.literal('wood'), z.literal('acrylic'), z.literal('metal')])

const rodParamsSchema = z.object({
  diameter: rodDiameterSchema,
  length: z.number().positive().finite(),
})

const crossClampParamsSchema = z.object({
  rodDiameter: rodDiameterSchema,
})

const fixedRingParamsSchema = z.object({
  rodDiameter: rodDiameterSchema,
})

const teeConnectorParamsSchema = z.object({
  rodDiameter: rodDiameterSchema,
})

const shelfParamsSchema = z.object({
  width: z.number().positive().finite(),
  depth: z.number().positive().finite(),
  thickness: z.number().positive().finite(),
  material: shelfMaterialSchema,
})

const ledStripParamsSchema = z.object({
  length: z.number().positive().finite(),
  color: z.string(),
})

const backPanelParamsSchema = z.object({
  width: z.number().positive().finite(),
  height: z.number().positive().finite(),
  material: shelfMaterialSchema,
})

const groupParamsSchema = z.object({})

// Use z.lazy for recursive children
export const sceneNodeSchema: z.ZodType = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({ ...baseNodeFields, type: z.literal('rod'), params: rodParamsSchema, children: z.array(sceneNodeSchema) }),
    z.object({ ...baseNodeFields, type: z.literal('crossClamp'), params: crossClampParamsSchema, children: z.array(sceneNodeSchema) }),
    z.object({ ...baseNodeFields, type: z.literal('fixedRing'), params: fixedRingParamsSchema, children: z.array(sceneNodeSchema) }),
    z.object({ ...baseNodeFields, type: z.literal('teeConnector'), params: teeConnectorParamsSchema, children: z.array(sceneNodeSchema) }),
    z.object({ ...baseNodeFields, type: z.literal('shelf'), params: shelfParamsSchema, children: z.array(sceneNodeSchema) }),
    z.object({ ...baseNodeFields, type: z.literal('ledStrip'), params: ledStripParamsSchema, children: z.array(sceneNodeSchema) }),
    z.object({ ...baseNodeFields, type: z.literal('backPanel'), params: backPanelParamsSchema, children: z.array(sceneNodeSchema) }),
    z.object({ ...baseNodeFields, type: z.literal('group'), params: groupParamsSchema, children: z.array(sceneNodeSchema) }),
  ])
)
