import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { NodeParamsEditor } from '@/components/editor/NodeParamsEditor'
import { useEditorStore } from '@/stores/editor-store'
import type { SceneNode } from '@3d-modeler/core'

function setScene(children: SceneNode[], selectedNodeId: string | null) {
  useEditorStore.setState({
    sceneGraph: {
      id: 'root',
      type: 'group',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      params: {},
      children,
    },
    selectedNodeId,
    mode: 'freeform',
    templateId: null,
    templateParams: null,
    transformMode: 'translate',
    past: [],
    future: [],
    typeCounters: {},
    designId: 'design-params',
    designName: '参数测试',
  })
}

describe('NodeParamsEditor', () => {
  beforeEach(() => {
    setScene([], null)
  })

  afterEach(() => {
    cleanup()
  })

  it('renders editable LED strip controls', () => {
    setScene([
      {
        id: 'ledStrip-0',
        type: 'ledStrip',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        params: { length: 1.2, color: '#ff0000' },
        children: [],
      },
    ], 'ledStrip-0')

    render(<NodeParamsEditor />)

    expect(screen.getByText('LED灯带 #0')).toBeTruthy()
    expect((screen.getByLabelText('灯带长度') as HTMLInputElement).value).toBe('1.2')
    expect((screen.getByLabelText('灯带颜色') as HTMLInputElement).value).toBe('#ff0000')
  })

  it('renders editable back panel controls and persists updates through the store', () => {
    setScene([
      {
        id: 'backPanel-0',
        type: 'backPanel',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        params: { width: 1, height: 1.4, material: 'wood' },
        children: [],
      },
    ], 'backPanel-0')

    render(<NodeParamsEditor />)

    fireEvent.change(screen.getByLabelText('背板宽度'), { target: { value: '1.8' } })
    fireEvent.change(screen.getByLabelText('背板材质'), { target: { value: 'metal' } })

    const updated = useEditorStore.getState().sceneGraph.children[0]
    expect(updated?.params).toMatchObject({
      width: 1.8,
      height: 1.4,
      material: 'metal',
    })
  })
})
