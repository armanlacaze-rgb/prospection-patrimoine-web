import type { Mode } from '@/lib/types'

interface Props {
  mode: Mode
  onChange: (mode: Mode) => void
}

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="inline-flex rounded-xl border bg-gray-100 p-1">
      <button
        onClick={() => onChange('standard')}
        className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
          mode === 'standard'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Standard <span className="text-xs text-gray-400 ml-1">50/sem</span>
      </button>
      <button
        onClick={() => onChange('premium')}
        className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
          mode === 'premium'
            ? 'bg-white text-purple-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Premium <span className="text-xs text-gray-400 ml-1">15/sem</span>
      </button>
    </div>
  )
}
