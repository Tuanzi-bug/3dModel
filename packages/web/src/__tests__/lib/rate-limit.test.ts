import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RateLimiter } from '@/lib/rate-limit'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('is not blocked before any hits', () => {
    const limiter = new RateLimiter({ windowMs: 60_000, max: 5 })
    expect(limiter.isBlocked('127.0.0.1')).toBe(false)
  })

  it('blocks after max failures', () => {
    const limiter = new RateLimiter({ windowMs: 60_000, max: 5 })
    for (let i = 0; i < 5; i++) {
      limiter.hit('127.0.0.1')
    }
    expect(limiter.isBlocked('127.0.0.1')).toBe(true)
  })

  it('does not block under the limit', () => {
    const limiter = new RateLimiter({ windowMs: 60_000, max: 5 })
    for (let i = 0; i < 4; i++) {
      limiter.hit('127.0.0.1')
    }
    expect(limiter.isBlocked('127.0.0.1')).toBe(false)
  })

  it('resets after window expires', () => {
    const limiter = new RateLimiter({ windowMs: 60_000, max: 5 })
    for (let i = 0; i < 5; i++) {
      limiter.hit('127.0.0.1')
    }
    expect(limiter.isBlocked('127.0.0.1')).toBe(true)

    vi.advanceTimersByTime(60_001)
    expect(limiter.isBlocked('127.0.0.1')).toBe(false)
  })

  it('tracks different IPs independently', () => {
    const limiter = new RateLimiter({ windowMs: 60_000, max: 1 })
    limiter.hit('1.1.1.1')
    expect(limiter.isBlocked('1.1.1.1')).toBe(true)
    expect(limiter.isBlocked('2.2.2.2')).toBe(false)
  })
})
