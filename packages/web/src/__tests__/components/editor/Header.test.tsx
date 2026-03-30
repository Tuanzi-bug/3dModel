import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Header } from '@/components/editor/Header'
import { useEditorStore } from '@/stores/editor-store'

const mockPush = vi.fn()
const manualSave = vi.fn()
let mockSaveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/hooks/use-auto-save', () => ({
  useAutoSave: () => ({
    manualSave,
    saveStatus: mockSaveStatus,
  }),
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSaveStatus = 'idle'
    useEditorStore.setState({
      designName: '测试设计',
      selectedNodeId: null,
      sceneGraph: {
        id: 'root',
        type: 'group',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        params: {},
        children: [],
      },
      mode: 'template',
      templateId: null,
      templateParams: null,
      past: [],
      future: [],
      typeCounters: {},
      designId: 'design-1',
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('uses 保存设计 as the primary save action copy', () => {
    render(<Header />)

    expect(screen.getByRole('button', { name: '保存设计' })).toBeTruthy()
  })

  it('announces save status changes with a polite live region', () => {
    mockSaveStatus = 'saved'

    render(<Header />)

    expect(screen.getByText('已保存').getAttribute('aria-live')).toBe('polite')
  })

  it('shows inline retry guidance near the save action when save fails', () => {
    mockSaveStatus = 'error'

    render(<Header />)

    expect(screen.getByRole('button', { name: '保存失败，请重试' })).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toBe(
      '保存失败，请重试。若问题持续，请返回控制台后重新打开设计。',
    )
  })

  it('calls manualSave when the primary save action is clicked', () => {
    render(<Header />)

    fireEvent.click(screen.getByRole('button', { name: '保存设计' }))

    expect(manualSave).toHaveBeenCalledTimes(1)
  })
})
