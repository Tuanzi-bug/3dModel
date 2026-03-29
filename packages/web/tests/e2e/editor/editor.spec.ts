import { test, expect } from '@playwright/test'

// ─────────────────────────────────────────────
// Editor 页面测试
// ─────────────────────────────────────────────
test.describe('Editor 页面', () => {
  test.beforeEach(async ({ page }) => {
    // 模拟 API 响应
    await page.route('/api/templates', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'single-shelf',
              name: '单层货架',
              category: '基础',
              defaultParams: {
                width: 1.0,
                height: 2.0,
                depth: 0.5,
                layers: 1,
                rodDiameter: 8,
                shelfMaterial: 'wood',
              },
            },
          ],
        }),
      })
    )

    await page.route('/api/designs', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'new-design-id',
              name: '新建单层货架',
              userId: 'test-user-id',
              templateId: 'single-shelf',
              sceneGraph: {
                type: 'group',
                id: 'root',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                children: [],
              },
              thumbnail: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        })
      }
    })
  })

  test('从模板创建新设计 - 页面加载', async ({ page }) => {
    await page.goto('/editor/new?template=single-shelf')
    await page.waitForLoadState('domcontentloaded')

    // 等待更长时间让页面完全加载
    await page.waitForTimeout(2000)

    // 验证编辑器组件已加载 - 使用更宽松的选择器
    await expect(page.getByText('返回')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('模板库')).toBeVisible()
    await expect(page.getByText('属性面板')).toBeVisible()
  })

  test('从模板创建新设计 - 无效模板 ID 跳转回 Dashboard', async ({ page }) => {
    await page.goto('/editor/new?template=invalid-template')

    // 等待路由跳转完成
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // 验证已跳转到 dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('从模板创建新设计 - 缺少模板参数跳转回 Dashboard', async ({ page }) => {
    await page.goto('/editor/new')

    // 等待路由跳转完成
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // 验证已跳转到 dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('编辑现有设计 - 页面加载', async ({ page }) => {
    // 模拟加载现有设计
    await page.route('/api/designs/test-design-id', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'test-design-id',
            name: '我的测试设计',
            userId: 'test-user-id',
            templateId: 'single-shelf',
            sceneGraph: {
              type: 'group',
              id: 'root',
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              children: [],
            },
            thumbnail: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      })
    )

    await page.goto('/editor/test-design-id')
    await page.waitForLoadState('domcontentloaded')

    // 等待加载完成
    await page.waitForTimeout(2000)

    // 验证编辑器组件已加载
    await expect(page.getByText('返回')).toBeVisible({ timeout: 10000 })
  })

  test('编辑现有设计 - 加载失败跳转回 Dashboard', async ({ page }) => {
    await page.route('/api/designs/invalid-id', route =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Design not found',
        }),
      })
    )

    await page.goto('/editor/invalid-id')

    // 等待路由跳转完成
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // 验证已跳转到 dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('截图 — Editor 新建页面', async ({ page }) => {
    await page.goto('/editor/new?template=single-shelf')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: 'tests/e2e/screenshots/editor-new.png',
      fullPage: true,
    })
  })
})


