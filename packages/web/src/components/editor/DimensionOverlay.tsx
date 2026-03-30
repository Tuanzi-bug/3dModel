'use client'

import type { Bounds3D } from '@3d-modeler/core'

interface Props {
  bounds: Bounds3D | null
}

function formatDimension(value: number) {
  return `${value.toFixed(2)}m`
}

export function DimensionOverlay({ bounds }: Props) {
  if (!bounds) {
    return null
  }

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-slate-200 bg-white/92 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
        {`宽 ${formatDimension(bounds.size[0])}`}
      </span>
      <span className="rounded-full border border-slate-200 bg-white/92 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
        {`高 ${formatDimension(bounds.size[1])}`}
      </span>
      <span className="rounded-full border border-slate-200 bg-white/92 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
        {`深 ${formatDimension(bounds.size[2])}`}
      </span>
    </div>
  )
}
