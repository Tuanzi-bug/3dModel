import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyToken } from './auth'

export interface AuthenticatedRequest {
  userId: string
}

export async function withAuth(): Promise<AuthenticatedRequest | NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_TOKEN_EXPIRED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  try {
    const { userId } = await verifyToken(token)
    return { userId }
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_TOKEN_EXPIRED', message: 'Token expired or invalid' } },
      { status: 401 },
    )
  }
}

export function isAuthError(result: AuthenticatedRequest | NextResponse): result is NextResponse {
  return result instanceof NextResponse
}
