'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '@/stores/editor-store'

const AUTO_SAVE_DELAY = 3000
const LOCAL_STORAGE_KEY = 'autosave-design'

export function useAutoSave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const designId = useEditorStore((s) => s.designId)
  const sceneGraph = useEditorStore((s) => s.sceneGraph)
  const designName = useEditorStore((s) => s.designName)

  const save = useCallback(async () => {
    if (!designId) return

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        designId,
        sceneGraph,
        designName,
        savedAt: new Date().toISOString(),
      }))
    } catch { /* quota exceeded — ignore */ }

    try {
      await fetch(`/api/designs/${designId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneGraph }),
      })
    } catch {
      // Network error — localStorage fallback already saved
    }
  }, [designId, sceneGraph, designName])

  useEffect(() => {
    if (!designId) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(save, AUTO_SAVE_DELAY)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [sceneGraph, designId, save])

  const manualSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    return save()
  }, [save])

  return { manualSave }
}
