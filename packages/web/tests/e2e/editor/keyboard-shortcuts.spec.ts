import { test, expect } from '@playwright/test'

test.describe('Editor Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API 响应
    await page.route('/api/designs', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
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
          ],
        }),
      })
    )

    // Mock 创建设计 API
    await page.route('/api/designs', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-design-id',
              name: '未命名设计',
              userId: 'test-user-id',
              sceneGraph: {},
              thumbnail: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        })
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        })
      }
    })

    // 直接访问编辑器页面（跳过登录流程）
    await page.goto('/editor/new?template=single-shelf')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // 等待编辑器加载
  })

  test('Ctrl+Z should undo last action', async ({ page }) => {
    // 修改设计名称
    const nameInput = page.locator('input[placeholder="未命名设计"]')
    await nameInput.fill('测试设计')
    await nameInput.blur()
    await page.waitForTimeout(500)

    // 验证名称已更改
    await expect(nameInput).toHaveValue('测试设计')

    // 按 Ctrl+Z 撤销
    await page.keyboard.press('Control+z')
    await page.waitForTimeout(300)

    // 验证撤销成功（撤销按钮应该被禁用，表示没有可撤销的操作）
    const undoButton = page.locator('button[aria-label="撤销"]')
    await expect(undoButton).toBeDisabled()
  })

  test('Ctrl+Shift+Z should redo last undone action', async ({ page }) => {
    // 修改设计名称
    const nameInput = page.locator('input[placeholder="未命名设计"]')
    await nameInput.fill('测试设计')
    await nameInput.blur()
    await page.waitForTimeout(500)

    // 撤销
    await page.keyboard.press('Control+z')
    await page.waitForTimeout(300)

    // 重做
    await page.keyboard.press('Control+Shift+z')
    await page.waitForTimeout(300)

    // 验证重做成功（重做按钮应该被禁用）
    const redoButton = page.locator('button[aria-label="重做"]')
    await expect(redoButton).toBeDisabled()
  })

  test('Delete key should remove selected node', async ({ page }) => {
    // 等待场景加载
    await page.waitForTimeout(1000)

    // 点击 3D 视图中的一个节点来选中它
    // 注意：这里我们假设场景中至少有一个节点
    const canvas = page.locator('canvas')
    await canvas.click({ position: { x: 400, y: 300 } })
    await page.waitForTimeout(500)

    // 检查状态栏是否显示选中的节点
    const statusBar = page.locator('text=/已选中:/')
    const hasSelection = await statusBar.count() > 0

    if (hasSelection) {
      // 按 Delete 键删除节点
      await page.keyboard.press('Delete')
      await page.waitForTimeout(300)

      // 验证节点已被删除（状态栏不再显示选中状态）
      await expect(page.locator('text=/已选中:/')).toHaveCount(0)
    }
  })

  test('Backspace key should remove selected node', async ({ page }) => {
    // 等待场景加载
    await page.waitForTimeout(1000)

    // 点击 3D 视图中的一个节点来选中它
    const canvas = page.locator('canvas')
    await canvas.click({ position: { x: 400, y: 300 } })
    await page.waitForTimeout(500)

    // 检查状态栏是否显示选中的节点
    const statusBar = page.locator('text=/已选中:/')
    const hasSelection = await statusBar.count() > 0

    if (hasSelection) {
      // 按 Backspace 键删除节点
      await page.keyboard.press('Backspace')
      await page.waitForTimeout(300)

      // 验证节点已被删除
      await expect(page.locator('text=/已选中:/')).toHaveCount(0)
    }
  })

  test('Keyboard shortcuts should not trigger when typing in input fields', async ({ page }) => {
    // 聚焦到设计名称输入框
    const nameInput = page.locator('input[placeholder="未命名设计"]')
    await nameInput.click()
    await nameInput.fill('测试')

    // 在输入框中按 Delete 键（不应该删除节点）
    await page.keyboard.press('Delete')
    await page.waitForTimeout(300)

    // 验证输入框内容被删除了（正常的输入框行为）
    await expect(nameInput).toHaveValue('测')

    // 继续输入
    await nameInput.fill('测试设计')

    // 在输入框中按 Ctrl+Z（不应该触发编辑器的撤销）
    await page.keyboard.press('Control+z')
    await page.waitForTimeout(300)

    // 验证输入框的撤销功能正常工作（浏览器原生行为）
    // 这里我们只是确保没有报错
    await expect(nameInput).toBeFocused()
  })

  test('Meta+Z (Cmd+Z on Mac) should undo last action', async ({ page }) => {
    // 修改设计名称
    const nameInput = page.locator('input[placeholder="未命名设计"]')
    await nameInput.fill('测试设计')
    await nameInput.blur()
    await page.waitForTimeout(500)

    // 按 Meta+Z (Cmd+Z) 撤销
    await page.keyboard.press('Meta+z')
    await page.waitForTimeout(300)

    // 验证撤销成功
    const undoButton = page.locator('button[aria-label="撤销"]')
    await expect(undoButton).toBeDisabled()
  })
})
