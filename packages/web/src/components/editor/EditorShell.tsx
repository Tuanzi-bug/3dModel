'use client'

import { Header } from './Header'
import { ComponentPanel } from './ComponentPanel'
import { Viewport } from './Viewport'
import { PropertiesPanel } from './PropertiesPanel'
import { StatusBar } from './StatusBar'

export function EditorShell() {
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
