import { expect, test, type Page } from '@playwright/test'
import type { SceneNode } from '@3d-modeler/core'

type PersistedDesign = {
  id: string
  name: string
  userId: string
  templateId: string
  sceneGraph: SceneNode
  thumbnail: string | null
  createdAt: string
  updatedAt: string
}

function countNodes(node: SceneNode): number {
  if (node.type === 'group') {
    return node.children.reduce((sum, child) => sum + countNodes(child), 0)
  }

  return 1
}

async function readComponentCount(page: Page) {
  const footerText = await page.locator('footer').textContent()
  const match = footerText?.match(/组件数:\s*(\d+)/)

  if (!match) {
    throw new Error(`Unable to read component count from footer: ${footerText ?? 'empty footer'}`)
  }

  return Number(match[1])
}

test.describe('Editor continuity', () => {
  test('can start from a preset, save, and reopen without continuity drift', async ({ page }) => {
    const now = '2026-03-29T12:00:00.000Z'
    let persistedDesign: PersistedDesign | null = null
    let lastPatchPayload: { name?: string; sceneGraph?: SceneNode } | null = null

    await page.route('**/api/templates', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 'single-shelf', name: '单层货架', description: '简单的单层货架' },
          ],
        }),
      })
    })

    await page.route('**/api/designs/design-1', async route => {
      const request = route.request()

      if (!persistedDesign) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { code: 'DESIGN_NOT_FOUND', message: 'Design not found' },
          }),
        })
        return
      }

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: persistedDesign,
          }),
        })
        return
      }

      if (request.method() === 'PATCH') {
        lastPatchPayload = request.postDataJSON() as { name?: string; sceneGraph?: SceneNode }
        persistedDesign = {
          ...persistedDesign,
          name: lastPatchPayload.name ?? persistedDesign.name,
          sceneGraph: lastPatchPayload.sceneGraph ?? persistedDesign.sceneGraph,
          updatedAt: '2026-03-29T12:05:00.000Z',
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: persistedDesign,
          }),
        })
        return
      }

      await route.fallback()
    })

    await page.route('**/api/designs', async route => {
      const request = route.request()

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: persistedDesign ? [persistedDesign] : [],
          }),
        })
        return
      }

      if (request.method() === 'POST') {
        const payload = request.postDataJSON() as {
          name: string
          templateId: string
          sceneGraph: SceneNode
        }

        persistedDesign = {
          id: 'design-1',
          name: payload.name,
          userId: 'test-user-id',
          templateId: payload.templateId,
          sceneGraph: payload.sceneGraph,
          thumbnail: null,
          createdAt: now,
          updatedAt: now,
        }

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: persistedDesign,
          }),
        })
        return
      }

      await route.fallback()
    })

    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: '从预置方案开始' })).toBeVisible()

    const createResponse = page.waitForResponse((response) =>
      response.url().endsWith('/api/designs') && response.request().method() === 'POST',
    )

    await page.getByRole('link', { name: '单层货架' }).click()

    await createResponse
    await expect(page).toHaveURL(/\/editor\/design-1$/)
    await expect(page.locator('footer')).toContainText('来源: 预置方案 · 单层货架')

    const initialCount = await readComponentCount(page)

    await page.getByLabel('设计名称').fill('连续性回归设计')
    await page.getByRole('button', { name: '层板' }).click()
    await expect.poll(() => readComponentCount(page)).toBe(initialCount + 1)
    await page.getByRole('combobox').selectOption('metal')

    const saveResponse = page.waitForResponse((response) =>
      response.url().endsWith('/api/designs/design-1') && response.request().method() === 'PATCH',
    )

    await page.getByRole('button', { name: '保存设计' }).click()

    await saveResponse
    expect(lastPatchPayload).not.toBeNull()
    expect(lastPatchPayload?.name).toBe('连续性回归设计')
    expect(lastPatchPayload?.sceneGraph).toBeDefined()
    expect(countNodes(lastPatchPayload!.sceneGraph!)).toBe(initialCount + 1)
    expect(
      lastPatchPayload?.sceneGraph?.children.some(
        (child) => child.type === 'shelf' && child.params && 'material' in child.params && child.params.material === 'metal',
      ),
    ).toBe(true)
    await expect(page.getByRole('button', { name: '已保存' })).toBeVisible()

    await page.getByRole('button', { name: '返回' }).click()
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('连续性回归设计')).toBeVisible()

    const reopenResponse = page.waitForResponse((response) =>
      response.url().endsWith('/api/designs/design-1') && response.request().method() === 'GET',
    )

    await page.getByRole('link', { name: /连续性回归设计/ }).click()

    await reopenResponse
    await expect(page).toHaveURL(/\/editor\/design-1$/)
    await expect(page.getByLabel('设计名称')).toHaveValue('连续性回归设计')
    await expect(page.locator('footer')).toContainText('来源: 预置方案 · 单层货架')
    await expect(page.locator('footer')).toContainText(`组件数: ${initialCount + 1}`)
    await expect(page.getByRole('button', { name: '保存设计' })).toBeVisible()
  })
})
