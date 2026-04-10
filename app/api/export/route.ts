import { NextRequest } from 'next/server'
import { generateCSV } from '@/lib/export'
import type { ProspectScored } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { prospects } = (await req.json()) as { prospects: ProspectScored[] }
  const csv = generateCSV(prospects)

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const filename = `prospects_qualifies_${date}.csv`

  return new Response('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
