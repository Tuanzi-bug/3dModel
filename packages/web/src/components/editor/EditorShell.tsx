'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { Header } from './Header'
import { ComponentPanel } from './ComponentPanel'
import { Viewport } from './Viewport'
import { PropertiesPanel } from './PropertiesPanel'
import { StatusBar } from './StatusBar'

export function EditorShell() {
  // 键盘快捷键处理
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      // 如果焦点在输入框、文本域或选择框中，不触发快捷键
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return
      }

      // Ctrl+Shift+Z 或 Cmd+Shift+Z: 重做
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault()
        useEditorStore.getState().redo()
      }
      // Ctrl+Z 或 Cmd+Z: 撤销
      else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        useEditorStore.getState().undo()
      }
      // Delete 或 Backspace: 删除选中的节点
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        const selected = useEditorStore.getState().selectedNodeId
        if (selected) {
          e.preventDefault()
          useEditorStore.getState().removeNode(selected)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ComponentPanel />
        <div className="flex-1 relative">
          <Viewport />
        </div>
        <PropertiesPanel />
      </div>
      <StatusBar />
    </div>
  )
}
