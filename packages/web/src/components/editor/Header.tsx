'use client'

import { useRouter } from 'next/navigation'
import { generateBom, serializeBomCsv } from '@3d-modeler/core'
import { useEditorStore } from '@/stores/editor-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { ArrowLeft, Undo2, Redo2, Save, Check, AlertCircle, Download } from 'lucide-react'

function sanitizeFilenameSegment(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'design'
  }

  return trimmed
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'design'
}

export function Header() {
  const router = useRouter()
  const { manualSave, saveStatus } = useAutoSave()
  const designName = useEditorStore((s) => s.designName)
  const setDesignName = useEditorStore((s) => s.setDesignName)
  const mode = useEditorStore((s) => s.mode)
  const templateId = useEditorStore((s) => s.templateId)
  const switchToFreeform = useEditorStore((s) => s.switchToFreeform)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const past = useEditorStore((s) => s.past)
  const future = useEditorStore((s) => s.future)
  const sceneGraph = useEditorStore((s) => s.sceneGraph)

  async function handleSave() {
    await manualSave()
  }

  function handleExportBom() {
    const csv = serializeBomCsv(generateBom(sceneGraph))
    const filename = `${sanitizeFilenameSegment(designName)}-bom.csv`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = objectUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
  }

  const getSaveButtonLabel = () => {
    switch (saveStatus) {
      case 'saving':
        return '保存中...'
      case 'saved':
        return '已保存'
      case 'error':
        return '保存失败，请重试'
      default:
        return '保存设计'
    }
  }

  const saveButtonLabel = getSaveButtonLabel()
  const saveErrorMessage = '保存失败，请重试。若问题持续，请返回控制台后重新打开设计。'
  const saveButtonIcon =
    saveStatus === 'saved'
      ? <Check className="w-4 h-4" />
      : saveStatus === 'error'
        ? <AlertCircle className="w-4 h-4" />
        : <Save className={`w-4 h-4${saveStatus === 'saving' ? ' animate-pulse' : ''}`} />

  return (
    <header className="flex flex-col gap-3 bg-white px-4 py-3 border-b border-slate-200 lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div className="flex items-center gap-4 min-w-0">
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
          aria-label="设计名称"
          className="bg-transparent border-b border-transparent hover:border-slate-300
                   focus:border-accent focus:outline-none px-2 py-1 text-slate-900
                   font-medium transition-colors min-w-0 flex-1"
          placeholder="未命名设计"
        />
      </div>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:justify-end">
        <div className="flex items-center gap-2">
        {mode === 'template' && templateId && (
          <button
            onClick={switchToFreeform}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-700
                     bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            转为自由搭建
          </button>
        )}
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
          onClick={handleExportBom}
          aria-label="导出清单"
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-700
                   bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          导出清单
        </button>
        </div>
        <div className="flex flex-col items-stretch gap-1 sm:items-end">
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          aria-describedby={saveStatus === 'error' ? 'save-error-message' : undefined}
          className="flex items-center justify-center gap-1 px-4 py-1.5 text-sm font-medium text-white
                   bg-accent hover:bg-accent-hover rounded-lg min-w-[120px]
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saveButtonIcon}
          <span aria-live="polite">{saveButtonLabel}</span>
        </button>
        {saveStatus === 'error' && (
          <p
            id="save-error-message"
            role="alert"
            className="text-sm text-red-600 sm:max-w-xs"
          >
            {saveErrorMessage}
          </p>
        )}
        </div>
      </div>
    </header>
  )
}
