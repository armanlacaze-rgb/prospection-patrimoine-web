// lib/pappers.ts
// Pappers API v2 client for patrimoine prospecting
// Two-step: /v2/recherche (0.1 credit/result) → /v2/entreprise (1 credit/fiche)

import type { ProspectInput, StandardSearchCriteria } from './types'

const BASE_URL = 'https://api.pappers.fr/v2'

// ─── Sector → NAF codes mapping ───────────────────────────────────────────────
// Sectors where individuals typically accumulate significant personal wealth
export const PATRIMOINE_SECTORS: Record<string, { label: string; nafCodes: string[] }> = {
  medical: {
    label: 'Médical',
    nafCodes: ['86.21Z', '86.22A', '86.22B', '86.22C', '86.23Z', '86.90A', '86.90F'],
  },
  juridique: {
    label: 'Juridique',
    nafCodes: ['69.10Z'],
  },
  expertise: {
    label: 'Expertise-comptable',
    nafCodes: ['69.20Z'],
  },
  immobilier: {
    label: 'Immobilier',
    nafCodes: ['68.10Z', '68.20A', '68.20B', '68.31Z'],
  },
  finance: {
    label: 'Finance / Conseil',
    nafCodes: ['64.19Z', '64.20Z', '64.30Z', '64.91Z', '64.99Z', '66.30Z', '70.22Z'],
  },
  tech: {
    label: 'Tech / IT',
    nafCodes: ['62.01Z', '62.02A', '62.09Z'],
  },
  industrie: {
    label: 'Industrie',
    nafCodes: ['28.11Z', '28.12Z', '28.13Z', '28.14Z', '28.15Z'],
  },
  pharmacie: {
    label: 'Pharmacie',
    nafCodes: ['47.73Z'],
  },
}

// ─── Region → department codes ────────────────────────────────────────────────
export const REGION_DEPTS: Record<string, string[]> = {
  Paris: ['75', '92', '93', '94', '77', '78', '91', '95'],
  Lyon: ['69'],
  Marseille: ['13'],
  Bordeaux: ['33'],
  Toulouse: ['31'],
  Nantes: ['44'],
  Lille: ['59'],
  Strasbourg: ['67'],
  Rennes: ['35'],
  Nice: ['06'],
}

// ─── Internal Pappers API types ────────────────────────────────────────────────
interface PappersResult {
  siren: string
  nom_entreprise?: string
  denomination?: string
  date_creation?: string
  entreprise_cessee?: boolean
  procedures_collectives?: unknown[]
  effectif?: string
  effectif_min?: number
  effectif_max?: number
  siege?: {
    siret?: string
    ville?: string
    code_postal?: string
    adresse_ligne_1?: string
  }
}

