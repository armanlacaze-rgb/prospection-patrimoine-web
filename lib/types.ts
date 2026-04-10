// lib/types.ts

export interface ProspectInput {
  first_name: string
  last_name: string
  job_title: string
  company_name: string
  sector?: string
  revenue_m?: number
  employees?: number
  location?: string
  linkedin_url?: string
  email?: string
}

export interface ProspectScored extends ProspectInput {
  score: number
  score_reasoning: string
  patrimoine_signals: string[]
  message_linkedin: string
}

export type SSEEvent =
  | { type: 'result'; prospect: ProspectScored }
  | { type: 'rejected'; name: string; score: number }
  | { type: 'done'; total: number; qualified: number }
  | { type: 'error'; message: string }

export type Mode = 'standard' | 'premium'

export type Step = 1 | 2 | 3

export interface Stats {
  loaded: number
  qualified: number
  avgScore: number
  messages: number
}

export interface SearchCriteria {
  sectors: string[]
  regions: string[]
  event_types: Array<'heritage' | 'cession' | 'changement_poste'>
  limit: number
}
