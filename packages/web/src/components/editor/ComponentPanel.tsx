'use client'

import { useEffect, useState } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import type { TemplateMetadata } from '@3d-modeler/core'
import { Box } from 'lucide-react'

export function ComponentPanel() {
  const [templates, setTemplates] = useState<TemplateMetadata[]>([])
  const applyTemplate = useEditorStore((s) => s.applyTemplate)
  const templateId = useEditorStore((s) => s.templateId)

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setTemplates(res.data)
      })
  }, [])

  return (
    <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">模板库</h2>
        <div className="flex flex-col gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id, t.defaultParams)}
              className={`text-left p-3 rounded-lg border transition-all ${
                templateId === t.id
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Box className="w-4 h-4" />
                <span className="text-sm font-medium">{t.name}</span>
              </div>
              <span className="block text-xs opacity-80">{t.category}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
