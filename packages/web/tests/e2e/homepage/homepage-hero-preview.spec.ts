import { devices, expect, test, type Locator, type Page } from '@playwright/test'

async function expectOriginalLandingContract(page: Page) {
  await expect(page.getByRole('heading', { name: '专业的 3D 模块化货架设计工具' })).toBeVisible()
  await expect(
    page.getByText('实时 3D 可视化，所见即所得。选择模板，调整尺寸，立即预览你的设计效果。'),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: '开始设计' })).toBeVisible()
  await expect(page.getByRole('link', { name: '查看示例' })).toBeVisible()
  await expect(page.getByText('3D 预览区域')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)

  await expect(page.getByRole('heading', { name: '实时 3D 可视化' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '丰富的模板库' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '快速导出' })).toBeVisible()

  for (const removedCopy of ['模块化货架设计平台', '用更可信的方式预览模块化货架方案', '模块扩展', '木纹层板']) {
    await expect(page.getByText(removedCopy)).toHaveCount(0)
  }
}

async function expectVerticalHeroFlow(heading: Locator, placeholder: Locator) {
  const headingBox = await heading.boundingBox()
  const placeholderBox = await placeholder.boundingBox()

  expect(headingBox).not.toBeNull()
  expect(placeholderBox).not.toBeNull()
  expect(placeholderBox!.y).toBeGreaterThan(headingBox!.y + headingBox!.height - 1)
}

test.describe('Homepage original landing restore', () => {
  test('renders the restored homepage baseline at 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1280 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expectOriginalLandingContract(page)
    await expectVerticalHeroFlow(
      page.getByRole('heading', { name: '专业的 3D 模块化货架设计工具' }),
      page.getByText('3D 预览区域'),
    )
  })

  test('keeps the restored hero vertically ordered at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1180 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expectOriginalLandingContract(page)
    await expectVerticalHeroFlow(
      page.getByRole('heading', { name: '专业的 3D 模块化货架设计工具' }),
      page.getByText('3D 预览区域'),
    )
  })

  test('keeps the restored homepage readable on iPhone 13 without horizontal overflow', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 13'],
      locale: 'zh-CN',
    })
    const page = await context.newPage()

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expectOriginalLandingContract(page)
    await expectVerticalHeroFlow(
      page.getByRole('heading', { name: '专业的 3D 模块化货架设计工具' }),
      page.getByText('3D 预览区域'),
    )

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(hasHorizontalOverflow).toBe(false)

    await context.close()
  })
})
