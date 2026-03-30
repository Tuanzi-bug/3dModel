'use client'

import { useEditorStore } from '@/stores/editor-store'
import { Box, Minus, Plus, Circle, GitBranch, Lightbulb, Square } from 'lucide-react'
import type { SceneNode } from '@3d-modeler/core'
import { isFreeformComponentEnabled } from '@/components/meshes/registry'

interface ComponentDef {
  type: SceneNode['type']
  name: string
  icon: React.ComponentType<{ className?: string }>
  defaultParams: SceneNode['params']
}

const components: ComponentDef[] = [
  {
    type: 'rod',
    name: '杆',
    icon: Minus,
    defaultParams: { diameter: 13, length: 1.0 },
  },
  {
    type: 'shelf',
    name: '层板',
    icon: Square,
    defaultParams: { width: 1.0, depth: 0.5, thickness: 0.02, material: 'wood' },
  },
  {
    type: 'crossClamp',
    name: '十字夹',
    icon: Plus,
    defaultParams: { rodDiameter: 13 },
  },
  {
    type: 'fixedRing',
    name: '固定环',
    icon: Circle,
    defaultParams: { rodDiameter: 13 },
  },
  {
    type: 'teeConnector',
    name: 'T型连接器',
    icon: GitBranch,
    defaultParams: { rodDiameter: 13 },
  },
  {
    type: 'ledStrip',
    name: 'LED灯带',
    icon: Lightbulb,
    defaultParams: { length: 1.0, color: '#ffffff' },
  },
  {
    type: 'backPanel',
    name: '背板',
    icon: Box,
    defaultParams: { width: 1.0, height: 1.0, material: 'wood' },
  },
]

export function ComponentPanel() {
  const addNode = useEditorStore((s) => s.addNode)
  const selectNode = useEditorStore((s) => s.selectNode)
  const generateNodeId = useEditorStore((s) => s.generateNodeId)

  function handleAdd(def: ComponentDef) {
    if (!isFreeformComponentEnabled(def.type)) {
      return
    }

    const node = {
      id: generateNodeId(def.type),
      type: def.type,
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      params: def.defaultParams,
      children: [],
    } as SceneNode
    addNode(node)
    selectNode(node.id)
  }

  return (
    <aside className="w-full shrink-0 overflow-y-auto border-b border-slate-200 bg-white lg:w-64 lg:border-b-0 lg:border-r">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">组件库</h2>
        <div className="flex flex-col gap-2">
          {components.map((def) => {
            const Icon = def.icon
            const isEnabled = isFreeformComponentEnabled(def.type)
            return (
              <button
                key={def.type}
                onClick={() => handleAdd(def)}
                disabled={!isEnabled}
                className={`text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                  isEnabled
                    ? 'border-slate-200 bg-white hover:border-accent hover:shadow-sm'
                    : 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-800">{def.name}</span>
                  {!isEnabled && (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      暂未开放
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
