'use client'

import { useState } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { TemplateParamsEditor } from './TemplateParamsEditor'
import { NodeParamsEditor } from './NodeParamsEditor'
import { Settings, Box } from 'lucide-react'

export function PropertiesPanel() {
  const [activeTab, setActiveTab] = useState<'template' | 'node'>('template')
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)

  return (
    <aside className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">属性面板</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('template')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'template'
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            模板参数
          </button>
          <button
            onClick={() => setActiveTab('node')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'node'
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-4 h-4" />
            组件属性
            {selectedNodeId && (
              <span className="w-2 h-2 bg-accent rounded-full" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          {activeTab === 'template' ? (
            <TemplateParamsEditor />
          ) : (
            <NodeParamsEditor />
          )}
        </div>
      </div>
    </aside>
  )
}
