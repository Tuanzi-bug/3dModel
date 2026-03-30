// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import type { SceneNode } from '@3d-modeler/core'

vi.stubEnv('JWT_SECRET', 'a'.repeat(32))
vi.stubEnv('DATABASE_URL', 'file:./test.db')

const {
  mockWithAuth,
  mockCreate,
  mockFindUnique,
  mockUpdate,
  mockFindMany,
  mockCount,
} = vi.hoisted(() => ({
  mockWithAuth: vi.fn(),
  mockCreate: vi.fn(),
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
}))

vi.mock('@/lib/with-auth', () => ({
  withAuth: mockWithAuth,
  isAuthError: (result: unknown) => result instanceof Response,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    design: {
      create: mockCreate,
      findUnique: mockFindUnique,
      update: mockUpdate,
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}))

import { GET as listDesigns, POST } from '@/app/api/designs/route'
import { GET as getDesignById, PATCH } from '@/app/api/designs/[id]/route'

const createdAt = new Date('2026-03-29T00:00:00.000Z')
const updatedAt = new Date('2026-03-29T01:00:00.000Z')

const initialSceneGraph: SceneNode = {
  id: 'root',
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children: [
    {
      id: 'shelf-0',
      type: 'shelf',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: { width: 1, depth: 0.5, thickness: 0.02, material: 'wood' },
      children: [],
    },
  ],
}

const updatedSceneGraph: SceneNode = {
  ...initialSceneGraph,
  children: [
    ...initialSceneGraph.children,
    {
      id: 'shelf-1',
      type: 'shelf',
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      params: { width: 1.2, depth: 0.5, thickness: 0.02, material: 'metal' },
      children: [],
    },
  ],
}

function designRecord(overrides: Partial<{
  id: string
  name: string
  userId: string
  templateId: string | null
  sceneGraph: SceneNode
  thumbnail: string | null
  createdAt: Date
  updatedAt: Date
}> = {}) {
  const sceneGraph = overrides.sceneGraph ?? initialSceneGraph

  return {
    id: overrides.id ?? 'design-1',
    name: overrides.name ?? '预置方案设计',
    userId: overrides.userId ?? 'user-123',
    templateId: overrides.templateId !== undefined ? overrides.templateId : 'single-shelf',
    sceneGraph: JSON.stringify(sceneGraph),
    thumbnail: overrides.thumbnail !== undefined ? overrides.thumbnail : null,
    createdAt: overrides.createdAt ?? createdAt,
    updatedAt: overrides.updatedAt ?? updatedAt,
  }
}

function designParams(id = 'design-1') {
  return { params: Promise.resolve({ id }) }
}

describe('design routes', () => {
  beforeEach(() => {
    mockWithAuth.mockReset()
    mockCreate.mockReset()
    mockFindUnique.mockReset()
    mockUpdate.mockReset()
    mockFindMany.mockReset()
    mockCount.mockReset()
    mockWithAuth.mockResolvedValue({ userId: 'user-123' })
  })

  it('preserves persisted sceneGraph across create, get, and patch responses', async () => {
    const createdDesign = designRecord()
    const patchedDesign = designRecord({
      name: '连续性回归设计',
      sceneGraph: updatedSceneGraph,
      updatedAt: new Date('2026-03-29T02:00:00.000Z'),
    })

    mockCreate.mockResolvedValue(createdDesign)
    mockFindUnique
      .mockResolvedValueOnce(createdDesign)
      .mockResolvedValueOnce(createdDesign)
    mockUpdate.mockResolvedValue(patchedDesign)

    const postRequest = new NextRequest('http://localhost/api/designs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: '预置方案设计',
        templateId: 'single-shelf',
        sceneGraph: initialSceneGraph,
      }),
    })

    const postResponse = await POST(postRequest)
    expect(postResponse.status).toBe(201)
    await expect(postResponse.json()).resolves.toMatchObject({
      success: true,
      data: {
        id: 'design-1',
        name: '预置方案设计',
        sceneGraph: initialSceneGraph,
        templateId: 'single-shelf',
      },
    })
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: '预置方案设计',
          userId: 'user-123',
          templateId: 'single-shelf',
        }),
      }),
    )
    expect(
      JSON.parse(
        mockCreate.mock.calls[0]?.[0]?.data?.sceneGraph as string,
      ),
    ).toEqual(initialSceneGraph)

    const getResponse = await getDesignById(
      new NextRequest('http://localhost/api/designs/design-1'),
      designParams(),
    )
    expect(getResponse.status).toBe(200)
    await expect(getResponse.json()).resolves.toMatchObject({
      success: true,
      data: {
        id: 'design-1',
        name: '预置方案设计',
        sceneGraph: initialSceneGraph,
        templateId: 'single-shelf',
      },
    })

    const patchRequest = new NextRequest('http://localhost/api/designs/design-1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: '连续性回归设计',
        sceneGraph: updatedSceneGraph,
      }),
    })

    const patchResponse = await PATCH(patchRequest, designParams())
    expect(patchResponse.status).toBe(200)
    await expect(patchResponse.json()).resolves.toMatchObject({
      success: true,
      data: {
        id: 'design-1',
        name: '连续性回归设计',
        sceneGraph: updatedSceneGraph,
        templateId: 'single-shelf',
      },
    })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'design-1' },
        data: expect.objectContaining({
          name: '连续性回归设计',
        }),
      }),
    )
    expect(
      JSON.parse(
        mockUpdate.mock.calls[0]?.[0]?.data?.sceneGraph as string,
      ),
    ).toEqual(updatedSceneGraph)
  })

  it('returns a forbidden response when another user tries to load the design', async () => {
    mockFindUnique.mockResolvedValue(
      designRecord({
        userId: 'another-user',
      }),
    )

    const response = await getDesignById(
      new NextRequest('http://localhost/api/designs/design-1'),
      designParams(),
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'DESIGN_FORBIDDEN',
        message: 'Access denied',
      },
    })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('allows patching templateId to null when a preset design becomes freeform', async () => {
    const updatedDesign = designRecord({
      templateId: null,
      updatedAt: new Date('2026-03-29T03:00:00.000Z'),
    })

    mockFindUnique.mockResolvedValue(designRecord())
    mockUpdate.mockResolvedValue(updatedDesign)

    const patchRequest = new NextRequest('http://localhost/api/designs/design-1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        templateId: null,
      }),
    })

    const response = await PATCH(patchRequest, designParams())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        id: 'design-1',
        templateId: null,
      },
    })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'design-1' },
        data: expect.objectContaining({
          templateId: null,
        }),
      }),
    )
  })

  it('generates thumbnails from sceneGraph on create and patch when the caller does not supply one', async () => {
    mockCreate.mockImplementation(async ({ data }) => designRecord({
      name: data.name as string,
      templateId: (data.templateId as string | null | undefined) ?? null,
      sceneGraph: JSON.parse(data.sceneGraph as string),
      thumbnail: data.thumbnail as string,
    }))
    mockFindUnique.mockResolvedValue(designRecord())
    mockUpdate.mockImplementation(async ({ data }) => designRecord({
      name: (data.name as string | undefined) ?? '预置方案设计',
      templateId: (data.templateId as string | null | undefined) ?? 'single-shelf',
      sceneGraph: JSON.parse((data.sceneGraph as string | undefined) ?? JSON.stringify(initialSceneGraph)),
      thumbnail: data.thumbnail as string,
    }))

    const postResponse = await POST(new NextRequest('http://localhost/api/designs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: '预览图设计',
        templateId: null,
        sceneGraph: initialSceneGraph,
      }),
    }))

    expect(postResponse.status).toBe(201)
    expect(mockCreate.mock.calls[0]?.[0]?.data?.thumbnail).toMatch(/^data:image\/svg\+xml/)
    await expect(postResponse.json()).resolves.toMatchObject({
      success: true,
      data: {
        thumbnail: expect.stringMatching(/^data:image\/svg\+xml/),
      },
    })

    const patchResponse = await PATCH(new NextRequest('http://localhost/api/designs/design-1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sceneGraph: updatedSceneGraph,
      }),
    }), designParams())

    expect(patchResponse.status).toBe(200)
    expect(mockUpdate.mock.calls[0]?.[0]?.data?.thumbnail).toMatch(/^data:image\/svg\+xml/)
    await expect(patchResponse.json()).resolves.toMatchObject({
      success: true,
      data: {
        thumbnail: expect.stringMatching(/^data:image\/svg\+xml/),
      },
    })
  })

  it('returns thumbnails in the dashboard list response', async () => {
    mockFindMany.mockResolvedValue([
      designRecord({
        thumbnail: 'data:image/svg+xml;charset=UTF-8,%3Csvg%3Epreview%3C%2Fsvg%3E',
      }),
    ])
    mockCount.mockResolvedValue(1)

    const response = await listDesigns(new NextRequest('http://localhost/api/designs?page=1&limit=20'))

    expect(response.status).toBe(200)
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          thumbnail: true,
        }),
      }),
    )
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: [
        {
          thumbnail: 'data:image/svg+xml;charset=UTF-8,%3Csvg%3Epreview%3C%2Fsvg%3E',
        },
      ],
    })
  })
})
