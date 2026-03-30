import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ViewPresetToolbar } from '@/components/editor/ViewPresetToolbar'

describe('ViewPresetToolbar', () => {
  it('renders Chinese-localized preset view controls and reports preset changes', () => {
    const onChange = vi.fn()

    render(<ViewPresetToolbar activePreset="iso" onChange={onChange} />)

    expect(screen.getByRole('button', { name: '前视' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '侧视' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '俯视' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '等轴' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '俯视' }))

    expect(onChange).toHaveBeenCalledWith('top')
  })
})
