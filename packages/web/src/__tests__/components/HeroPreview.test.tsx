import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'

import { HeroPreview } from '@/components/landing/HeroPreview'

describe('HeroPreview', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders a static product-led hero preview with restrained parameter chips', () => {
    render(<HeroPreview />)

    const preview = screen.getByTestId('hero-preview')
    expect(preview.getAttribute('data-preview-mode')).toBe('static')
    expect(preview.getAttribute('aria-label')).toBe('货架产品预览')
    expect(screen.getByTestId('hero-preview-poster')).toBeTruthy()
    expect(preview.querySelector('canvas')).toBeNull()

    const chipList = within(screen.getByTestId('hero-preview-poster')).getByRole('list', { name: '产品参数' })
    expect(within(chipList).getAllByRole('listitem')).toHaveLength(4)

    for (const chip of ['模块扩展', '可调层距', '阳极氧化铝框架', '木纹层板']) {
      expect(screen.getByText(chip)).toBeTruthy()
    }

    for (const removedCopy of ['拖拽旋转', '正在准备 3D 预览', '3D 预览暂时使用海报模式展示']) {
      expect(screen.queryByText(removedCopy)).toBeNull()
    }
  })
})
