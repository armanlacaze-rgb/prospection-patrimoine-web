import { NextRequest } from 'next/server'
import { createAnthropicClient, scoreProspect } from '@/lib/anthropic'
import { searchPappers } from '@/lib/pappers'
import type { StandardSearchCriteria } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const apiKey = process.env.PAPPERS_API_KEY
  if (!apiKey) {
    return new Response(
      `data: ${JSON.stringify({ type: 'error', message: 'PAPPERS_API_KEY non configurée' })}\n\n`,
      { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } }
    )
  }

  const criteria = (await req.json()) as StandardSearchCriteria

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const client = createAnthropicClient()
        let total = 0
        let qualified = 0

        for await (const prospect of searchPappers(criteria, apiKey)) {
          total++
          try {
            const { prospect: scored, qualified: isQualified } = await scoreProspect(client, prospect)
            if (isQualified) {
              qualified++
              send({ type: 'result', prospect: scored })
              if (qualified >= criteria.limit) break
            } else {
              send({
                type: 'rejected',
                name: `${prospect.first_name} ${prospect.last_name}`,
                score: scored.score,
              })
            }
          } catch {
            send({ type: 'rejected', name: `${prospect.first_name} ${prospect.last_name}`, score: 0 })
          }
        }

        send({ type: 'done', total, qualified })
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : 'Erreur inconnue' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
