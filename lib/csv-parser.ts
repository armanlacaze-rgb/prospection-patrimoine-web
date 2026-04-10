// lib/csv-parser.ts
import Papa from 'papaparse'
import type { ProspectInput } from './types'

type RawRow = Record<string, string>

function toFloat(val: string | undefined): number | undefined {
  if (!val) return undefined
  const n = parseFloat(val.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? undefined : n
}

function toInt(val: string | undefined): number | undefined {
  if (!val) return undefined
  const n = parseInt(val.replace(/[^0-9]/g, ''), 10)
  return isNaN(n) ? undefined : n
}

function toMillions(val: string | undefined): number | undefined {
  const raw = toFloat(val)
  if (raw === undefined) return undefined
  // If value is already expressed in millions (≤ 9999), keep it; otherwise divide
  return raw > 9999 ? Math.round((raw / 1_000_000) * 100) / 100 : raw
}

function mapApollo(row: RawRow): ProspectInput {
  return {
    first_name: row['First Name'] ?? '',
    last_name: row['Last Name'] ?? '',
    job_title: row['Title'] ?? '',
    company_name: row['Company'] ?? '',
    sector: row['Industry'] || undefined,
    revenue_m: toMillions(row['Annual Revenue']),
    employees: toInt(row['# Employees']),
    linkedin_url: row['LinkedIn Url'] || undefined,
    email: row['Email'] || undefined,
    location: row['City'] || undefined,
  }
}

function mapLinkedIn(row: RawRow): ProspectInput {
  const positions = row['Current Positions'] ?? ''
  const jobMatch = positions.match(/^([^à@,]+?)(?:\s+(?:chez|at)\s+.+)?$/)
  return {
    first_name: row['First Name'] ?? '',
    last_name: row['Last Name'] ?? '',
    job_title: jobMatch ? jobMatch[1].trim() : positions,
    company_name: row['Company Name'] ?? '',
    sector: row['Industry'] || undefined,
    linkedin_url: row['LinkedIn Profile URL'] || undefined,
  }
}

function detectFormat(headers: string[]): 'apollo' | 'linkedin' | 'unknown' {
  if (headers.includes('Annual Revenue') || headers.includes('# Employees')) return 'apollo'
  if (headers.includes('Current Positions') || headers.includes('LinkedIn Profile URL')) return 'linkedin'
  return 'unknown'
}

export function parseCSV(csvString: string): ProspectInput[] {
  if (!csvString.trim()) return []

  const result = Papa.parse<RawRow>(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  if (!result.data.length) return []

  const headers = Object.keys(result.data[0])
  const format = detectFormat(headers)

  return result.data
    .map((row) => {
      if (format === 'apollo') return mapApollo(row)
      if (format === 'linkedin') return mapLinkedIn(row)
      return {
        first_name: row['First Name'] ?? row['first_name'] ?? '',
        last_name: row['Last Name'] ?? row['last_name'] ?? '',
        job_title: row['Title'] ?? row['job_title'] ?? '',
        company_name: row['Company'] ?? row['Company Name'] ?? row['company_name'] ?? '',
      }
    })
    .filter((p) => p.first_name && p.company_name)
}
