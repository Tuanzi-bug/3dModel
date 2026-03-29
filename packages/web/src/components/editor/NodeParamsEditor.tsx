'use client'

import { useEditorStore } from '@/stores/editor-store'
import { findNode } from '@3d-modeler/core'

export function NodeParamsEditor() {
  const sceneGraph = useEditorStore((s) => s.sceneGraph)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const updateNodeParams = useEditorStore((s) => s.updateNodeParams)
  const updateNodeTransform = useEditorStore((s) => s.updateNodeTransform)

  if (!selectedNodeId) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-500">选择一个组件以编辑其属性</p>
      </div>
    )
  }

  const node = findNode(sceneGraph, selectedNodeId)
  if (!node || node.type === 'group') {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-500">无法编辑此组件</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="p-3 bg-slate-100 rounded-lg">
        <p className="text-xs font-medium text-slate-700 uppercase">{node.type}</p>
      </div>

      {/* Position */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-slate-700">位置</span>
        <div className="grid grid-cols-3 gap-2">
          {(['X', 'Y', 'Z'] as const).map((axis, i) => (
            <label key={axis} className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">{axis}</span>
              <input
                type="number"
                step={0.05}
                value={node.position[i]}
                onChange={(e) => {
                  const newPos = [...node.position] as [number, number, number]
                  newPos[i] = Number(e.target.value)
                  updateNodeTransform(node.id, { position: newPos })
                }}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs
                         focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Type-specific params - simplified version */}
      {node.type === 'rod' && node.params && 'diameter' in node.params && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-700">直径 (mm)</span>
          <select
            value={node.params.diameter}
            onChange={(e) => updateNodeParams(node.id, { ...node.params, diameter: Number(e.target.value) as 6 | 8 | 13 })}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value={6}>6mm</option>
            <option value={8}>8mm</option>
            <option value={13}>13mm</option>
          </select>
        </label>
      )}

      {node.type === 'shelf' && node.params && 'material' in node.params && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-700">材质</span>
          <select
            value={node.params.material}
            onChange={(e) => updateNodeParams(node.id, { ...node.params, material: e.target.value as 'wood' | 'acrylic' | 'metal' })}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          >
            <option value="wood">木质</option>
            <option value="acrylic">亚克力</option>
            <option value="metal">金属</option>
          </select>
        </label>
      )}
    </div>
  )
}
