// lib/__tests__/csv-parser.test.ts
import { describe, it, expect } from 'vitest'
import { parseCSV } from '../csv-parser'

const APOLLO_CSV = `First Name,Last Name,Title,Company,Industry,Annual Revenue,# Employees,LinkedIn Url,Email,City
Thomas,Marchand,PDG,Marchand BTP,Construction,8500000,45,https://linkedin.com/in/tmarchand,t.marchand@marchandbtp.fr,Lyon
Sophie,Duval,Directeur Général,Duval Pharmacie,Pharmacie,3200000,22,https://linkedin.com/in/sduval,s.duval@duval-pharma.fr,Paris`

const LINKEDIN_CSV = `First Name,Last Name,Current Positions,Company Name,Industry,LinkedIn Profile URL
Jean,Martin,"PDG chez Martin Tech",Martin Tech,IT,https://linkedin.com/in/jmartin`

describe('parseCSV', () => {
  it('parse un export Apollo.io', () => {
    const result = parseCSV(APOLLO_CSV)
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      first_name: 'Thomas',
      last_name: 'Marchand',
      job_title: 'PDG',
      company_name: 'Marchand BTP',
      sector: 'Construction',
      revenue_m: 8.5,
      employees: 45,
      location: 'Lyon',
    })
  })

  it('parse un export LinkedIn Sales Navigator', () => {
    const result = parseCSV(LINKEDIN_CSV)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      first_name: 'Jean',
      last_name: 'Martin',
      company_name: 'Martin Tech',
    })
  })

  it('retourne [] pour CSV vide', () => {
    expect(parseCSV('')).toEqual([])
  })
})
