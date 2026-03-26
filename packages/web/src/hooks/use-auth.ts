'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const router = useRouter()

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error.message)
    router.push('/dashboard')
    return data.data
  }, [router])

  const register = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error.message)
    router.push('/dashboard')
    return data.data
  }, [router])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }, [router])

  return { login, register, logout }
}
