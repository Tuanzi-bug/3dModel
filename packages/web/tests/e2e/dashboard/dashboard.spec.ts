import { test, expect } from '@playwright/test'

// ─────────────────────────────────────────────
// Dashboard 页面测试
// ─────────────────────────────────────────────
test.describe('Dashboard 页面', () => {
  test.beforeEach(async ({ page }) => {
    // 模拟 API 响应
    await page.route('/api/designs', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'design-1',
              name: '我的货架设计',
              userId: 'test-user-id',
              sceneGraph: {},
              thumbnail: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        }),
      })
    )

    await page.route('/api/templates', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 'single-shelf', name: '单层货架', description: '简单的单层货架' },
            { id: 'multi-shelf', name: '多层货架', description: '多层货架系统' },
          ],
        }),
      })
    )

    // 访问 dashboard（假设已登录）
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('页面元素正确渲染', async ({ page }) => {
    // 品牌名称
    await expect(page.getByText('ShelfCraft')).toBeVisible()

    // 页面标题
    await expect(page.getByText('我的设计')).toBeVisible()

    // 退出登录按钮
    await expect(page.getByRole('button', { name: '退出登录' })).toBeVisible()

    // 模板区域标题
    await expect(page.getByText('从模板开始')).toBeVisible()

    // 已保存的设计区域标题
    await expect(page.getByText('已保存的设计')).toBeVisible()

    // 模板卡片
    await expect(page.getByText('单层货架')).toBeVisible()
    await expect(page.getByText('多层货架')).toBeVisible()

    // 设计卡片
    await expect(page.getByText('我的货架设计')).toBeVisible()
  })

  test('点击模板卡片跳转到编辑器', async ({ page }) => {
    await page.getByText('单层货架').click()
    await expect(page).toHaveURL('/editor/new?template=single-shelf')
  })

  test('点击设计卡片跳转到编辑器', async ({ page }) => {
    await page.getByText('我的货架设计').click()
    await expect(page).toHaveURL('/editor/design-1')
  })

  test('删除设计功能', async ({ page }) => {
    // 模拟删除 API
    await page.route('/api/designs/design-1', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    )

    // 设置 dialog 监听器（必须在点击之前）
    page.on('dialog', dialog => dialog.accept())

    // 点击删除按钮
    await page.getByRole('button', { name: /删除/ }).click()

    // 等待设计从列表中消失
    await expect(page.getByText('我的货架设计')).not.toBeVisible({ timeout: 5000 })
  })

  test('截图 — Dashboard 初始状态', async ({ page }) => {
    await page.screenshot({
      path: 'tests/e2e/screenshots/dashboard-initial.png',
      fullPage: true,
    })
  })
})

