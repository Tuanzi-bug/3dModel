import { devices, expect, test, type Page } from '@playwright/test'

async function expectStaticHeroContract(page: Page) {
  const heroPreview = page.getByTestId('hero-preview')

  await expect(heroPreview).toBeVisible()
  await expect(heroPreview).toHaveAttribute('data-preview-mode', 'static')
  await expect(page.locator('canvas')).toHaveCount(0)

  for (const removedCopy of ['拖拽旋转', '正在准备 3D 预览', '3D 预览暂时使用海报模式展示']) {
    await expect(page.getByText(removedCopy)).toHaveCount(0)
  }
}

async function expectCopyAbovePreview(page: Page) {
  const heroCopy = page.getByTestId('landing-hero-copy')
  const heroPreview = page.getByTestId('hero-preview')

  await expect(heroCopy).toBeVisible()
  await expect(heroPreview).toBeVisible()

  const copyBox = await heroCopy.boundingBox()
  const previewBox = await heroPreview.boundingBox()

  expect(copyBox).not.toBeNull()
  expect(previewBox).not.toBeNull()

  expect(previewBox!.y).toBeGreaterThan(copyBox!.y + copyBox!.height - 1)
}

test.describe('Homepage hero preview', () => {
  test('keeps the hero static and product-led at 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1280 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expectStaticHeroContract(page)
    await expectCopyAbovePreview(page)

    await expect(page.getByText('模块化货架设计平台')).toBeVisible()
    await expect(page.getByRole('heading', { name: '用更可信的方式预览模块化货架方案' })).toBeVisible()
    await expect(page.getByRole('link', { name: '开始设计' })).toBeVisible()
    await expect(page.getByRole('link', { name: '查看示例' })).toBeVisible()

    for (const chip of ['模块扩展', '可调层距', '阳极氧化铝框架', '木纹层板']) {
      await expect(page.getByText(chip)).toBeVisible()
    }
  })

  test('keeps copy above the preview at 768px without reviving the old live-3d contract', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1180 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expectStaticHeroContract(page)
    await expectCopyAbovePreview(page)
    await expect(page.getByText('模块化货架设计平台')).toBeVisible()
    await expect(page.getByText('先看整体比例')).toBeVisible()
  })

  test('keeps the static hero readable on iPhone 13 without horizontal overflow at 375px', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 13'],
      locale: 'zh-CN',
    })
    const page = await context.newPage()

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expectStaticHeroContract(page)
    await expectCopyAbovePreview(page)
    await expect(page.getByText('模块扩展')).toBeVisible()
    await expect(page.getByText('木纹层板')).toBeVisible()

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(hasHorizontalOverflow).toBe(false)

    await context.close()
  })
})
