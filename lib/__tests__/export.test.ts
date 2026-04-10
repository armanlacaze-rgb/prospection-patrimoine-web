// lib/__tests__/export.test.ts
import { describe, it, expect } from 'vitest'
import { generateCSV } from '../export'
import type { ProspectScored } from '../types'

const PROSPECTS: ProspectScored[] = [
  {
    first_name: 'Thomas',
    last_name: 'Marchand',
    job_title: 'PDG',
    company_name: 'Marchand BTP',
    sector: 'BTP',
    revenue_m: 8.5,
    employees: 45,
    location: 'Lyon',
    linkedin_url: 'https://linkedin.com/in/tmarchand',
    email: 't.marchand@marchandbtp.fr',
    score: 9.2,
    score_reasoning: 'Fort potentiel patrimonial',
    patrimoine_signals: ['holding', 'optimisation IS'],
    message_linkedin: 'Bonjour Thomas, votre activité dans le BTP...',
  },
]

describe('generateCSV', () => {
  it('génère un CSV avec les bonnes colonnes', () => {
    const csv = generateCSV(PROSPECTS)
    expect(csv).toContain(
      'Prénom,Nom,Titre,Entreprise,Secteur,CA (M€),Effectifs,Localisation,Score,Signaux,Message LinkedIn,Email,LinkedIn URL'
    )
    expect(csv).toContain('Thomas')
    expect(csv).toContain('Marchand BTP')
    expect(csv).toContain('9.2')
  })

  it('échappe les virgules dans les champs', () => {
    const csv = generateCSV([
      { ...PROSPECTS[0], message_linkedin: 'Bonjour, test' },
    ])
    expect(csv).toContain('"Bonjour, test"')
  })

  it('échappe les guillemets doubles', () => {
    const csv = generateCSV([
      { ...PROSPECTS[0], message_linkedin: 'Test "citation"' },
    ])
    expect(csv).toContain('"Test ""citation"""')
  })
})
