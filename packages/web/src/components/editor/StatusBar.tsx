'use client'

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

  return (
    <footer className="flex items-center justify-between px-6 py-2 bg-white border-t border-slate-200 text-xs text-slate-600">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>
            模板: <span className="font-medium text-slate-900">{templateId || '未选择'}</span>
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
