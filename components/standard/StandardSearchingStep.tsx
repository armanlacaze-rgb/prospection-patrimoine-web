'use client'
import { useEffect, useState } from 'react'
import { ScoringProgress } from '@/components/shared/ScoringProgress'
import type { ProspectScored, StandardSearchCriteria } from '@/lib/types'

interface Props {
  criteria: StandardSearchCriteria
  onComplete: (qualified: ProspectScored[]) => void
  onStatsUpdate: (qualified: number, avgScore: number, messages: number) => void
}

export function StandardSearchingStep({ criteria, onComplete, onStatsUpdate }: Props) {
  const [total, setTotal] = useState(criteria.limit)
  const [processed, setProcessed] = useState(0)
  const [qualified, setQualified] = useState<ProspectScored[]>([])
  const [rejected, setRejected] = useState<Array<{ name: string; score: number }>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      const qualifiedList: ProspectScored[] = []

      const res = await fetch('/api/standard-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const event = JSON.parse(line.slice(6))

          if (event.type === 'result') {
            qualifiedList.push(event.prospect)
            setQualified([...qualifiedList])
            setProcessed((n) => n + 1)
            const avg = qualifiedList.reduce((s, p) => s + p.score, 0) / qualifiedList.length
            onStatsUpdate(qualifiedList.length, avg, qualifiedList.length)
          } else if (event.type === 'rejected') {
            setRejected((r) => [...r, { name: event.name, score: event.score }])
            setProcessed((n) => n + 1)
          } else if (event.type === 'done') {
            setTotal(event.total)
            onComplete(qualifiedList)
          } else if (event.type === 'error') {
            setError(event.message)
          }
        }
      }
    }
    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
        Erreur : {error}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-blue-700 font-medium">
        Recherche Pappers + scoring IA en cours...
      </p>
      <ScoringProgress
        total={total}
        processed={processed}
        qualified={qualified}
        rejected={rejected}
      />
    </div>
  )
}
