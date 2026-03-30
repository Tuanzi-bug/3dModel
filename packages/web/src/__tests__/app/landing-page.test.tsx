import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'

import LandingPage from '@/app/page'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/landing/HeroPreview', () => ({
  HeroPreview: () => <div data-testid="hero-preview-stub">Hero Preview Stub</div>,
}))

describe('LandingPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('keeps the hero copy above the preview and quietly rewrites the first section', () => {
    const { queryByText } = render(<LandingPage />)

    expect(screen.getByText('模块化货架设计平台')).toBeTruthy()
    expect(screen.getByRole('heading', { name: '用更可信的方式预览模块化货架方案' })).toBeTruthy()
    expect(
      screen.getByText('在进入细节建模前，先确认结构比例、层板关系与材质方向，让方案沟通更接近真实产品展示。'),
    ).toBeTruthy()

    const heroCopy = screen.getByTestId('landing-hero-copy')
    const heroPreview = screen.getByTestId('hero-preview-stub')
    expect(heroCopy.compareDocumentPosition(heroPreview) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    const primaryCta = screen.getByRole('link', { name: '开始设计' })
    const secondaryCta = screen.getByRole('link', { name: '查看示例' })

    expect(primaryCta.getAttribute('href')).toBe('/register')
    expect(secondaryCta.getAttribute('href')).toBe('/login')

    expect(screen.getByText('先看整体比例')).toBeTruthy()
    expect(screen.getByText('再调材质与规格')).toBeTruthy()
    expect(screen.getByText('输出可沟通方案')).toBeTruthy()

    expect(queryByText('实时 3D 可视化')).toBeNull()
    expect(queryByText('支持 360° 旋转查看')).toBeNull()
    expect(queryByText('3D 预览区域')).toBeNull()
  })
})
