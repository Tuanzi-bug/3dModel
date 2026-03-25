import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema } from '../../src/schemas/auth'

describe('registerSchema', () => {
  it('accepts valid input', () => {
    expect(registerSchema.parse({ email: 'a@b.com', password: '12345678' })).toBeDefined()
  })

  it('rejects short password', () => {
    expect(() => registerSchema.parse({ email: 'a@b.com', password: '1234567' })).toThrow()
  })

  it('rejects invalid email', () => {
    expect(() => registerSchema.parse({ email: 'not-email', password: '12345678' })).toThrow()
  })
})

describe('loginSchema', () => {
  it('accepts valid input', () => {
    expect(loginSchema.parse({ email: 'a@b.com', password: '12345678' })).toBeDefined()
  })
})
