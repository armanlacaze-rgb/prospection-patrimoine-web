'use client'
import type { ProspectScored } from '@/lib/types'

interface Props {
  total: number
  processed: number
  qualified: ProspectScored[]
  rejected: Array<{ name: string; score: number }>
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? 'bg-green-100 text-green-800' :
    score >= 7 ? 'bg-orange-100 text-orange-800' :
    'bg-red-100 text-red-500 line-through opacity-60'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score.toFixed(1)}
    </span>
  )
}

export function ScoringProgress({ total, processed, qualified, rejected }: Props) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{processed}/{total} prospects analysés</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {qualified.map((p, i) => (
          <div key={i} className="flex items-center justify-between py-1 px-2 bg-green-50 rounded text-sm">
            <span className="font-medium">{p.first_name} {p.last_name}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">{p.company_name}</span>
              <ScoreBadge score={p.score} />
            </div>
          </div>
        ))}
        {rejected.map((p, i) => (
          <div key={i} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded text-sm opacity-50">
            <span className="line-through">{p.name}</span>
            <ScoreBadge score={p.score} />
          </div>
        ))}
      </div>
    </div>
  )
}
