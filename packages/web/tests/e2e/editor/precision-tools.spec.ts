import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
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

test.describe('Precision tools workflow', () => {
  test('supports snapping, preset inspection controls, and BOM export together', async ({ page }) => {
    const now = '2026-03-30T13:00:00.000Z'
    let persistedDesign: PersistedDesign | null = null

    await page.route('**/api/templates', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'single-shelf',
              name: '单层货架',
              category: 'single',
              thumbnail: null,
              defaultParams: { width: 0.8, height: 1.0, depth: 0.4, layers: 1, rodDiameter: 8, shelfMaterial: 'wood' },
            },
          ],
        }),
      })
    })

    await page.route('**/api/designs', async (route) => {
      const request = route.request()

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: persistedDesign ? [persistedDesign] : [] }),
        })
        return
      }

      if (request.method() === 'POST') {
        const payload = request.postDataJSON() as { name: string; templateId: string | null; sceneGraph: SceneNode }

        persistedDesign = {
          id: 'precision-design',
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
          body: JSON.stringify({ success: true, data: persistedDesign }),
        })
        return
      }

      await route.fallback()
    })

    await page.route('**/api/designs/precision-design', async (route) => {
      const request = route.request()

      if (!persistedDesign) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: { code: 'DESIGN_NOT_FOUND', message: 'Design not found' } }),
        })
        return
      }

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: persistedDesign }),
        })
        return
      }

      if (request.method() === 'PATCH') {
        const payload = request.postDataJSON() as { name?: string; sceneGraph?: SceneNode; templateId?: string | null }

        persistedDesign = {
          ...persistedDesign,
          name: payload.name ?? persistedDesign.name,
          sceneGraph: payload.sceneGraph ?? persistedDesign.sceneGraph,
          templateId: payload.templateId ?? persistedDesign.templateId,
          updatedAt: '2026-03-30T13:10:00.000Z',
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: persistedDesign }),
        })
        return
      }

      await route.fallback()
    })

    await page.goto('/dashboard')
    await page.getByRole('link', { name: /空白画布/ }).click()

    await expect(page).toHaveURL(/\/editor\/precision-design$/)

    await page.getByLabel('设计名称').fill('precision-tools-regression')

    await page.getByRole('button', { name: '杆' }).click()
    await page.getByLabel('位置 X').fill('0.23')
    await expect(page.getByLabel('位置 X')).toHaveValue('0.25')

    await page.getByRole('button', { name: '层板' }).click()
    await page.getByRole('button', { name: 'LED灯带' }).click()
    await page.getByRole('button', { name: '背板' }).click()

    await expect(page.getByRole('button', { name: '前视' })).toBeVisible()
    await expect(page.getByRole('button', { name: '侧视' })).toBeVisible()
    await expect(page.getByRole('button', { name: '俯视' })).toBeVisible()
    await expect(page.getByRole('button', { name: '等轴' })).toBeVisible()
    await page.getByRole('button', { name: '前视' }).click()
    await page.getByRole('button', { name: '等轴' }).click()

    await expect(page.getByText(/^宽 \d+\.\d{2}m$/)).toBeVisible()
    await expect(page.getByText(/^高 \d+\.\d{2}m$/)).toBeVisible()
    await expect(page.getByText(/^深 \d+\.\d{2}m$/)).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '导出清单' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('precision-tools-regression-bom.csv')

    const downloadPath = await download.path()
    expect(downloadPath).not.toBeNull()

    const csv = await readFile(downloadPath!, 'utf8')
    expect(csv).toContain('类型,规格,数量,单位')
    expect(csv).toContain('杆')
    expect(csv).toContain('层板')
    expect(csv).toContain('LED灯带')
    expect(csv).toContain('背板')
  })
})
