import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ComponentType } from 'react'

import { HeroPreview } from '@/components/landing/HeroPreview'

type MatchMediaState = {
  matches: boolean
}

type SceneProps = {
  autoRotate: boolean
  onReady: () => void
  onError: (error?: unknown) => void
}

function stubMatchMedia({ matches }: MatchMediaState) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeListener: (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      dispatchEvent: (event: Event) => {
        listeners.forEach((listener) => listener(event as MediaQueryListEvent))
        return true
      },
    })),
  )
}

function readyScene(): ComponentType<SceneProps> {
  return function ReadyScene({ autoRotate, onReady }: SceneProps) {
    queueMicrotask(onReady)

    return (
      <div data-testid="hero-preview-scene" data-auto-rotate={String(autoRotate)}>
        scene-ready
      </div>
    )
  }
}

function failingScene(): ComponentType<SceneProps> {
  return function FailingScene({ onError }: SceneProps) {
    queueMicrotask(() => onError(new Error('webgl init failed')))

    return <div data-testid="hero-preview-scene">scene-failing</div>
  }
}

describe('HeroPreview', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders the poster immediately while the live scene is unresolved', () => {
    stubMatchMedia({ matches: false })

    render(<HeroPreview />)

    expect(screen.getByTestId('hero-preview')).toHaveAttribute('data-state', 'poster')
    expect(screen.getByTestId('hero-preview-poster')).toBeTruthy()
    expect(screen.getByText('正在准备 3D 预览')).toBeTruthy()
  })

  it('switches into the ready state when the scene reports readiness', async () => {
    stubMatchMedia({ matches: false })

    render(<HeroPreview SceneComponent={readyScene()} />)

    await waitFor(() => {
      expect(screen.getByTestId('hero-preview')).toHaveAttribute('data-state', 'ready')
    })

    expect(screen.getByTestId('hero-preview-scene')).toHaveAttribute('data-auto-rotate', 'true')
    expect(screen.getByText('拖拽旋转，滚轮缩放')).toBeTruthy()
  })

  it('falls back to the poster state when the scene reports an error', async () => {
    stubMatchMedia({ matches: false })

    render(<HeroPreview SceneComponent={failingScene()} />)

    await waitFor(() => {
      expect(screen.getByTestId('hero-preview')).toHaveAttribute('data-state', 'fallback')
    })

    expect(screen.getByText('3D 预览暂时使用海报模式展示')).toBeTruthy()
    expect(screen.getByTestId('hero-preview-poster')).toBeTruthy()
  })

  it('suppresses auto-rotation when reduced motion is preferred', async () => {
    stubMatchMedia({ matches: true })

    render(<HeroPreview SceneComponent={readyScene()} />)

    await waitFor(() => {
      expect(screen.getByTestId('hero-preview')).toHaveAttribute('data-state', 'ready')
    })

    expect(screen.getByTestId('hero-preview-scene')).toHaveAttribute('data-auto-rotate', 'false')
    expect(screen.getByText('拖拽旋转，滚轮缩放')).toBeTruthy()
  })
})
