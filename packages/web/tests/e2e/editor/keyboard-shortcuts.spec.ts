import { test, expect, type Page } from '@playwright/test'

async function readComponentCount(page: Page) {
  const footerText = await page.locator('footer').textContent()
  const match = footerText?.match(/组件数:\s*(\d+)/)

  if (!match) {
    throw new Error(`Unable to read component count from footer: ${footerText ?? 'empty footer'}`)
  }

  return Number(match[1])
}

test.describe('Editor Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/designs', async route => {
      const request = route.request()

      if (request.method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-design-id',
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

    await page.route('**/api/designs/test-design-id', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'test-design-id',
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
    await expect(page).toHaveURL(/\/editor\/test-design-id$/)
  })

  test('Ctrl+D duplicates the selected node', async ({ page }) => {
    const initialCount = await readComponentCount(page)

    await page.getByRole('button', { name: '层板' }).click()
    await expect.poll(() => readComponentCount(page)).toBe(initialCount + 1)
    await expect(page.locator('footer')).toContainText('已选择:')

    await page.keyboard.press('Control+d')

    await expect.poll(() => readComponentCount(page)).toBe(initialCount + 2)
  })

  test('Meta+D duplicates the selected node', async ({ page }) => {
    const initialCount = await readComponentCount(page)

    await page.getByRole('button', { name: '杆' }).click()
    await expect.poll(() => readComponentCount(page)).toBe(initialCount + 1)

    await page.keyboard.press('Meta+d')

    await expect.poll(() => readComponentCount(page)).toBe(initialCount + 2)
  })

  test('Delete removes the selected node', async ({ page }) => {
    const initialCount = await readComponentCount(page)

    await page.getByRole('button', { name: '层板' }).click()
    await expect.poll(() => readComponentCount(page)).toBe(initialCount + 1)

    await page.keyboard.press('Delete')

    await expect.poll(() => readComponentCount(page)).toBe(initialCount)
  })

  test('Backspace removes the selected node', async ({ page }) => {
    const initialCount = await readComponentCount(page)

    await page.getByRole('button', { name: '杆' }).click()
    await expect.poll(() => readComponentCount(page)).toBe(initialCount + 1)

    await page.keyboard.press('Backspace')

    await expect.poll(() => readComponentCount(page)).toBe(initialCount)
  })

  test('Keyboard shortcuts do not mutate the scene while typing in inputs', async ({ page }) => {
    const initialCount = await readComponentCount(page)

    await page.getByRole('button', { name: '层板' }).click()
    await expect.poll(() => readComponentCount(page)).toBe(initialCount + 1)

    const nameInput = page.getByLabel('设计名称')
    await nameInput.click()
    await nameInput.fill('自由搭建测试')

    await page.keyboard.press('Control+d')
    await page.keyboard.press('Delete')

    await expect(nameInput).toBeFocused()
    await expect.poll(() => readComponentCount(page)).toBe(initialCount + 1)
  })
})
