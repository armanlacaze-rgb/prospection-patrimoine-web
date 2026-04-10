'use client'
import { useEffect, useState } from 'react'
import { SettingsModal } from '@/components/settings/SettingsModal'
import { REGION_DEPTS } from '@/lib/pappers'
import { loadSettings, saveSettings } from '@/lib/settings'
import type { PappersSettings } from '@/lib/settings'
import type { StandardSearchCriteria } from '@/lib/types'

const REGIONS = Object.keys(REGION_DEPTS)
const CA_OPTIONS = [
  { value: undefined, label: 'Tous' },
  { value: 0.5,       label: '> 500k€' },
  { value: 1,         label: '> 1M€' },
  { value: 2,         label: '> 2M€' },
  { value: 5,         label: '> 5M€' },
]

interface Props {
  onSearch: (criteria: StandardSearchCriteria) => void
}

export function StandardSearchStep({ onSearch }: Props) {
  const [settings, setSettings] = useState<PappersSettings | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [sectors, setSectors] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [caMin, setCaMin] = useState<number | undefined>(undefined)
  const [limit, setLimit] = useState(50)

  // Load settings client-side only (localStorage)
  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  function toggle<T>(list: T[], setList: (v: T[]) => void, val: T) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])
  }

  function handleSaveSettings(updated: PappersSettings) {
    saveSettings(updated)
    setSettings(updated)
    // Reset sector selection if saved sectors changed
    setSectors([])
  }

  function handleSearch() {
    if (!settings) return
    onSearch({ sectors, regions, ca_min_m: caMin, limit, settings })
  }

  if (!settings) {
    return <div className="py-8 text-center text-sm text-gray-400">Chargement des paramètres...</div>
  }

  const enabledSectors = Object.entries(settings.sectors).filter(([, s]) => s.enabled)
  const totalNafCodes = Object.values(settings.sectors)
    .filter((s) => s.enabled)
    .flatMap((s) => s.nafCodes).length

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start justify-between gap-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <p className="text-sm text-blue-700">
          Recherche automatique dans la base Pappers (registre national des entreprises).
          Chaque dirigeant identifié est scoré par l'IA selon son potentiel patrimonial.
        </p>
        <button
          onClick={() => setShowSettings(true)}
          className="shrink-0 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-300 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition"
          title="Configurer les secteurs et filtres Pappers"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
          </svg>
          Paramètres
        </button>
      </div>

      {/* Active config summary */}
      <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
        <span className="font-medium text-gray-700">{enabledSectors.length} secteur{enabledSectors.length > 1 ? 's' : ''} actif{enabledSectors.length > 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{totalNafCodes} codes NAF</span>
        <span>·</span>
        <span>Ancienneté {settings.filters.ancienneteMinAns}–{settings.filters.ancienneteMaxAns} ans</span>
        {settings.filters.effectifMax > 0 && (
          <>
            <span>·</span>
            <span>Effectif {settings.filters.effectifMin}–{settings.filters.effectifMax}</span>
          </>
        )}
      </div>

      {/* Sector filter (optional restriction) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Secteurs à rechercher{' '}
          <span className="font-normal text-gray-400">(optionnel — tous les secteurs actifs si vide)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {enabledSectors.map(([key, sector]) => (
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
              <span className="ml-1 opacity-60">{sector.nafCodes.length}</span>
            </button>
          ))}
          {enabledSectors.length === 0 && (
            <p className="text-xs text-red-500">
              Aucun secteur actif.{' '}
              <button onClick={() => setShowSettings(true)} className="underline">
                Ouvrir les paramètres
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Region filter */}
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

      {/* CA min + limit + launch */}
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
            disabled={enabledSectors.length === 0}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            Rechercher {limit} prospects
          </button>
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          initial={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
