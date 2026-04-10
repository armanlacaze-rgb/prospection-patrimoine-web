import type { Stats } from '@/lib/types'

interface Props {
  stats: Stats
}

export function StatsBar({ stats }: Props) {
  const items = [
    { label: 'Prospects chargés', value: stats.loaded, color: 'text-gray-800' },
    { label: 'Qualifiés', value: stats.qualified, color: 'text-green-600' },
    {
      label: 'Score moyen',
      value: stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '—',
      color: 'text-blue-600',
    },
    { label: 'Messages générés', value: stats.messages, color: 'text-purple-600' },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white rounded-xl border p-4 text-center shadow-sm">
          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          <div className="text-xs text-gray-500 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  )
}
