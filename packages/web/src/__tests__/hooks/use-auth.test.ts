import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('calls /api/auth/login and redirects to /dashboard on success', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: { userId: 'u1' } }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login('user@example.com', 'password123')
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com', password: 'password123' }),
      }))
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('throws on login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: false, error: { message: 'Invalid credentials' } }),
      })

      const { result } = renderHook(() => useAuth())

      await expect(
        act(async () => {
          await result.current.login('bad@example.com', 'wrong')
        })
      ).rejects.toThrow('Invalid credentials')

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('register', () => {
    it('calls /api/auth/register and redirects to /dashboard on success', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true, data: { userId: 'u2' } }),
      })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register('new@example.com', 'securepass')
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'new@example.com', password: 'securepass' }),
      }))
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('throws on register failure', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: false, error: { message: 'Email already exists' } }),
      })

      const { result } = renderHook(() => useAuth())

      await expect(
        act(async () => {
          await result.current.register('dup@example.com', 'pass')
        })
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('logout', () => {
    it('calls /api/auth/logout and redirects to /', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.logout()
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })
})
