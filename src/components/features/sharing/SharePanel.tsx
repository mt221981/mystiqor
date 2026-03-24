'use client'

/**
 * פאנל שיתוף ניתוח — יצירת קישור שיתוף + כפתורי רשתות חברתיות
 */
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  WhatsappShareButton,
  TelegramShareButton,
  FacebookShareButton,
  WhatsappIcon,
  TelegramIcon,
  FacebookIcon,
} from 'react-share'
import { Button } from '@/components/ui/button'

interface SharePanelProps {
  analysisId: string
  title: string
}

interface ShareResponse {
  share_url: string
  share_token: string
}

/** פאנל שיתוף — יצירת קישור + שיתוף לוואטסאפ, טלגרם, פייסבוק */
export function SharePanel({ analysisId, title }: SharePanelProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { mutate: generateShare, isPending, isError } = useMutation<ShareResponse>({
    mutationFn: async () => {
      const res = await fetch('/api/analysis/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_id: analysisId }),
      })
      if (!res.ok) throw new Error('שגיאה ביצירת קישור שיתוף')
      return res.json() as Promise<ShareResponse>
    },
    onSuccess: (data) => {
      setShareUrl(data.share_url)
    },
  })

  /** העתקת קישור ללוח */
  async function handleCopy() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /** שיתוף נייטיב דרך Web Share API */
  async function handleNativeShare() {
    if (!shareUrl || !navigator.share) return
    await navigator.share({ title, url: shareUrl })
  }

  if (!shareUrl) {
    return (
      <div className="flex flex-col items-start gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateShare()}
          disabled={isPending}
          className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border-outline-variant/20"
        >
          {isPending ? 'יוצר קישור...' : 'שתף ניתוח'}
        </Button>
        {isError && (
          <p className="text-error text-xs">שגיאה ביצירת קישור, נסה שוב</p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5 flex flex-col gap-3">
      {/* קישור + כפתור העתקה */}
      <div className="flex gap-2 items-center">
        <input
          readOnly
          value={shareUrl}
          className="flex-1 bg-surface-container-lowest rounded-lg px-4 py-2 text-on-surface font-mono text-sm border-none outline-none"
          aria-label="קישור שיתוף"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="bg-primary-container text-on-primary-container rounded-lg px-3 py-2 font-label text-sm hover:opacity-90 transition-opacity"
        >
          {copied ? 'הועתק!' : 'העתק'}
        </button>
      </div>

      {/* שיתוף נייטיב — זמין רק בדפדפנים שתומכים ב-Web Share API */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="bg-surface-container-high hover:bg-surface-container-highest rounded-lg p-3 text-on-surface-variant hover:text-on-surface transition-colors text-sm font-label"
        >
          שתף
        </button>
      )}

      {/* כפתורי רשתות חברתיות */}
      <div className="flex gap-2">
        <WhatsappShareButton url={shareUrl} title={title} className="bg-surface-container-high hover:bg-surface-container-highest rounded-lg p-1.5 transition-colors">
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
        <TelegramShareButton url={shareUrl} title={title} className="bg-surface-container-high hover:bg-surface-container-highest rounded-lg p-1.5 transition-colors">
          <TelegramIcon size={32} round />
        </TelegramShareButton>
        <FacebookShareButton url={shareUrl} className="bg-surface-container-high hover:bg-surface-container-highest rounded-lg p-1.5 transition-colors">
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>
    </div>
  )
}
