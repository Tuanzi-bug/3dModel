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

describe('LandingPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('restores the original landing-page baseline', () => {
    const { queryByText } = render(<LandingPage />)

    expect(screen.getByRole('heading', { name: '专业的 3D 模块化货架设计工具' })).toBeTruthy()
    expect(screen.getByText('实时 3D 可视化，所见即所得。选择模板，调整尺寸，立即预览你的设计效果。')).toBeTruthy()
    expect(screen.getByText('3D 预览区域')).toBeTruthy()

    const primaryCta = screen.getByRole('link', { name: '开始设计' })
    const secondaryCta = screen.getByRole('link', { name: '查看示例' })

    expect(primaryCta.getAttribute('href')).toBe('/register')
    expect(secondaryCta.getAttribute('href')).toBe('/login')

    expect(screen.getByRole('heading', { name: '实时 3D 可视化' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '丰富的模板库' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '快速导出' })).toBeTruthy()

    expect(queryByText('模块化货架设计平台')).toBeNull()
    expect(queryByText('用更可信的方式预览模块化货架方案')).toBeNull()
    expect(queryByText('先看整体比例')).toBeNull()
    expect(queryByText('输出可沟通方案')).toBeNull()
  })
})
