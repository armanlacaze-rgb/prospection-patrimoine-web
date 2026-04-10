'use client'
import { useState } from 'react'
import type { PappersSettings } from '@/lib/settings'
import { defaultSettings } from '@/lib/settings'

interface Props {
  initial: PappersSettings
  onSave: (settings: PappersSettings) => void
  onClose: () => void
}

export function SettingsModal({ initial, onSave, onClose }: Props) {
  const [settings, setSettings] = useState<PappersSettings>(() =>
    JSON.parse(JSON.stringify(initial))
  )
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [nafInputs, setNafInputs] = useState<Record<string, string>>({})
  const [newLabel, setNewLabel] = useState('')
  const [newNaf, setNewNaf] = useState('')

  // ── Sector helpers ─────────────────────────────────────────────────────────
  function toggleSector(key: string) {
    setSettings((s) => ({
      ...s,
      sectors: {
        ...s.sectors,
        [key]: { ...s.sectors[key], enabled: !s.sectors[key].enabled },
      },
    }))
  }

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function removeNaf(sectorKey: string, naf: string) {
    setSettings((s) => ({
      ...s,
      sectors: {
        ...s.sectors,
        [sectorKey]: {
          ...s.sectors[sectorKey],
          nafCodes: s.sectors[sectorKey].nafCodes.filter((c) => c !== naf),
        },
      },
    }))
  }

  function addNaf(sectorKey: string) {
    const code = (nafInputs[sectorKey] ?? '').trim().toUpperCase()
    if (!code || settings.sectors[sectorKey].nafCodes.includes(code)) return
    setSettings((s) => ({
      ...s,
      sectors: {
        ...s.sectors,
        [sectorKey]: {
          ...s.sectors[sectorKey],
          nafCodes: [...s.sectors[sectorKey].nafCodes, code],
        },
      },
    }))
    setNafInputs((prev) => ({ ...prev, [sectorKey]: '' }))
  }

  function removeSector(key: string) {
    setSettings((s) => {
      const { [key]: _removed, ...rest } = s.sectors
      return { ...s, sectors: rest }
    })
  }

  function addSector() {
    const label = newLabel.trim()
    const codes = newNaf
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean)
    if (!label || codes.length === 0) return
    const key = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
    setSettings((s) => ({
      ...s,
      sectors: {
        ...s.sectors,
        [key]: { label, nafCodes: codes, enabled: true },
      },
    }))
    setNewLabel('')
    setNewNaf('')
  }

  // ── Filter helpers ─────────────────────────────────────────────────────────
  function setFilter<K extends keyof PappersSettings['filters']>(
    key: K,
    value: PappersSettings['filters'][K]
  ) {
    setSettings((s) => ({ ...s, filters: { ...s.filters, [key]: value } }))
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Paramètres Pappers</h2>
            <p className="text-xs text-gray-400 mt-0.5">Secteurs cibles et filtres de qualification</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none font-light"
          >
            ×
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-8">

          {/* Section Secteurs */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Secteurs cibles
            </h3>

            <div className="space-y-1.5">
              {Object.entries(settings.sectors).map(([key, sector]) => (
                <div key={key} className="border rounded-xl overflow-hidden">

                  {/* Sector header row */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50/50 transition">
                    <input
                      type="checkbox"
                      checked={sector.enabled}
                      onChange={() => toggleSector(key)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                    />
                    <span
                      className={`flex-1 text-sm font-medium ${
                        sector.enabled ? 'text-gray-800' : 'text-gray-400 line-through'
                      }`}
                    >
                      {sector.label}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {sector.nafCodes.length} code{sector.nafCodes.length > 1 ? 's' : ''} NAF
                    </span>
                    <button
                      onClick={() => toggleExpand(key)}
                      className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 rounded hover:bg-gray-100 transition"
                      title="Modifier les codes NAF"
                    >
                      {expanded.has(key) ? '▲' : '▼'}
                    </button>
                    <button
                      onClick={() => removeSector(key)}
                      className="text-red-300 hover:text-red-500 text-sm font-bold px-1 transition"
                      title="Supprimer ce secteur"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Expanded NAF editor */}
                  {expanded.has(key) && (
                    <div className="border-t bg-gray-50 px-4 py-3 space-y-3">
                      {/* Existing NAF chips */}
                      <div className="flex flex-wrap gap-1.5 min-h-6">
                        {sector.nafCodes.length === 0 && (
                          <span className="text-xs text-gray-400 italic">Aucun code NAF</span>
                        )}
                        {sector.nafCodes.map((naf) => (
                          <span
                            key={naf}
                            className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2.5 py-0.5 text-xs text-gray-700"
                          >
                            {naf}
                            <button
                              onClick={() => removeNaf(key, naf)}
                              className="text-gray-400 hover:text-red-500 font-bold leading-none ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      {/* Add NAF input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={nafInputs[key] ?? ''}
                          onChange={(e) =>
                            setNafInputs((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && addNaf(key)}
                          placeholder="Ex: 86.21Z"
                          className="border rounded-lg px-3 py-1.5 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        <button
                          onClick={() => addNaf(key)}
                          className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-xs hover:bg-blue-700 transition"
                        >
                          + Ajouter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add new sector */}
            <div className="mt-4 border border-dashed border-gray-300 rounded-xl px-4 py-4 space-y-2.5">
              <p className="text-xs font-medium text-gray-500">Ajouter un secteur personnalisé</p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Nom du secteur"
                  className="border rounded-lg px-3 py-2 text-xs flex-1 min-w-36 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newNaf}
                  onChange={(e) => setNewNaf(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSector()}
                  placeholder="Codes NAF séparés par virgules (ex: 45.11Z, 45.19Z)"
                  className="border rounded-lg px-3 py-2 text-xs flex-1 min-w-52 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={addSector}
                  disabled={!newLabel.trim() || !newNaf.trim()}
                  className="bg-gray-800 text-white rounded-lg px-4 py-2 text-xs hover:bg-gray-700 disabled:opacity-40 transition"
                >
                  Créer
                </button>
              </div>
            </div>
          </section>

          {/* Section Filtres */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Filtres de qualification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Ancienneté min (ans)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.filters.ancienneteMinAns}
                  onChange={(e) => setFilter('ancienneteMinAns', Number(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Ancienneté max (ans)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.filters.ancienneteMaxAns}
                  onChange={(e) => setFilter('ancienneteMaxAns', Number(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Effectif min
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.filters.effectifMin}
                  onChange={(e) => setFilter('effectifMin', Number(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Effectif max <span className="text-gray-400">(0 = illimité)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.filters.effectifMax}
                  onChange={(e) => setFilter('effectifMax', Number(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <label className="flex items-center gap-2.5 mt-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.filters.exclureProcedures}
                onChange={(e) => setFilter('exclureProcedures', e.target.checked)}
                className="w-4 h-4 accent-blue-600 shrink-0"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                Exclure les procédures collectives
                <span className="text-xs text-gray-400 ml-1">(liquidation, redressement judiciaire)</span>
              </span>
            </label>
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl shrink-0">
          <button
            onClick={() => setSettings(defaultSettings())}
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition"
          >
            Réinitialiser les valeurs par défaut
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 transition text-gray-600"
            >
              Annuler
            </button>
            <button
              onClick={() => { onSave(settings); onClose() }}
              className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
