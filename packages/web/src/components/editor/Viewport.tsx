// @ts-nocheck - R3F JSX types not resolved in monorepo
'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useEditorStore } from '@/stores/editor-store'
import { Loader2 } from 'lucide-react'

// 动态导入整个 Canvas 组件，避免 SSR 问题
const DynamicCanvas = dynamic(
  () => import('./ViewportCanvas').then((mod) => mod.ViewportCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-slate-100">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    ),
  }
)

export function Viewport() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex-1 h-full bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 h-full bg-slate-100">
      <DynamicCanvas />
    </div>
  )
}
