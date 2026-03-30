import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Bounds3D } from '@3d-modeler/core'
import { DimensionOverlay } from '@/components/editor/DimensionOverlay'

const bounds: Bounds3D = {
  min: [0, 0, 0],
  max: [1.2, 2.4, 0.5],
  size: [1.2, 2.4, 0.5],
  center: [0.6, 1.2, 0.25],
}

describe('DimensionOverlay', () => {
  it('renders localized width, height, and depth labels from bounds data', () => {
    render(<DimensionOverlay bounds={bounds} />)

    expect(screen.getByText('宽 1.20m')).toBeTruthy()
    expect(screen.getByText('高 2.40m')).toBeTruthy()
    expect(screen.getByText('深 0.50m')).toBeTruthy()
  })

  it('renders nothing when no bounds are available', () => {
    const { container } = render(<DimensionOverlay bounds={null} />)

    expect(container.firstChild).toBeNull()
  })
})
