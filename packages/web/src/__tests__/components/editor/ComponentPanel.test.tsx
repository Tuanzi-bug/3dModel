import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ComponentPanel } from '@/components/editor/ComponentPanel'
import { useEditorStore } from '@/stores/editor-store'

describe('ComponentPanel', () => {
  beforeEach(() => {
    useEditorStore.setState({
      sceneGraph: {
        id: 'root',
        type: 'group',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        params: {},
        children: [],
      },
      selectedNodeId: null,
      mode: 'freeform',
      templateId: null,
      templateParams: null,
      transformMode: 'translate',
      past: [],
      future: [],
      typeCounters: {},
      designId: 'design-1',
      designName: '自由搭建设计',
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('keeps 杆、层板、LED灯带 和 背板 interactive while unsupported entries stay disabled', () => {
    render(<ComponentPanel />)

    expect(screen.getByRole('button', { name: /杆/ }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByRole('button', { name: /层板/ }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByRole('button', { name: /LED灯带/ }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByRole('button', { name: /背板/ }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByRole('button', { name: /十字夹/ }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: /固定环/ }).hasAttribute('disabled')).toBe(true)
    expect(screen.getAllByText('暂未开放').length).toBeGreaterThan(0)
  })

  it('does not mutate the scene when a disabled component entry is clicked', () => {
    render(<ComponentPanel />)

    fireEvent.click(screen.getByRole('button', { name: /十字夹/ }))

    expect(useEditorStore.getState().sceneGraph.children).toHaveLength(0)
    expect(useEditorStore.getState().selectedNodeId).toBeNull()
  })

  it('adds a supported Phase 3 component to the scene and selects it', () => {
    render(<ComponentPanel />)

    fireEvent.click(screen.getByRole('button', { name: /LED灯带/ }))

    expect(useEditorStore.getState().sceneGraph.children).toHaveLength(1)
    expect(useEditorStore.getState().sceneGraph.children[0]?.type).toBe('ledStrip')
    expect(useEditorStore.getState().selectedNodeId).toBe('ledStrip-0')
  })
})
