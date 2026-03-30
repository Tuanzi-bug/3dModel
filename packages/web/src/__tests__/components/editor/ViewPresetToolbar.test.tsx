import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ViewPresetToolbar } from '@/components/editor/ViewPresetToolbar'

describe('ViewPresetToolbar', () => {
  it('renders Chinese-localized preset view controls and reports preset changes', () => {
    const onChange = vi.fn()
    const onFocusSelected = vi.fn()
    const onZoomIn = vi.fn()
    const onZoomOut = vi.fn()

    render(
      <ViewPresetToolbar
        activePreset="iso"
        onChange={onChange}
        onFocusSelected={onFocusSelected}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        focusDisabled={false}
      />,
    )

    expect(screen.getByRole('button', { name: '前视' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '侧视' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '俯视' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '等轴' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '聚焦选中' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '放大' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '缩小' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '俯视' }))
    fireEvent.click(screen.getByRole('button', { name: '聚焦选中' }))
    fireEvent.click(screen.getByRole('button', { name: '放大' }))
    fireEvent.click(screen.getByRole('button', { name: '缩小' }))

    expect(onChange).toHaveBeenCalledWith('top')
    expect(onFocusSelected).toHaveBeenCalledTimes(1)
    expect(onZoomIn).toHaveBeenCalledTimes(1)
    expect(onZoomOut).toHaveBeenCalledTimes(1)
  })
})
