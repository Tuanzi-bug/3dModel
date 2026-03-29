'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEditorStore } from '@/stores/editor-store'
import { EditorShell } from '@/components/editor/EditorShell'
import { getTemplateById } from '@3d-modeler/core'

export default function NewEditorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialized = useRef(false)
  const creatingRef = useRef(false)
  const applyTemplate = useEditorStore((s) => s.applyTemplate)
  const sceneGraph = useEditorStore((s) => s.sceneGraph)
  const resetScene = useEditorStore((s) => s.resetScene)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const templateId = searchParams.get('template')
    if (!templateId) {
      router.push('/dashboard')
      return
    }

    const template = getTemplateById(templateId)
    if (!template) {
      router.push('/dashboard')
      return
    }

    resetScene()
    useEditorStore.setState({ designName: `新建${template.name}` })
    applyTemplate(templateId, template.defaultParams)
  }, [searchParams, router, applyTemplate, resetScene])

  useEffect(() => {
    const { designId, designName, templateId } = useEditorStore.getState()
    if (designId) return
    if (creatingRef.current) return
    if (sceneGraph.children.length === 0) return

    creatingRef.current = true
    fetch('/api/designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: designName, templateId, sceneGraph }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          useEditorStore.setState({ designId: res.data.id })
          window.history.replaceState(null, '', `/editor/${res.data.id}`)
        }
      })
      .finally(() => {
        creatingRef.current = false
      })
  }, [sceneGraph])

  return <EditorShell />
}
