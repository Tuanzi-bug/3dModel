import { test, expect } from '@playwright/test'

test.describe('Viewport gizmo stability', () => {
  test('clicking the bottom-right gizmo does not throw the null-control runtime error', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    await page.route('**/api/designs', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'gizmo-design-id',
              name: '新建单层货架',
              userId: 'test-user-id',
              templateId: 'single-shelf',
              sceneGraph: {
                id: 'root',
                type: 'group',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                params: {},
                children: [],
              },
              thumbnail: null,
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
        body: JSON.stringify({ success: true, data: [] }),
      })
    })

    await page.route('**/api/designs/gizmo-design-id', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'gizmo-design-id',
            name: '新建单层货架',
            userId: 'test-user-id',
            templateId: 'single-shelf',
            sceneGraph: {
              id: 'root',
              type: 'group',
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              params: {},
              children: [],
            },
            thumbnail: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      })
    })

    await page.goto('/editor/new?template=single-shelf')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/editor\/gizmo-design-id$/)

    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    const box = await canvas.boundingBox()

    if (!box) {
      throw new Error('Canvas bounding box is unavailable')
    }

    await canvas.click({
      position: {
        x: box.width - 78,
        y: box.height - 78,
      },
    })

    await expect.poll(
      () => pageErrors.filter((message) => message.includes('getTarget') || message.includes('minPolarAngle')).length,
      { timeout: 1200 },
    ).toBe(0)
  })
})
