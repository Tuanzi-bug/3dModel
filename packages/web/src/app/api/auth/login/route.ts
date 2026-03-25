import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@3d-modeler/core'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Content-Type must be application/json' } },
      { status: 400 },
    )
  }

  const body = await request.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid input' } },
      { status: 400 },
    )
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password' } },
      { status: 401 },
    )
  }

  const token = await signToken({ userId: user.id })
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({
    success: true,
    data: { id: user.id, email: user.email },
  })
}
