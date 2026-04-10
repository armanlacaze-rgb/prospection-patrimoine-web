// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'
import type { ProspectInput, ProspectScored } from './types'

const SCORING_SYSTEM = `Tu es un expert en gestion de patrimoine B2B.
Ta mission : analyser le profil d'un dirigeant et lui attribuer un score de potentiel patrimonial de 1 à 10.

Score 8-10 : Dirigeant d'entreprise profitable, CA > 2M€, secteur à forte marge, potentiel holding évident, optimisation IS/IR urgente, transmission probable.
Score 5-7 : Profil intéressant mais signaux faibles (CA modeste, secteur à marge variable, poste non décisionnaire).
Score 1-4 : Peu de potentiel (employé, micro-entreprise, secteur public, ONG).

Secteurs à fort potentiel : BTP, immobilier, médical/chirurgie, pharmacie, industrie, conseil, tech/SaaS, commerce de gros, hôtellerie, énergie.

Réponds UNIQUEMENT en JSON valide, sans markdown :
{"score": <float 1.0-10.0>, "reasoning": "<2-3 phrases>", "patrimoine_signals": ["<signal>", ...], "message_linkedin": "<message LinkedIn personnalisé 200-300 caractères>"}`

function buildPrompt(p: ProspectInput): string {
  const lines = [
    `Prénom : ${p.first_name}`,
    `Nom : ${p.last_name}`,
    `Titre : ${p.job_title}`,
    `Entreprise : ${p.company_name}`,
  ]
  if (p.sector) lines.push(`Secteur : ${p.sector}`)
  if (p.revenue_m) lines.push(`CA estimé : ${p.revenue_m.toFixed(1)} M€`)
  if (p.employees) lines.push(`Effectifs : ${p.employees}`)
  if (p.location) lines.push(`Localisation : ${p.location}`)
  return lines.join('\n')
}

export interface ScoringResult {
  prospect: ProspectScored
  qualified: boolean
}

export async function scoreProspect(
  client: Anthropic,
  prospect: ProspectInput,
  threshold = 7.0,
): Promise<ScoringResult> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SCORING_SYSTEM,
    messages: [{ role: 'user', content: buildPrompt(prospect) }],
  })

  const raw = (response.content[0] as { text: string }).text.trim()
  const parsed = JSON.parse(raw)

  const scored: ProspectScored = {
    ...prospect,
    score: parseFloat(parsed.score),
    score_reasoning: parsed.reasoning ?? '',
    patrimoine_signals: parsed.patrimoine_signals ?? [],
    message_linkedin: parsed.message_linkedin ?? '',
  }

  return { prospect: scored, qualified: scored.score >= threshold }
}

export function createAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY manquant')
  return new Anthropic({ apiKey: key })
}
