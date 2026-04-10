'use client'
import { useState } from 'react'
import { PATRIMOINE_SECTORS, REGION_DEPTS } from '@/lib/pappers'
import type { StandardSearchCriteria } from '@/lib/types'

const REGIONS = Object.keys(REGION_DEPTS)
const CA_OPTIONS = [
  { value: undefined, label: 'Tous' },
  { value: 0.5, label: '> 500k€' },
  { value: 1, label: '> 1M€' },
  { value: 2, label: '> 2M€' },
  { value: 5, label: '> 5M€' },
]

interface Props {
  onSearch: (criteria: StandardSearchCriteria) => void
}

export function StandardSearchStep({ onSearch }: Props) {
  const [sectors, setSectors] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [caMin, setCaMin] = useState<number | undefined>(undefined)
  const [limit, setLimit] = useState(50)

  function toggle<T>(list: T[], setList: (v: T[]) => void, val: T) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])
  }

  function handleSearch() {
    onSearch({ sectors, regions, ca_min_m: caMin, limit })
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
        Recherche automatique dans la base Pappers (registre national des entreprises).
        Chaque dirigeant identifié est ensuite scoré par l'IA selon son potentiel patrimonial.
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Secteurs cibles{' '}
          <span className="font-normal text-gray-400">(optionnel — tous si vide)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PATRIMOINE_SECTORS).map(([key, sector]) => (
            <button
              key={key}
              onClick={() => toggle(sectors, setSectors, key)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                sectors.includes(key)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {sector.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Régions{' '}
          <span className="font-normal text-gray-400">(optionnel — toute la France si vide)</span>
        </label>
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

      <div className="flex flex-wrap items-end gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CA minimum</label>
          <select
            value={caMin ?? ''}
            onChange={(e) => setCaMin(e.target.value ? Number(e.target.value) : undefined)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {CA_OPTIONS.map((o) => (
              <option key={String(o.value)} value={o.value ?? ''}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prospects max</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex justify-end">
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            Rechercher {limit} prospects
          </button>
        </div>
      </div>
    </div>
  )
}
