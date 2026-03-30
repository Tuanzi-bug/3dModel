'use client'

import { useEditorStore } from '@/stores/editor-store'
import { findNode, parseNodeId } from '@3d-modeler/core'

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

  const parsedId = parseNodeId(node.id)
  const displayLabel = parsedId.sequence ? `${parsedId.typeLabel} #${parsedId.sequence}` : parsedId.typeLabel
  const renderVectorInputs = (
    label: string,
    values: [number, number, number],
    onChange: (next: [number, number, number]) => void,
    step: number,
  ) => (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <div className="grid grid-cols-3 gap-2">
        {(['X', 'Y', 'Z'] as const).map((axis, i) => {
          const value = values[i] ?? 0
          return (
            <label key={`${label}-${axis}`} className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">{axis}</span>
              <input
                type="number"
                step={step}
                aria-label={`${label} ${axis}`}
                value={value.toFixed(2)}
                onChange={(e) => {
                  const next = [...values] as [number, number, number]
                  next[i] = parseFloat(e.target.value)
                  onChange(next)
                }}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs
                         focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="p-3 bg-slate-100 rounded-lg">
        <p className="text-xs font-medium text-slate-700">{displayLabel}</p>
      </div>

      {/* Position */}
      {renderVectorInputs('位置', node.position, (position) => {
        updateNodeTransform(node.id, { position })
      }, 0.01)}

      {renderVectorInputs('旋转', node.rotation, (rotation) => {
        updateNodeTransform(node.id, { rotation })
      }, 0.1)}

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

      {node.type === 'ledStrip' && node.params && 'color' in node.params && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-700">灯带长度</span>
            <input
              type="number"
              step={0.1}
              min={0.1}
              aria-label="灯带长度"
              value={node.params.length}
              onChange={(e) =>
                updateNodeParams(node.id, {
                  ...node.params,
                  length: Number(e.target.value),
                })
              }
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-700">灯带颜色</span>
            <input
              type="color"
              aria-label="灯带颜色"
              value={node.params.color}
              onChange={(e) =>
                updateNodeParams(node.id, {
                  ...node.params,
                  color: e.target.value,
                })
              }
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-2
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </label>
        </>
      )}

      {node.type === 'backPanel' && node.params && 'height' in node.params && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-700">背板宽度</span>
            <input
              type="number"
              step={0.1}
              min={0.1}
              aria-label="背板宽度"
              value={node.params.width}
              onChange={(e) =>
                updateNodeParams(node.id, {
                  ...node.params,
                  width: Number(e.target.value),
                })
              }
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-700">背板高度</span>
            <input
              type="number"
              step={0.1}
              min={0.1}
              aria-label="背板高度"
              value={node.params.height}
              onChange={(e) =>
                updateNodeParams(node.id, {
                  ...node.params,
                  height: Number(e.target.value),
                })
              }
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-700">背板材质</span>
            <select
              aria-label="背板材质"
              value={node.params.material}
              onChange={(e) =>
                updateNodeParams(node.id, {
                  ...node.params,
                  material: e.target.value as 'wood' | 'acrylic' | 'metal',
                })
              }
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="wood">木质</option>
              <option value="acrylic">亚克力</option>
              <option value="metal">金属</option>
            </select>
          </label>
        </>
      )}
    </div>
  )
}
