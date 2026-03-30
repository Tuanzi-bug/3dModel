'use client'

import { useEditorStore } from '@/stores/editor-store'
import { NodeParamsEditor } from './NodeParamsEditor'
import { Box, Copy, Trash2 } from 'lucide-react'

export function PropertiesPanel() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const duplicateNode = useEditorStore((s) => s.duplicateNode)
  const removeNode = useEditorStore((s) => s.removeNode)
  const hasSelection = Boolean(selectedNodeId)

  return (
    <aside className="w-full shrink-0 overflow-y-auto border-t border-slate-200 bg-white lg:w-80 lg:border-l lg:border-t-0">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Box className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-900">组件属性</h2>
          {selectedNodeId && (
            <span className="ml-auto w-2 h-2 bg-accent rounded-full" />
          )}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => selectedNodeId && duplicateNode(selectedNodeId)}
            disabled={!hasSelection}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy className="w-4 h-4" />
            复制组件
          </button>
          <button
            type="button"
            onClick={() => selectedNodeId && removeNode(selectedNodeId)}
            disabled={!hasSelection}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            删除组件
          </button>
        </div>

        <NodeParamsEditor />
      </div>
    </aside>
  )
}
