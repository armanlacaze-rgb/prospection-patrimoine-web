import { NextRequest } from 'next/server'
import { createAnthropicClient, scoreProspect } from '@/lib/anthropic'
import type { ProspectInput } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { prospects } = (await req.json()) as { prospects: ProspectInput[] }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const client = createAnthropicClient()
        let qualified = 0

        for (const prospect of prospects) {
          try {
            const { prospect: scored, qualified: isQualified } = await scoreProspect(client, prospect)
            if (isQualified) {
              qualified++
              send({ type: 'result', prospect: scored })
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

        send({ type: 'done', total: prospects.length, qualified })
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
