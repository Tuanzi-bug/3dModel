import { describe, it, expect, vi, afterEach } from 'vitest'

describe('validateEnv', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    vi.resetModules()
  })

  it('throws if JWT_SECRET is missing', async () => {
    process.env = { ...originalEnv, JWT_SECRET: undefined, DATABASE_URL: 'file:./test.db' }
    const { validateEnv } = await import('@/lib/env')
    expect(() => validateEnv()).toThrow('JWT_SECRET')
  })

  it('throws if JWT_SECRET is too short', async () => {
    process.env = { ...originalEnv, JWT_SECRET: 'short', DATABASE_URL: 'file:./test.db' }
    const { validateEnv } = await import('@/lib/env')
    expect(() => validateEnv()).toThrow()
  })

  it('passes with valid env', async () => {
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'a'.repeat(32),
      DATABASE_URL: 'file:./test.db',
    }
    const { validateEnv } = await import('@/lib/env')
    expect(() => validateEnv()).not.toThrow()
  })
})
