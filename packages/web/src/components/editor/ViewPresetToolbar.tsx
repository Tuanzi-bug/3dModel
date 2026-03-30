'use client'

export type ViewPreset = 'front' | 'side' | 'top' | 'iso'

interface Props {
  activePreset: ViewPreset
  onChange: (preset: ViewPreset) => void
}

const PRESETS: Array<{ id: ViewPreset; label: string }> = [
  { id: 'front', label: '前视' },
  { id: 'side', label: '侧视' },
  { id: 'top', label: '俯视' },
  { id: 'iso', label: '等轴' },
]

export function ViewPresetToolbar({ activePreset, onChange }: Props) {
  return (
    <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onChange(preset.id)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            activePreset === preset.id
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
