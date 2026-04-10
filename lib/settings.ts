// lib/settings.ts
// Pappers configuration stored in localStorage

export interface SectorConfig {
  label: string
  nafCodes: string[]
  enabled: boolean
}

export interface PappersFilters {
  ancienneteMinAns: number
  ancienneteMaxAns: number
  effectifMin: number
  effectifMax: number
  exclureProcedures: boolean
}

export interface PappersSettings {
  sectors: Record<string, SectorConfig>
  filters: PappersFilters
}

// Hardcoded defaults — sectors where individuals accumulate significant personal wealth
export const DEFAULT_SECTORS: Record<string, { label: string; nafCodes: string[] }> = {
  medical:    { label: 'Médical',              nafCodes: ['86.21Z', '86.22A', '86.22B', '86.22C', '86.23Z', '86.90A', '86.90F'] },
  juridique:  { label: 'Juridique',            nafCodes: ['69.10Z'] },
  expertise:  { label: 'Expertise-comptable',  nafCodes: ['69.20Z'] },
  immobilier: { label: 'Immobilier',           nafCodes: ['68.10Z', '68.20A', '68.20B', '68.31Z'] },
  finance:    { label: 'Finance / Conseil',    nafCodes: ['64.19Z', '64.20Z', '64.30Z', '64.91Z', '64.99Z', '66.30Z', '70.22Z'] },
  tech:       { label: 'Tech / IT',            nafCodes: ['62.01Z', '62.02A', '62.09Z'] },
  industrie:  { label: 'Industrie',            nafCodes: ['28.11Z', '28.12Z', '28.13Z', '28.14Z', '28.15Z'] },
  pharmacie:  { label: 'Pharmacie',            nafCodes: ['47.73Z'] },
}

export function defaultSettings(): PappersSettings {
  return {
    sectors: Object.fromEntries(
      Object.entries(DEFAULT_SECTORS).map(([key, s]) => [
        key,
        { label: s.label, nafCodes: [...s.nafCodes], enabled: true },
      ])
    ),
    filters: {
      ancienneteMinAns: 2,
      ancienneteMaxAns: 40,
      effectifMin: 0,
      effectifMax: 200,
      exclureProcedures: true,
    },
  }
}

const STORAGE_KEY = 'pappers_settings_v1'

export function loadSettings(): PappersSettings {
  if (typeof window === 'undefined') return defaultSettings()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings()
    return JSON.parse(raw) as PappersSettings
  } catch {
    return defaultSettings()
  }
}

export function saveSettings(settings: PappersSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage not available
  }
}
