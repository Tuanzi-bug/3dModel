'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/stores/editor-store'
import { EditorShell } from '@/components/editor/EditorShell'
import { Loader2 } from 'lucide-react'

export default function EditEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const loadDesign = useEditorStore((s) => s.loadDesign)

  useEffect(() => {
    fetch(`/api/designs/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) {
          router.push('/dashboard')
          return
        }
        loadDesign({
          id: res.data.id,
          name: res.data.name,
          sceneGraph: res.data.sceneGraph,
          templateId: res.data.templateId,
          templateParams: null,
        })
        setLoading(false)
      })
      .catch(() => router.push('/dashboard'))
  }, [id, router, loadDesign])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-slate-600">加载设计中...</p>
        </div>
      </div>
    )
  }

  return <EditorShell />
}
