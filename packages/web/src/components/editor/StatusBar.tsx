'use client'

import { getTemplateById } from '@3d-modeler/core'
import { useEditorStore } from '@/stores/editor-store'
import { Info } from 'lucide-react'

export function StatusBar() {
  const sceneGraph = useEditorStore((s) => s.sceneGraph)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const templateId = useEditorStore((s) => s.templateId)

  // Count total nodes (excluding root group)
  const countNodes = (node: typeof sceneGraph): number => {
    if (node.type === 'group') {
      return node.children.reduce((sum, child) => sum + countNodes(child), 0)
    }
    return 1
  }

  const totalNodes = countNodes(sceneGraph)
  const templateName = templateId ? getTemplateById(templateId)?.name ?? templateId : null
  const sourceLabel = templateName ? `预置方案 · ${templateName}` : '当前设计'

  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 lg:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>
            来源: <span className="font-medium text-slate-900">{sourceLabel}</span>
          </span>
        </div>
        <div className="h-4 w-px bg-slate-300" />
        <span>
          组件数: <span className="font-medium text-slate-900">{totalNodes}</span>
        </span>
        {selectedNodeId && (
          <>
            <div className="h-4 w-px bg-slate-300" />
            <span>
              已选择: <span className="font-medium text-slate-900">{selectedNodeId}</span>
            </span>
          </>
        )}
      </div>
      <div className="text-slate-500">
        ShelfCraft 3D 编辑器
      </div>
    </footer>
  )
}
