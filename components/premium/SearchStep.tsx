'use client'
import { useState } from 'react'
import type { SearchCriteria } from '@/lib/types'

const SECTORS = ['BTP', 'Immobilier', 'Médical', 'Pharmacie', 'Industrie', 'Conseil', 'IT', 'Commerce', 'Hôtellerie', 'Énergie', 'Logistique']
const REGIONS = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Nantes', 'Lille', 'Strasbourg', 'Rennes', 'Nice']
const EVENT_TYPES = [
  { value: 'heritage', label: 'Héritage / Succession', icon: '⚖️' },
  { value: 'cession', label: 'Cession d\'entreprise', icon: '🤝' },
  { value: 'changement_poste', label: 'Changement de poste', icon: '🚀' },
]

interface Props {
  onSearch: (criteria: SearchCriteria) => void
}

export function SearchStep({ onSearch }: Props) {
  const [sectors, setSectors] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [eventTypes, setEventTypes] = useState<string[]>(['heritage', 'cession', 'changement_poste'])
  const [limit, setLimit] = useState(15)

  function toggle<T>(list: T[], setList: (v: T[]) => void, val: T) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])
  }

  function handleSearch() {
    onSearch({
      sectors,
      regions,
      event_types: eventTypes as SearchCriteria['event_types'],
      limit,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Événements à détecter</label>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((e) => (
            <button
              key={e.value}
              onClick={() => toggle(eventTypes, setEventTypes, e.value)}
              className={`px-3 py-2 rounded-lg text-sm border transition ${
                eventTypes.includes(e.value)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {e.icon} {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Secteurs (optionnel — tous si vide)</label>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => toggle(sectors, setSectors, s)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                sectors.includes(s)
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Régions (optionnel)</label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => toggle(regions, setRegions, r)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                regions.includes(r)
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de prospects max</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex-1 flex justify-end pt-5">
          <button
            onClick={handleSearch}
            disabled={eventTypes.length === 0}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition font-semibold disabled:opacity-50"
          >
            Rechercher et scorer
          </button>
        </div>
      </div>
    </div>
  )
}
