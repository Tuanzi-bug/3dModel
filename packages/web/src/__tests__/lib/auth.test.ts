// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'

// Set env before importing
vi.stubEnv('JWT_SECRET', 'a'.repeat(32))
vi.stubEnv('DATABASE_URL', 'file:./test.db')

import { hashPassword, verifyPassword, signToken, verifyToken } from '@/lib/auth'

describe('password hashing', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('mypassword')
    expect(hash).not.toBe('mypassword')
    expect(await verifyPassword('mypassword', hash)).toBe(true)
  })

  it('rejects wrong password', async () => {
    const hash = await hashPassword('mypassword')
    expect(await verifyPassword('wrongpassword', hash)).toBe(false)
  })
})

describe('JWT', () => {
  it('signs and verifies token', async () => {
    const token = await signToken({ userId: 'user-123' })
    expect(typeof token).toBe('string')
    const payload = await verifyToken(token)
    expect(payload.userId).toBe('user-123')
  })

  it('rejects invalid token', async () => {
    await expect(verifyToken('invalid-token')).rejects.toThrow()
  })
})
