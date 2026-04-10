// lib/export.ts
import type { ProspectScored } from './types'

function escape(val: string | number | undefined): string {
  const str = val === undefined ? '' : String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function generateCSV(prospects: ProspectScored[]): string {
  const headers = [
    'Prénom',
    'Nom',
    'Titre',
    'Entreprise',
    'Secteur',
    'CA (M€)',
    'Score',
    'Signaux',
    'Message LinkedIn',
    'Effectifs',
    'Localisation',
    'Email',
    'LinkedIn URL',
  ]

  const rows = prospects.map((p) =>
    [
      escape(p.first_name),
      escape(p.last_name),
      escape(p.job_title),
      escape(p.company_name),
      escape(p.sector),
      escape(p.revenue_m),
      escape(p.score.toFixed(1)),
      escape(p.patrimoine_signals.join(' | ')),
      escape(p.message_linkedin),
      escape(p.employees),
      escape(p.location),
      escape(p.email),
      escape(p.linkedin_url),
    ].join(',')
  )

  return [headers.join(','), ...rows].join('\n')
}
