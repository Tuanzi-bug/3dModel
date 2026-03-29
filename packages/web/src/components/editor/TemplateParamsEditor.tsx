'use client'

import { useEditorStore } from '@/stores/editor-store'
import { AlertTriangle } from 'lucide-react'

export function TemplateParamsEditor() {
  const templateParams = useEditorStore((s) => s.templateParams)
  const updateTemplateParams = useEditorStore((s) => s.updateTemplateParams)

  if (!templateParams) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-500">请先选择一个模板</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-yellow-700">
          修改模板参数将重新生成所有组件
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-700">宽度 (m)</span>
        <input
          type="number"
          step={0.1}
          min={0.1}
          max={5}
          value={templateParams.width}
          onChange={(e) => updateTemplateParams({ width: Number(e.target.value) })}
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-700">高度 (m)</span>
        <input
          type="number"
          step={0.1}
          min={0.1}
          max={5}
          value={templateParams.height}
          onChange={(e) => updateTemplateParams({ height: Number(e.target.value) })}
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-700">深度 (m)</span>
        <input
          type="number"
          step={0.1}
          min={0.1}
          max={5}
          value={templateParams.depth}
          onChange={(e) => updateTemplateParams({ depth: Number(e.target.value) })}
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-700">层数</span>
        <input
          type="number"
          step={1}
          min={1}
          max={10}
          value={templateParams.layers}
          onChange={(e) => updateTemplateParams({ layers: Number(e.target.value) })}
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-700">杆直径 (mm)</span>
        <select
          value={templateParams.rodDiameter}
          onChange={(e) => updateTemplateParams({ rodDiameter: Number(e.target.value) as 6 | 8 | 13 })}
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        >
          <option value={6}>6mm</option>
          <option value={8}>8mm</option>
          <option value={13}>13mm</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-700">层板材质</span>
        <select
          value={templateParams.shelfMaterial}
          onChange={(e) => updateTemplateParams({ shelfMaterial: e.target.value as 'wood' | 'acrylic' | 'metal' })}
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        >
          <option value="wood">木质</option>
          <option value="acrylic">亚克力</option>
          <option value="metal">金属</option>
        </select>
      </label>
    </div>
  )
}
