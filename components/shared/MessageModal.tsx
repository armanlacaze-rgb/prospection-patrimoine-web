'use client'
import { useState } from 'react'
import type { ProspectScored } from '@/lib/types'

interface Props {
  prospect: ProspectScored
  onClose: () => void
}

export function MessageModal({ prospect, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(prospect.message_linkedin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{prospect.first_name} {prospect.last_name}</h3>
            <p className="text-sm text-gray-500">{prospect.job_title} — {prospect.company_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {prospect.message_linkedin}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            {copied ? '✓ Copié !' : 'Copier le message'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
