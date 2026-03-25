// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'

vi.stubEnv('JWT_SECRET', 'a'.repeat(32))
vi.stubEnv('DATABASE_URL', 'file:./test.db')

// We test the handler logic by mocking Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { hashPassword, verifyPassword, signToken, verifyToken } from '@/lib/auth'

describe('auth flow', () => {
  it('register → login → verify token flow', async () => {
    const password = 'testpassword123'

    // Simulate register
    const passwordHash = await hashPassword(password)
    expect(await verifyPassword(password, passwordHash)).toBe(true)

    // Simulate login → sign token
    const token = await signToken({ userId: 'user-123' })
    expect(typeof token).toBe('string')

    // Verify token
    const payload = await verifyToken(token)
    expect(payload.userId).toBe('user-123')
  })
})
