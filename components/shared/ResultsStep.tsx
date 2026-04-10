'use client'
import { useState } from 'react'
import type { ProspectScored } from '@/lib/types'
import { MessageModal } from './MessageModal'

interface Props {
  prospects: ProspectScored[]
  onRestart: () => void
}

export function ResultsStep({ prospects, onRestart }: Props) {
  const [selected, setSelected] = useState<ProspectScored | null>(null)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospects }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      a.href = url
      a.download = `prospects_qualifies_${date}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{prospects.length} prospects qualifiés</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
          >
            {exporting ? 'Export...' : 'Exporter CSV'}
          </button>
          <button
            onClick={onRestart}
            className="border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Nouveau batch
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Prospect</th>
              <th className="text-left p-3 font-medium text-gray-600">Entreprise</th>
              <th className="text-left p-3 font-medium text-gray-600">Signaux</th>
              <th className="text-center p-3 font-medium text-gray-600">Score</th>
              <th className="text-center p-3 font-medium text-gray-600">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {prospects.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium">{p.first_name} {p.last_name}</div>
                  <div className="text-xs text-gray-500">{p.job_title}</div>
                </td>
                <td className="p-3">
                  <div>{p.company_name}</div>
                  <div className="text-xs text-gray-500">{p.sector} {p.location ? `· ${p.location}` : ''}</div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {p.patrimoine_signals.slice(0, 3).map((s, j) => (
                      <span key={j} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-center">
                  <span className={`font-bold text-base ${p.score >= 8 ? 'text-green-600' : 'text-orange-500'}`}>
                    {p.score.toFixed(1)}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => setSelected(p)}
                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                  >
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <MessageModal prospect={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
