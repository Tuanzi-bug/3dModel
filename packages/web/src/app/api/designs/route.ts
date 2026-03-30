import { NextRequest, NextResponse } from 'next/server'
import { createDesignSchema, generateScenePreviewDataUrl } from '@3d-modeler/core'
import { prisma } from '@/lib/prisma'
import { withAuth, isAuthError } from '@/lib/with-auth'

export async function GET(request: NextRequest) {
  const auth = await withAuth()
  if (isAuthError(auth)) return auth

  const url = new URL(request.url)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20))
  const skip = (page - 1) * limit

  const [designs, total] = await Promise.all([
    prisma.design.findMany({
      where: { userId: auth.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        userId: true,
        templateId: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
    }),
    prisma.design.count({ where: { userId: auth.userId } }),
  ])

  return NextResponse.json({
    success: true,
    data: designs.map((d: { createdAt: Date; updatedAt: Date; [key: string]: unknown }) => ({
      ...d,
      thumbnail: d.thumbnail ?? null,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
    pagination: { page, limit, total },
  })
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Content-Type must be application/json' } },
      { status: 400 },
    )
  }

  const auth = await withAuth()
  if (isAuthError(auth)) return auth

  const body = await request.json()
  const parsed = createDesignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Validation failed' } },
      { status: 400 },
    )
  }

  const design = await prisma.design.create({
    data: {
      name: parsed.data.name,
      userId: auth.userId,
      templateId: parsed.data.templateId ?? null,
      sceneGraph: JSON.stringify(parsed.data.sceneGraph),
      thumbnail: generateScenePreviewDataUrl(parsed.data.sceneGraph),
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      ...design,
      sceneGraph: JSON.parse(design.sceneGraph),
      thumbnail: design.thumbnail,
      createdAt: design.createdAt.toISOString(),
      updatedAt: design.updatedAt.toISOString(),
    },
  }, { status: 201 })
}
