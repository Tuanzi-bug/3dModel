'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditorStore } from '@/stores/editor-store'

const AUTO_SAVE_DELAY = 500 // 500ms delay for auto-save
const LOCAL_STORAGE_KEY = 'autosave-design'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const designId = useEditorStore((s) => s.designId)
  const sceneGraph = useEditorStore((s) => s.sceneGraph)
  const designName = useEditorStore((s) => s.designName)
  const templateId = useEditorStore((s) => s.templateId)

  const scheduleStatusReset = useCallback((nextStatus: SaveStatus, delay: number) => {
    setSaveStatus(nextStatus)

    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => {
      setSaveStatus('idle')
    }, delay)
  }, [])

  const save = useCallback(async () => {
    if (!designId) return

    setSaveStatus('saving')

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        designId,
        sceneGraph,
        designName,
        templateId,
        savedAt: new Date().toISOString(),
      }))
    } catch { /* quota exceeded — ignore */ }

    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: designName, sceneGraph, templateId }),
      })

      if (!response.ok) {
        throw new Error('Save request failed')
      }

      scheduleStatusReset('saved', 2000)
    } catch {
      scheduleStatusReset('error', 3000)
    }
  }, [designId, sceneGraph, designName, templateId, scheduleStatusReset])

  useEffect(() => {
    if (!designId) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(save, AUTO_SAVE_DELAY)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [sceneGraph, designName, designId, templateId, save])

  const manualSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    return save()
  }, [save])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  return { manualSave, saveStatus }
}
