// app/page.tsx
'use client'
import { useState } from 'react'
import { ModeToggle } from '@/components/ModeToggle'
import { StatsBar } from '@/components/StatsBar'
import { UploadStep } from '@/components/standard/UploadStep'
import { ScoringStep } from '@/components/standard/ScoringStep'
import { SearchStep } from '@/components/premium/SearchStep'
import { SearchingStep } from '@/components/premium/SearchingStep'
import { ResultsStep } from '@/components/shared/ResultsStep'
import type { Mode, Step, Stats, ProspectInput, ProspectScored, SearchCriteria } from '@/lib/types'

const STEP_LABELS: Record<Mode, string[]> = {
  standard: ['Import CSV', 'Scoring IA', 'Résultats'],
  premium: ['Critères', 'Recherche IA', 'Résultats'],
}

function StepIndicator({ mode, step }: { mode: Mode; step: Step }) {
  const labels = STEP_LABELS[mode]
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => {
        const n = (i + 1) as Step
        const active = step === n
        const done = step > n
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              active ? 'bg-blue-600 text-white' :
              done ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-400'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                active ? 'bg-white text-blue-600' :
                done ? 'bg-green-500 text-white' :
                'bg-gray-300 text-gray-500'
              }`}>
                {done ? '✓' : n}
              </span>
              {label}
            </div>
            {i < 2 && <div className="w-6 h-px bg-gray-300" />}
          </div>
        )
      })}
    </div>
  )
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('standard')
  const [step, setStep] = useState<Step>(1)
  const [stats, setStats] = useState<Stats>({ loaded: 0, qualified: 0, avgScore: 0, messages: 0 })
  const [prospects, setProspects] = useState<ProspectInput[]>([])
  const [results, setResults] = useState<ProspectScored[]>([])
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null)

  function handleModeChange(newMode: Mode) {
    setMode(newMode)
    setStep(1)
    setStats({ loaded: 0, qualified: 0, avgScore: 0, messages: 0 })
    setProspects([])
    setResults([])
    setSearchCriteria(null)
  }

  function handleProspectsLoaded(loaded: ProspectInput[]) {
    setProspects(loaded)
    setStats((s) => ({ ...s, loaded: loaded.length }))
    setStep(2)
  }

  function handleSearch(criteria: SearchCriteria) {
    setSearchCriteria(criteria)
    setStep(2)
  }

  function handleScoringComplete(qualified: ProspectScored[]) {
    setResults(qualified)
    setStep(3)
  }

  function handleStatsUpdate(qualified: number, avgScore: number, messages: number) {
    setStats((s) => ({ ...s, qualified, avgScore, messages }))
  }

  function handleRestart() {
    setStep(1)
    setStats({ loaded: 0, qualified: 0, avgScore: 0, messages: 0 })
    setProspects([])
    setResults([])
    setSearchCriteria(null)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospection Patrimoine IA</h1>
          <p className="text-sm text-gray-500">Qualification automatique de prospects B2B</p>
        </div>
        <ModeToggle mode={mode} onChange={handleModeChange} />
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Stepper */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
        <StepIndicator mode={mode} step={step} />

        <div className="border-t pt-6">
          {/* Mode Standard */}
          {mode === 'standard' && step === 1 && (
            <UploadStep onProspectsLoaded={handleProspectsLoaded} />
          )}
          {mode === 'standard' && step === 2 && (
            <ScoringStep
              prospects={prospects}
              onComplete={handleScoringComplete}
              onStatsUpdate={handleStatsUpdate}
            />
          )}

          {/* Mode Premium */}
          {mode === 'premium' && step === 1 && (
            <SearchStep onSearch={handleSearch} />
          )}
          {mode === 'premium' && step === 2 && searchCriteria && (
            <SearchingStep
              criteria={searchCriteria}
              onComplete={handleScoringComplete}
              onStatsUpdate={handleStatsUpdate}
            />
          )}

          {/* Résultats (partagé) */}
          {step === 3 && (
            <ResultsStep prospects={results} onRestart={handleRestart} />
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">Propulsé par Claude · Anthropic</p>
    </main>
  )
}
