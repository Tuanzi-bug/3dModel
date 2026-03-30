import { expect, test, type Page } from '@playwright/test'
import type { SceneNode } from '@3d-modeler/core'

type PersistedDesign = {
  id: string
  name: string
  userId: string
  templateId: string | null
  sceneGraph: SceneNode
  thumbnail: string | null
  createdAt: string
  updatedAt: string
}

const templatePreview = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20160%20120%22%3E%3Crect%20width%3D%22160%22%20height%3D%22120%22%20rx%3D%2218%22%20fill%3D%22%23e2e8f0%22/%3E%3C/svg%3E'
const designPreview = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20160%20120%22%3E%3Crect%20width%3D%22160%22%20height%3D%22120%22%20rx%3D%2218%22%20fill%3D%22%23dbeafe%22/%3E%3Ccircle%20cx%3D%2280%22%20cy%3D%2260%22%20r%3D%2224%22%20fill%3D%22%233b82f6%22/%3E%3C/svg%3E'

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

test.describe('Freeform builder continuity', () => {
  test('can create, edit, save, and reopen a freeform design with preview continuity', async ({ page }) => {
    const now = '2026-03-30T12:00:00.000Z'
    let persistedDesign: PersistedDesign | null = null
    let lastCreatePayload: { name: string; templateId: string | null; sceneGraph: SceneNode } | null = null
    let lastPatchPayload: { name?: string; templateId?: string | null; sceneGraph?: SceneNode } | null = null

    await page.route('**/api/templates', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 'single-shelf', name: '单层货架', category: 'single', thumbnail: templatePreview, defaultParams: { width: 0.8, height: 1.0, depth: 0.4, layers: 1, rodDiameter: 8, shelfMaterial: 'wood' } },
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
        lastPatchPayload = request.postDataJSON() as { name?: string; templateId?: string | null; sceneGraph?: SceneNode }
        persistedDesign = {
          ...persistedDesign,
          name: lastPatchPayload.name ?? persistedDesign.name,
          templateId: lastPatchPayload.templateId ?? persistedDesign.templateId,
          sceneGraph: lastPatchPayload.sceneGraph ?? persistedDesign.sceneGraph,
          thumbnail: persistedDesign.thumbnail ?? designPreview,
          updatedAt: '2026-03-30T12:05:00.000Z',
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
        lastCreatePayload = request.postDataJSON() as {
          name: string
          templateId: string | null
          sceneGraph: SceneNode
        }

        persistedDesign = {
          id: 'design-1',
          name: lastCreatePayload.name,
          userId: 'test-user-id',
          templateId: lastCreatePayload.templateId,
          sceneGraph: lastCreatePayload.sceneGraph,
          thumbnail: designPreview,
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
    await expect(page.getByRole('link', { name: /空白画布/ })).toBeVisible()

    const createResponse = page.waitForResponse((response) =>
      response.url().endsWith('/api/designs') && response.request().method() === 'POST',
    )

    await page.getByRole('link', { name: /空白画布/ }).click()

    await createResponse
    expect(lastCreatePayload).not.toBeNull()
    expect(lastCreatePayload?.templateId).toBeNull()
    expect(countNodes(lastCreatePayload!.sceneGraph)).toBe(0)
    await expect(page).toHaveURL(/\/editor\/design-1$/)
    await expect(page.locator('footer')).toContainText('来源: 当前设计')
    await expect(page.getByRole('button', { name: '转为自由搭建' })).toHaveCount(0)
    await expect.poll(() => readComponentCount(page)).toBe(0)

    await page.getByRole('button', { name: '层板' }).click()
    await expect.poll(() => readComponentCount(page)).toBe(1)
    await expect(page.locator('footer')).toContainText('已选择:')

    await page.getByRole('button', { name: '旋转' }).click()
    await page.getByLabel('旋转 Y').fill('0.50')
    await page.getByRole('button', { name: '移动' }).click()
    await page.getByLabel('位置 X').fill('1.25')
    await page.getByRole('button', { name: '复制组件' }).click()
    await expect.poll(() => readComponentCount(page)).toBe(2)
    await page.getByRole('button', { name: '删除组件' }).click()
    await expect.poll(() => readComponentCount(page)).toBe(1)

    await page.getByLabel('设计名称').fill('自由搭建回归设计')

    const saveResponse = page.waitForResponse((response) =>
      response.url().endsWith('/api/designs/design-1') && response.request().method() === 'PATCH',
    )

    await page.getByRole('button', { name: '保存设计' }).click()

    await saveResponse
    expect(lastPatchPayload).not.toBeNull()
    expect(lastPatchPayload?.templateId).toBeNull()
    expect(lastPatchPayload?.name).toBe('自由搭建回归设计')
    expect(countNodes(lastPatchPayload!.sceneGraph!)).toBe(1)
    expect(
      lastPatchPayload?.sceneGraph?.children.some(
        (child) => child.position[0] === 1.25 && child.rotation[1] === 0.5,
      ),
    ).toBe(true)
    await expect(page.getByRole('button', { name: '已保存' })).toBeVisible()

    await page.getByRole('button', { name: '返回' }).click()
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('link', { name: /自由搭建回归设计/ })).toBeVisible()
    await expect(page.getByRole('img', { name: '自由搭建回归设计预览图' })).toBeVisible()

    const reopenResponse = page.waitForResponse((response) =>
      response.url().endsWith('/api/designs/design-1') && response.request().method() === 'GET',
    )

    await page.getByRole('link', { name: /自由搭建回归设计/ }).click()

    await reopenResponse
    await expect(page).toHaveURL(/\/editor\/design-1$/)
    await expect(page.getByLabel('设计名称')).toHaveValue('自由搭建回归设计')
    await expect(page.locator('footer')).toContainText('来源: 当前设计')
    await expect(page.locator('footer')).toContainText('组件数: 1')
    await expect(page.getByRole('button', { name: '转为自由搭建' })).toHaveCount(0)
  })
})
