import { expect, test } from '@playwright/test'
import type { SceneNode } from '@3d-modeler/core'

const templatePreview = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20160%20120%22%3E%3Crect%20width%3D%22160%22%20height%3D%22120%22%20rx%3D%2218%22%20fill%3D%22%23e2e8f0%22/%3E%3Crect%20x%3D%2228%22%20y%3D%2228%22%20width%3D%22104%22%20height%3D%2264%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E'
const designPreview = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20160%20120%22%3E%3Crect%20width%3D%22160%22%20height%3D%22120%22%20rx%3D%2218%22%20fill%3D%22%23dbeafe%22/%3E%3Ccircle%20cx%3D%2280%22%20cy%3D%2260%22%20r%3D%2224%22%20fill%3D%22%233b82f6%22/%3E%3C/svg%3E'

const emptyScene: SceneNode = {
  id: 'root',
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children: [],
}

test.describe('Dashboard 页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/designs', async route => {
      const request = route.request()

      if (request.method() === 'POST') {
        const payload = request.postDataJSON() as {
          name: string
          templateId: string | null
          sceneGraph: SceneNode
        }

        const id = payload.templateId ? 'new-design-id' : 'freeform-design-id'
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id,
              name: payload.name,
              userId: 'test-user-id',
              templateId: payload.templateId,
              sceneGraph: payload.sceneGraph,
              thumbnail: designPreview,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'design-1',
              name: '我的货架设计',
              userId: 'test-user-id',
              templateId: null,
              thumbnail: designPreview,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        }),
      })
    })

    await page.route('**/api/designs/*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'design-1',
            name: '我的货架设计',
            userId: 'test-user-id',
            templateId: null,
            sceneGraph: emptyScene,
            thumbnail: designPreview,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      })
    })

    await page.route('**/api/templates', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 'single-shelf', name: '单层货架', category: 'single', thumbnail: templatePreview, defaultParams: { width: 0.8, height: 1.0, depth: 0.4, layers: 1, rodDiameter: 8, shelfMaterial: 'wood' } },
            { id: 'multi-shelf', name: '多层货架', category: 'multi', thumbnail: templatePreview, defaultParams: { width: 0.8, height: 1.5, depth: 0.4, layers: 4, rodDiameter: 8, shelfMaterial: 'wood' } },
          ],
        }),
      })
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('renders the empty-canvas entry and preview images', async ({ page }) => {
    const templateImage = page.getByRole('img', { name: '单层货架预览图' })
    const secondTemplateImage = page.getByRole('img', { name: '多层货架预览图' })
    const savedDesignImage = page.getByRole('img', { name: '我的货架设计预览图' })

    await expect(page.getByText('ShelfCraft')).toBeVisible()
    await expect(page.getByRole('link', { name: /空白画布/ })).toBeVisible()
    await expect(page.getByText('从空白场景开始自由搭建')).toBeVisible()
    await expect(templateImage).toBeVisible()
    await expect(secondTemplateImage).toBeVisible()
    await expect(savedDesignImage).toBeVisible()
    await expect(templateImage).toHaveAttribute('src', /data:image\/svg\+xml/)
    await expect(savedDesignImage).toHaveAttribute('src', /data:image\/svg\+xml/)
  })

  test('clicking 空白画布 creates a freeform design with templateId null', async ({ page }) => {
    let createPayload: { name: string; templateId: string | null; sceneGraph: SceneNode } | null = null

    await page.route('**/api/designs', async route => {
      const request = route.request()

      if (request.method() === 'POST') {
        createPayload = request.postDataJSON() as typeof createPayload
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'freeform-design-id',
              name: createPayload?.name,
              userId: 'test-user-id',
              templateId: createPayload?.templateId ?? null,
              sceneGraph: createPayload?.sceneGraph ?? emptyScene,
              thumbnail: designPreview,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        })
        return
      }

      await route.fallback()
    })

    const createResponse = page.waitForResponse((response) =>
      response.url().endsWith('/api/designs') && response.request().method() === 'POST',
    )

    await page.getByRole('link', { name: /空白画布/ }).click()

    await createResponse
    expect(createPayload).not.toBeNull()
    expect(createPayload?.templateId).toBeNull()
    expect(createPayload?.sceneGraph).toEqual(emptyScene)
    await expect(page).toHaveURL(/\/editor\/freeform-design-id$/)
  })

  test('clicking a saved design card reopens that design', async ({ page }) => {
    await page.getByRole('link', { name: /我的货架设计/ }).click()
    await expect(page).toHaveURL('/editor/design-1')
  })
})
