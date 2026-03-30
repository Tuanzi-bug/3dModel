'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/stores/editor-store'
import { EditorShell } from '@/components/editor/EditorShell'
import { getTemplateById, type SceneNode } from '@3d-modeler/core'
import { useAutoSave } from '@/hooks/use-auto-save'

type NewEditorClientProps = {
  templateId: string | null
  mode?: 'template' | 'freeform'
}

const emptyRoot: SceneNode = {
  id: 'root',
  type: 'group',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  params: {},
  children: [],
}

export function NewEditorClient({ templateId, mode = 'template' }: NewEditorClientProps) {
  const router = useRouter()
  const initialized = useRef(false)
  const creatingRef = useRef(false)
  const applyTemplate = useEditorStore((s) => s.applyTemplate)
  const sceneGraph = useEditorStore((s) => s.sceneGraph)
  const editorMode = useEditorStore((s) => s.mode)
  const currentTemplateId = useEditorStore((s) => s.templateId)
  const designName = useEditorStore((s) => s.designName)
  const resetScene = useEditorStore((s) => s.resetScene)

  useAutoSave()

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (mode === 'freeform') {
      resetScene()
      useEditorStore.setState({
        mode: 'freeform',
        templateId: null,
        templateParams: null,
        designName: '新建设计',
      })
      return
    }

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
  }, [mode, templateId, router, applyTemplate, resetScene])

  useEffect(() => {
    const {
      designId,
      designName: currentDesignName,
      templateId: persistedTemplateId,
      sceneGraph: persistedSceneGraph,
      mode: persistedMode,
    } = useEditorStore.getState()
    if (designId) return
    if (creatingRef.current) return
    if (persistedMode === 'template' && persistedSceneGraph.children.length === 0) return

    creatingRef.current = true
    fetch('/api/designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: currentDesignName,
        templateId: persistedTemplateId,
        sceneGraph: persistedSceneGraph,
      }),
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
  }, [sceneGraph, editorMode, designName, currentTemplateId])

  return <EditorShell />
}
