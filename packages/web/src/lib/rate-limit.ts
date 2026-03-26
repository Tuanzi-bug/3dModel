interface RateLimitEntry {
  count: number
  resetAt: number
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private windowMs: number
  private max: number

  constructor(opts: { windowMs: number; max: number }) {
    this.windowMs = opts.windowMs
    this.max = opts.max
  }

  /** Record a failed attempt for this key */
  hit(key: string): void {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs })
      return
    }

    entry.count++
  }

  /** Check if key is blocked (reached max failures in window) */
  isBlocked(key: string): boolean {
    const now = Date.now()
    const entry = this.store.get(key)
    if (!entry || now > entry.resetAt) return false
    return entry.count >= this.max
  }
}

// Pre-configured limiters for auth endpoints
// Login: 5 failed attempts per minute per IP
export const loginLimiter = new RateLimiter({ windowMs: 60_000, max: 5 })
// Register: 10 attempts per hour per IP (counts all attempts)
export const registerLimiter = new RateLimiter({ windowMs: 3_600_000, max: 10 })
