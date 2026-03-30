import { NextRequest, NextResponse } from 'next/server'
import { generateScenePreviewDataUrl, updateDesignSchema } from '@3d-modeler/core'
import { prisma } from '@/lib/prisma'
import { withAuth, isAuthError } from '@/lib/with-auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params
  const design = await prisma.design.findUnique({ where: { id } })

  if (!design) {
    return NextResponse.json(
      { success: false, error: { code: 'DESIGN_NOT_FOUND', message: 'Design not found' } },
      { status: 404 },
    )
  }

  if (design.userId !== auth.userId) {
    return NextResponse.json(
      { success: false, error: { code: 'DESIGN_FORBIDDEN', message: 'Access denied' } },
      { status: 403 },
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      ...design,
      sceneGraph: JSON.parse(design.sceneGraph),
      thumbnail: design.thumbnail ?? null,
      createdAt: design.createdAt.toISOString(),
      updatedAt: design.updatedAt.toISOString(),
    },
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Content-Type must be application/json' } },
      { status: 400 },
    )
  }

  const auth = await withAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params
  const design = await prisma.design.findUnique({ where: { id } })

  if (!design) {
    return NextResponse.json(
      { success: false, error: { code: 'DESIGN_NOT_FOUND', message: 'Design not found' } },
      { status: 404 },
    )
  }

  if (design.userId !== auth.userId) {
    return NextResponse.json(
      { success: false, error: { code: 'DESIGN_FORBIDDEN', message: 'Access denied' } },
      { status: 403 },
    )
  }

  const body = await request.json()
  const parsed = updateDesignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Validation failed' } },
      { status: 400 },
    )
  }

  const updateData: Record<string, unknown> = {}
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name
  if (parsed.data.templateId !== undefined) updateData.templateId = parsed.data.templateId
  if (parsed.data.sceneGraph !== undefined) updateData.sceneGraph = JSON.stringify(parsed.data.sceneGraph)
  if (parsed.data.thumbnail !== undefined) {
    updateData.thumbnail = parsed.data.thumbnail
  } else if (parsed.data.sceneGraph !== undefined) {
    updateData.thumbnail = generateScenePreviewDataUrl(parsed.data.sceneGraph)
  }

  const updated = await prisma.design.update({ where: { id }, data: updateData })

  return NextResponse.json({
    success: true,
    data: {
      ...updated,
      sceneGraph: JSON.parse(updated.sceneGraph),
      thumbnail: updated.thumbnail ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAuth()
  if (isAuthError(auth)) return auth

  const { id } = await params
  const design = await prisma.design.findUnique({ where: { id } })

  if (!design) {
    return NextResponse.json(
      { success: false, error: { code: 'DESIGN_NOT_FOUND', message: 'Design not found' } },
      { status: 404 },
    )
  }

  if (design.userId !== auth.userId) {
    return NextResponse.json(
      { success: false, error: { code: 'DESIGN_FORBIDDEN', message: 'Access denied' } },
      { status: 403 },
    )
  }

  await prisma.design.delete({ where: { id } })

  return NextResponse.json({ success: true, data: null })
}
