import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Header } from '@/components/editor/Header'
import { useEditorStore } from '@/stores/editor-store'

const mockPush = vi.fn()
const manualSave = vi.fn()
let mockSaveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle'
const createObjectURL = vi.fn(() => 'blob:mock')
const revokeObjectURL = vi.fn()
const anchorClick = vi.fn()
const mockBlob = vi.fn((parts: unknown[], options?: Record<string, unknown>) => ({ parts, options }))
let exportedBlob: { parts: unknown[]; options?: Record<string, unknown> } | null = null

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
    exportedBlob = null
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: vi.fn((blob: { parts: unknown[]; options?: Record<string, unknown> }) => {
        exportedBlob = blob
        return createObjectURL(blob)
      }),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: revokeObjectURL,
    })
    vi.stubGlobal('Blob', mockBlob)
    HTMLAnchorElement.prototype.click = anchorClick
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
    vi.unstubAllGlobals()
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

  it('downloads an excel-safe BOM csv when the export action is clicked', async () => {
    render(<Header />)

    fireEvent.click(screen.getByRole('button', { name: '导出清单' }))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(anchorClick).toHaveBeenCalledTimes(1)
    expect(exportedBlob).not.toBeNull()

    const csv = String(exportedBlob!.parts[0])
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('类型,规格,数量,单位')
  })
})
