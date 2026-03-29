'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditorStore } from '@/stores/editor-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { ArrowLeft, Undo2, Redo2, Save } from 'lucide-react'

export function Header() {
  const router = useRouter()
  const { manualSave } = useAutoSave()
  const designName = useEditorStore((s) => s.designName)
  const setDesignName = useEditorStore((s) => s.setDesignName)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const past = useEditorStore((s) => s.past)
  const future = useEditorStore((s) => s.future)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await manualSave()
    setSaving(false)
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          title="返回控制台"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">返回</span>
        </button>
        <div className="h-6 w-px bg-slate-300" />
        <input
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          className="bg-transparent border-b border-transparent hover:border-slate-300
                   focus:border-accent focus:outline-none px-2 py-1 text-slate-900
                   font-medium transition-colors"
          placeholder="未命名设计"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={past.length === 0}
          aria-label="撤销"
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-700
                   bg-white border border-slate-300 rounded-lg hover:bg-slate-50
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="撤销 (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
          撤销
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          aria-label="重做"
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-700
                   bg-white border border-slate-300 rounded-lg hover:bg-slate-50
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="重做 (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
          重做
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white
                   bg-accent hover:bg-accent-hover rounded-lg
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </header>
  )
}