interface PappersFiche {
  siren: string
  nom_entreprise?: string
  denomination?: string
  chiffre_affaires?: number
  effectif?: string
  representants?: Array<{
    prenom?: string
    prenom_usuel?: string
    nom?: string
    nom_usage?: string
    qualite?: string
    titre?: string
    date_prise_de_poste?: string
  }>
  dirigeants?: Array<{
    prenom?: string
    prenom_usuel?: string
    nom?: string
    nom_usage?: string
    qualite?: string
    titre?: string
    date_prise_de_poste?: string
  }>
  siege?: { ville?: string; code_postal?: string }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

function ancienneteAns(dateCreation?: string): number {
  if (!dateCreation) return 0
  return (Date.now() - new Date(dateCreation).getTime()) / (1000 * 60 * 60 * 24 * 365)
}

function passeLesFiltres(e: PappersResult): boolean {
  if (e.entreprise_cessee) return false
  if (e.procedures_collectives && e.procedures_collectives.length > 0) return false
  const ans = ancienneteAns(e.date_creation)
  if (ans < 2) return false
  return true
}

async function fetchPappers<T>(path: string, params: Record<string, string | number>): Promise<T | null> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString()
  try {
    const res = await fetch(`${BASE_URL}${path}?${qs}`, {
      signal: AbortSignal.timeout(15_000),
    })
    if (res.status === 429) {
      await delay(3_000)
      return fetchPappers<T>(path, params)
    }
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

function extractDirigeant(fiche: PappersFiche) {
  const d = (fiche.representants ?? fiche.dirigeants)?.[0]
  if (!d) return null
  return {
    prenom: d.prenom ?? d.prenom_usuel ?? '',
    nom: d.nom ?? d.nom_usage ?? '',
    titre: d.qualite ?? d.titre ?? 'Dirigeant',
  }
}

function sectorLabelForNaf(nafCode: string): string {
  for (const sector of Object.values(PATRIMOINE_SECTORS)) {
    if (sector.nafCodes.includes(nafCode)) return sector.label
  }
  return 'PME'
}

// ─── Main export: async generator ────────────────────────────────────────────
// Yields ProspectInput one by one as Pappers returns them.
// The caller (SSE route) can stop iteration when enough qualified prospects found.
export async function* searchPappers(
  criteria: StandardSearchCriteria,
  apiKey: string,
): AsyncGenerator<ProspectInput> {
  const sectorKeys =
    criteria.sectors.length > 0 ? criteria.sectors : Object.keys(PATRIMOINE_SECTORS)

  const departements: string[] =
    criteria.regions.length > 0
      ? criteria.regions.flatMap((r) => REGION_DEPTS[r] ?? [])
      : []

  // We search up to 4× the limit in raw candidates (most won't qualify scoring)
  const maxCandidates = criteria.limit * 4

  let candidatesFound = 0

  outer: for (const sectorKey of sectorKeys) {
    const sector = PATRIMOINE_SECTORS[sectorKey]
    if (!sector) continue

    for (const nafCode of sector.nafCodes) {
      for (let page = 1; page <= 3; page++) {
        if (candidatesFound >= maxCandidates) break outer

        const params: Record<string, string | number> = {
          api_token: apiKey,
          code_naf: nafCode,
          par_page: 20,
          page,
          precision: 'standard',
        }
        if (departements.length > 0) {
          params.departement = departements.join(',')
        }

        const data = await fetchPappers<{ resultats: PappersResult[] }>('/recherche', params)
        const resultats = data?.resultats ?? []
        if (resultats.length === 0) break // no more pages for this NAF

        const candidats = resultats.filter(passeLesFiltres)

        for (const candidat of candidats) {
          if (candidatesFound >= maxCandidates) break outer

          await delay(300)

          const fiche = await fetchPappers<PappersFiche>('/entreprise', {
            api_token: apiKey,
            siren: candidat.siren,
          })
          if (!fiche) continue

          const dirigeant = extractDirigeant(fiche)
          if (!dirigeant?.nom) continue

          const caM = fiche.chiffre_affaires ? fiche.chiffre_affaires / 1_000_000 : undefined
          if (criteria.ca_min_m && caM !== undefined && caM < criteria.ca_min_m) continue

          const ville = candidat.siege?.ville ?? fiche.siege?.ville ?? ''
          const cp = candidat.siege?.code_postal ?? fiche.siege?.code_postal ?? ''

          yield {
            first_name: dirigeant.prenom,
            last_name: dirigeant.nom,
            job_title: dirigeant.titre,
            company_name: candidat.nom_entreprise ?? candidat.denomination ?? fiche.nom_entreprise ?? fiche.denomination ?? '',
            sector: sectorLabelForNaf(nafCode),
            revenue_m: caM,
            employees: fiche.effectif ? parseInt(fiche.effectif) || undefined : undefined,
            location: ville ? `${ville}${cp ? ` (${cp.slice(0, 2)})` : ''}` : undefined,
          }

          candidatesFound++
          await delay(300)
        }

        await delay(300)
      }
    }
  }
}
