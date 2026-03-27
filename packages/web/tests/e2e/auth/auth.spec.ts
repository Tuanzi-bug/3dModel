import { test, expect, Page } from '@playwright/test'

// 辅助函数：生成随机邮箱，避免注册冲突
function randomEmail() {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`
}

// ─────────────────────────────────────────────
// 登录页测试
// ─────────────────────────────────────────────
test.describe('登录页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
  })

  test('页面元素正确渲染', async ({ page }) => {
    // 品牌
    await expect(page.getByText('ShelfCraft')).toBeVisible()
    await expect(page.getByText('欢迎回来')).toBeVisible()

    // 表单字段 - 使用 ID 选择器避免冲突
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()

    // placeholder 中文
    await expect(page.getByPlaceholder('请输入邮箱')).toBeVisible()
    await expect(page.getByPlaceholder('请输入密码')).toBeVisible()

    // 提交按钮
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()

    // 注册链接
    await expect(page.getByRole('link', { name: '注册账号' })).toBeVisible()
  })

  test('密码可视化切换', async ({ page }) => {
    const passwordInput = page.locator('#password')
    const toggleBtn = page.getByRole('button', { name: '显示密码' })

    // 默认隐藏
    await expect(passwordInput).toHaveAttribute('type', 'password')
    await expect(toggleBtn).toBeVisible()

    // 点击后显示
    await toggleBtn.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
    await expect(page.getByRole('button', { name: '隐藏密码' })).toBeVisible()

    // 再次点击恢复隐藏
    await page.getByRole('button', { name: '隐藏密码' }).click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('点击注册账号链接跳转到注册页', async ({ page }) => {
    await page.getByRole('link', { name: '注册账号' }).click()
    await expect(page).toHaveURL('/register')
  })

  test('邮箱或密码错误时显示错误信息', async ({ page }) => {
    await page.locator('#email').fill('nonexistent@example.com')
    await page.locator('#password').fill('wrongpassword')
    await page.getByRole('button', { name: '登录' }).click()

    // 等待错误信息出现（API 返回失败）
    const errorMsg = page.locator('p.text-red-600, p[class*="text-red"]')
    await expect(errorMsg).toBeVisible({ timeout: 8000 })
  })

  test('提交时按钮进入加载状态', async ({ page }) => {
    // 拦截请求，让其挂起以观察 loading 状态
    await page.route('/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.continue()
    })

    await page.locator('#email').fill('test@example.com')
    await page.locator('#password').fill('password123')
    await page.getByRole('button', { name: '登录' }).click()

    // 按钮应变为「登录中…」且禁用
    await expect(page.getByRole('button', { name: /登录中/ })).toBeDisabled()
  })

  test('截图 — 登录页初始状态', async ({ page }) => {
    await page.screenshot({ path: 'tests/e2e/screenshots/login-initial.png', fullPage: true })
  })
})

// ─────────────────────────────────────────────
// 注册页测试
// ─────────────────────────────────────────────
test.describe('注册页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
  })

  test('页面元素正确渲染', async ({ page }) => {
    // 品牌
    await expect(page.getByText('ShelfCraft')).toBeVisible()
    await expect(page.getByText('创建账号')).toBeVisible()

    // 表单字段 - 使用 ID 选择器避免冲突
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#confirmPassword')).toBeVisible()

    // placeholder 中文
    await expect(page.getByPlaceholder('请输入邮箱')).toBeVisible()
    await expect(page.getByPlaceholder('请输入密码')).toBeVisible()
    await expect(page.getByPlaceholder('请再次输入密码')).toBeVisible()

    // 提交按钮
    await expect(page.getByRole('button', { name: '注册' })).toBeVisible()

    // 登录链接
    await expect(page.getByRole('link', { name: '立即登录' })).toBeVisible()
  })

  test('密码字段可视化切换（密码）', async ({ page }) => {
    const passwordInput = page.locator('#password')
    // 共两个「显示密码」按钮（密码+确认密码），取第一个
    const toggleBtns = page.getByRole('button', { name: '显示密码' })

    await expect(passwordInput).toHaveAttribute('type', 'password')
    await toggleBtns.first().click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('确认密码字段可视化切换', async ({ page }) => {
    const confirmInput = page.locator('#confirmPassword')
    const toggleBtns = page.getByRole('button', { name: '显示密码' })

    await expect(confirmInput).toHaveAttribute('type', 'password')
    await toggleBtns.last().click()
    await expect(confirmInput).toHaveAttribute('type', 'text')
  })

  test('两次密码不一致时显示错误', async ({ page }) => {
    await page.locator('#email').fill('user@example.com')
    await page.locator('#password').fill('password123')
    await page.locator('#confirmPassword').fill('different456')
    await page.getByRole('button', { name: '注册' }).click()

    await expect(page.getByText('两次输入的密码不一致')).toBeVisible()
  })

  test('点击立即登录链接跳转到登录页', async ({ page }) => {
    await page.getByRole('link', { name: '立即登录' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('提交时按钮进入加载状态', async ({ page }) => {
    await page.route('/api/auth/register', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.continue()
    })

    const email = randomEmail()
    await page.locator('#email').fill(email)
    await page.locator('#password').fill('password123')
    await page.locator('#confirmPassword').fill('password123')
    await page.getByRole('button', { name: '注册' }).click()

    await expect(page.getByRole('button', { name: /注册中/ })).toBeDisabled()
  })

  test('注册成功后跳转到 dashboard', async ({ page }) => {
    // 拦截 API，模拟注册成功
    await page.route('/api/auth/register', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { userId: 'test-uid' } }),
      })
    )

    const email = randomEmail()
    await page.locator('#email').fill(email)
    await page.locator('#password').fill('password123')
    await page.locator('#confirmPassword').fill('password123')
    await page.getByRole('button', { name: '注册' }).click()

    await expect(page).toHaveURL('/dashboard', { timeout: 8000 })
  })

  test('截图 — 注册页初始状态', async ({ page }) => {
    await page.screenshot({ path: 'tests/e2e/screenshots/register-initial.png', fullPage: true })
  })
})

// ─────────────────────────────────────────────
// 登录→注册导航流程
// ─────────────────────────────────────────────
test.describe('页面导航流程', () => {
  test('从登录页跳转到注册页再跳回', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: '注册账号' }).click()
    await expect(page).toHaveURL('/register')

    await page.getByRole('link', { name: '立即登录' }).click()
    await expect(page).toHaveURL('/login')
  })
})
