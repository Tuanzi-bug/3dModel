import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useEditorStore } from '@/stores/editor-store'

// Mock next/navigation (not used in use-auto-save, but needed for store imports)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
vi.stubGlobal('localStorage', localStorageMock)

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockFetch.mockResolvedValue({ ok: true })
    localStorageMock.clear()
    // Reset store to clean state
    useEditorStore.setState({
      designId: null,
      sceneGraph: { id: 'root', type: 'group', position: [0,0,0], rotation: [0,0,0], params: {}, children: [] },
      designName: 'Test Design',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('does not save when designId is null', async () => {
    const { result } = renderHook(() => useAutoSave())

    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('debounces auto-save 3 seconds after sceneGraph changes', async () => {
    useEditorStore.setState({ designId: 'design-123' })

    const { rerender } = renderHook(() => useAutoSave())

    // Simulate sceneGraph change
    act(() => {
      useEditorStore.setState({
        sceneGraph: { id: 'root', type: 'group', position: [1,0,0], rotation: [0,0,0], params: {}, children: [] },
      })
    })

    rerender()

    // Not called yet
    expect(mockFetch).not.toHaveBeenCalled()

    // Advance past debounce
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/designs/design-123',
      expect.objectContaining({ method: 'PATCH' })
    )
  })

  it('saves to localStorage on auto-save', async () => {
    useEditorStore.setState({ designId: 'design-456', designName: 'My Shelf' })

    renderHook(() => useAutoSave())

    act(() => {
      useEditorStore.setState({
        sceneGraph: { id: 'root', type: 'group', position: [0,1,0], rotation: [0,0,0], params: {}, children: [] },
      })
    })

    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    const saved = JSON.parse(localStorageMock.getItem('autosave-design') ?? '{}')
    expect(saved.designId).toBe('design-456')
    expect(saved.designName).toBe('My Shelf')
    expect(saved.savedAt).toBeDefined()
  })

  it('manualSave saves immediately without waiting for debounce', async () => {
    useEditorStore.setState({ designId: 'design-789' })

    const { result } = renderHook(() => useAutoSave())

    // Call manualSave directly — should save once
    await act(async () => {
      await result.current.manualSave()
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/designs/design-789',
      expect.objectContaining({ method: 'PATCH' })
    )
  })

  it('handles fetch network error gracefully', async () => {
    useEditorStore.setState({ designId: 'design-err' })
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useAutoSave())

    // Should not throw
    await expect(
      act(async () => {
        await result.current.manualSave()
      })
    ).resolves.not.toThrow()
  })
})
