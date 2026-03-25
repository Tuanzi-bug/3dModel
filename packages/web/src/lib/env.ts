import { z } from 'zod'

const envSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
})

export function validateEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path}: ${i.message}`).join('\n')
    throw new Error(`Environment validation failed:\n${errors}`)
  }
  return result.data
}

export function getEnv() {
  return envSchema.parse(process.env)
}
